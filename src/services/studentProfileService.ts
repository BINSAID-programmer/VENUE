import { StudentProfile } from '../types';
import { db, dbDefault, auth, storage, isVerifiedOwnerAccount } from './firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { updateProfile, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';

/**
 * Validates a profile photo file against strict MIME type and file size boundaries.
 */
export function validateProfilePhotoFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (!allowedMimeTypes.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: 'Invalid file format. Please upload a JPEG, PNG, or WebP image.',
    };
  }

  const maxBytes = 5 * 1024 * 1024; // 5 MB limit
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: 'File size exceeds 5MB limit. Please choose a smaller photo.',
    };
  }

  return { valid: true };
}

/**
 * Uploads a profile photo to Firebase Storage with progress tracking and resilient fallback.
 */
export async function uploadStudentProfilePhoto(
  uid: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  const validation = validateProfilePhotoFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid photo file');
  }

  onProgress?.(5);

  const cleanUid = (uid || auth.currentUser?.uid || 'user').replace(/[^a-zA-Z0-9_-]/g, '_');
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const safeExt = ['png', 'webp', 'jpg', 'jpeg'].includes(ext) ? ext : 'jpg';
  const storagePath = `profiles/${cleanUid}/avatar_${Date.now()}.${safeExt}`;

  // 1. Attempt Cloud Storage upload with bounded timeout
  try {
    const storageRef = ref(storage, storagePath);
    const metadata = {
      contentType: file.type || 'image/jpeg',
      customMetadata: {
        uid: cleanUid,
        uploadedAt: new Date().toISOString(),
      },
    };

    const uploadTask = uploadBytesResumable(storageRef, file, metadata);

    const downloadUrl = await new Promise<string>((resolve, reject) => {
      const timer = setTimeout(() => {
        try {
          uploadTask.cancel();
        } catch {}
        reject(new Error('Storage upload timed out'));
      }, 12000);

      uploadTask.on(
        'state_changed',
        (snap) => {
          if (snap.totalBytes > 0) {
            const pct = Math.min(95, Math.round((snap.bytesTransferred / snap.totalBytes) * 100));
            onProgress?.(pct);
          }
        },
        (err) => {
          clearTimeout(timer);
          reject(err);
        },
        async () => {
          clearTimeout(timer);
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(url);
          } catch (urlErr) {
            reject(urlErr);
          }
        }
      );
    });

    onProgress?.(100);

    // Sync to Firebase Auth currentUser photoURL if available
    if (auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, { photoURL: downloadUrl });
      } catch {
        // non-blocking
      }
    }

    return downloadUrl;
  } catch (cloudErr) {
    console.warn('Firebase Cloud Storage profile upload note, falling back to optimized compression:', cloudErr);
  }

  // 2. Resilient fallback: High-fidelity canvas downsampling DataURL
  onProgress?.(50);
  const compressedDataUrl = await compressAndFormatImage(file, 512, 0.85);
  onProgress?.(100);

  return compressedDataUrl;
}

/**
 * Updates only permitted personal profile fields (Full Name, Profile Photo, Phone Number).
 * Academic fields (University, Programme, Registration Number, Year, Semester) remain strictly preserved.
 */
export async function updateStudentPersonalProfile(
  uid: string,
  updates: {
    fullName?: string;
    name?: string;
    phoneNumber?: string;
    profilePhoto?: string;
  }
): Promise<StudentProfile> {
  const targetUid = uid || auth.currentUser?.uid;
  if (!targetUid) {
    throw new Error('Authenticated user UID is required to update profile.');
  }

  const newName = (updates.fullName || updates.name || '').trim();
  if (!newName) {
    throw new Error('Full Name cannot be empty.');
  }

  // 1. Fetch current profile to ensure existing academic identity is not altered
  const existing = await loadStudentProfile(targetUid);
  const now = new Date().toISOString();

  const merged: StudentProfile = {
    ...(existing || {
      uid: targetUid,
      email: auth.currentUser?.email || '',
      creatorTag: 'VENUE Student',
      country: '',
      university: '',
      universityShort: '',
      college: '',
      programme: '',
      programmeShort: '',
      academicYear: '',
      yearOfStudy: '',
      semester: '',
      registrationNumber: '',
      gpa: 0,
      gpaMax: 5,
      creditsCompleted: 0,
      totalCredits: 0,
      studyStreakDays: 0,
      studyHoursThisWeek: 0,
      skills: [],
      achievements: [],
    }),
    uid: targetUid,
    name: newName,
    fullName: newName,
    phoneNumber: updates.phoneNumber !== undefined ? updates.phoneNumber.trim() : (existing?.phoneNumber || ''),
    profilePhoto: updates.profilePhoto !== undefined ? updates.profilePhoto : (existing?.profilePhoto || existing?.avatar || ''),
    photoURL: updates.profilePhoto !== undefined ? updates.profilePhoto : (existing?.profilePhoto || existing?.avatar || ''),
    avatar: updates.profilePhoto !== undefined ? updates.profilePhoto : (existing?.profilePhoto || existing?.avatar || ''),
    updatedAt: now,
  };

  // 2. Save persistently to server storage
  try {
    const res = await fetch('/api/student/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid: targetUid, profile: merged }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.profile) {
        // Cache in localStorage
        try {
          localStorage.setItem(`venue_profile_${targetUid}`, JSON.stringify(data.profile));
        } catch {}
      }
    }
  } catch (err) {
    console.warn('Server personal profile sync note:', err);
  }

  // 3. Update Firestore documents in students and users collections
  if (auth.currentUser && auth.currentUser.uid === targetUid) {
    try {
      const fsPayload = {
        name: newName,
        fullName: newName,
        phoneNumber: merged.phoneNumber,
        profilePhoto: merged.profilePhoto,
        photoURL: merged.profilePhoto,
        avatar: merged.profilePhoto,
        updatedAt: now,
      };
      await setDoc(doc(db, 'students', targetUid), fsPayload, { merge: true });
      await setDoc(doc(db, 'users', targetUid), fsPayload, { merge: true });
    } catch (fsErr) {
      console.warn('Firestore personal profile update note:', fsErr);
    }

    // 4. Update Firebase Auth displayName & photoURL
    try {
      await updateProfile(auth.currentUser, {
        displayName: newName,
        photoURL: merged.profilePhoto || undefined,
      });
    } catch {
      // non-blocking
    }
  }

  // Local cache
  try {
    localStorage.setItem(`venue_profile_${targetUid}`, JSON.stringify(merged));
  } catch {}

  return merged;
}

/**
 * Triggers a secure password reset email via Firebase Authentication.
 */
export async function sendStudentPasswordResetEmail(email?: string): Promise<{ success: boolean; message: string }> {
  const targetEmail = (email || auth.currentUser?.email || '').trim();
  if (!targetEmail) {
    return { success: false, message: 'Valid email address is required.' };
  }

  try {
    await sendPasswordResetEmail(auth, targetEmail);
    return {
      success: true,
      message: `Password reset instructions sent to ${targetEmail}. Please check your inbox.`,
    };
  } catch (err: any) {
    console.error('Password reset error:', err);
    return {
      success: false,
      message: err?.message || 'Failed to send password reset email. Please try again.',
    };
  }
}

/**
 * Triggers an email verification link via Firebase Authentication.
 */
export async function sendStudentEmailVerification(): Promise<{ success: boolean; message: string }> {
  if (!auth.currentUser) {
    return { success: false, message: 'User is not currently authenticated.' };
  }

  try {
    await sendEmailVerification(auth.currentUser);
    return {
      success: true,
      message: 'Verification link sent to your registered email address.',
    };
  } catch (err: any) {
    console.error('Email verification error:', err);
    return {
      success: false,
      message: err?.message || 'Failed to send verification email. Please try again later.',
    };
  }
}

/**
 * Generates a stable, unique student identifier from an authenticated Firebase UID or email.
 */
export function getStudentUid(email: string, firebaseUid?: string): string {
  if (firebaseUid && firebaseUid.trim()) {
    return firebaseUid.trim();
  }
  const cleanEmail = (email || 'student@venue.ac.tz').toLowerCase().trim();
  // Safe alphanumeric deterministic hash
  let hash = 0;
  for (let i = 0; i < cleanEmail.length; i++) {
    const chr = cleanEmail.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  const positiveHash = Math.abs(hash).toString(36);
  const cleanPrefix = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '_').slice(0, 10);
  return `uid_${cleanPrefix}_${positiveHash}`;
}

/**
 * Compresses an uploaded image file on the client using canvas downsampling.
 * Ensures the profile photo remains high quality, fast to render, and easy to persist.
 */
export async function compressAndFormatImage(file: File, maxDimension = 512, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image file format'));
      img.onload = () => {
        let { width, height } = img;
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(img.src);
        }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Loads a student profile persistently from backend storage and Firestore if authenticated.
 */
export async function loadStudentProfile(uid: string, email?: string): Promise<StudentProfile | null> {
  // Use authenticated UID as primary source if logged into Firebase
  const targetUid = (auth.currentUser ? auth.currentUser.uid : uid) || '';
  if (!targetUid && !email) return null;

  const sanitizeLoadedProfile = (raw: StudentProfile): StudentProfile => {
    const resolvedUid = targetUid || raw.uid;
    const isOwner = isVerifiedOwnerAccount(resolvedUid, email || raw.email);
    return {
      ...raw,
      uid: resolvedUid,
      ...(isOwner ? { status: 'active', accountStatus: 'active' } : {}),
    };
  };

  try {
    // 1. Try Firestore direct document read if authenticated (check 'users' then 'students' across db and dbDefault)
    if (auth.currentUser && auth.currentUser.uid === targetUid) {
      for (const firestoreInstance of [db, dbDefault]) {
        try {
          const userDoc = await getDoc(doc(firestoreInstance, 'users', targetUid));
          if (userDoc.exists()) {
            const fsData = sanitizeLoadedProfile(userDoc.data() as StudentProfile);
            try {
              localStorage.setItem(`venue_profile_${targetUid}`, JSON.stringify(fsData));
            } catch {
              // ignore
            }
            return fsData;
          }

          const studentDoc = await getDoc(doc(firestoreInstance, 'students', targetUid));
          if (studentDoc.exists()) {
            const fsData = sanitizeLoadedProfile(studentDoc.data() as StudentProfile);
            try {
              localStorage.setItem(`venue_profile_${targetUid}`, JSON.stringify(fsData));
            } catch {
              // ignore
            }
            return fsData;
          }
        } catch (fsErr) {
          console.warn('Firestore profile lookup note:', fsErr);
        }
      }
    }

    // 2. Try server-side persistent endpoint by UID
    if (targetUid) {
      const res = await fetch(`/api/student/profile/${encodeURIComponent(targetUid)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.profile) {
          const safeProf = sanitizeLoadedProfile(data.profile as StudentProfile);
          // Cache in localStorage for offline fast boot
          try {
            localStorage.setItem(`venue_profile_${targetUid}`, JSON.stringify(safeProf));
            if (safeProf.email) {
              localStorage.setItem(`venue_profile_email_${safeProf.email.toLowerCase().trim()}`, JSON.stringify(safeProf));
            }
          } catch {
            // ignore localStorage quota issues
          }
          return safeProf;
        }
      }
    }

    // 3. Try server-side persistent endpoint by Email
    if (email) {
      const cleanEmail = email.toLowerCase().trim();
      const resByEmail = await fetch(`/api/student/profile/by-email/${encodeURIComponent(cleanEmail)}`);
      if (resByEmail.ok) {
        const data = await resByEmail.json();
        if (data.success && data.profile) {
          return sanitizeLoadedProfile(data.profile as StudentProfile);
        }
      }
    }

    // 4. Fallback: check local storage cache if server was offline
    if (targetUid) {
      const cached = localStorage.getItem(`venue_profile_${targetUid}`);
      if (cached) {
        return sanitizeLoadedProfile(JSON.parse(cached) as StudentProfile);
      }
    }
    if (email) {
      const cachedByEmail = localStorage.getItem(`venue_profile_email_${email.toLowerCase().trim()}`);
      if (cachedByEmail) {
        return sanitizeLoadedProfile(JSON.parse(cachedByEmail) as StudentProfile);
      }
    }

    return null;
  } catch (error) {
    console.warn('Error loading student profile from server:', error);
    // Try localStorage backup
    if (targetUid) {
      const cached = localStorage.getItem(`venue_profile_${targetUid}`);
      if (cached) {
        try {
          return sanitizeLoadedProfile(JSON.parse(cached) as StudentProfile);
        } catch {
          return null;
        }
      }
    }
    return null;
  }
}

/**
 * Saves a student profile persistently to backend server storage and Firestore.
 * Academic fields are completely university-agnostic and dynamically preserved.
 */
export async function saveStudentProfile(profile: StudentProfile): Promise<StudentProfile> {
  // Use authenticated Firebase user UID whenever available for strict security & authorization
  const uid = auth.currentUser?.uid || profile.uid || getStudentUid(profile.email);
  const now = new Date().toISOString();

  // Split name into first, middle, last if not explicitly set
  let firstName = (profile.firstName || '').trim();
  let middleName = (profile.middleName || '').trim();
  let lastName = (profile.lastName || '').trim();

  if (!firstName && (profile.name || profile.fullName)) {
    const rawParts = (profile.name || profile.fullName || '').trim().split(/\s+/);
    if (rawParts.length === 1) {
      firstName = rawParts[0];
    } else if (rawParts.length === 2) {
      firstName = rawParts[0];
      lastName = rawParts[1];
    } else if (rawParts.length >= 3) {
      firstName = rawParts[0];
      middleName = rawParts.slice(1, -1).join(' ');
      lastName = rawParts[rawParts.length - 1];
    }
  }

  const constructedFullName = [firstName, middleName, lastName].filter(Boolean).join(' ');
  const fullName = constructedFullName || (profile.fullName || profile.name || '').trim();
  const displayName = firstName ? [firstName, lastName].filter(Boolean).join(' ') : (fullName || 'Student');

  const isComplete = Boolean(
    profile.isProfileComplete ||
    ((profile.universityId?.trim() || profile.university?.trim()) &&
      (profile.departmentId?.trim() || profile.department?.trim()) &&
      (profile.programmeId?.trim() || profile.programme?.trim()) &&
      profile.yearOfStudy?.trim() &&
      profile.semester?.trim())
  );

  const enrichedProfile: StudentProfile = {
    ...profile,
    uid,
    firstName,
    middleName,
    lastName,
    fullName,
    name: displayName,
    email: (profile.email || '').trim(),
    phoneNumber: (profile.phoneNumber || '').trim(),
    country: (profile.country || profile.countryName || '').trim(),
    countryId: (profile.countryId || '').trim(),
    countryName: (profile.countryName || profile.country || '').trim(),
    photoURL: profile.photoURL || profile.profilePhoto || profile.avatar || '',
    profilePhoto: profile.profilePhoto || profile.photoURL || profile.avatar || '',
    avatar: profile.avatar || profile.photoURL || profile.profilePhoto || '',
    registrationNumber: (profile.registrationNumber || '').toUpperCase().trim(),
    universityId: profile.universityId || '',
    universityName: profile.universityName || profile.university || '',
    university: profile.university || profile.universityName || '',
    universityShort: profile.universityShort || '',
    institutionId: profile.institutionId || profile.academicUnitId || profile.collegeId || '',
    institutionName: profile.institutionName || profile.academicUnitName || profile.college || '',
    college: profile.college || profile.institutionName || profile.academicUnitName || '',
    collegeId: profile.collegeId || profile.institutionId || profile.academicUnitId || '',
    academicUnitId: profile.academicUnitId || profile.institutionId || profile.collegeId || '',
    academicUnitName: profile.academicUnitName || profile.institutionName || profile.college || '',
    academicUnitType: profile.academicUnitType || 'College',
    departmentId: profile.departmentId || '',
    departmentName: profile.departmentName || profile.department || '',
    department: profile.department || profile.departmentName || '',
    programmeId: profile.programmeId || '',
    programmeName: profile.programmeName || profile.programme || '',
    programme: profile.programme || profile.programmeName || '',
    programmeShort: profile.programmeShort || '',
    yearOfStudy: profile.yearOfStudy || '',
    semester: profile.semester || '',
    academicYear: profile.academicYear || '',
    isProfileComplete: isComplete,
    createdAt: profile.createdAt || now,
    updatedAt: now,
  };

  // Cache in localStorage for immediate optimistic UI rendering
  // Stage 9B Security Hardening: Strip any unauthorized role escalation or administrative permission injection
  const safeStudentProfile: StudentProfile = {
    ...enrichedProfile,
    role: enrichedProfile.role === 'super_admin' || enrichedProfile.role === 'university_admin' || enrichedProfile.role === 'college_admin' || enrichedProfile.role === 'department_moderator' || enrichedProfile.role === 'lecturer'
      ? 'student'
      : (enrichedProfile.role || 'student'),
  };
  delete (safeStudentProfile as any).permissions;

  try {
    localStorage.setItem(`venue_profile_${uid}`, JSON.stringify(safeStudentProfile));
    if (safeStudentProfile.email) {
      localStorage.setItem(`venue_profile_email_${safeStudentProfile.email.toLowerCase().trim()}`, JSON.stringify(safeStudentProfile));
    }
    localStorage.setItem('venue_current_student_uid', uid);
  } catch {
    // ignore
  }

  // Save to server persistent API
  try {
    const res = await fetch('/api/student/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid,
        profile: safeStudentProfile,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.profile) {
        // Also sync to Firestore users and students collections
        if (auth.currentUser && auth.currentUser.uid === uid) {
          try {
            await setDoc(doc(db, 'users', uid), data.profile, { merge: true });
            await setDoc(doc(db, 'students', uid), data.profile, { merge: true });
          } catch (fsErr) {
            console.warn('Firestore sync note:', fsErr);
          }
        }
        return data.profile as StudentProfile;
      }
    }
  } catch (error) {
    console.warn('Note: Server profile sync temporarily offline, cached locally in browser:', error);
  }

  // Direct Firestore sync if authenticated in Firebase
  if (auth.currentUser && auth.currentUser.uid === uid) {
    try {
      await setDoc(doc(db, 'users', uid), safeStudentProfile, { merge: true });
      await setDoc(doc(db, 'students', uid), safeStudentProfile, { merge: true });
    } catch (fsErr) {
      console.warn('Firestore direct sync note:', fsErr);
    }
  }

  return safeStudentProfile;
}
