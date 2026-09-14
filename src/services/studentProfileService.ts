import { StudentProfile } from '../types';
import { db, auth } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

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

  try {
    // 1. Try Firestore direct document read if authenticated
    if (auth.currentUser && auth.currentUser.uid === targetUid) {
      try {
        const studentDoc = await getDoc(doc(db, 'students', targetUid));
        if (studentDoc.exists()) {
          const fsData = studentDoc.data() as StudentProfile;
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

    // 2. Try server-side persistent endpoint by UID
    if (targetUid) {
      const res = await fetch(`/api/student/profile/${encodeURIComponent(targetUid)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.profile) {
          // Cache in localStorage for offline fast boot
          try {
            localStorage.setItem(`venue_profile_${targetUid}`, JSON.stringify(data.profile));
            if (data.profile.email) {
              localStorage.setItem(`venue_profile_email_${data.profile.email.toLowerCase().trim()}`, JSON.stringify(data.profile));
            }
          } catch {
            // ignore localStorage quota issues
          }
          return data.profile as StudentProfile;
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
          return data.profile as StudentProfile;
        }
      }
    }

    // 4. Fallback: check local storage cache if server was offline
    if (targetUid) {
      const cached = localStorage.getItem(`venue_profile_${targetUid}`);
      if (cached) {
        return JSON.parse(cached) as StudentProfile;
      }
    }
    if (email) {
      const cachedByEmail = localStorage.getItem(`venue_profile_email_${email.toLowerCase().trim()}`);
      if (cachedByEmail) {
        return JSON.parse(cachedByEmail) as StudentProfile;
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
          return JSON.parse(cached) as StudentProfile;
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
 * Canonical academic fields (IDs and names) are strictly preserved.
 */
export async function saveStudentProfile(profile: StudentProfile): Promise<StudentProfile> {
  // Use authenticated Firebase user UID whenever available for strict security & authorization
  const uid = auth.currentUser?.uid || profile.uid || getStudentUid(profile.email);
  const now = new Date().toISOString();

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
    fullName: (profile.fullName || profile.name || '').trim(),
    name: (profile.name || profile.fullName || 'Student').trim(),
    email: (profile.email || '').trim(),
    photoURL: profile.photoURL || profile.profilePhoto || profile.avatar || '',
    profilePhoto: profile.profilePhoto || profile.photoURL || profile.avatar || '',
    avatar: profile.avatar || profile.photoURL || profile.profilePhoto || '',
    registrationNumber: (profile.registrationNumber || '').toUpperCase().trim(),
    universityId: profile.universityId || 'udsm',
    universityName: profile.universityName || profile.university || 'University of Dar es Salaam',
    university: profile.university || profile.universityName || 'University of Dar es Salaam',
    universityShort: profile.universityShort || '',
    institutionId: profile.institutionId || profile.academicUnitId || profile.collegeId || '',
    institutionName: profile.institutionName || profile.college || '',
    college: profile.college || profile.institutionName || '',
    collegeId: profile.collegeId || profile.institutionId || profile.academicUnitId || '',
    academicUnitId: profile.academicUnitId || profile.institutionId || profile.collegeId || '',
    academicUnitType: profile.academicUnitType || 'College',
    departmentId: profile.departmentId || '',
    departmentName: profile.departmentName || profile.department || '',
    department: profile.department || profile.departmentName || '',
    programmeId: profile.programmeId || '',
    programmeName: profile.programmeName || profile.programme || '',
    programme: profile.programme || profile.programmeName || '',
    programmeShort: profile.programmeShort || '',
    yearOfStudy: profile.yearOfStudy || 'Year 1',
    semester: profile.semester || 'Semester 1',
    academicYear: profile.academicYear || '2025/2026',
    isProfileComplete: isComplete,
    createdAt: profile.createdAt || now,
    updatedAt: now,
  };

  // Cache in localStorage for immediate optimistic UI rendering
  try {
    localStorage.setItem(`venue_profile_${uid}`, JSON.stringify(enrichedProfile));
    if (enrichedProfile.email) {
      localStorage.setItem(`venue_profile_email_${enrichedProfile.email.toLowerCase().trim()}`, JSON.stringify(enrichedProfile));
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
        profile: enrichedProfile,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.profile) {
        // Also non-blocking Firestore sync if authenticated in Firebase
        if (auth.currentUser && auth.currentUser.uid === uid) {
          try {
            const studentRef = doc(db, 'students', uid);
            await setDoc(studentRef, data.profile, { merge: true });
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
      const studentRef = doc(db, 'students', uid);
      await setDoc(studentRef, enrichedProfile, { merge: true });
    } catch (fsErr) {
      console.warn('Firestore direct sync note:', fsErr);
    }
  }

  return enrichedProfile;
}
