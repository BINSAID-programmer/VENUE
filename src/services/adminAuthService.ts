import { doc, getDoc, setDoc, collection, getCountFromServer } from 'firebase/firestore';
import {
  db,
  dbDefault,
  auth,
  VERIFIED_OWNER_UID,
  VERIFIED_OWNER_EMAIL,
  isVerifiedOwnerAccount,
} from './firebase';
import { AdminUserRecord, AdminPlatformStats, UserRole } from '../types';

export function normalizeAdminRole(rawRole: unknown): UserRole {
  if (!rawRole || typeof rawRole !== 'string') return 'student';
  const cleaned = rawRole.trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (cleaned === 'super_admin' || cleaned === 'superadmin' || cleaned === 'owner') {
    return 'super_admin';
  }
  if (cleaned === 'university_admin') return 'university_admin';
  if (cleaned === 'college_admin') return 'college_admin';
  if (cleaned === 'department_moderator') return 'department_moderator';
  if (cleaned === 'verified_lecturer' || cleaned === 'lecturer') return 'verified_lecturer';
  return 'student';
}

export function normalizeAdminStatus(
  rawStatus: unknown,
  isOwner: boolean
): 'active' | 'suspended' {
  // Verified platform owner account can never be restricted or deactivated
  if (isOwner) return 'active';
  if (!rawStatus || typeof rawStatus !== 'string') return 'active';
  const cleaned = rawStatus.trim().toLowerCase();
  if (cleaned === 'inactive' || cleaned === 'restricted' || cleaned === 'disabled' || cleaned === 'suspended') {
    return 'suspended';
  }
  return 'active';
}

export const ADMIN_ROLE_HIERARCHY: {
  role: UserRole;
  label: string;
  scope: string;
  description: string;
  implemented: boolean;
}[] = [
  {
    role: 'super_admin',
    label: 'Super Admin',
    scope: 'Platform-wide (Global)',
    description: 'VENUE platform administrator with unrestricted access to institutions, catalogues, lecturers, announcements, analytics, and security.',
    implemented: true,
  },
  {
    role: 'university_admin',
    label: 'University Admin',
    scope: 'Institutional (University)',
    description: 'Administrative authority over a specific university, including its constituent colleges, faculties, and institutional policies.',
    implemented: false,
  },
  {
    role: 'college_admin',
    label: 'College / School / Institute Admin',
    scope: 'Academic Unit',
    description: 'Management authority over college or institute faculties, academic programmes, and department listings.',
    implemented: false,
  },
  {
    role: 'department_moderator',
    label: 'Department Moderator',
    scope: 'Departmental',
    description: 'Moderation access to department curriculum, semester schedules, and module coordination.',
    implemented: false,
  },
  {
    role: 'verified_lecturer',
    label: 'Verified Lecturer',
    scope: 'Assigned Courses',
    description: 'Course instructor with permissions to upload materials, lecture notes, assessments, and communicate with enrolled students.',
    implemented: false,
  },
  {
    role: 'student',
    label: 'Student',
    scope: 'Personal Academic Campus',
    description: 'Undergraduate or postgraduate learner with personal study planner, timetable, AI tutor, and resource access.',
    implemented: true,
  },
];

class AdminAuthService {
  /**
   * Fetches the role-based administrative user record from Firestore.
   * Ensures authentication has initialized, normalizes legacy role strings ('Super Admin' -> 'super_admin'),
   * and synchronizes the verified owner's Super Admin record across named and default Firestore instances.
   */
  async fetchAdminUser(uid: string, email?: string | null): Promise<AdminUserRecord | null> {
    if (!uid || typeof uid !== 'string') return null;

    if (typeof auth.authStateReady === 'function') {
      try {
        await auth.authStateReady();
      } catch {
        // ignore
      }
    }

    const resolvedEmail = (email || auth.currentUser?.email || '').trim();
    const isOwner = isVerifiedOwnerAccount(uid, resolvedEmail);

    let snapNamed: any = null;
    let snapDefault: any = null;
    let namedErr: any = null;
    let defaultErr: any = null;

    // 1. Check named DB first
    try {
      snapNamed = await getDoc(doc(db, 'admin_users', uid));
    } catch (err) {
      namedErr = err;
    }

    // 2. Check (default) DB where original admin_users record was bootstrapped
    if (!snapNamed || !snapNamed.exists()) {
      try {
        snapDefault = await getDoc(doc(dbDefault, 'admin_users', uid));
      } catch (err) {
        defaultErr = err;
      }
    }

    // 3. If authenticated user is the verified owner and their record is under VERIFIED_OWNER_UID in (default)
    if (
      isOwner &&
      (!snapNamed || !snapNamed.exists()) &&
      (!snapDefault || !snapDefault.exists()) &&
      uid !== VERIFIED_OWNER_UID
    ) {
      try {
        snapDefault = await getDoc(doc(dbDefault, 'admin_users', VERIFIED_OWNER_UID));
      } catch {
        // ignore
      }
    }

    const activeSnap =
      snapNamed && snapNamed.exists()
        ? snapNamed
        : snapDefault && snapDefault.exists()
        ? snapDefault
        : null;

    // 4. If no document was found in either DB
    if (!activeSnap) {
      // If the user is the verified owner (authenticated via Firebase Auth), restore and sync their Super Admin record
      if (isOwner) {
        const nowIso = new Date().toISOString();
        const ownerRecord: AdminUserRecord = {
          uid,
          email: resolvedEmail || VERIFIED_OWNER_EMAIL,
          role: 'super_admin',
          displayName: auth.currentUser?.displayName || 'Platform Administrator',
          status: 'active',
          createdAt: nowIso,
          updatedAt: nowIso,
          assignedBy: 'system_bootstrap',
        };

        // Synchronize owner record to named DB and default DB so Firestore security rules (isSuperAdmin) succeed
        if (auth.currentUser && auth.currentUser.uid === uid) {
          setDoc(doc(db, 'admin_users', uid), ownerRecord, { merge: true }).catch(() => {});
          setDoc(doc(dbDefault, 'admin_users', uid), ownerRecord, { merge: true }).catch(() => {});
        }

        return ownerRecord;
      }

      // If both reads failed due to network/unavailable errors (not simply missing doc), surface error
      if (namedErr && defaultErr) {
        const errCode = namedErr?.code || defaultErr?.code || '';
        if (errCode === 'unavailable' || errCode === 'deadline-exceeded') {
          throw new Error('Network error while verifying administrative permissions. Please check your connection and retry.');
        }
      }

      return null;
    }

    const data = activeSnap.data();
    let createdAtStr = new Date().toISOString();
    if (data.createdAt) {
      if (typeof data.createdAt === 'string') {
        createdAtStr = data.createdAt;
      } else if (typeof data.createdAt.toDate === 'function') {
        createdAtStr = data.createdAt.toDate().toISOString();
      }
    }

    const normalizedRole: UserRole = isOwner
      ? 'super_admin'
      : normalizeAdminRole(data.role);
    const normalizedStatus = normalizeAdminStatus(data.status, isOwner);

    const record: AdminUserRecord = {
      uid: uid || activeSnap.id,
      email: data.email || resolvedEmail || (isOwner ? VERIFIED_OWNER_EMAIL : ''),
      role: normalizedRole,
      displayName: data.displayName || auth.currentUser?.displayName || (isOwner ? 'Platform Administrator' : ''),
      status: normalizedStatus,
      universityId: data.universityId,
      academicUnitId: data.academicUnitId,
      departmentId: data.departmentId,
      createdAt: createdAtStr,
      updatedAt: data.updatedAt,
      assignedBy: data.assignedBy || (isOwner ? 'system_bootstrap' : undefined),
    };

    // If the record was only in dbDefault or had an unnormalized role ('Super Admin') or non-active status for owner,
    // synchronize the normalized document to both db (named) and dbDefault
    const needsSyncToNamed = !snapNamed || !snapNamed.exists() || data.role !== normalizedRole || data.status !== normalizedStatus;
    if (needsSyncToNamed && auth.currentUser && auth.currentUser.uid === uid) {
      const syncPayload = {
        uid: record.uid,
        email: record.email,
        role: record.role,
        displayName: record.displayName,
        status: record.status,
        assignedBy: record.assignedBy || 'system_bootstrap',
        updatedAt: new Date().toISOString(),
      };
      setDoc(doc(db, 'admin_users', uid), syncPayload, { merge: true }).catch(() => {});
      if (data.role !== normalizedRole || data.status !== normalizedStatus) {
        setDoc(doc(dbDefault, 'admin_users', uid), syncPayload, { merge: true }).catch(() => {});
      }
    }

    return record;
  }

  /**
   * Verifies if the authenticated UID possesses verified active Super Admin status
   */
  async isSuperAdmin(uid: string, email?: string | null): Promise<boolean> {
    if (!uid) return false;
    const admin = await this.fetchAdminUser(uid, email);
    return Boolean(admin && admin.role === 'super_admin' && admin.status === 'active');
  }

  /**
   * Loads real, uninvented platform statistics directly from Firestore collections.
   * Uses getCountFromServer for bandwidth efficiency.
   * If a collection is not yet populated or accessible, safely returns 0 without inventing fake numbers.
   */
  async fetchPlatformStats(): Promise<AdminPlatformStats> {
    const stats: AdminPlatformStats = {
      universities: 0,
      academicUnits: 0,
      departments: 0,
      programmes: 0,
      courses: 0,
      materials: 0,
      students: 0,
      lecturers: 0,
      canonicalCourses: 0,
      catalogueCourses: 0,
      lastUpdated: new Date().toISOString(),
    };

    const getCollectionCount = async (collName: string): Promise<number> => {
      try {
        const snap = await getCountFromServer(collection(db, collName));
        const count = snap.data().count;
        if (count > 0) return count;
      } catch {
        // continue to fallback
      }
      try {
        const snapDef = await getCountFromServer(collection(dbDefault, collName));
        return snapDef.data().count;
      } catch {
        return 0;
      }
    };

    try {
      const [
        uniCount,
        unitCount,
        deptCount,
        progCount,
        canonCount,
        catCount,
        matCount,
        acadMatCount,
        studCount,
        lectCount,
      ] = await Promise.all([
        getCollectionCount('universities'),
        getCollectionCount('academic_units'),
        getCollectionCount('departments'),
        getCollectionCount('programmes'),
        getCollectionCount('canonical_courses'),
        getCollectionCount('catalogue_courses'),
        getCollectionCount('materials'),
        getCollectionCount('academic_materials'),
        getCollectionCount('students'),
        getCollectionCount('lecturers'),
      ]);

      stats.universities = uniCount;
      stats.academicUnits = unitCount;
      stats.departments = deptCount;
      stats.programmes = progCount;
      stats.canonicalCourses = canonCount;
      stats.catalogueCourses = catCount;
      // Courses stat displays canonical accredited courses
      stats.courses = canonCount > 0 ? canonCount : catCount;
      stats.materials = matCount > 0 ? matCount : acadMatCount;

      let finalStudCount = studCount;
      if (finalStudCount === 0) {
        try {
          const userCount = await getCollectionCount('users');
          if (userCount > 0) {
            finalStudCount = userCount;
          } else {
            const res = await fetch('/api/admin/students?pageSize=1');
            if (res.ok) {
              const d = await res.json();
              if (d.success && typeof d.total === 'number') {
                finalStudCount = d.total;
              }
            }
          }
        } catch {
          // ignore
        }
      }

      stats.students = finalStudCount;
      stats.lecturers = lectCount;
      stats.lastUpdated = new Date().toISOString();
    } catch (err) {
      console.warn('AdminAuthService: Could not load full platform counts:', err);
    }

    return stats;
  }
}

export const adminAuthService = new AdminAuthService();
