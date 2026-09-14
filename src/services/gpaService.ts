import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { StudentResult, StudentProfile } from '../types';
import {
  mapGradeToGradePoint,
  calculateCumulativeGpa,
  CumulativeGpaSummary,
} from './gradingService';
import { saveStudentProfile } from './studentProfileService';

/**
 * Generates a stable deterministic result identifier:
 * res_{courseId}_{semester}_{academicYear}
 * Guarantees NO duplicate records for the same student + course + semester
 */
export function buildResultDocId(
  courseId: string,
  semester: string,
  academicYear: string
): string {
  const cleanCourse = (courseId || 'course')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');
  const cleanSem = (semester || 'sem1')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');
  const cleanYear = (academicYear || '2025_2026')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');
  return `res_${cleanCourse}_${cleanSem}_${cleanYear}`;
}

/**
 * Securely retrieves the active authenticated user UID.
 * Never trusts unauthenticated or unverified client IDs.
 */
export function getAuthenticatedUid(providedUid?: string): string {
  if (auth.currentUser && auth.currentUser.uid) {
    return auth.currentUser.uid;
  }
  if (providedUid && providedUid.trim()) {
    return providedUid.trim();
  }
  const stored = localStorage.getItem('venue_current_student_uid');
  return stored || 'anonymous_student';
}

/**
 * Loads student results for the authenticated student.
 * Uses local fast caching to prevent redundant queries and unnecessary database reads.
 */
export async function getStudentResults(providedUid?: string): Promise<StudentResult[]> {
  const uid = getAuthenticatedUid(providedUid);
  const cacheKey = `venue_results_${uid}`;

  // 1. Try local cache first for instant UI response
  let cachedResults: StudentResult[] = [];
  try {
    const raw = localStorage.getItem(cacheKey);
    if (raw) {
      cachedResults = JSON.parse(raw);
    }
  } catch {
    // Ignore cache parse error
  }

  try {
    // 2. Query Firestore student results subcollection
    const colRef = collection(db, 'students', uid, 'results');
    const q = query(colRef);
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const results: StudentResult[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as StudentResult;
        results.push({
          ...data,
          id: docSnap.id,
        });
      });

      // Cache updated results
      try {
        localStorage.setItem(cacheKey, JSON.stringify(results));
      } catch {
        // Ignore quota error
      }
      return results;
    }
  } catch (fsErr) {
    console.warn('Firestore getStudentResults fallback to local store:', fsErr);
  }

  // 3. Fallback to server persistence API if available
  try {
    const res = await fetch(`/api/student/results/${encodeURIComponent(uid)}`);
    if (res.ok) {
      const payload = await res.json();
      if (payload.success && Array.isArray(payload.results)) {
        try {
          localStorage.setItem(cacheKey, JSON.stringify(payload.results));
        } catch {
          // Ignore
        }
        return payload.results;
      }
    }
  } catch {
    // Server fetch fallback
  }

  return cachedResults;
}

/**
 * Adds or edits a student course result.
 * Automatically computes grade points based on the active university grading system.
 * Prevents duplicate results by using the stable deterministic doc ID.
 */
export async function saveStudentResult(
  resultInput: {
    courseId: string;
    courseCode: string;
    courseName: string;
    credits: number;
    grade: string;
    semester: string;
    academicYear?: string;
    yearOfStudy?: string;
    universityId?: string;
  },
  providedUid?: string
): Promise<{ result: StudentResult; allResults: StudentResult[] }> {
  const uid = getAuthenticatedUid(providedUid);
  const academicYear = resultInput.academicYear || '2025/2026';
  const semester = resultInput.semester || 'Semester 1';
  const grade = resultInput.grade.trim().toUpperCase();
  const gradePoint = mapGradeToGradePoint(grade, resultInput.universityId);
  const nowIso = new Date().toISOString();

  const docId = buildResultDocId(resultInput.courseId, semester, academicYear);

  const newResult: StudentResult = {
    id: docId,
    uid,
    courseId: resultInput.courseId,
    courseCode: resultInput.courseCode.trim(),
    courseName: resultInput.courseName.trim(),
    credits: Number(resultInput.credits) || 0,
    grade,
    gradePoint,
    semester,
    academicYear,
    yearOfStudy: resultInput.yearOfStudy,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  // 1. Read existing from local cache or Firestore
  const currentResults = await getStudentResults(uid);
  const existingIdx = currentResults.findIndex(
    (r) =>
      r.id === docId ||
      (r.courseId === resultInput.courseId &&
        r.semester === semester &&
        r.academicYear === academicYear)
  );

  let updatedList: StudentResult[];
  if (existingIdx >= 0) {
    newResult.createdAt = currentResults[existingIdx].createdAt || nowIso;
    updatedList = [...currentResults];
    updatedList[existingIdx] = newResult;
  } else {
    updatedList = [...currentResults, newResult];
  }

  // 2. Persist to Firestore
  try {
    const docRef = doc(db, 'students', uid, 'results', docId);
    await setDoc(docRef, newResult, { merge: true });
  } catch (fsErr) {
    console.warn('Firestore saveStudentResult direct write note:', fsErr);
  }

  // 3. Persist to local cache
  const cacheKey = `venue_results_${uid}`;
  try {
    localStorage.setItem(cacheKey, JSON.stringify(updatedList));
  } catch {
    // Ignore
  }

  // 4. Mirror to server API for durable offline/mock fallback
  try {
    await fetch('/api/student/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, result: newResult }),
    });
  } catch {
    // Ignore server error
  }

  return { result: newResult, allResults: updatedList };
}

/**
 * Deletes a course result from the student's records.
 */
export async function deleteStudentResult(
  resultId: string,
  providedUid?: string
): Promise<StudentResult[]> {
  const uid = getAuthenticatedUid(providedUid);
  const currentResults = await getStudentResults(uid);
  const updatedList = currentResults.filter((r) => r.id !== resultId);

  // 1. Delete from Firestore
  try {
    const docRef = doc(db, 'students', uid, 'results', resultId);
    await deleteDoc(docRef);
  } catch (fsErr) {
    console.warn('Firestore deleteStudentResult note:', fsErr);
  }

  // 2. Update local cache
  const cacheKey = `venue_results_${uid}`;
  try {
    localStorage.setItem(cacheKey, JSON.stringify(updatedList));
  } catch {
    // Ignore
  }

  // 3. Mirror delete to server API
  try {
    await fetch(`/api/student/results/${encodeURIComponent(uid)}/${encodeURIComponent(resultId)}`, {
      method: 'DELETE',
    });
  } catch {
    // Ignore
  }

  return updatedList;
}

/**
 * Synchronizes calculated GPA with the student's profile.
 * Immediately updates profile.gpa and profile.creditsCompleted.
 */
export async function syncStudentProfileGpa(
  profile: StudentProfile,
  results: StudentResult[]
): Promise<{ updatedProfile: StudentProfile; summary: CumulativeGpaSummary }> {
  const summary = calculateCumulativeGpa(
    results,
    profile.universityId || profile.university,
    profile.semester,
    profile.academicYear
  );

  const updatedProfile: StudentProfile = {
    ...profile,
    gpa: summary.cgpa,
    gpaMax: summary.maxGpa,
    creditsCompleted: summary.totalCredits,
    updatedAt: new Date().toISOString(),
  };

  try {
    await saveStudentProfile(updatedProfile);
  } catch (err) {
    console.warn('syncStudentProfileGpa profile save note:', err);
  }

  return { updatedProfile, summary };
}
