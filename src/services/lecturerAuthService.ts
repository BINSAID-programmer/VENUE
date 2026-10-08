import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  limit,
} from 'firebase/firestore';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import { db, dbDefault, storage, handleFirestoreError, OperationType, auth } from './firebase';
import { LecturerRecord } from '../types';

class LecturerAuthService {
  // In-memory cache to prevent duplicate Firestore reads
  private cachedLecturer: LecturerRecord | null = null;
  private cachedUid: string | null = null;

  /**
   * Fetches the linked lecturer record for a given Firebase Auth UID
   */
  async getLecturerByUid(uid: string, forceRefresh = false): Promise<LecturerRecord | null> {
    if (!uid) return null;

    if (!forceRefresh && this.cachedUid === uid && this.cachedLecturer) {
      return this.cachedLecturer;
    }

    try {
      // 1. Try querying by userId index in primary db
      const q = query(
        collection(db, 'lecturers'),
        where('userId', '==', uid),
        limit(1)
      );

      let snap: any = null;
      try {
        snap = await getDocs(q);
      } catch {
        // Fallback to dbDefault
        try {
          snap = await getDocs(
            query(collection(dbDefault, 'lecturers'), where('userId', '==', uid), limit(1))
          );
        } catch {
          snap = null;
        }
      }

      if (snap && !snap.empty) {
        const docSnap = snap.docs[0];
        const record = {
          id: docSnap.id,
          ...(docSnap.data() as any),
        } as LecturerRecord;

        this.cachedUid = uid;
        this.cachedLecturer = record;
        return record;
      }

      // 2. If not found by query, check if any lecturer document id itself matches or has userId field
      return null;
    } catch (err) {
      console.warn('LecturerAuthService: Error finding lecturer by UID:', err);
      return null;
    }
  }

  /**
   * Fetches lecturer by invitation code for safe account linking
   */
  async getLecturerByInviteCode(inviteCode: string): Promise<LecturerRecord | null> {
    const cleanCode = inviteCode.trim().toUpperCase();
    if (!cleanCode) return null;

    try {
      const q = query(
        collection(db, 'lecturers'),
        where('invitationCode', '==', cleanCode),
        limit(1)
      );

      let snap: any = null;
      try {
        snap = await getDocs(q);
      } catch {
        snap = await getDocs(
          query(collection(dbDefault, 'lecturers'), where('invitationCode', '==', cleanCode), limit(1))
        );
      }

      if (snap && !snap.empty) {
        const d = snap.docs[0];
        return {
          id: d.id,
          ...(d.data() as any),
        } as LecturerRecord;
      }
      return null;
    } catch (err) {
      console.warn('LecturerAuthService: Error fetching lecturer by invite code:', err);
      return null;
    }
  }

  /**
   * Safely links an authenticated Firebase user UID to an existing Lecturer record
   */
  async linkLecturerAccount(
    lecturerId: string,
    uid: string,
    authEmail?: string
  ): Promise<LecturerRecord> {
    if (!lecturerId || !uid) {
      throw new Error('Missing lecturer ID or Firebase UID for account linking.');
    }

    // Check if lecturer exists
    const lecturerRef = doc(db, 'lecturers', lecturerId);
    let snap = await getDoc(lecturerRef);
    if (!snap.exists()) {
      const fbSnap = await getDoc(doc(dbDefault, 'lecturers', lecturerId));
      if (!fbSnap.exists()) {
        throw new Error('Lecturer record does not exist in Firestore catalogue.');
      }
      snap = fbSnap;
    }

    const data = snap.data() as LecturerRecord;

    // If already linked to another UID, verify conflict
    if (data.userId && data.userId !== uid) {
      throw new Error(
        `This lecturer profile is already linked to another account (${data.userId}). An administrator must unlink it first.`
      );
    }

    const now = new Date().toISOString();
    const updates: Partial<LecturerRecord> = {
      userId: uid,
      accountLinked: true,
      linkedAt: now,
      role: 'lecturer',
      updatedAt: now,
    };

    try {
      await updateDoc(lecturerRef, updates);
    } catch {
      await updateDoc(doc(dbDefault, 'lecturers', lecturerId), updates);
    }

    // Update in-memory cache
    const updated: LecturerRecord = {
      ...data,
      ...updates,
      id: lecturerId,
    };
    this.cachedUid = uid;
    this.cachedLecturer = updated;

    return updated;
  }

  /**
   * Updates permitted profile fields by the authenticated lecturer
   * Security constraint: Lecturers CANNOT modify role, universityId, academicUnitId, departmentId, verificationStatus
   */
  async updatePermittedProfile(
    lecturerId: string,
    updates: {
      fullName?: string;
      phone?: string;
      bio?: string;
      office?: string;
      photoURL?: string;
      title?: string;
    }
  ): Promise<LecturerRecord> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('You must be signed in to update your lecturer profile.');
    }

    const lecturer = await this.getLecturerByUid(user.uid, true);
    if (!lecturer || lecturer.id !== lecturerId) {
      throw new Error('Unauthorized: You can only update your own verified lecturer profile.');
    }
    if (lecturer.status === 'inactive') {
      throw new Error('Access Denied: Inactive lecturer accounts cannot modify profile details.');
    }

    // Sanitize permitted fields
    const safePayload: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    if (updates.fullName !== undefined) safePayload.fullName = updates.fullName.trim();
    if (updates.phone !== undefined) safePayload.phone = updates.phone.trim();
    if (updates.bio !== undefined) safePayload.bio = updates.bio.trim();
    if (updates.office !== undefined) safePayload.office = updates.office.trim();
    if (updates.photoURL !== undefined) safePayload.photoURL = updates.photoURL.trim();
    if (updates.title !== undefined) safePayload.title = updates.title.trim();

    try {
      await updateDoc(doc(db, 'lecturers', lecturerId), safePayload);
    } catch {
      await updateDoc(doc(dbDefault, 'lecturers', lecturerId), safePayload);
    }

    const updated: LecturerRecord = {
      ...lecturer,
      ...safePayload,
    };

    this.cachedLecturer = updated;
    return updated;
  }

  /**
   * Upload profile photo to Firebase Storage
   */
  async uploadProfilePhoto(file: File, lecturerId: string): Promise<string> {
    if (!file) throw new Error('No photo file provided.');

    // Validate mime type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid image format. Supported formats: JPG, PNG, WEBP.');
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Profile photo must be smaller than 5MB.');
    }

    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const storagePath = `lecturers/${lecturerId}/avatar_${Date.now()}.${ext}`;
      const storageRef = ref(storage, storagePath);

      const uploadTask = await uploadBytesResumable(storageRef, file);
      const photoURL = await getDownloadURL(uploadTask.ref);

      // Update Firestore profile
      await this.updatePermittedProfile(lecturerId, { photoURL });
      return photoURL;
    } catch (err: any) {
      // Fallback: convert to lightweight data URL for preview if offline/rules
      console.warn('Storage upload fallback:', err);
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
          const dataUrl = reader.result as string;
          try {
            await this.updatePermittedProfile(lecturerId, { photoURL: dataUrl });
            resolve(dataUrl);
          } catch (e) {
            reject(e);
          }
        };
        reader.onerror = () => reject(new Error('Failed to read image file.'));
        reader.readAsDataURL(file);
      });
    }
  }

  /**
   * Clear cache on sign out
   */
  clearCache(): void {
    this.cachedLecturer = null;
    this.cachedUid = null;
  }
}

export const lecturerAuthService = new LecturerAuthService();
