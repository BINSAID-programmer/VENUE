import {
  EmailAuthProvider,
  GoogleAuthProvider,
  deleteUser,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
} from 'firebase/auth';
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import type { StudentProfile } from '../types';
import { auth, db, dbDefault } from './firebase';
import { authenticatedFetch } from './apiClient';
import { loadStudentProfile } from './studentProfileService';

export const MAX_PLACEMENT_CORRECTIONS = 3;

export interface PlacementInput {
  universityId: string;
  university?: string;
  universityName?: string;
  universityShort?: string;
  academicUnitId: string;
  academicUnitName?: string;
  college?: string;
  collegeId?: string;
  departmentId: string;
  department?: string;
  departmentName?: string;
  programmeId: string;
  programme?: string;
  programmeName?: string;
  programmeShort?: string;
  academicYear?: string;
  yearOfStudy?: string;
  semester?: string;
}

export function correctionsLeft(profile: Partial<StudentProfile> | null | undefined): number {
  const used = Number((profile as any)?.placementCorrections || 0);
  return Math.max(0, MAX_PLACEMENT_CORRECTIONS - used);
}

function clearLocalCaches(uid: string, email?: string) {
  try {
    localStorage.removeItem(`venue_profile_${uid}`);
    if (email) localStorage.removeItem(`venue_profile_email_${email.toLowerCase().trim()}`);
    localStorage.removeItem('venue_current_student_uid');
  } catch {
    /* ignore */
  }
}

/** Update only year of study / semester / academic year (free, unlimited). */
export async function updateAcademicProgress(
  profile: StudentProfile,
  progress: { yearOfStudy: string; semester: string; academicYear?: string }
): Promise<StudentProfile> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Please sign in again.');
  const patch = {
    yearOfStudy: progress.yearOfStudy,
    semester: progress.semester,
    academicYear: progress.academicYear || profile.academicYear || '',
    updatedAt: new Date().toISOString(),
  };
  let result: StudentProfile = { ...profile, ...patch };
  try {
    const res = await authenticatedFetch('/api/student/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, profile: result }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.profile) result = { ...result, ...data.profile };
    }
  } catch {
    /* server optional */
  }
  await setDoc(doc(db, 'students', uid), patch, { merge: true });
  await setDoc(doc(db, 'users', uid), patch, { merge: true });
  try {
    localStorage.setItem(`venue_profile_${uid}`, JSON.stringify(result));
  } catch {
    /* ignore */
  }
  return result;
}

/** Correct a wrongly chosen university / college / department / programme (max 3 times). */
export async function correctPlacement(profile: StudentProfile, placement: PlacementInput): Promise<StudentProfile> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Please sign in again.');

  // Source of truth for the counter: the highest value we can see.
  let used = Number((profile as any).placementCorrections || 0);
  try {
    const snap = await getDoc(doc(db, 'students', uid));
    if (snap.exists()) used = Math.max(used, Number(snap.data().placementCorrections || 0));
  } catch {
    /* use local value */
  }
  if (used >= MAX_PLACEMENT_CORRECTIONS) {
    throw new Error('You have reached the correction limit (3). Please contact your university admin.');
  }

  let next: StudentProfile = {
    ...profile,
    ...placement,
    placementCorrections: used + 1,
    updatedAt: new Date().toISOString(),
  } as StudentProfile;

  try {
    const res = await authenticatedFetch('/api/student/placement-correction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ placement }),
    });
    if (res.status === 403) {
      const d = await res.json().catch(() => ({}));
      if (d?.error === 'LIMIT_REACHED') throw new Error(d.message || 'You have reached the correction limit.');
    } else if (res.ok) {
      const data = await res.json();
      if (data?.profile) {
        next = { ...next, ...data.profile, placementCorrections: used + 1 };
      }
    }
  } catch (err: any) {
    if (String(err?.message || '').includes('correction limit')) throw err;
    /* server offline: Firestore below is the source of truth */
  }

  await setDoc(doc(db, 'students', uid), next as any, { merge: true });
  await setDoc(doc(db, 'users', uid), next as any, { merge: true });
  try {
    localStorage.setItem(`venue_profile_${uid}`, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

export async function exportMyData(): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Please sign in again.');
  const profile = await loadStudentProfile(user.uid, user.email || undefined);
  let results: any = null;
  try {
    const res = await authenticatedFetch(`/api/student/results/${encodeURIComponent(user.uid)}`);
    if (res.ok) results = await res.json();
  } catch {
    /* optional */
  }
  const blob = new Blob(
    [JSON.stringify({ exportedAt: new Date().toISOString(), email: user.email, profile, results }, null, 2)],
    { type: 'application/json' }
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `venue-data-${user.uid.slice(0, 6)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function accountUsesPassword(): boolean {
  return !!auth.currentUser?.providerData.some((p) => p.providerId === 'password');
}

async function reauthenticate(password?: string) {
  const user = auth.currentUser;
  if (!user) throw new Error('Please sign in again.');
  if (accountUsesPassword()) {
    if (!password) throw new Error('Enter your password to confirm.');
    if (!user.email) throw new Error('This account has no email.');
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password));
  } else {
    await reauthenticateWithPopup(user, new GoogleAuthProvider());
  }
}

async function deleteSubcollection(parentPath: string[], name: string) {
  try {
    const snap = await getDocs(collection(db, parentPath.join('/'), name));
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref).catch(() => undefined)));
  } catch {
    /* best effort */
  }
}

/** Permanently delete the signed-in student's account and data. */
export async function deleteMyAccount(password?: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Please sign in again.');
  const uid = user.uid;
  const email = user.email || undefined;

  try {
    await reauthenticate(password);
  } catch (err: any) {
    const code = err?.code || '';
    if (code.includes('wrong-password') || code.includes('invalid-credential')) {
      throw new Error('Incorrect password.');
    }
    throw err;
  }

  const res = await authenticatedFetch('/api/student/account', { method: 'DELETE' }).catch(() => null);
  if (res && res.status === 403) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d?.message || 'This account cannot be deleted.');
  }

  for (const sub of ['results', 'notifications', 'ai_learning_sessions', 'ai_learning_progress']) {
    await deleteSubcollection(['users', uid], sub);
    await deleteSubcollection(['students', uid], sub);
  }
  for (const database of [db, dbDefault]) {
    for (const col of ['students', 'users']) {
      try {
        await deleteDoc(doc(database, col, uid));
      } catch (err: any) {
        if (database === db) throw new Error('Could not delete your data. Make sure the latest Firestore rules are published.');
      }
    }
  }

  await deleteUser(user);
  clearLocalCaches(uid, email);
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch {
    /* ignore */
  }
}
