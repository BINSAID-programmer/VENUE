import {
  collection,
  query,
  where,
  getDocs,
  limit,
  orderBy,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getCountFromServer,
} from 'firebase/firestore';
import { db, dbDefault, handleFirestoreError, OperationType, auth } from './firebase';
import { adminAuditService } from './adminAuditService';
import {
  UniversityRecord,
  AcademicUnitRecord,
  AcademicUnitType,
  DepartmentRecord,
  ProgrammeRecord,
  CourseRecord,
  ProgrammeYearCurriculum,
  ProgrammeSemesterCurriculum,
  ProgrammeYearConfig,
  ProgrammeSemesterConfig,
  CanonicalCourseRecord,
  ProgrammeCourseRecord,
} from '../types';
import {
  OFFICIAL_UDSM_UNIVERSITY,
  AUDITED_ACADEMIC_UNITS,
  AUDITED_DEPARTMENTS,
  AUDITED_PROGRAMMES,
  AUDITED_CANONICAL_COURSES,
  AUDITED_PROGRAMME_COURSES,
} from '../data/udsmAuditedCatalogue2025';
import {
  UDSM_PROGRAMMES,
  UDSM_PROGRAMME_COURSES,
  UDSM_VERIFIED_COURSES,
} from '../data/udsmProspectus2025';

export function normalizeCatalogueRefId(raw?: string): string {
  return String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/^udsm[_-]/, '');
}

export function normalizeYearValue(raw: number | string | undefined | null): number {
  if (typeof raw === 'number' && !Number.isNaN(raw)) return raw;
  const str = String(raw ?? '').trim().toLowerCase();
  const numMatch = str.match(/\d+/);
  if (numMatch) return Number(numMatch[0]);
  if (str.includes('first') || str.endsWith(' i')) return 1;
  if (str.includes('second') || str.endsWith(' ii')) return 2;
  if (str.includes('third') || str.endsWith(' iii')) return 3;
  if (str.includes('fourth') || str.endsWith(' iv')) return 4;
  if (str.includes('fifth') || str.endsWith(' v')) return 5;
  return Number(raw) || 0;
}

export function normalizeSemesterValue(raw: number | string | undefined | null): number {
  if (typeof raw === 'number' && !Number.isNaN(raw)) return raw;
  const str = String(raw ?? '').trim().toLowerCase();
  const numMatch = str.match(/\d+/);
  if (numMatch) return Number(numMatch[0]);
  if (str === 'ii' || str.endsWith(' ii') || str.includes('second')) return 2;
  if (str === 'iii' || str.endsWith(' iii') || str.includes('third')) return 3;
  if (str === 'i' || str.endsWith(' i') || str.includes('first')) return 1;
  return Number(raw) || 0;
}

export function getAcademicUnitAliases(unitId: string): Set<string> {
  const clean = String(unitId || '').trim().toLowerCase();
  const base = normalizeCatalogueRefId(clean);
  const aliases = new Set<string>([clean, base, `udsm_${base}`, `udsm-${base}`]);

  const matchedAudited = AUDITED_ACADEMIC_UNITS.find(
    (u) =>
      u.id.toLowerCase() === clean ||
      u.id.toLowerCase() === base ||
      (u.shortName || '').toLowerCase() === base ||
      (u.abbreviation || '').toLowerCase() === base
  );
  if (matchedAudited) {
    const mId = matchedAudited.id.toLowerCase();
    aliases.add(mId);
    aliases.add(`udsm_${mId}`);
    if (matchedAudited.shortName) aliases.add(matchedAudited.shortName.toLowerCase());
  }
  return aliases;
}

export function getDepartmentAliases(departmentId: string): Set<string> {
  const clean = String(departmentId || '').trim().toLowerCase();
  const base = normalizeCatalogueRefId(clean);
  const aliases = new Set<string>([clean, base]);

  const deptAliasPairs: Array<[string[], string]> = [
    [['dept-math', 'udsm_conas_math', 'conas_math', 'mathematics'], 'dept-math'],
    [['dept-stats', 'udsm_coss_stat', 'coss_stat', 'statistics'], 'dept-stats'],
    [['dept-phys', 'udsm_conas_phys', 'conas_phys', 'physics'], 'dept-phys'],
    [['dept-chem', 'udsm_conas_chem', 'conas_chem', 'chemistry'], 'dept-chem'],
    [['dept-botany', 'udsm_conas_bot', 'conas_bot', 'botany'], 'dept-botany'],
    [['dept-zoology', 'udsm_conas_zwc', 'conas_zwc', 'zoology'], 'dept-zoology'],
    [['dept-biotech', 'udsm_conas_mbb', 'conas_mbb', 'biotechnology', 'dept-mbb'], 'dept-biotech'],
    [['dept-cse', 'udsm_coict_cse', 'coict_cse'], 'dept-cse'],
    [['dept-ete', 'udsm_coict_ete', 'coict_ete'], 'dept-ete'],
    [['dept-economics', 'udsm_udse_econ', 'udse_econ'], 'dept-economics'],
    [['dept-applied-economics', 'udsm_udse_aecon'], 'dept-applied-economics'],
  ];

  for (const [group, canonical] of deptAliasPairs) {
    if (group.includes(clean) || group.includes(base) || clean === canonical) {
      aliases.add(canonical);
      group.forEach((g) => aliases.add(g));
    }
  }

  return aliases;
}

export function getProgrammeAliases(programmeId: string): Set<string> {
  const clean = String(programmeId || '').trim().toLowerCase();
  const base = normalizeCatalogueRefId(clean);
  const dashBase = base.replace(/_/g, '-');
  const underscoreBase = base.replace(/-/g, '_');
  const aliases = new Set<string>([
    clean,
    base,
    dashBase,
    underscoreBase,
    `udsm_${base}`,
    `udsm_${underscoreBase}`,
    `udsm_prog_${base}`,
    `udsm_prog_${underscoreBase}`,
  ]);

  const progAliasGroups: string[][] = [
    ['math-stats', 'bsc_math_stats', 'udsm_prog_bsc_math_stats', 'bsc-math-stats', 'udsm_bsc_math_stats'],
    ['bsc-math', 'bsc-mth', 'bsc_math', 'udsm_prog_bsc_math'],
    ['bsc-actuarial', 'bsc_actuarial', 'udsm_prog_bsc_actuarial', 'actuarial'],
    ['bsc-cs', 'bsc_cs', 'udsm_prog_bsc_cs'],
    ['bsc-bit', 'bsc_bit', 'udsm_prog_bsc_bit'],
    ['bsc-ceit', 'bsc_ceit', 'udsm_prog_bsc_ceit'],
    ['bsc-telecom', 'bsc_te', 'udsm_prog_bsc_te'],
    ['bsc-esc', 'bsc_es', 'udsm_prog_bsc_es', 'bsc-es'],
    ['ba-stat', 'ba_stats', 'udsm_prog_ba_stats', 'ba-statistics', 'bsc-stats', 'bsc_stats'],
    ['ba-economics', 'ba_econ', 'udsm_prog_ba_econ', 'ba-econ'],
    ['ba-econ-stats', 'ba_econ_stat', 'udsm_prog_ba_econ_stat'],
    ['bsc-ed', 'bsc_ed', 'udsm_prog_bsc_ed'],
    ['bsc-ed-botany', 'bsc-botany', 'bsc-ed'],
    ['bsc-ed-chem', 'bsc-chem', 'bsc-ed'],
    ['bsc-ed-phys', 'bsc-phys', 'bsc-ed'],
    ['ba-history-political-science', 'ba-hist-ps', 'ba-history', 'ba-pspa'],
    ['bsc-mol-bio', 'bsc-mbb', 'udsm_prog_bsc_mbb', 'bsc_mbb'],
  ];

  for (const group of progAliasGroups) {
    if (group.includes(clean) || group.includes(base) || group.includes(dashBase)) {
      group.forEach((g) => aliases.add(g));
    }
  }

  return aliases;
}

export interface CourseUsageRecord {
  programmeId: string;
  programmeName: string;
  yearOfStudy: number;
  semester: number;
  status: string;
  credits: number;
  academicUnitId?: string;
  departmentId?: string;
}

export interface CatalogueAuditLogEntry {
  action:
    | 'create_unit'
    | 'update_unit'
    | 'archive_unit'
    | 'delete_unit'
    | 'create_department'
    | 'update_department'
    | 'archive_department'
    | 'delete_department'
    | 'create_programme'
    | 'update_programme'
    | 'archive_programme'
    | 'delete_programme'
    | 'add_year'
    | 'edit_year'
    | 'delete_year'
    | 'add_semester'
    | 'edit_semester'
    | 'delete_semester'
    | 'update_duration'
    | 'create_course'
    | 'edit_course'
    | 'archive_course'
    | 'delete_course'
    | 'assign_course'
    | 'edit_programme_course'
    | 'remove_course';
  targetType:
    | 'academic_unit'
    | 'department'
    | 'programme'
    | 'programme_year'
    | 'programme_semester'
    | 'canonical_course'
    | 'programme_course';
  targetId: string;
  adminUid: string;
  adminEmail?: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface CatalogueSearchResult {
  type: 'unit' | 'department' | 'programme' | 'course';
  id: string;
  code?: string;
  title: string;
  subtitle: string;
  badge?: string;
  unitId?: string;
  departmentId?: string;
  programmeId?: string;
  year?: number;
  semester?: number;
}

export interface AcademicUnitDependencyCheckResult {
  hasDependencies: boolean;
  departmentCount: number;
  programmeCount: number;
  courseCount: number;
  studentCount: number;
  lecturerCount: number;
  materialCount: number;
  totalDependencies: number;
  sampleDepartments: string[];
  sampleProgrammes: string[];
}

export interface DepartmentDependencyCheckResult {
  hasDependencies: boolean;
  programmeCount: number;
  courseCount: number;
  studentCount: number;
  lecturerCount: number;
  materialCount: number;
  totalDependencies: number;
  sampleProgrammes: string[];
}

export interface ProgrammeDependencyCheckResult {
  hasDependencies: boolean;
  catalogueCourseCount: number;
  programmeCourseCount: number;
  totalCourses: number;
  studentCount?: number;
  materialCount?: number;
  careerCount?: number;
  totalDependencies?: number;
  sampleCourses: {
    code: string;
    title: string;
    year: number;
    semester: number;
  }[];
}

export interface CanonicalCourseDependencyCheckResult {
  hasDependencies: boolean;
  usages: CourseUsageRecord[];
  materialCount: number;
  lecturerAssignmentCount: number;
  totalDependencies: number;
}

class AdminCatalogueService {
  // In-memory caches to prevent redundant Firestore reads
  private universitiesCache: UniversityRecord[] | null = null;
  private unitsCache: AcademicUnitRecord[] | null = null;
  private departmentsByUnitCache = new Map<string, DepartmentRecord[]>();
  private programmesByDeptCache = new Map<string, ProgrammeRecord[]>();
  private coursesCache = new Map<string, CourseRecord[]>(); // key: `${programmeId}_y${year}_s${semester}`
  private allProgrammesCache: ProgrammeRecord[] | null = null;
  private allDepartmentsCache: DepartmentRecord[] | null = null;

  /**
   * Helper: Query both dbDefault (where the full 6,600+ seeded catalogue resides) and db (named database)
   */
  private async queryBothDatabases(
    collectionName: string,
    buildQuery?: (colRef: any) => any
  ): Promise<Array<{ id: string; data: Record<string, any> }>> {
    const merged = new Map<string, { id: string; data: Record<string, any> }>();
    let succeededCount = 0;
    let lastError: any = null;

    const fetchFromDb = async (database: any) => {
      try {
        const colRef = collection(database, collectionName);
        const q = buildQuery ? buildQuery(colRef) : colRef;
        const snap = await getDocs(q);
        succeededCount++;
        for (const d of snap.docs) {
          merged.set(d.id, { id: d.id, data: d.data() as Record<string, any> });
        }
      } catch (err) {
        lastError = err;
      }
    };

    // Read from dbDefault first (full canonical catalogue), then overlay db
    await fetchFromDb(dbDefault);
    await fetchFromDb(db);

    if (succeededCount === 0 && lastError) {
      throw lastError;
    }

    return Array.from(merged.values());
  }

  private async getDocFromBothDatabases(
    collectionName: string,
    docId: string
  ): Promise<{ id: string; data: Record<string, any> } | null> {
    if (!docId) return null;
    for (const database of [db, dbDefault]) {
      try {
        const snap = await getDoc(doc(database, collectionName, docId));
        if (snap.exists()) {
          return { id: snap.id, data: snap.data() as Record<string, any> };
        }
      } catch {
        // continue to fallback database
      }
    }
    return null;
  }

  private async setDocInBothDatabases(
    collectionName: string,
    docId: string,
    payload: Record<string, any>,
    options?: { merge?: boolean }
  ): Promise<void> {
    let wroteAny = false;
    let lastErr: any = null;
    for (const database of [db, dbDefault]) {
      try {
        if (options) {
          await setDoc(doc(database, collectionName, docId), payload, options);
        } else {
          await setDoc(doc(database, collectionName, docId), payload);
        }
        wroteAny = true;
      } catch (err) {
        lastErr = err;
      }
    }
    if (!wroteAny && lastErr) {
      throw lastErr;
    }
  }

  private async deleteDocInBothDatabases(
    collectionName: string,
    docId: string
  ): Promise<void> {
    let deletedAny = false;
    let lastErr: any = null;
    for (const database of [db, dbDefault]) {
      try {
        await deleteDoc(doc(database, collectionName, docId));
        deletedAny = true;
      } catch (err) {
        lastErr = err;
      }
    }
    if (!deletedAny && lastErr) {
      throw lastErr;
    }
  }

  getAcademicUnitAliases(unitId: string): Set<string> {
    return getAcademicUnitAliases(unitId);
  }

  getDepartmentAliases(departmentId: string): Set<string> {
    return getDepartmentAliases(departmentId);
  }

  getProgrammeAliases(programmeId: string): Set<string> {
    return getProgrammeAliases(programmeId);
  }

  /**
   * 0. Fetch all Universities
   */
  async getUniversities(): Promise<UniversityRecord[]> {
    if (this.universitiesCache && this.universitiesCache.length > 0) {
      return this.universitiesCache;
    }

    try {
      const docs = await this.queryBothDatabases('universities');
      if (docs.length > 0) {
        const list = docs.map((d) => ({
          id: d.id,
          ...(d.data as any),
        })) as UniversityRecord[];
        list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        this.universitiesCache = list;
        return list;
      }
    } catch (err) {
      console.warn('AdminCatalogueService: Error reading universities:', err);
    }

    const defaultUni: UniversityRecord = {
      id: 'udsm',
      name: 'University of Dar es Salaam',
      shortName: 'UDSM',
      country: 'Tanzania',
      status: 'active',
      verified: true,
      source: 'Official Charter',
    };
    return [defaultUni];
  }

  /**
   * 0B. Create University (Supports existing schema)
   */
  async createUniversity(data: {
    id?: string;
    name: string;
    shortName: string;
    country: string;
  }): Promise<{ success: boolean; university?: UniversityRecord; error?: string }> {
    const cleanName = data.name.trim();
    const cleanShort = data.shortName.trim().toUpperCase();
    if (!cleanName) return { success: false, error: 'University name is required.' };
    if (!cleanShort) return { success: false, error: 'University abbreviation/code is required.' };

    const proposedId = (data.id?.trim() || cleanShort.toLowerCase()).replace(/[^a-z0-9_\-]+/g, '-');
    if (!proposedId || !/^[a-zA-Z0-9_\-]+$/.test(proposedId)) {
      return { success: false, error: 'University ID must be alphanumeric.' };
    }

    try {
      const existingSnap = await this.getDocFromBothDatabases('universities', proposedId);
      if (existingSnap) {
        return { success: false, error: `University with ID "${proposedId}" already exists.` };
      }

      const all = await this.getUniversities();
      if (all.some((u) => u.name.toLowerCase() === cleanName.toLowerCase())) {
        return { success: false, error: `University "${cleanName}" already exists.` };
      }

      const record: UniversityRecord = {
        id: proposedId,
        name: cleanName,
        shortName: cleanShort,
        country: data.country.trim() || 'Tanzania',
        status: 'active',
        verified: true,
        source: 'Official Academic Catalogue',
      };

      await this.setDocInBothDatabases('universities', proposedId, record);
      this.universitiesCache = null;
      return { success: true, university: record };
    } catch (err: any) {
      console.error('Error creating university:', err);
      return { success: false, error: err?.message || 'Failed to create university.' };
    }
  }

  /**
   * 0C. Create Academic Unit (College, School, Institute, etc.)
   */
  async createAcademicUnit(data: {
    id?: string;
    universityId: string;
    name: string;
    type: AcademicUnitType;
    shortName?: string;
  }): Promise<{ success: boolean; unit?: AcademicUnitRecord; error?: string }> {
    const cleanName = data.name.trim();
    const uniId = (data.universityId || 'udsm').toLowerCase().trim();
    if (!cleanName) return { success: false, error: 'Academic Unit name is required.' };

    const cleanShort = data.shortName?.trim().toUpperCase() || '';
    const proposedId = (
      data.id?.trim() ||
      cleanShort.toLowerCase() ||
      cleanName.toLowerCase().replace(/[^a-z0-9_\-]+/g, '-')
    ).replace(/[^a-z0-9_\-]+/g, '-');

    if (!proposedId || !/^[a-zA-Z0-9_\-]+$/.test(proposedId)) {
      return { success: false, error: 'Academic Unit ID must contain only alphanumeric characters or dashes.' };
    }

    try {
      const existingSnap = await this.getDocFromBothDatabases('academic_units', proposedId);
      if (existingSnap) {
        return { success: false, error: `Academic Unit with ID "${proposedId}" already exists.` };
      }

      const all = await this.getAcademicUnits(uniId);
      if (all.some((u) => u.name.toLowerCase() === cleanName.toLowerCase())) {
        return { success: false, error: `An Academic Unit named "${cleanName}" already exists in this University.` };
      }

      const record: AcademicUnitRecord = {
        id: proposedId,
        universityId: uniId,
        name: cleanName,
        type: data.type || 'College',
        shortName: cleanShort || proposedId.toUpperCase(),
        verified: true,
        source: 'Official Academic Catalogue',
      };

      await this.setDocInBothDatabases('academic_units', proposedId, record);
      this.unitsCache = null;
      return { success: true, unit: record };
    } catch (err: any) {
      console.error('Error creating academic unit:', err);
      return { success: false, error: err?.message || 'Failed to create academic unit.' };
    }
  }

  /**
   * 0D. Create Department
   */
  async createDepartment(data: {
    id?: string;
    universityId: string;
    academicUnitId: string;
    name: string;
    shortName?: string;
  }): Promise<{ success: boolean; department?: DepartmentRecord; error?: string }> {
    const cleanName = data.name.trim();
    const cleanUnitId = data.academicUnitId.toLowerCase().trim();
    const uniId = (data.universityId || 'udsm').toLowerCase().trim();

    if (!cleanName) return { success: false, error: 'Department name is required.' };
    if (!cleanUnitId) return { success: false, error: 'Academic Unit relationship is required.' };

    try {
      // Verify parent unit exists
      const units = await this.getAcademicUnits(uniId);
      const unitAliases = getAcademicUnitAliases(cleanUnitId);
      const unitExists = units.some((u) => unitAliases.has(u.id.toLowerCase()));
      if (!unitExists) {
        return { success: false, error: `Academic Unit "${cleanUnitId}" does not exist in the catalogue.` };
      }

      // Check duplicate within the Academic Unit
      const existingDepts = await this.getDepartmentsByUnit(cleanUnitId);
      if (existingDepts.some((d) => d.name.toLowerCase() === cleanName.toLowerCase())) {
        return { success: false, error: `A Department named "${cleanName}" already exists under this Academic Unit.` };
      }

      const slug = cleanName.toLowerCase().replace(/[^a-z0-9_\-]+/g, '-');
      const proposedId = (data.id?.trim() || `dept-${slug}`).replace(/[^a-z0-9_\-]+/g, '-');

      const record: DepartmentRecord = {
        id: proposedId,
        universityId: uniId,
        academicUnitId: cleanUnitId,
        name: cleanName,
        shortName: data.shortName?.trim() || undefined,
        verified: true,
        source: 'Official Academic Catalogue',
      };

      await this.setDocInBothDatabases('departments', proposedId, record);
      this.departmentsByUnitCache.delete(cleanUnitId);
      this.allDepartmentsCache = null;
      return { success: true, department: record };
    } catch (err: any) {
      console.error('Error creating department:', err);
      return { success: false, error: err?.message || 'Failed to create department.' };
    }
  }

  /**
   * 0E. Update Academic Unit (Preserves ID and university relationship, prevents duplicate names)
   */
  async updateAcademicUnit(
    unitId: string,
    updates: {
      name?: string;
      type?: AcademicUnitType;
      shortName?: string;
      description?: string;
      status?: 'active' | 'archived' | 'inactive';
      active?: boolean;
      archived?: boolean;
    }
  ): Promise<{ success: boolean; unit?: AcademicUnitRecord; error?: string }> {
    const cleanId = unitId.toLowerCase().trim();
    if (!cleanId) return { success: false, error: 'Missing Academic Unit ID.' };

    try {
      const units = await this.getAcademicUnits('udsm');
      const unitAliases = getAcademicUnitAliases(cleanId);
      const existing = units.find((u) => unitAliases.has(u.id.toLowerCase()));
      if (!existing) {
        return { success: false, error: `Academic Unit "${cleanId}" not found.` };
      }

      const newName = updates.name?.trim() || existing.name;
      if (!newName) {
        return { success: false, error: 'Academic Unit name cannot be empty.' };
      }

      // Check duplicate name within the same University
      if (newName.toLowerCase() !== existing.name.toLowerCase()) {
        const duplicate = units.find(
          (u) =>
            !unitAliases.has(u.id.toLowerCase()) &&
            u.name.trim().toLowerCase() === newName.toLowerCase()
        );
        if (duplicate) {
          return {
            success: false,
            error: `An Academic Unit named "${newName}" already exists in this University (${duplicate.shortName || duplicate.id}).`,
          };
        }
      }

      const newStatus: 'active' | 'archived' | 'inactive' =
        updates.status ||
        (updates.archived === true
          ? 'archived'
          : updates.active === false
          ? 'inactive'
          : existing.status || 'active');

      const updatedUnit: AcademicUnitRecord = {
        ...existing,
        name: newName,
        type: updates.type || existing.type,
        shortName: updates.shortName !== undefined ? updates.shortName.trim().toUpperCase() : existing.shortName,
        abbreviation: updates.shortName !== undefined ? updates.shortName.trim().toUpperCase() : existing.abbreviation,
        description: updates.description !== undefined ? updates.description.trim() : existing.description,
        status: newStatus,
        active: newStatus === 'active',
        archived: newStatus === 'archived',
        updatedAt: new Date().toISOString(),
      };

      await this.setDocInBothDatabases('academic_units', existing.id, updatedUnit, { merge: true });
      this.unitsCache = null;

      await this.recordCatalogueAuditLog({
        action: newStatus === 'archived' ? 'archive_unit' : 'update_unit',
        targetType: 'academic_unit',
        targetId: existing.id,
        adminUid: auth.currentUser?.uid || 'super_admin',
        adminEmail: auth.currentUser?.email || undefined,
        details: {
          name: updatedUnit.name,
          type: updatedUnit.type,
          shortName: updatedUnit.shortName,
          status: updatedUnit.status,
        },
        timestamp: new Date().toISOString(),
      });

      return { success: true, unit: updatedUnit };
    } catch (err: any) {
      console.error('Error updating academic unit:', err);
      return { success: false, error: err?.message || 'Failed to update Academic Unit.' };
    }
  }

  /**
   * 0F. Check Academic Unit Dependencies before Deletion
   * Inspects departments, programmes, courses/relationships, students, lecturers, and materials.
   */
  async checkAcademicUnitDependencies(
    unitId: string
  ): Promise<AcademicUnitDependencyCheckResult> {
    const cleanId = unitId.toLowerCase().trim();
    const unitAliases = Array.from(getAcademicUnitAliases(cleanId)).slice(0, 10);

    let departmentCount = 0;
    let programmeCount = 0;
    let courseCount = 0;
    let studentCount = 0;
    let lecturerCount = 0;
    let materialCount = 0;
    const sampleDepartments: string[] = [];
    const sampleProgrammes: string[] = [];

    try {
      const depts = await this.getDepartmentsByUnit(cleanId);
      departmentCount = depts.length;
      depts.slice(0, 5).forEach((d) => sampleDepartments.push(d.name));

      const allProgs = await this.getAllProgrammes();
      const unitProgs = allProgs.filter((p) =>
        unitAliases.includes((p.academicUnitId || '').toLowerCase().trim())
      );
      programmeCount = unitProgs.length;
      unitProgs.slice(0, 5).forEach((p) => sampleProgrammes.push(`${p.code || p.shortName || p.id}: ${p.name}`));

      if (unitAliases.length > 0) {
        const [courseDocs, studentDocs, lecturerDocs, materialDocs] = await Promise.all([
          this.queryBothDatabases('catalogue_courses', (colRef) =>
            query(colRef, where('academicUnitId', 'in', unitAliases), limit(50))
          ).catch(() => []),
          this.queryBothDatabases('users', (colRef) =>
            query(colRef, where('academicUnitId', 'in', unitAliases), limit(50))
          ).catch(() => []),
          this.queryBothDatabases('lecturers', (colRef) =>
            query(colRef, where('academicUnitId', 'in', unitAliases), limit(50))
          ).catch(() => []),
          this.queryBothDatabases('materials', (colRef) =>
            query(colRef, where('academicUnitId', 'in', unitAliases), limit(50))
          ).catch(() => []),
        ]);

        courseCount = courseDocs.length;
        studentCount = studentDocs.length;
        lecturerCount = lecturerDocs.length;
        materialCount = materialDocs.length;
      }
    } catch (err) {
      console.warn(`Error checking Academic Unit dependencies for ${cleanId}:`, err);
    }

    const totalDependencies =
      departmentCount + programmeCount + courseCount + studentCount + lecturerCount + materialCount;

    return {
      hasDependencies: totalDependencies > 0,
      departmentCount,
      programmeCount,
      courseCount,
      studentCount,
      lecturerCount,
      materialCount,
      totalDependencies,
      sampleDepartments,
      sampleProgrammes,
    };
  }

  /**
   * 0G. Archive Academic Unit
   */
  async archiveAcademicUnit(
    unitId: string,
    archived = true
  ): Promise<{ success: boolean; unit?: AcademicUnitRecord; error?: string }> {
    return this.updateAcademicUnit(unitId, {
      status: archived ? 'archived' : 'active',
      archived,
      active: !archived,
    });
  }

  /**
   * 0H. Delete Academic Unit (Blocked if dependencies exist)
   */
  async deleteAcademicUnit(
    unitId: string
  ): Promise<{ success: boolean; hasDependencies?: boolean; dependencies?: AcademicUnitDependencyCheckResult; error?: string }> {
    const cleanId = unitId.toLowerCase().trim();
    if (!cleanId) return { success: false, error: 'Missing Academic Unit ID.' };

    const depCheck = await this.checkAcademicUnitDependencies(cleanId);
    if (depCheck.hasDependencies) {
      return {
        success: false,
        hasDependencies: true,
        dependencies: depCheck,
        error: `Cannot hard-delete Academic Unit: It has ${depCheck.departmentCount} departments, ${depCheck.programmeCount} programmes, and ${depCheck.courseCount + depCheck.studentCount + depCheck.lecturerCount + depCheck.materialCount} dependent records. Please Archive this Academic Unit instead.`,
      };
    }

    try {
      await this.deleteDocInBothDatabases('academic_units', cleanId);
      this.unitsCache = null;

      await this.recordCatalogueAuditLog({
        action: 'delete_unit',
        targetType: 'academic_unit',
        targetId: cleanId,
        adminUid: auth.currentUser?.uid || 'super_admin',
        adminEmail: auth.currentUser?.email || undefined,
        timestamp: new Date().toISOString(),
      });

      return { success: true };
    } catch (err: any) {
      console.error('Error deleting academic unit:', err);
      return { success: false, error: err?.message || 'Failed to delete Academic Unit.' };
    }
  }

  /**
   * 0I. Update Department (Preserves ID and parent Academic Unit, prevents duplicate names)
   */
  async updateDepartment(
    departmentId: string,
    updates: {
      name?: string;
      shortName?: string;
      code?: string;
      description?: string;
      academicUnitId?: string;
      status?: 'active' | 'archived' | 'inactive';
      active?: boolean;
      archived?: boolean;
    }
  ): Promise<{ success: boolean; department?: DepartmentRecord; error?: string }> {
    const cleanId = departmentId.toLowerCase().trim();
    if (!cleanId) return { success: false, error: 'Missing Department ID.' };

    try {
      const allDepts = await this.getAllDepartments();
      const deptAliases = getDepartmentAliases(cleanId);
      const existing = allDepts.find((d) => deptAliases.has(d.id.toLowerCase()));
      if (!existing) {
        return { success: false, error: `Department "${cleanId}" not found.` };
      }

      const targetUnitId = (updates.academicUnitId || existing.academicUnitId).toLowerCase().trim();
      const newName = updates.name?.trim() || existing.name;
      if (!newName) {
        return { success: false, error: 'Department name cannot be empty.' };
      }

      // Prevent duplicate department names within the same Academic Unit
      const unitDepts = await this.getDepartmentsByUnit(targetUnitId);
      const duplicate = unitDepts.find(
        (d) =>
          !deptAliases.has(d.id.toLowerCase()) &&
          d.name.trim().toLowerCase() === newName.toLowerCase()
      );
      if (duplicate) {
        return {
          success: false,
          error: `A Department named "${newName}" already exists under this Academic Unit.`,
        };
      }

      const newStatus: 'active' | 'archived' | 'inactive' =
        updates.status ||
        (updates.archived === true
          ? 'archived'
          : updates.active === false
          ? 'inactive'
          : existing.status || 'active');

      const updatedDept: DepartmentRecord = {
        ...existing,
        academicUnitId: targetUnitId,
        name: newName,
        shortName: updates.shortName !== undefined ? updates.shortName.trim() : existing.shortName,
        code: updates.code !== undefined ? updates.code.trim().toUpperCase() : existing.code || existing.shortName,
        description: updates.description !== undefined ? updates.description.trim() : existing.description,
        status: newStatus,
        active: newStatus === 'active',
        archived: newStatus === 'archived',
        updatedAt: new Date().toISOString(),
      };

      await this.setDocInBothDatabases('departments', existing.id, updatedDept, { merge: true });
      this.departmentsByUnitCache.delete(existing.academicUnitId.toLowerCase().trim());
      this.departmentsByUnitCache.delete(targetUnitId);
      this.allDepartmentsCache = null;

      await this.recordCatalogueAuditLog({
        action: newStatus === 'archived' ? 'archive_department' : 'update_department',
        targetType: 'department',
        targetId: existing.id,
        adminUid: auth.currentUser?.uid || 'super_admin',
        adminEmail: auth.currentUser?.email || undefined,
        details: {
          name: updatedDept.name,
          shortName: updatedDept.shortName,
          academicUnitId: updatedDept.academicUnitId,
          status: updatedDept.status,
        },
        timestamp: new Date().toISOString(),
      });

      return { success: true, department: updatedDept };
    } catch (err: any) {
      console.error('Error updating department:', err);
      return { success: false, error: err?.message || 'Failed to update Department.' };
    }
  }

  /**
   * 0J. Check Department Dependencies before Deletion
   * Checks programmes, lecturer assignments, student placements, course relationships, and materials.
   */
  async checkDepartmentDependencies(
    departmentId: string
  ): Promise<DepartmentDependencyCheckResult> {
    const cleanId = departmentId.toLowerCase().trim();
    const deptAliases = Array.from(getDepartmentAliases(cleanId)).slice(0, 10);

    let programmeCount = 0;
    let courseCount = 0;
    let studentCount = 0;
    let lecturerCount = 0;
    let materialCount = 0;
    const sampleProgrammes: string[] = [];

    try {
      const progs = await this.getProgrammesByDepartment(cleanId);
      programmeCount = progs.length;
      progs.slice(0, 5).forEach((p) => sampleProgrammes.push(`${p.code || p.shortName || p.id}: ${p.name}`));

      if (deptAliases.length > 0) {
        const [courseDocs, studentDocs, lecturerDocs, materialDocs] = await Promise.all([
          this.queryBothDatabases('catalogue_courses', (colRef) =>
            query(colRef, where('departmentId', 'in', deptAliases), limit(50))
          ).catch(() => []),
          this.queryBothDatabases('users', (colRef) =>
            query(colRef, where('departmentId', 'in', deptAliases), limit(50))
          ).catch(() => []),
          this.queryBothDatabases('lecturers', (colRef) =>
            query(colRef, where('departmentId', 'in', deptAliases), limit(50))
          ).catch(() => []),
          this.queryBothDatabases('materials', (colRef) =>
            query(colRef, where('departmentId', 'in', deptAliases), limit(50))
          ).catch(() => []),
        ]);

        courseCount = courseDocs.length;
        studentCount = studentDocs.length;
        lecturerCount = lecturerDocs.length;
        materialCount = materialDocs.length;
      }
    } catch (err) {
      console.warn(`Error checking Department dependencies for ${cleanId}:`, err);
    }

    const totalDependencies =
      programmeCount + courseCount + studentCount + lecturerCount + materialCount;

    return {
      hasDependencies: totalDependencies > 0,
      programmeCount,
      courseCount,
      studentCount,
      lecturerCount,
      materialCount,
      totalDependencies,
      sampleProgrammes,
    };
  }

  /**
   * 0K. Archive Department
   */
  async archiveDepartment(
    departmentId: string,
    archived = true
  ): Promise<{ success: boolean; department?: DepartmentRecord; error?: string }> {
    return this.updateDepartment(departmentId, {
      status: archived ? 'archived' : 'active',
      archived,
      active: !archived,
    });
  }

  /**
   * 0L. Delete Department (Blocked if dependencies exist)
   */
  async deleteDepartment(
    departmentId: string,
    academicUnitId?: string
  ): Promise<{ success: boolean; hasDependencies?: boolean; dependencies?: DepartmentDependencyCheckResult; error?: string }> {
    const cleanId = departmentId.toLowerCase().trim();
    if (!cleanId) return { success: false, error: 'Missing Department ID.' };

    const depCheck = await this.checkDepartmentDependencies(cleanId);
    if (depCheck.hasDependencies) {
      return {
        success: false,
        hasDependencies: true,
        dependencies: depCheck,
        error: `Cannot hard-delete Department: It has ${depCheck.programmeCount} programmes, ${depCheck.courseCount} courses, ${depCheck.lecturerCount} lecturers, and ${depCheck.studentCount + depCheck.materialCount} student/material records. Please Archive this Department instead.`,
      };
    }

    try {
      await this.deleteDocInBothDatabases('departments', cleanId);
      if (academicUnitId) {
        this.departmentsByUnitCache.delete(academicUnitId.toLowerCase().trim());
      }
      this.allDepartmentsCache = null;

      await this.recordCatalogueAuditLog({
        action: 'delete_department',
        targetType: 'department',
        targetId: cleanId,
        adminUid: auth.currentUser?.uid || 'super_admin',
        adminEmail: auth.currentUser?.email || undefined,
        timestamp: new Date().toISOString(),
      });

      return { success: true };
    } catch (err: any) {
      console.error('Error deleting department:', err);
      return { success: false, error: err?.message || 'Failed to delete Department.' };
    }
  }

  /**
   * 1. Fetch Academic Units for University (defaults to udsm)
   */
  async getAcademicUnits(universityId = 'udsm'): Promise<AcademicUnitRecord[]> {
    const cleanUni = (universityId || 'udsm').toLowerCase().trim();
    if (this.unitsCache && this.unitsCache.length > 0 && cleanUni === 'udsm') {
      return this.unitsCache;
    }

    const unitsByKey = new Map<string, AcademicUnitRecord>();

    // 1. Seed with official audited UDSM academic units first
    if (cleanUni === 'udsm' || cleanUni.includes('dar es salaam')) {
      for (const u of AUDITED_ACADEMIC_UNITS) {
        const key = normalizeCatalogueRefId(u.id);
        unitsByKey.set(key, { ...u });
      }
    }

    // 2. Overlay Firestore academic_units from both dbDefault and db
    try {
      const docs = await this.queryBothDatabases('academic_units', (colRef) =>
        query(colRef, where('universityId', '==', cleanUni))
      );
      for (const d of docs) {
        const raw = { id: d.id, ...(d.data as any) } as AcademicUnitRecord;
        const key = normalizeCatalogueRefId(raw.id);
        const existing = unitsByKey.get(key);
        if (existing) {
          unitsByKey.set(key, {
            ...existing,
            ...raw,
            id: existing.id, // keep canonical short ID (e.g. 'conas') so child queries stay consistent
          });
        } else {
          unitsByKey.set(key, raw);
        }
      }
    } catch (err) {
      console.warn('AdminCatalogueService: Error reading academic_units from Firestore:', err);
    }

    const units = Array.from(unitsByKey.values());

    // Sort by Type (College, Constituent College, School, Institute, Centre) then by Name
    const typeRank: Record<string, number> = {
      College: 1,
      'Constituent College': 2,
      School: 3,
      Institute: 4,
      Centre: 5,
    };

    units.sort((a, b) => {
      const rankA = typeRank[a.type] || 99;
      const rankB = typeRank[b.type] || 99;
      if (rankA !== rankB) return rankA - rankB;
      return (a.name || '').localeCompare(b.name || '');
    });

    if (cleanUni === 'udsm') {
      this.unitsCache = units;
    }
    return units;
  }

  /**
   * 2. Fetch Departments belonging to a specific Academic Unit
   */
  async getDepartmentsByUnit(academicUnitId: string): Promise<DepartmentRecord[]> {
    if (!academicUnitId) return [];
    const cleanId = academicUnitId.toLowerCase().trim();

    if (this.departmentsByUnitCache.has(cleanId)) {
      return this.departmentsByUnitCache.get(cleanId)!;
    }

    const unitAliases = getAcademicUnitAliases(cleanId);
    const deptsByKey = new Map<string, DepartmentRecord>();

    // 1. Seed from official audited UDSM departments matching any alias of the unit
    for (const d of AUDITED_DEPARTMENTS) {
      if (unitAliases.has((d.academicUnitId || '').toLowerCase().trim())) {
        const key = d.name.trim().toLowerCase();
        deptsByKey.set(key, { ...d });
      }
    }

    // 2. Also check Firestore departments (across dbDefault and db) for any alias of academicUnitId
    try {
      const aliasList = Array.from(unitAliases).slice(0, 10);
      if (aliasList.length > 0) {
        const docs = await this.queryBothDatabases('departments', (colRef) =>
          query(colRef, where('academicUnitId', 'in', aliasList))
        );
        for (const docSnap of docs) {
          const raw = { id: docSnap.id, ...(docSnap.data as any) } as DepartmentRecord;
          const key = (raw.name || raw.id).trim().toLowerCase();
          const existing = deptsByKey.get(key);
          if (existing) {
            deptsByKey.set(key, {
              ...existing,
              ...raw,
              id: existing.id, // preserve canonical department ID (e.g. 'dept-math')
              academicUnitId: existing.academicUnitId,
            });
          } else {
            deptsByKey.set(key, raw);
          }
        }
      }
    } catch (err) {
      console.warn(`AdminCatalogueService: Error reading departments for unit ${cleanId}:`, err);
    }

    const depts = Array.from(deptsByKey.values());
    depts.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    this.departmentsByUnitCache.set(cleanId, depts);
    return depts;
  }

  /**
   * 3. Fetch Programmes under a specific Department
   */
  async getProgrammesByDepartment(departmentId: string): Promise<ProgrammeRecord[]> {
    if (!departmentId) return [];
    const cleanId = departmentId.toLowerCase().trim();

    if (this.programmesByDeptCache.has(cleanId)) {
      return this.programmesByDeptCache.get(cleanId)!;
    }

    const deptAliases = getDepartmentAliases(cleanId);
    const progsByKey = new Map<string, ProgrammeRecord>();

    // 1. Seed from official audited UDSM programmes matching any alias of the department
    for (const p of AUDITED_PROGRAMMES) {
      if (deptAliases.has((p.departmentId || '').toLowerCase().trim())) {
        const key = `${p.name.trim().toLowerCase()}__${(p.shortName || p.id).trim().toLowerCase()}`;
        progsByKey.set(key, { ...p });
      }
    }

    // 2. Also check Firestore programmes (across dbDefault and db) for any alias of departmentId
    try {
      const aliasList = Array.from(deptAliases).slice(0, 10);
      if (aliasList.length > 0) {
        const docs = await this.queryBothDatabases('programmes', (colRef) =>
          query(colRef, where('departmentId', 'in', aliasList))
        );
        for (const docSnap of docs) {
          const raw = { id: docSnap.id, ...(docSnap.data as any) } as ProgrammeRecord;
          // Match by canonical alias or name
          const rawAliases = getProgrammeAliases(raw.id);
          let matchedExistingKey: string | null = null;
          for (const [k, existingProg] of progsByKey.entries()) {
            if (
              rawAliases.has(existingProg.id.toLowerCase()) ||
              existingProg.name.trim().toLowerCase() === (raw.name || '').trim().toLowerCase()
            ) {
              matchedExistingKey = k;
              break;
            }
          }
          if (matchedExistingKey) {
            const existing = progsByKey.get(matchedExistingKey)!;
            progsByKey.set(matchedExistingKey, {
              ...existing,
              ...raw,
              id: existing.id, // preserve canonical programme ID (e.g. 'math-stats', 'bsc-cs')
              departmentId: existing.departmentId,
              academicUnitId: existing.academicUnitId,
            });
          } else {
            const key = `${(raw.name || raw.id).trim().toLowerCase()}__${raw.id.toLowerCase()}`;
            progsByKey.set(key, raw);
          }
        }
      }
    } catch (err) {
      console.warn(`AdminCatalogueService: Error reading programmes for dept ${cleanId}:`, err);
    }

    const progs = Array.from(progsByKey.values());
    progs.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    this.programmesByDeptCache.set(cleanId, progs);
    return progs;
  }

  /**
   * 4. Fetch Courses for a Programme + Year + Semester (scoped & progressive)
   */
  async getCoursesByTerm(
    programmeId: string,
    yearOfStudy: number | string,
    semester: number | string
  ): Promise<CourseRecord[]> {
    const cleanProgId = String(programmeId || '').toLowerCase().trim();
    const numYear = normalizeYearValue(yearOfStudy);
    const numSem = normalizeSemesterValue(semester);

    if (!cleanProgId || !numYear || !numSem) return [];

    const cacheKey = `${cleanProgId}_y${numYear}_s${numSem}`;

    if (this.coursesCache.has(cacheKey)) {
      return this.coursesCache.get(cacheKey)!;
    }

    const progAliases = getProgrammeAliases(cleanProgId);
    const coursesByCode = new Map<string, CourseRecord>();

    const normalizeCodeKey = (code?: string) =>
      String(code || '')
        .trim()
        .toUpperCase()
        .replace(/[\s_-]+/g, ' ');

    // 1. Build canonical course lookup from AUDITED_CANONICAL_COURSES
    const canonicalById = new Map<string, CanonicalCourseRecord>();
    for (const cc of AUDITED_CANONICAL_COURSES) {
      const ccCode = normalizeCodeKey(cc.code || cc.courseCode);
      canonicalById.set(cc.id.toLowerCase(), cc);
      if (ccCode) {
        canonicalById.set(ccCode, cc);
      }
    }

    // 2. Resolve from AUDITED_PROGRAMME_COURSES
    for (const rel of AUDITED_PROGRAMME_COURSES) {
      const relProg = (rel.programmeId || '').toLowerCase().trim();
      const relYear = normalizeYearValue(rel.yearOfStudy ?? (rel as any).year);
      const relSem = normalizeSemesterValue(rel.semester);

      if (progAliases.has(relProg) && relYear === numYear && relSem === numSem) {
        const rawCode = rel.code || rel.courseCode || '';
        const canon =
          canonicalById.get((rel.courseId || '').toLowerCase()) ||
          canonicalById.get(normalizeCodeKey(rawCode));
        const code = normalizeCodeKey(rawCode || canon?.code || canon?.courseCode || rel.courseId);
        if (!code) continue;

        const title =
          rel.title ||
          rel.courseTitle ||
          canon?.title ||
          canon?.courseTitle ||
          'University Course';
        const credits = Number(rel.credits ?? canon?.defaultCredits ?? canon?.credits ?? 12);
        const status = (rel.status || rel.courseType || 'Core') as any;
        const canonId =
          canon?.id || rel.courseId || code.toLowerCase().replace(/[^a-z0-9]+/g, '_');

        coursesByCode.set(code, {
          id: canonId,
          canonicalCourseId: canonId,
          code,
          courseCode: code,
          title,
          courseTitle: title,
          credits,
          status,
          courseType: status,
          programmeId: cleanProgId,
          academicUnitId: rel.academicUnitId || canon?.academicUnitId,
          departmentId: rel.departmentId || canon?.departmentId,
          yearOfStudy: numYear,
          year: numYear,
          semester: numSem,
          universityId: rel.universityId || 'udsm',
          verified: true,
        });
      }
    }

    // 3. Also resolve from UDSM_PROGRAMME_COURSES and UDSM_VERIFIED_COURSES
    for (const rel25 of UDSM_PROGRAMME_COURSES || []) {
      const relProg = (rel25.programmeId || '').toLowerCase().trim();
      const relYear = normalizeYearValue(rel25.yearOfStudy ?? (rel25 as any).year);
      const relSem = normalizeSemesterValue(rel25.semester);

      if (progAliases.has(relProg) && relYear === numYear && relSem === numSem) {
        const rawCode = rel25.code || rel25.courseCode || '';
        const code = normalizeCodeKey(rawCode || rel25.courseId);
        if (!code || coursesByCode.has(code)) continue;

        const canon =
          canonicalById.get((rel25.courseId || '').toLowerCase()) ||
          canonicalById.get(code);
        const title =
          rel25.title ||
          rel25.courseTitle ||
          canon?.title ||
          canon?.courseTitle ||
          'University Course';
        const credits = Number(rel25.credits ?? canon?.defaultCredits ?? 12);
        const status = (rel25.status || rel25.courseType || 'Core') as any;
        const canonId =
          rel25.courseId || canon?.id || code.toLowerCase().replace(/[^a-z0-9]+/g, '_');

        coursesByCode.set(code, {
          id: canonId,
          canonicalCourseId: canonId,
          code,
          courseCode: code,
          title,
          courseTitle: title,
          credits,
          status,
          courseType: status,
          programmeId: cleanProgId,
          academicUnitId: rel25.academicUnitId || canon?.academicUnitId,
          departmentId: rel25.departmentId || canon?.departmentId,
          yearOfStudy: numYear,
          year: numYear,
          semester: numSem,
          universityId: 'udsm',
          verified: true,
        });
      }
    }

    for (const vc of UDSM_VERIFIED_COURSES || []) {
      const vcProg = (vc.programmeId || '').toLowerCase().trim();
      const vcYear = normalizeYearValue(vc.yearOfStudy ?? vc.year);
      const vcSem = normalizeSemesterValue(vc.semester);

      if (progAliases.has(vcProg) && vcYear === numYear && vcSem === numSem) {
        const code = normalizeCodeKey(vc.code || vc.courseCode);
        if (!code || coursesByCode.has(code)) continue;
        const canonId =
          vc.canonicalCourseId || vc.id || code.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        const title = vc.title || vc.courseTitle || vc.courseName || 'University Course';
        const status = (vc.status || vc.courseType || 'Core') as any;

        coursesByCode.set(code, {
          id: canonId,
          canonicalCourseId: canonId,
          code,
          courseCode: code,
          title,
          courseTitle: title,
          credits: Number(vc.credits || 12),
          status,
          courseType: status,
          programmeId: cleanProgId,
          academicUnitId: vc.academicUnitId,
          departmentId: vc.departmentId,
          yearOfStudy: numYear,
          year: numYear,
          semester: numSem,
          universityId: 'udsm',
          verified: true,
        });
      }
    }

    // 4. Overlay Firestore catalogue_courses and programme_courses across BOTH dbDefault and db
    try {
      const aliasList = Array.from(progAliases).slice(0, 10);
      if (aliasList.length > 0) {
        const [catDocs, relDocs] = await Promise.all([
          this.queryBothDatabases('catalogue_courses', (colRef) =>
            query(colRef, where('programmeId', 'in', aliasList))
          ),
          this.queryBothDatabases('programme_courses', (colRef) =>
            query(colRef, where('programmeId', 'in', aliasList))
          ),
        ]);

        for (const d of catDocs) {
          const data = d.data as any;
          const docYear = normalizeYearValue(data.yearOfStudy ?? data.year);
          const docSem = normalizeSemesterValue(data.semester);
          if (docYear === numYear && docSem === numSem) {
            const code = normalizeCodeKey(data.code || data.courseCode || d.id);
            if (!code) continue;
            const canon =
              canonicalById.get((data.courseId || data.canonicalCourseId || '').toLowerCase()) ||
              canonicalById.get(code);
            const existing = coursesByCode.get(code);
            const title =
              data.title ||
              data.courseName ||
              data.courseTitle ||
              existing?.title ||
              canon?.title ||
              'Course';
            const status = (data.status || data.courseType || existing?.status || 'Core') as any;
            const canonId =
              data.canonicalCourseId ||
              data.courseId ||
              existing?.canonicalCourseId ||
              canon?.id ||
              d.id;

            coursesByCode.set(code, {
              ...(existing || {}),
              ...(data as any),
              id: canonId,
              canonicalCourseId: canonId,
              code,
              courseCode: code,
              title,
              courseTitle: title,
              credits: Number(data.credits ?? existing?.credits ?? canon?.defaultCredits ?? 12),
              status,
              courseType: status,
              programmeId: cleanProgId,
              yearOfStudy: numYear,
              year: numYear,
              semester: numSem,
              universityId: data.universityId || 'udsm',
              verified: true,
            });
          }
        }

        for (const d of relDocs) {
          const data = d.data as any;
          const docYear = normalizeYearValue(data.yearOfStudy ?? data.year);
          const docSem = normalizeSemesterValue(data.semester);
          if (docYear === numYear && docSem === numSem) {
            const code = normalizeCodeKey(data.code || data.courseCode || data.courseId);
            if (!code) continue;
            const canon =
              canonicalById.get((data.courseId || data.canonicalCourseId || '').toLowerCase()) ||
              canonicalById.get(code);
            const existing = coursesByCode.get(code);
            const title =
              data.title ||
              data.courseTitle ||
              data.canonicalTitle ||
              existing?.title ||
              canon?.title ||
              canon?.courseTitle ||
              'Course';
            const status = (data.status || data.courseType || existing?.status || 'Core') as any;
            const canonId =
              data.courseId ||
              data.canonicalCourseId ||
              existing?.canonicalCourseId ||
              canon?.id ||
              d.id;

            coursesByCode.set(code, {
              ...(existing || {}),
              id: canonId,
              canonicalCourseId: canonId,
              code,
              courseCode: code,
              title,
              courseTitle: title,
              credits: Number(data.credits ?? existing?.credits ?? canon?.defaultCredits ?? 12),
              status,
              courseType: status,
              programmeId: cleanProgId,
              academicUnitId: data.academicUnitId || existing?.academicUnitId,
              departmentId: data.departmentId || existing?.departmentId,
              yearOfStudy: numYear,
              year: numYear,
              semester: numSem,
              universityId: data.universityId || 'udsm',
              verified: true,
            });
          }
        }
      }
    } catch (err) {
      console.error(`AdminCatalogueService: Error reading courses for ${cacheKey}:`, err);
      if (coursesByCode.size === 0) {
        throw err;
      }
    }

    const courses = Array.from(coursesByCode.values());

    // Sort: Core courses first, then by course code alphabetically
    courses.sort((a, b) => {
      const isCoreA = (a.status || a.courseType || '').toLowerCase() === 'core';
      const isCoreB = (b.status || b.courseType || '').toLowerCase() === 'core';
      if (isCoreA && !isCoreB) return -1;
      if (!isCoreA && isCoreB) return 1;
      return (a.code || a.courseCode || '').localeCompare(b.code || b.courseCode || '');
    });

    this.coursesCache.set(cacheKey, courses);
    return courses;
  }

  /**
   * 5. Lightweight debounced search across Academic Units, Departments, Programmes and Courses
   */
  async searchCatalogue(searchTerm: string): Promise<CatalogueSearchResult[]> {
    const term = searchTerm.trim().toLowerCase();
    if (!term || term.length < 2) return [];

    const results: CatalogueSearchResult[] = [];

    try {
      // 1. Check loaded or cached Academic Units
      const units = await this.getAcademicUnits();
      for (const u of units) {
        if (
          (u.name && u.name.toLowerCase().includes(term)) ||
          (u.shortName && u.shortName.toLowerCase().includes(term)) ||
          (u.id && u.id.toLowerCase().includes(term))
        ) {
          results.push({
            type: 'unit',
            id: u.id,
            title: u.name,
            subtitle: `${u.type || 'Academic Unit'} (${u.shortName || u.id})`,
            badge: u.type,
            unitId: u.id,
          });
        }
      }

      // 2. Search Departments
      const depts = await this.getAllDepartments();
      for (const d of depts) {
        if (
          (d.name && d.name.toLowerCase().includes(term)) ||
          (d.id && d.id.toLowerCase().includes(term))
        ) {
          results.push({
            type: 'department',
            id: d.id,
            title: d.name,
            subtitle: `Department under Unit: ${(d.academicUnitId || '').toUpperCase()}`,
            unitId: d.academicUnitId,
            departmentId: d.id,
          });
        }
      }

      // 3. Search Programmes
      const progs = await this.getAllProgrammes();
      for (const p of progs) {
        if (
          (p.name && p.name.toLowerCase().includes(term)) ||
          (p.shortName && p.shortName.toLowerCase().includes(term)) ||
          (p.id && p.id.toLowerCase().includes(term))
        ) {
          results.push({
            type: 'programme',
            id: p.id,
            title: p.name,
            subtitle: `${p.shortName || p.id} • ${p.durationYears || 3} Years`,
            badge: p.awardLevel || 'Degree',
            unitId: p.academicUnitId,
            departmentId: p.departmentId,
            programmeId: p.id,
          });
        }
      }

      // 4. Search Courses by Code (e.g. "AY 100", "PL 111", "CS 174") or Title
      const cleanCode = term.toUpperCase().replace(/\s+/g, ' ');
      const courseDocs = await this.queryBothDatabases('catalogue_courses', (colRef) =>
        query(
          colRef,
          where('code', '>=', cleanCode),
          where('code', '<=', cleanCode + '\uf8ff'),
          limit(10)
        )
      );

      courseDocs.forEach((d) => {
        const c = d.data;
        results.push({
          type: 'course',
          id: d.id,
          code: c.code || c.courseCode,
          title: `${c.code || c.courseCode}: ${c.title || c.courseName}`,
          subtitle: `Programme: ${c.programmeId} • Year ${c.yearOfStudy || c.year} Sem ${c.semester} • ${c.credits} Credits`,
          badge: c.status || c.courseType || 'Course',
          unitId: c.academicUnitId,
          departmentId: c.departmentId,
          programmeId: c.programmeId,
          year: c.yearOfStudy || c.year,
          semester: c.semester,
        });
      });
    } catch (err) {
      console.warn('AdminCatalogueService: Search error:', err);
    }

    return results.slice(0, 25);
  }

  /**
   * 6. Fetch all Departments across university (with caching)
   */
  async getAllDepartments(): Promise<DepartmentRecord[]> {
    if (this.allDepartmentsCache && this.allDepartmentsCache.length > 0) {
      return this.allDepartmentsCache;
    }

    const deptsByKey = new Map<string, DepartmentRecord>();
    for (const d of AUDITED_DEPARTMENTS) {
      deptsByKey.set(d.name.trim().toLowerCase(), { ...d });
    }

    try {
      const docs = await this.queryBothDatabases('departments');
      for (const d of docs) {
        const raw = { id: d.id, ...(d.data as any) } as DepartmentRecord;
        const key = (raw.name || raw.id).trim().toLowerCase();
        const existing = deptsByKey.get(key);
        if (existing) {
          deptsByKey.set(key, {
            ...existing,
            ...raw,
            id: existing.id,
            academicUnitId: existing.academicUnitId,
          });
        } else {
          deptsByKey.set(key, raw);
        }
      }
    } catch (err) {
      console.warn('AdminCatalogueService: Error loading all departments:', err);
    }

    const depts = Array.from(deptsByKey.values());
    depts.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    this.allDepartmentsCache = depts;
    return depts;
  }

  /**
   * 6B. Fetch all Programmes across university (with caching)
   */
  async getAllProgrammes(): Promise<ProgrammeRecord[]> {
    if (this.allProgrammesCache && this.allProgrammesCache.length > 0) {
      return this.allProgrammesCache;
    }

    const progsByKey = new Map<string, ProgrammeRecord>();
    for (const p of AUDITED_PROGRAMMES) {
      const key = `${p.name.trim().toLowerCase()}__${(p.shortName || p.id).trim().toLowerCase()}`;
      progsByKey.set(key, { ...p });
    }

    try {
      const docs = await this.queryBothDatabases('programmes');
      for (const d of docs) {
        const raw = { id: d.id, ...(d.data as any) } as ProgrammeRecord;
        const rawAliases = getProgrammeAliases(raw.id);
        let matchedKey: string | null = null;
        for (const [k, existingProg] of progsByKey.entries()) {
          if (
            rawAliases.has(existingProg.id.toLowerCase()) ||
            existingProg.name.trim().toLowerCase() === (raw.name || '').trim().toLowerCase()
          ) {
            matchedKey = k;
            break;
          }
        }
        if (matchedKey) {
          const existing = progsByKey.get(matchedKey)!;
          progsByKey.set(matchedKey, {
            ...existing,
            ...raw,
            id: existing.id,
            departmentId: existing.departmentId,
            academicUnitId: existing.academicUnitId,
          });
        } else {
          const key = `${(raw.name || raw.id).trim().toLowerCase()}__${raw.id.toLowerCase()}`;
          progsByKey.set(key, raw);
        }
      }
    } catch (err) {
      console.warn('AdminCatalogueService: Error loading all programmes:', err);
    }

    const progs = Array.from(progsByKey.values());
    progs.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    this.allProgrammesCache = progs;
    return progs;
  }

  /**
   * 7. Fetch single Programme by ID
   */
  async getProgrammeById(programmeId: string): Promise<ProgrammeRecord | null> {
    if (!programmeId) return null;
    const cleanId = programmeId.toLowerCase().trim();
    const progAliases = getProgrammeAliases(cleanId);

    try {
      const snap = await this.getDocFromBothDatabases('programmes', cleanId);
      if (snap) {
        return {
          id: snap.id,
          ...(snap.data as any),
        };
      }
    } catch (err) {
      console.warn(`AdminCatalogueService: Error fetching programme ${cleanId}:`, err);
    }

    const auditedMatch = AUDITED_PROGRAMMES.find((p) =>
      progAliases.has(p.id.toLowerCase())
    );
    if (auditedMatch) {
      return { ...auditedMatch };
    }
    return null;
  }

  /**
   * 8. Check Programme Code Uniqueness
   * Checks both doc ID, code, and shortName to prevent duplicates.
   */
  async checkProgrammeCodeExists(
    codeOrShortName: string,
    excludeId?: string
  ): Promise<{ exists: boolean; conflictingProgramme?: ProgrammeRecord }> {
    if (!codeOrShortName) return { exists: false };
    const cleanCode = codeOrShortName.trim().toUpperCase();
    const cleanSlug = codeOrShortName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    try {
      // 1. Direct ID check
      const idSnap = await getDoc(doc(db, 'programmes', cleanSlug));
      if (idSnap.exists() && (!excludeId || idSnap.id !== excludeId.toLowerCase().trim())) {
        return {
          exists: true,
          conflictingProgramme: { id: idSnap.id, ...(idSnap.data() as any) },
        };
      }

      // 2. Query code field
      const qCode = query(
        collection(db, 'programmes'),
        where('code', '==', cleanCode),
        limit(2)
      );
      const codeSnap = await getDocs(qCode);
      for (const d of codeSnap.docs) {
        if (!excludeId || d.id !== excludeId.toLowerCase().trim()) {
          return {
            exists: true,
            conflictingProgramme: { id: d.id, ...(d.data() as any) },
          };
        }
      }

      // 3. Query shortName field
      const qShort = query(
        collection(db, 'programmes'),
        where('shortName', '==', codeOrShortName.trim()),
        limit(2)
      );
      const shortSnap = await getDocs(qShort);
      for (const d of shortSnap.docs) {
        if (!excludeId || d.id !== excludeId.toLowerCase().trim()) {
          return {
            exists: true,
            conflictingProgramme: { id: d.id, ...(d.data() as any) },
          };
        }
      }
    } catch (err) {
      console.warn('AdminCatalogueService: Error checking code uniqueness:', err);
    }

    return { exists: false };
  }

  /**
   * 9. Check Programme Name within the same Department
   */
  async checkProgrammeNameInDepartment(
    name: string,
    departmentId: string,
    excludeId?: string
  ): Promise<{ duplicate: boolean; existingProgName?: string }> {
    if (!name || !departmentId) return { duplicate: false };
    const cleanName = name.trim().toLowerCase();
    const cleanDeptId = departmentId.trim().toLowerCase();

    try {
      const progs = await this.getProgrammesByDepartment(cleanDeptId);
      const match = progs.find(
        (p) =>
          p.name.trim().toLowerCase() === cleanName &&
          (!excludeId || p.id.toLowerCase().trim() !== excludeId.toLowerCase().trim())
      );
      if (match) {
        return { duplicate: true, existingProgName: match.name };
      }
    } catch (err) {
      console.warn('AdminCatalogueService: Error checking programme name duplicate:', err);
    }

    return { duplicate: false };
  }

  /**
   * 10. Check Programme Dependencies before Deletion
   * Inspects courses, students enrolled, materials, and career/scholarship mappings.
   */
  async checkProgrammeDependencies(
    programmeId: string
  ): Promise<ProgrammeDependencyCheckResult> {
    const cleanId = programmeId.toLowerCase().trim();
    const progAliases = Array.from(getProgrammeAliases(cleanId)).slice(0, 10);
    let catalogueCount = 0;
    let programmeCourseCount = 0;
    let studentCount = 0;
    let materialCount = 0;
    let careerCount = 0;
    const sampleCourses: { code: string; title: string; year: number; semester: number }[] = [];

    try {
      // 1. Check audited static relationships as well as Firestore
      for (const rel of AUDITED_PROGRAMME_COURSES) {
        if (progAliases.includes((rel.programmeId || '').toLowerCase().trim())) {
          programmeCourseCount++;
          if (sampleCourses.length < 5) {
            sampleCourses.push({
              code: rel.code || rel.courseCode || rel.courseId,
              title: rel.title || rel.courseTitle || 'Accredited Course',
              year: normalizeYearValue(rel.yearOfStudy ?? (rel as any).year) || 1,
              semester: normalizeSemesterValue(rel.semester) || 1,
            });
          }
        }
      }

      if (progAliases.length > 0) {
        const [ccDocs, pcDocs, studentDocs, materialDocs] = await Promise.all([
          this.queryBothDatabases('catalogue_courses', (colRef) =>
            query(colRef, where('programmeId', 'in', progAliases), limit(100))
          ).catch(() => []),
          this.queryBothDatabases('programme_courses', (colRef) =>
            query(colRef, where('programmeId', 'in', progAliases), limit(100))
          ).catch(() => []),
          this.queryBothDatabases('users', (colRef) =>
            query(colRef, where('programmeId', 'in', progAliases), limit(50))
          ).catch(() => []),
          this.queryBothDatabases('materials', (colRef) =>
            query(colRef, where('programmeId', 'in', progAliases), limit(50))
          ).catch(() => []),
        ]);

        catalogueCount = ccDocs.length;
        programmeCourseCount = Math.max(programmeCourseCount, pcDocs.length);
        studentCount = studentDocs.length;
        materialCount = materialDocs.length;

        ccDocs.slice(0, 5).forEach((d) => {
          const c = d.data;
          if (sampleCourses.length < 5) {
            sampleCourses.push({
              code: c.code || c.courseCode || d.id,
              title: c.title || c.courseName || 'Accredited Course',
              year: normalizeYearValue(c.yearOfStudy ?? c.year) || 1,
              semester: normalizeSemesterValue(c.semester) || 1,
            });
          }
        });
      }
    } catch (err) {
      console.warn(`AdminCatalogueService: Error checking dependencies for ${cleanId}:`, err);
    }

    const totalCourses = Math.max(catalogueCount, programmeCourseCount);
    const totalDependencies = totalCourses + studentCount + materialCount + careerCount;
    return {
      hasDependencies: totalDependencies > 0,
      catalogueCourseCount: catalogueCount,
      programmeCourseCount: programmeCourseCount,
      totalCourses,
      studentCount,
      materialCount,
      careerCount,
      totalDependencies,
      sampleCourses,
    };
  }

  /**
   * 11. Add Programme
   * Enforces Department relationship, unique code validation, and proper Firestore schema.
   */
  async createProgramme(data: {
    id?: string;
    code: string;
    name: string;
    departmentId: string;
    academicUnitId: string;
    durationYears: number;
    awardLevel?: string;
    degreeLevel?: string;
    studyMode?: string;
    status?: 'active' | 'inactive' | 'archived';
    shortName?: string;
    description?: string;
  }): Promise<{ success: boolean; programme?: ProgrammeRecord; error?: string }> {
    // 1. Validation
    if (!data.name || !data.name.trim()) {
      return { success: false, error: 'Programme name is required.' };
    }
    if (!data.code || !data.code.trim()) {
      return { success: false, error: 'Programme code is required.' };
    }
    if (!data.departmentId || !data.departmentId.trim()) {
      return { success: false, error: 'Programme must belong to an existing Department.' };
    }

    const cleanDeptId = data.departmentId.toLowerCase().trim();
    const cleanUnitId = data.academicUnitId.toLowerCase().trim();

    // Verify Department exists (in memory or Firestore)
    const allDepts = await this.getAllDepartments();
    const deptAliases = getDepartmentAliases(cleanDeptId);
    const deptExists = allDepts.some((d) => deptAliases.has(d.id.toLowerCase()));
    if (!deptExists) {
      return { success: false, error: `Department "${cleanDeptId}" does not exist in the catalogue.` };
    }

    // Generate or clean ID
    const proposedId = data.id && data.id.trim()
      ? data.id.toLowerCase().trim().replace(/[^a-z0-9_\-]+/g, '-')
      : data.code.toLowerCase().trim().replace(/[^a-z0-9_\-]+/g, '-');

    if (!proposedId || !/^[a-zA-Z0-9_\-]+$/.test(proposedId)) {
      return { success: false, error: 'Programme ID must contain only alphanumeric characters, dashes, or underscores.' };
    }

    // Check code uniqueness
    const uniqueness = await this.checkProgrammeCodeExists(data.code);
    if (uniqueness.exists) {
      return {
        success: false,
        error: `Programme with code "${data.code}" already exists (${uniqueness.conflictingProgramme?.name || uniqueness.conflictingProgramme?.id}).`,
      };
    }

    const duration = Math.max(1, Math.min(7, Number(data.durationYears) || 3));
    const awardLevel = data.awardLevel || 'Bachelor Degree';
    const degreeLevel = data.degreeLevel || (awardLevel.includes('Master') ? "Master's Degree" : awardLevel.includes('PhD') ? 'PhD' : "Bachelor's Degree");
    const nowIso = new Date().toISOString();

    const record: ProgrammeRecord = {
      id: proposedId,
      code: data.code.trim().toUpperCase(),
      shortName: data.shortName?.trim() || data.code.trim(),
      name: data.name.trim(),
      description: data.description?.trim(),
      departmentId: cleanDeptId,
      academicUnitId: cleanUnitId,
      collegeId: cleanUnitId,
      schoolId: cleanUnitId,
      instituteId: cleanUnitId,
      durationYears: duration,
      awardLevel,
      degreeLevel,
      studyMode: data.studyMode || 'Full-Time',
      status: data.status || 'active',
      active: data.status !== 'inactive' && data.status !== 'archived',
      archived: data.status === 'archived',
      universityId: 'udsm',
      academicYear: '2025/2026',
      verified: true,
      source: 'Official Academic Catalogue',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    try {
      await this.setDocInBothDatabases('programmes', proposedId, record, { merge: true });
      // Invalidate caches
      this.programmesByDeptCache.delete(cleanDeptId);
      this.allProgrammesCache = null;

      await this.recordCatalogueAuditLog({
        action: 'create_programme',
        targetType: 'programme',
        targetId: proposedId,
        adminUid: auth.currentUser?.uid || 'super_admin',
        adminEmail: auth.currentUser?.email || undefined,
        details: { name: record.name, code: record.code, departmentId: cleanDeptId },
        timestamp: nowIso,
      });

      return { success: true, programme: record };
    } catch (err) {
      console.error('AdminCatalogueService: Error creating programme:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Database write failed.' };
    }
  }

  /**
   * 12. Edit Programme
   * Preserves existing document ID and department relationship.
   */
  async updateProgramme(
    programmeId: string,
    updates: {
      name?: string;
      code?: string;
      shortName?: string;
      description?: string;
      awardLevel?: string;
      degreeLevel?: string;
      durationYears?: number;
      studyMode?: string;
      status?: 'active' | 'inactive' | 'archived';
      active?: boolean;
      archived?: boolean;
    }
  ): Promise<{ success: boolean; programme?: ProgrammeRecord; error?: string }> {
    const cleanId = programmeId.toLowerCase().trim();
    if (!cleanId) return { success: false, error: 'Missing programme ID.' };

    const existing = await this.getProgrammeById(cleanId);
    if (!existing) {
      return { success: false, error: `Programme "${cleanId}" not found.` };
    }

    // If code is being changed, check uniqueness
    if (updates.code && updates.code.trim().toUpperCase() !== (existing.code || existing.shortName || '').toUpperCase()) {
      const uniqueness = await this.checkProgrammeCodeExists(updates.code, existing.id);
      if (uniqueness.exists) {
        return {
          success: false,
          error: `Programme with code "${updates.code}" already exists.`,
        };
      }
    }

    const duration = updates.durationYears !== undefined
      ? Math.max(1, Math.min(7, Number(updates.durationYears)))
      : existing.durationYears || 3;

    const newStatus: 'active' | 'archived' | 'inactive' =
      updates.status ||
      (updates.archived === true
        ? 'archived'
        : updates.active === false
        ? 'inactive'
        : existing.status || (existing.active === false ? 'inactive' : 'active'));

    const updatedRecord: ProgrammeRecord = {
      ...existing,
      name: updates.name?.trim() || existing.name,
      code: updates.code?.trim().toUpperCase() || existing.code || existing.shortName,
      shortName: updates.shortName?.trim() || updates.code?.trim() || existing.shortName,
      description: updates.description !== undefined ? updates.description.trim() : existing.description,
      awardLevel: updates.awardLevel || existing.awardLevel || 'Bachelor Degree',
      degreeLevel: updates.degreeLevel || existing.degreeLevel || "Bachelor's Degree",
      durationYears: duration,
      studyMode: updates.studyMode || existing.studyMode || 'Full-Time',
      status: newStatus,
      active: newStatus === 'active',
      archived: newStatus === 'archived',
      updatedAt: new Date().toISOString(),
    };

    try {
      await this.setDocInBothDatabases('programmes', existing.id, updatedRecord, { merge: true });

      // Clear caches
      this.programmesByDeptCache.delete(existing.departmentId.toLowerCase().trim());
      this.allProgrammesCache = null;

      await this.recordCatalogueAuditLog({
        action: newStatus === 'archived' ? 'archive_programme' : 'update_programme',
        targetType: 'programme',
        targetId: existing.id,
        adminUid: auth.currentUser?.uid || 'super_admin',
        adminEmail: auth.currentUser?.email || undefined,
        details: {
          name: updatedRecord.name,
          code: updatedRecord.code,
          durationYears: updatedRecord.durationYears,
          status: updatedRecord.status,
        },
        timestamp: new Date().toISOString(),
      });

      return { success: true, programme: updatedRecord };
    } catch (err) {
      console.error('AdminCatalogueService: Error updating programme:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Database update failed.' };
    }
  }

  /**
   * 12B. Archive Programme
   */
  async archiveProgramme(
    programmeId: string,
    archived = true
  ): Promise<{ success: boolean; programme?: ProgrammeRecord; error?: string }> {
    return this.updateProgramme(programmeId, {
      status: archived ? 'archived' : 'active',
      archived,
      active: !archived,
    });
  }

  /**
   * 13. Delete Programme
   * Strictly enforces safety check: cannot delete if dependent courses, students, or materials exist!
   */
  async deleteProgramme(
    programmeId: string,
    departmentId?: string
  ): Promise<{ success: boolean; hasDependencies?: boolean; dependencies?: ProgrammeDependencyCheckResult; error?: string }> {
    const cleanId = programmeId.toLowerCase().trim();
    if (!cleanId) return { success: false, error: 'Missing programme ID.' };

    // Strict dependency safety check
    const depCheck = await this.checkProgrammeDependencies(cleanId);
    if (depCheck.hasDependencies) {
      return {
        success: false,
        hasDependencies: true,
        dependencies: depCheck,
        error: `Cannot hard-delete programme. It currently has ${depCheck.totalCourses} linked courses, ${depCheck.studentCount || 0} enrolled students, and ${depCheck.materialCount || 0} materials in the catalogue. Please Archive this programme instead to protect academic integrity.`,
      };
    }

    try {
      await this.deleteDocInBothDatabases('programmes', cleanId);

      // Invalidate caches
      if (departmentId) {
        this.programmesByDeptCache.delete(departmentId.toLowerCase().trim());
      }
      this.allProgrammesCache = null;

      await this.recordCatalogueAuditLog({
        action: 'delete_programme',
        targetType: 'programme',
        targetId: cleanId,
        adminUid: auth.currentUser?.uid || 'super_admin',
        adminEmail: auth.currentUser?.email || undefined,
        timestamp: new Date().toISOString(),
      });

      return { success: true };
    } catch (err) {
      console.error('AdminCatalogueService: Error deleting programme:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Database deletion failed.' };
    }
  }

  /**
   * 14. Update Programme Duration (Year structure)
   */
  async updateProgrammeDuration(
    programmeId: string,
    newDurationYears: number
  ): Promise<{ success: boolean; error?: string }> {
    const cleanId = programmeId.toLowerCase().trim();
    const dur = Math.max(1, Math.min(7, Number(newDurationYears) || 3));

    const res = await this.updateProgramme(cleanId, { durationYears: dur });
    if (res.success) {
      await this.recordCatalogueAuditLog({
        action: 'update_duration',
        targetType: 'programme',
        targetId: cleanId,
        adminUid: auth.currentUser?.uid || 'super_admin',
        adminEmail: auth.currentUser?.email || undefined,
        details: { newDurationYears: dur },
        timestamp: new Date().toISOString(),
      });
    }
    return res;
  }

  /**
   * 15. Record an Audit-Friendly Log Entry
   */
  async recordCatalogueAuditLog(entry: CatalogueAuditLogEntry): Promise<void> {
    try {
      const logId = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await setDoc(doc(db, 'catalogue_audit_logs', logId), entry, { merge: true });

      // Stage 9A: Centralized Audit Logging
      const actionMap: Record<string, string> = {
        create_programme: 'catalogue.programme.create',
        update_programme: 'catalogue.programme.update',
        delete_programme: 'catalogue.programme.delete',
        create_course: 'catalogue.course.create',
        edit_course: 'catalogue.course.update',
        delete_course: 'catalogue.course.delete',
        assign_course: 'catalogue.programme_course.assign',
        remove_course: 'catalogue.programme_course.remove',
        add_year: 'catalogue.curriculum.update',
        edit_year: 'catalogue.curriculum.update',
        delete_year: 'catalogue.curriculum.update',
        add_semester: 'catalogue.curriculum.update',
        edit_semester: 'catalogue.curriculum.update',
        delete_semester: 'catalogue.curriculum.update',
        update_duration: 'catalogue.programme.update',
      };
      const mappedAction = actionMap[entry.action] || `catalogue.${entry.action}`;

      await adminAuditService.recordAuditLog({
        action: mappedAction,
        entityType: entry.targetType,
        entityId: entry.targetId,
        summary: `Catalogue ${entry.action.replace(/_/g, ' ')} on ${entry.targetType} ${entry.targetId}`,
        metadata: entry.details || {},
        source: 'client_service',
      });
    } catch (err) {
      // Non-blocking for primary catalogue operations
      console.warn('Catalogue audit log notice:', err);
    }
  }

  /**
   * 16. Get or initialize Year/Semester Structure for a Programme
   */
  getProgrammeYearStructure(programme: ProgrammeRecord): ProgrammeYearConfig[] {
    if (programme.yearsStructure && programme.yearsStructure.length > 0) {
      return [...programme.yearsStructure].sort((a, b) => a.yearNumber - b.yearNumber);
    }

    const duration = programme.durationYears || 3;
    const structure: ProgrammeYearConfig[] = [];
    for (let y = 1; y <= duration; y++) {
      structure.push({
        yearNumber: y,
        label: `Year ${y}`,
        semesters: [
          { semesterNumber: 1, label: 'Semester 1' },
          { semesterNumber: 2, label: 'Semester 2' },
        ],
      });
    }
    return structure;
  }

  /**
   * 17. Add Academic Year to Programme (Rejects Duplicates)
   */
  async addProgrammeYear(
    programmeId: string,
    yearNumber: number,
    label?: string
  ): Promise<{ success: boolean; error?: string; updatedProgramme?: ProgrammeRecord }> {
    const cleanId = programmeId.toLowerCase().trim();
    const prog = await this.getProgrammeById(cleanId);
    if (!prog) return { success: false, error: 'Programme not found.' };

    const structure = this.getProgrammeYearStructure(prog);

    // Prevent duplicate Year records
    if (structure.some((y) => y.yearNumber === yearNumber)) {
      return { success: false, error: `Year ${yearNumber} already exists in this programme.` };
    }

    const newYearConfig: ProgrammeYearConfig = {
      yearNumber,
      label: label?.trim() || `Year ${yearNumber}`,
      semesters: [
        { semesterNumber: 1, label: 'Semester 1' },
        { semesterNumber: 2, label: 'Semester 2' },
      ],
    };

    structure.push(newYearConfig);
    structure.sort((a, b) => a.yearNumber - b.yearNumber);

    const newDuration = Math.max(prog.durationYears || 1, ...structure.map((y) => y.yearNumber));

    try {
      await updateDoc(doc(db, 'programmes', cleanId), {
        yearsStructure: structure,
        durationYears: newDuration,
        updatedAt: new Date().toISOString(),
      });

      this.clearProgrammeCaches(prog.departmentId);
      const updatedProg = { ...prog, yearsStructure: structure, durationYears: newDuration };

      await this.recordCatalogueAuditLog({
        action: 'add_year',
        targetType: 'programme_year',
        targetId: `${cleanId}_y${yearNumber}`,
        adminUid: auth.currentUser?.uid || 'super_admin',
        adminEmail: auth.currentUser?.email || undefined,
        details: { yearNumber, label: newYearConfig.label },
        timestamp: new Date().toISOString(),
      });

      return { success: true, updatedProgramme: updatedProg };
    } catch (err: any) {
      console.error('Error adding programme year:', err);
      return { success: false, error: err?.message || 'Failed to add academic year.' };
    }
  }

  /**
   * 18. Edit Academic Year Label
   */
  async editProgrammeYear(
    programmeId: string,
    yearNumber: number,
    newLabel: string
  ): Promise<{ success: boolean; error?: string; updatedProgramme?: ProgrammeRecord }> {
    const cleanId = programmeId.toLowerCase().trim();
    const prog = await this.getProgrammeById(cleanId);
    if (!prog) return { success: false, error: 'Programme not found.' };

    const structure = this.getProgrammeYearStructure(prog);
    const targetYear = structure.find((y) => y.yearNumber === yearNumber);
    if (!targetYear) {
      return { success: false, error: `Year ${yearNumber} does not exist in this programme.` };
    }

    targetYear.label = newLabel.trim() || `Year ${yearNumber}`;

    try {
      await updateDoc(doc(db, 'programmes', cleanId), {
        yearsStructure: structure,
        updatedAt: new Date().toISOString(),
      });

      this.clearProgrammeCaches(prog.departmentId);
      const updatedProg = { ...prog, yearsStructure: structure };

      await this.recordCatalogueAuditLog({
        action: 'edit_year',
        targetType: 'programme_year',
        targetId: `${cleanId}_y${yearNumber}`,
        adminUid: auth.currentUser?.uid || 'super_admin',
        adminEmail: auth.currentUser?.email || undefined,
        details: { yearNumber, newLabel },
        timestamp: new Date().toISOString(),
      });

      return { success: true, updatedProgramme: updatedProg };
    } catch (err: any) {
      console.error('Error editing programme year:', err);
      return { success: false, error: err?.message || 'Failed to edit academic year.' };
    }
  }

  /**
   * 19. Delete Academic Year from Programme (With Course Dependency Check)
   */
  async deleteProgrammeYear(
    programmeId: string,
    yearNumber: number
  ): Promise<{ success: boolean; error?: string; updatedProgramme?: ProgrammeRecord }> {
    const cleanId = programmeId.toLowerCase().trim();
    const prog = await this.getProgrammeById(cleanId);
    if (!prog) return { success: false, error: 'Programme not found.' };

    // Dependency check: count courses in this year
    try {
      const qCourses = query(
        collection(db, 'catalogue_courses'),
        where('programmeId', '==', cleanId),
        where('yearOfStudy', '==', yearNumber)
      );
      const snapCourses = await getDocs(qCourses);
      if (snapCourses.size > 0) {
        return {
          success: false,
          error: `Cannot delete Year ${yearNumber}: It has ${snapCourses.size} registered courses. Please reassign or delete the courses first.`,
        };
      }
    } catch (err) {
      console.warn('Dependency check error on year deletion:', err);
    }

    const structure = this.getProgrammeYearStructure(prog).filter((y) => y.yearNumber !== yearNumber);
    if (structure.length === 0) {
      return { success: false, error: 'A programme must have at least one Academic Year.' };
    }

    const newDuration = Math.max(1, ...structure.map((y) => y.yearNumber));

    try {
      await updateDoc(doc(db, 'programmes', cleanId), {
        yearsStructure: structure,
        durationYears: newDuration,
        updatedAt: new Date().toISOString(),
      });

      this.clearProgrammeCaches(prog.departmentId);
      const updatedProg = { ...prog, yearsStructure: structure, durationYears: newDuration };

      await this.recordCatalogueAuditLog({
        action: 'delete_year',
        targetType: 'programme_year',
        targetId: `${cleanId}_y${yearNumber}`,
        adminUid: auth.currentUser?.uid || 'super_admin',
        adminEmail: auth.currentUser?.email || undefined,
        details: { yearNumber },
        timestamp: new Date().toISOString(),
      });

      return { success: true, updatedProgramme: updatedProg };
    } catch (err: any) {
      console.error('Error deleting programme year:', err);
      return { success: false, error: err?.message || 'Failed to delete academic year.' };
    }
  }

  /**
   * 20. Add Semester to Academic Year (Rejects Duplicates)
   */
  async addProgrammeSemester(
    programmeId: string,
    yearNumber: number,
    semesterNumber: number,
    label?: string
  ): Promise<{ success: boolean; error?: string; updatedProgramme?: ProgrammeRecord }> {
    const cleanId = programmeId.toLowerCase().trim();
    const prog = await this.getProgrammeById(cleanId);
    if (!prog) return { success: false, error: 'Programme not found.' };

    const structure = this.getProgrammeYearStructure(prog);
    const targetYear = structure.find((y) => y.yearNumber === yearNumber);
    if (!targetYear) {
      return { success: false, error: `Year ${yearNumber} does not exist in this programme.` };
    }

    // Prevent duplicate semesters in this Year
    if (targetYear.semesters.some((s) => s.semesterNumber === semesterNumber)) {
      return {
        success: false,
        error: `Semester ${semesterNumber} already exists in Year ${yearNumber}.`,
      };
    }

    const newSemesterConfig: ProgrammeSemesterConfig = {
      semesterNumber,
      label: label?.trim() || `Semester ${semesterNumber}`,
    };

    targetYear.semesters.push(newSemesterConfig);
    targetYear.semesters.sort((a, b) => a.semesterNumber - b.semesterNumber);

    try {
      await updateDoc(doc(db, 'programmes', cleanId), {
        yearsStructure: structure,
        updatedAt: new Date().toISOString(),
      });

      this.clearProgrammeCaches(prog.departmentId);
      const updatedProg = { ...prog, yearsStructure: structure };

      await this.recordCatalogueAuditLog({
        action: 'add_semester',
        targetType: 'programme_semester',
        targetId: `${cleanId}_y${yearNumber}_s${semesterNumber}`,
        adminUid: auth.currentUser?.uid || 'super_admin',
        adminEmail: auth.currentUser?.email || undefined,
        details: { yearNumber, semesterNumber, label: newSemesterConfig.label },
        timestamp: new Date().toISOString(),
      });

      return { success: true, updatedProgramme: updatedProg };
    } catch (err: any) {
      console.error('Error adding programme semester:', err);
      return { success: false, error: err?.message || 'Failed to add semester.' };
    }
  }

  /**
   * 21. Edit Semester Label
   */
  async editProgrammeSemester(
    programmeId: string,
    yearNumber: number,
    semesterNumber: number,
    newLabel: string
  ): Promise<{ success: boolean; error?: string; updatedProgramme?: ProgrammeRecord }> {
    const cleanId = programmeId.toLowerCase().trim();
    const prog = await this.getProgrammeById(cleanId);
    if (!prog) return { success: false, error: 'Programme not found.' };

    const structure = this.getProgrammeYearStructure(prog);
    const targetYear = structure.find((y) => y.yearNumber === yearNumber);
    if (!targetYear) {
      return { success: false, error: `Year ${yearNumber} does not exist in this programme.` };
    }

    const targetSem = targetYear.semesters.find((s) => s.semesterNumber === semesterNumber);
    if (!targetSem) {
      return { success: false, error: `Semester ${semesterNumber} does not exist in Year ${yearNumber}.` };
    }

    targetSem.label = newLabel.trim() || `Semester ${semesterNumber}`;

    try {
      await updateDoc(doc(db, 'programmes', cleanId), {
        yearsStructure: structure,
        updatedAt: new Date().toISOString(),
      });

      this.clearProgrammeCaches(prog.departmentId);
      const updatedProg = { ...prog, yearsStructure: structure };

      await this.recordCatalogueAuditLog({
        action: 'edit_semester',
        targetType: 'programme_semester',
        targetId: `${cleanId}_y${yearNumber}_s${semesterNumber}`,
        adminUid: auth.currentUser?.uid || 'super_admin',
        adminEmail: auth.currentUser?.email || undefined,
        details: { yearNumber, semesterNumber, newLabel },
        timestamp: new Date().toISOString(),
      });

      return { success: true, updatedProgramme: updatedProg };
    } catch (err: any) {
      console.error('Error editing programme semester:', err);
      return { success: false, error: err?.message || 'Failed to edit semester.' };
    }
  }

  /**
   * 22. Delete Semester from Academic Year (With Course Dependency Check)
   */
  async deleteProgrammeSemester(
    programmeId: string,
    yearNumber: number,
    semesterNumber: number
  ): Promise<{ success: boolean; error?: string; updatedProgramme?: ProgrammeRecord }> {
    const cleanId = programmeId.toLowerCase().trim();
    const prog = await this.getProgrammeById(cleanId);
    if (!prog) return { success: false, error: 'Programme not found.' };

    const structure = this.getProgrammeYearStructure(prog);
    const targetYear = structure.find((y) => y.yearNumber === yearNumber);
    if (!targetYear) {
      return { success: false, error: `Year ${yearNumber} does not exist in this programme.` };
    }

    // Dependency check: count courses in this specific year & semester
    try {
      const qCourses = query(
        collection(db, 'catalogue_courses'),
        where('programmeId', '==', cleanId),
        where('yearOfStudy', '==', yearNumber),
        where('semester', '==', semesterNumber)
      );
      const snapCourses = await getDocs(qCourses);
      if (snapCourses.size > 0) {
        return {
          success: false,
          error: `Cannot delete Semester ${semesterNumber} in Year ${yearNumber}: It has ${snapCourses.size} registered courses. Please reassign or delete the courses first.`,
        };
      }
    } catch (err) {
      console.warn('Dependency check error on semester deletion:', err);
    }

    targetYear.semesters = targetYear.semesters.filter((s) => s.semesterNumber !== semesterNumber);
    if (targetYear.semesters.length === 0) {
      return { success: false, error: 'An Academic Year must have at least one semester.' };
    }

    try {
      await updateDoc(doc(db, 'programmes', cleanId), {
        yearsStructure: structure,
        updatedAt: new Date().toISOString(),
      });

      this.clearProgrammeCaches(prog.departmentId);
      const updatedProg = { ...prog, yearsStructure: structure };

      await this.recordCatalogueAuditLog({
        action: 'delete_semester',
        targetType: 'programme_semester',
        targetId: `${cleanId}_y${yearNumber}_s${semesterNumber}`,
        adminUid: auth.currentUser?.uid || 'super_admin',
        adminEmail: auth.currentUser?.email || undefined,
        details: { yearNumber, semesterNumber },
        timestamp: new Date().toISOString(),
      });

      return { success: true, updatedProgramme: updatedProg };
    } catch (err: any) {
      console.error('Error deleting programme semester:', err);
      return { success: false, error: err?.message || 'Failed to delete semester.' };
    }
  }

  /**
   * 23. Invalidate Programme Caches
   */
  clearProgrammeCaches(departmentId?: string) {
    if (departmentId) {
      this.programmesByDeptCache.delete(departmentId.toLowerCase().trim());
    } else {
      this.programmesByDeptCache.clear();
    }
    this.allProgrammesCache = null;
  }

  /**
   * 24. Find Canonical Course by Code
   */
  async getCanonicalCourseByCode(
    courseCode: string
  ): Promise<CanonicalCourseRecord | null> {
    if (!courseCode || !courseCode.trim()) return null;
    const cleanCode = courseCode.trim().toUpperCase().replace(/[\s_-]+/g, ' ');
    const cleanId = cleanCode.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

    try {
      // 1. Direct ID lookup in canonical_courses across both databases
      const snapDirect = await this.getDocFromBothDatabases('canonical_courses', cleanId);
      if (snapDirect) {
        return { id: snapDirect.id, ...(snapDirect.data as any) };
      }

      // 2. Query code field in canonical_courses across both databases
      const docs = await this.queryBothDatabases('canonical_courses', (colRef) =>
        query(colRef, where('code', '==', cleanCode), limit(1))
      );
      if (docs.length > 0) {
        const d = docs[0];
        return { id: d.id, ...(d.data as any) };
      }
    } catch (err) {
      console.warn(`AdminCatalogueService: Error reading canonical course ${cleanCode}:`, err);
    }

    // 3. Fallback to official audited UDSM canonical courses
    const audited = AUDITED_CANONICAL_COURSES.find(
      (c) =>
        (c.code || c.courseCode || '').trim().toUpperCase().replace(/[\s_-]+/g, ' ') === cleanCode ||
        c.id.toLowerCase() === cleanId ||
        c.id.toLowerCase() === `udsm_${cleanId}`
    );
    if (audited) {
      return {
        ...audited,
        code: audited.code || audited.courseCode || cleanCode,
        title: audited.title || audited.courseTitle || 'University Course',
        defaultCredits: audited.defaultCredits || audited.credits || 12,
      };
    }

    return null;
  }

  /**
   * 25. Search Canonical Courses (by code prefix or title query)
   */
  async searchCanonicalCourses(
    searchTerm: string,
    maxResults = 20
  ): Promise<CanonicalCourseRecord[]> {
    const term = searchTerm.trim();
    if (!term || term.length < 2) return [];

    const cleanCode = term.toUpperCase().replace(/\s+/g, ' ');
    const termLower = term.toLowerCase();
    const resultsMap = new Map<string, CanonicalCourseRecord>();

    // 1. Search official audited UDSM canonical courses first
    for (const c of AUDITED_CANONICAL_COURSES) {
      const cCode = (c.code || c.courseCode || '').trim().toUpperCase();
      const cTitle = (c.title || c.courseTitle || '').trim();
      if (cCode.includes(cleanCode) || cTitle.toLowerCase().includes(termLower)) {
        resultsMap.set(c.id, {
          ...c,
          code: cCode,
          title: cTitle,
          defaultCredits: c.defaultCredits || c.credits || 12,
        });
        if (resultsMap.size >= maxResults) break;
      }
    }

    try {
      // 2. Prefix query on 'code' in Firestore across both databases
      const codeDocs = await this.queryBothDatabases('canonical_courses', (colRef) =>
        query(
          colRef,
          where('code', '>=', cleanCode),
          where('code', '<=', cleanCode + '\uf8ff'),
          limit(maxResults)
        )
      );
      codeDocs.forEach((d) => {
        resultsMap.set(d.id, { id: d.id, ...(d.data as any) });
      });

      // 3. If results are few, also inspect catalogue_courses for deduplication
      if (resultsMap.size < maxResults) {
        const catDocs = await this.queryBothDatabases('catalogue_courses', (colRef) =>
          query(
            colRef,
            where('code', '>=', cleanCode),
            where('code', '<=', cleanCode + '\uf8ff'),
            limit(maxResults)
          )
        );
        catDocs.forEach((d) => {
          const c = d.data;
          const canonId = c.canonicalCourseId || (c.code || '').toLowerCase().replace(/[^a-z0-9]+/g, '_');
          if (!resultsMap.has(canonId) && c.code) {
            resultsMap.set(canonId, {
              id: canonId,
              code: c.code,
              title: c.title || c.courseName || '',
              defaultCredits: Number(c.credits) || 12,
              universityId: c.universityId || 'udsm',
              verified: Boolean(c.verified),
              source: c.source || 'Official Academic Catalogue',
            });
          }
        });
      }
    } catch (err) {
      console.warn('AdminCatalogueService: Error searching canonical courses:', err);
    }

    return Array.from(resultsMap.values()).slice(0, maxResults);
  }

  /**
   * 26. Create Canonical Course (Canonical Course Model)
   * Prevents duplication: checks if code already exists.
   */
  async createCanonicalCourse(data: {
    code: string;
    title: string;
    defaultCredits: number;
    universityId?: string;
    academicUnitId?: string;
    departmentId?: string;
  }): Promise<{
    success: boolean;
    course?: CanonicalCourseRecord;
    existing?: CanonicalCourseRecord;
    exactMatch?: boolean;
    conflict?: boolean;
    error?: string;
  }> {
    if (!data.code || !data.code.trim()) {
      return { success: false, error: 'Course code is required.' };
    }
    if (!data.title || !data.title.trim()) {
      return { success: false, error: 'Course title is required.' };
    }

    const cleanCode = data.code.trim().toUpperCase();
    const cleanTitle = data.title.trim();
    const credits = Math.max(1, Math.min(60, Number(data.defaultCredits) || 12));
    const cleanId = cleanCode.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

    // Canonical Duplicate Check
    const existing = await this.getCanonicalCourseByCode(cleanCode);
    if (existing) {
      const isSameTitle = existing.title.trim().toLowerCase() === cleanTitle.toLowerCase();
      if (isSameTitle) {
        return {
          success: false,
          exactMatch: true,
          existing,
          error: `Course ${cleanCode} already exists as "${existing.title}" (${existing.defaultCredits || credits} Credits). You can assign it to a programme without creating a duplicate record.`,
        };
      } else {
        return {
          success: false,
          conflict: true,
          existing,
          error: `Course code ${cleanCode} already exists with a different title: "${existing.title}". Please review before proceeding.`,
        };
      }
    }

    const record: CanonicalCourseRecord = {
      id: cleanId,
      code: cleanCode,
      title: cleanTitle,
      defaultCredits: credits,
      universityId: (data.universityId || 'udsm').toLowerCase(),
      academicUnitId: data.academicUnitId,
      departmentId: data.departmentId,
      verified: true,
      source: 'Official Academic Catalogue',
    };

    try {
      await this.setDocInBothDatabases('canonical_courses', cleanId, record);

      await this.recordCatalogueAuditLog({
        action: 'create_course',
        targetType: 'canonical_course',
        targetId: cleanId,
        adminUid: auth.currentUser?.uid || 'super_admin',
        adminEmail: auth.currentUser?.email || undefined,
        details: { code: cleanCode, title: cleanTitle, credits },
        timestamp: new Date().toISOString(),
      });

      return { success: true, course: record };
    } catch (err: any) {
      console.error('Error creating canonical course:', err);
      try {
        handleFirestoreError(err, OperationType.WRITE, `canonical_courses/${cleanId}`);
      } catch (wrapped) {
        return {
          success: false,
          error: wrapped instanceof Error ? wrapped.message : 'Failed to write canonical course to Firestore.',
        };
      }
      return { success: false, error: 'Database write failed.' };
    }
  }

  /**
   * 27. Edit Canonical Course
   * Preserves existing document ID. Also supports description and status updates.
   */
  async updateCanonicalCourse(
    id: string,
    updates: {
      title?: string;
      defaultCredits?: number;
      code?: string;
      description?: string;
      status?: 'active' | 'archived' | 'inactive';
      active?: boolean;
      archived?: boolean;
    }
  ): Promise<{ success: boolean; course?: CanonicalCourseRecord; error?: string }> {
    const cleanId = id.toLowerCase().trim();
    if (!cleanId) return { success: false, error: 'Missing course ID.' };

    const snap = await this.getDocFromBothDatabases('canonical_courses', cleanId);
    const current: CanonicalCourseRecord = snap
      ? ({ id: snap.id, ...(snap.data as any) } as CanonicalCourseRecord)
      : (await this.getCanonicalCourseByCode(id)) || {
          id: cleanId,
          code: updates.code?.trim().toUpperCase() || cleanId.toUpperCase().replace(/_/g, ' '),
          title: updates.title?.trim() || 'University Course',
          defaultCredits: updates.defaultCredits || 12,
          universityId: 'udsm',
          verified: true,
          source: 'Official Academic Catalogue',
        };

    // If changing code, protect against duplicate canonical courses
    if (updates.code && updates.code.trim().toUpperCase() !== current.code.trim().toUpperCase()) {
      const existingConflict = await this.getCanonicalCourseByCode(updates.code);
      if (existingConflict && existingConflict.id !== cleanId) {
        return {
          success: false,
          error: `Cannot change course code to ${updates.code}: A canonical course with this code already exists (${existingConflict.title}).`,
        };
      }
    }

    const isArchived =
      updates.archived !== undefined
        ? updates.archived
        : updates.status === 'archived'
        ? true
        : updates.status === 'active'
        ? false
        : Boolean(current.archived);

    const updatedData: CanonicalCourseRecord = {
      ...current,
      id: cleanId,
      title: updates.title?.trim() || current.title,
      defaultCredits:
        updates.defaultCredits !== undefined
          ? Math.max(1, Math.min(60, Number(updates.defaultCredits)))
          : current.defaultCredits,
      code: updates.code?.trim().toUpperCase() || current.code,
      description: updates.description !== undefined ? updates.description.trim() : current.description || '',
      status: updates.status || (isArchived ? 'archived' : current.status || 'active'),
      active: updates.active !== undefined ? updates.active : !isArchived,
      archived: isArchived,
      updatedAt: new Date().toISOString(),
    };

    try {
      await this.setDocInBothDatabases('canonical_courses', cleanId, updatedData, { merge: true });

      // Sync updated title/credits/description to matching programme-course relationships across both DBs
      const pcDocs = await this.queryBothDatabases('programme_courses', (colRef) =>
        query(colRef, where('code', '==', current.code))
      );
      for (const d of pcDocs) {
        await this.setDocInBothDatabases(
          'programme_courses',
          d.id,
          {
            title: updatedData.title,
            code: updatedData.code,
            description: updatedData.description || '',
            updatedAt: updatedData.updatedAt,
          },
          { merge: true }
        );
      }

      // Sync to matching catalogue_courses across both DBs
      const ccDocs = await this.queryBothDatabases('catalogue_courses', (colRef) =>
        query(colRef, where('code', '==', current.code))
      );
      for (const d of ccDocs) {
        await this.setDocInBothDatabases(
          'catalogue_courses',
          d.id,
          {
            title: updatedData.title,
            code: updatedData.code,
            description: updatedData.description || '',
            updatedAt: updatedData.updatedAt,
          },
          { merge: true }
        );
      }

      this.coursesCache.clear();

      await this.recordCatalogueAuditLog({
        action: 'edit_course',
        targetType: 'canonical_course',
        targetId: cleanId,
        adminUid: auth.currentUser?.uid || 'super_admin',
        adminEmail: auth.currentUser?.email || undefined,
        details: updatedData,
        timestamp: new Date().toISOString(),
      });

      return { success: true, course: updatedData };
    } catch (err: any) {
      console.error('Error updating canonical course:', err);
      return { success: false, error: err?.message || 'Failed to update canonical course.' };
    }
  }

  /**
   * 27B. Archive or Restore Canonical Course
   */
  async archiveCanonicalCourse(
    idOrCode: string,
    archived = true
  ): Promise<{ success: boolean; course?: CanonicalCourseRecord; error?: string }> {
    const cleanInput = idOrCode.trim();
    const cleanId = cleanInput.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    const res = await this.updateCanonicalCourse(cleanId, {
      status: archived ? 'archived' : 'active',
      active: !archived,
      archived,
    });
    if (res.success) {
      await this.recordCatalogueAuditLog({
        action: 'archive_course',
        targetType: 'canonical_course',
        targetId: cleanId,
        adminUid: auth.currentUser?.uid || 'super_admin',
        adminEmail: auth.currentUser?.email || undefined,
        details: { archived },
        timestamp: new Date().toISOString(),
      });
    }
    return res;
  }

  /**
   * 27C. Update Programme-Course Relationship (Year, Semester, Credits, Status)
   * Updates only the relationship for the target programme without altering canonical course or other programmes.
   */
  async updateProgrammeCourseRelationship(params: {
    programmeId: string;
    code: string;
    canonicalCourseId?: string;
    oldYearOfStudy: number;
    oldSemester: number;
    newYearOfStudy: number;
    newSemester: number;
    credits: number;
    status: 'Core' | 'Elective';
    title?: string;
    description?: string;
    academicUnitId?: string;
    departmentId?: string;
  }): Promise<{ success: boolean; error?: string }> {
    const cleanProgId = params.programmeId.toLowerCase().trim();
    const cleanCode = params.code.trim().toUpperCase();
    const oldYear = Number(params.oldYearOfStudy) || 1;
    const oldSem = Number(params.oldSemester) || 1;
    const newYear = Number(params.newYearOfStudy) || 1;
    const newSem = Number(params.newSemester) || 1;
    const credits = Math.max(1, Math.min(60, Number(params.credits) || 12));
    const status = params.status || 'Core';

    const canonicalId =
      params.canonicalCourseId?.toLowerCase().trim() ||
      cleanCode.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    const codeSlug = cleanCode.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    try {
      // If moving to a different Year/Semester, verify no duplicate assignment in target term
      if (oldYear !== newYear || oldSem !== newSem) {
        const existingInTarget = await this.getCoursesByProgrammeYearSemester(cleanProgId, newYear, newSem);
        if (existingInTarget.some((c) => c.code.trim().toUpperCase() === cleanCode)) {
          return {
            success: false,
            error: `Course ${cleanCode} is already assigned to Year ${newYear}, Semester ${newSem} in this programme.`,
          };
        }
      }

      const nowIso = new Date().toISOString();
      const pcId = `${cleanProgId}_${canonicalId}`;
      const ccId = `udsm_${cleanProgId}_${codeSlug}`;

      // Update programme_courses across both DBs
      const pcSnap = await this.getDocFromBothDatabases('programme_courses', pcId);
      const pcPayload: Record<string, any> = {
        ...(pcSnap?.data || {}),
        id: pcId,
        programmeId: cleanProgId,
        courseId: canonicalId,
        code: cleanCode,
        ...(params.title ? { title: params.title.trim() } : {}),
        ...(params.description !== undefined ? { description: params.description.trim() } : {}),
        credits,
        yearOfStudy: newYear,
        semester: newSem,
        status,
        ...(params.academicUnitId ? { academicUnitId: params.academicUnitId } : {}),
        ...(params.departmentId ? { departmentId: params.departmentId } : {}),
        updatedAt: nowIso,
      };
      await this.setDocInBothDatabases('programme_courses', pcId, pcPayload, { merge: true });

      // Also update any matching programme_courses documents by query
      const matchingPc = await this.queryBothDatabases('programme_courses', (colRef) =>
        query(colRef, where('programmeId', '==', cleanProgId), where('code', '==', cleanCode))
      );
      for (const d of matchingPc) {
        await this.setDocInBothDatabases(
          'programme_courses',
          d.id,
          {
            credits,
            yearOfStudy: newYear,
            semester: newSem,
            status,
            ...(params.title ? { title: params.title.trim() } : {}),
            ...(params.description !== undefined ? { description: params.description.trim() } : {}),
            updatedAt: nowIso,
          },
          { merge: true }
        );
      }

      // Update catalogue_courses across both DBs
      const ccSnap = await this.getDocFromBothDatabases('catalogue_courses', ccId);
      const ccPayload: Record<string, any> = {
        ...(ccSnap?.data || {}),
        id: ccId,
        programmeId: cleanProgId,
        canonicalCourseId: canonicalId,
        code: cleanCode,
        ...(params.title ? { title: params.title.trim() } : {}),
        ...(params.description !== undefined ? { description: params.description.trim() } : {}),
        credits,
        yearOfStudy: newYear,
        semester: newSem,
        status,
        courseType: status,
        ...(params.academicUnitId ? { academicUnitId: params.academicUnitId } : {}),
        ...(params.departmentId ? { departmentId: params.departmentId } : {}),
        active: true,
        updatedAt: nowIso,
      };
      await this.setDocInBothDatabases('catalogue_courses', ccId, ccPayload, { merge: true });

      const matchingCc = await this.queryBothDatabases('catalogue_courses', (colRef) =>
        query(colRef, where('programmeId', '==', cleanProgId), where('code', '==', cleanCode))
      );
      for (const d of matchingCc) {
        await this.setDocInBothDatabases(
          'catalogue_courses',
          d.id,
          {
            credits,
            yearOfStudy: newYear,
            semester: newSem,
            status,
            courseType: status,
            ...(params.title ? { title: params.title.trim() } : {}),
            ...(params.description !== undefined ? { description: params.description.trim() } : {}),
            updatedAt: nowIso,
          },
          { merge: true }
        );
      }

      // Invalidate both old and new term caches
      this.coursesCache.delete(`${cleanProgId}_y${oldYear}_s${oldSem}`);
      this.coursesCache.delete(`${cleanProgId}_y${newYear}_s${newSem}`);

      await this.recordCatalogueAuditLog({
        action: 'update_course_relationship',
        targetType: 'programme_course',
        targetId: pcId,
        adminUid: auth.currentUser?.uid || 'super_admin',
        adminEmail: auth.currentUser?.email || undefined,
        details: {
          programmeId: cleanProgId,
          code: cleanCode,
          oldYear,
          oldSem,
          newYear,
          newSem,
          credits,
          status,
        },
        timestamp: nowIso,
      });

      return { success: true };
    } catch (err: any) {
      console.error('Error updating programme-course relationship:', err);
      return { success: false, error: err?.message || 'Failed to update course relationship.' };
    }
  }

  /**
   * 28. Get Course Usages (Where is this course used across programmes, years, and semesters?)
   */
  async getCourseUsages(courseCodeOrId: string): Promise<CourseUsageRecord[]> {
    if (!courseCodeOrId || !courseCodeOrId.trim()) return [];
    const cleanInput = courseCodeOrId.trim();
    const cleanCode = cleanInput.toUpperCase();
    const cleanId = cleanInput.toLowerCase().replace(/[^a-z0-9]+/g, '_');

    const usagesMap = new Map<string, CourseUsageRecord>();

    try {
      // 1. Query programme_courses
      const pcQ1 = query(
        collection(db, 'programme_courses'),
        where('code', '==', cleanCode)
      );
      const pcSnap1 = await getDocs(pcQ1);
      pcSnap1.docs.forEach((d) => {
        const data = d.data();
        const key = `${data.programmeId}_y${data.yearOfStudy}_s${data.semester}`;
        usagesMap.set(key, {
          programmeId: data.programmeId,
          programmeName: data.programmeName || data.programmeId,
          yearOfStudy: Number(data.yearOfStudy) || 1,
          semester: Number(data.semester) || 1,
          status: data.status || 'Core',
          credits: Number(data.credits) || 12,
          academicUnitId: data.academicUnitId,
          departmentId: data.departmentId,
        });
      });

      // 2. Query catalogue_courses
      const ccQ1 = query(
        collection(db, 'catalogue_courses'),
        where('code', '==', cleanCode)
      );
      const ccSnap1 = await getDocs(ccQ1);
      ccSnap1.docs.forEach((d) => {
        const data = d.data();
        const key = `${data.programmeId}_y${data.yearOfStudy}_s${data.semester}`;
        if (!usagesMap.has(key)) {
          usagesMap.set(key, {
            programmeId: data.programmeId,
            programmeName: data.programmeName || data.programmeId,
            yearOfStudy: Number(data.yearOfStudy) || 1,
            semester: Number(data.semester) || 1,
            status: data.status || data.courseType || 'Core',
            credits: Number(data.credits) || 12,
            academicUnitId: data.academicUnitId,
            departmentId: data.departmentId,
          });
        }
      });

      // Also check canonicalCourseId lookup
      if (cleanId) {
        const ccQ2 = query(
          collection(db, 'catalogue_courses'),
          where('canonicalCourseId', '==', cleanId)
        );
        const ccSnap2 = await getDocs(ccQ2);
        ccSnap2.docs.forEach((d) => {
          const data = d.data();
          const key = `${data.programmeId}_y${data.yearOfStudy}_s${data.semester}`;
          if (!usagesMap.has(key)) {
            usagesMap.set(key, {
              programmeId: data.programmeId,
              programmeName: data.programmeName || data.programmeId,
              yearOfStudy: Number(data.yearOfStudy) || 1,
              semester: Number(data.semester) || 1,
              status: data.status || data.courseType || 'Core',
              credits: Number(data.credits) || 12,
              academicUnitId: data.academicUnitId,
              departmentId: data.departmentId,
            });
          }
        });
      }

      // Enrich programme names if missing or raw ID
      const usages = Array.from(usagesMap.values());
      for (const u of usages) {
        if (!u.programmeName || u.programmeName === u.programmeId) {
          const prog = await this.getProgrammeById(u.programmeId);
          if (prog) {
            u.programmeName = prog.name;
          }
        }
      }

      // Sort by Programme Name, then Year, then Semester
      usages.sort((a, b) => {
        const cmp = a.programmeName.localeCompare(b.programmeName);
        if (cmp !== 0) return cmp;
        if (a.yearOfStudy !== b.yearOfStudy) return a.yearOfStudy - b.yearOfStudy;
        return a.semester - b.semester;
      });

      return usages;
    } catch (err) {
      console.warn(`AdminCatalogueService: Error getting course usages for ${cleanInput}:`, err);
      return Array.from(usagesMap.values());
    }
  }

  /**
   * 29. Assign Course to Programme, Year, and Semester (Hierarchical Assignment)
   * Prevents duplicate assignment: checks if course is already in that term.
   */
  async assignCourseToProgramme(params: {
    canonicalCourseId?: string;
    code: string;
    title: string;
    credits: number;
    status: 'Core' | 'Elective';
    programmeId: string;
    academicUnitId: string;
    departmentId: string;
    yearOfStudy: number;
    semester: number;
  }): Promise<{ success: boolean; alreadyAssigned?: boolean; error?: string }> {
    const cleanProgId = params.programmeId.toLowerCase().trim();
    const cleanCode = params.code.trim().toUpperCase();
    const year = Number(params.yearOfStudy);
    const sem = Number(params.semester);
    const credits = Number(params.credits) || 12;
    const status = params.status || 'Core';

    if (!cleanProgId || !cleanCode || !year || !sem) {
      return { success: false, error: 'Missing required assignment fields.' };
    }

    const canonicalId =
      params.canonicalCourseId?.toLowerCase().trim() ||
      cleanCode.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    const codeSlug = cleanCode.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    // 1. Duplicate Assignment Protection: Check if course already exists in this Programme + Year + Semester
    try {
      const qExisting = query(
        collection(db, 'catalogue_courses'),
        where('programmeId', '==', cleanProgId),
        where('yearOfStudy', '==', year),
        where('semester', '==', sem),
        where('code', '==', cleanCode)
      );
      const snapExisting = await getDocs(qExisting);
      if (!snapExisting.empty) {
        return {
          success: false,
          alreadyAssigned: true,
          error: `Course ${cleanCode} is already assigned to this programme in Year ${year}, Semester ${sem}.`,
        };
      }
    } catch (err) {
      console.warn('Error checking duplicate course assignment:', err);
    }

    // 2. Ensure canonical course exists in canonical_courses
    try {
      const canonRef = doc(db, 'canonical_courses', canonicalId);
      const canonSnap = await getDoc(canonRef);
      if (!canonSnap.exists()) {
        await setDoc(canonRef, {
          id: canonicalId,
          code: cleanCode,
          title: params.title.trim(),
          defaultCredits: credits,
          universityId: 'udsm',
          academicUnitId: params.academicUnitId,
          departmentId: params.departmentId,
          verified: true,
          source: 'Official Academic Catalogue',
        });
      }
    } catch (err) {
      console.warn('Canonical course verification notice:', err);
    }

    // 3. Create programme_courses relationship
    const pcId = `${cleanProgId}_${canonicalId}`;
    const pcData: ProgrammeCourseRecord = {
      id: pcId,
      programmeId: cleanProgId,
      courseId: canonicalId,
      code: cleanCode,
      title: params.title.trim(),
      credits,
      yearOfStudy: year,
      semester: sem,
      status,
      academicUnitId: params.academicUnitId,
      departmentId: params.departmentId,
      universityId: 'udsm',
      verified: true,
      source: 'Official Academic Catalogue',
      academicYear: '2025/2026',
      sourceType: 'official_prospectus',
    };

    // 4. Create catalogue_courses entry (used by student portal & term curriculum viewer)
    const ccId = `udsm_${cleanProgId}_${codeSlug}`;
    const ccData: CourseRecord = {
      id: ccId,
      programmeId: cleanProgId,
      canonicalCourseId: canonicalId,
      code: cleanCode,
      title: params.title.trim(),
      credits,
      yearOfStudy: year,
      semester: sem,
      status,
      courseType: status,
      academicUnitId: params.academicUnitId,
      departmentId: params.departmentId,
      universityId: 'udsm',
      active: true,
      verified: true,
      source: 'Official Academic Catalogue',
      academicYear: '2025/2026',
      sourceType: 'official_prospectus',
    };

    try {
      await this.setDocInBothDatabases('programme_courses', pcId, pcData, { merge: true });
      await this.setDocInBothDatabases('catalogue_courses', ccId, ccData, { merge: true });

      // Invalidate term course cache
      this.coursesCache.delete(`${cleanProgId}_y${year}_s${sem}`);

      await this.recordCatalogueAuditLog({
        action: 'assign_course',
        targetType: 'programme_course',
        targetId: pcId,
        adminUid: auth.currentUser?.uid || 'super_admin',
        adminEmail: auth.currentUser?.email || undefined,
        details: {
          programmeId: cleanProgId,
          courseCode: cleanCode,
          yearOfStudy: year,
          semester: sem,
          status,
        },
        timestamp: new Date().toISOString(),
      });

      return { success: true };
    } catch (err: any) {
      console.error('Error assigning course to programme:', err);
      return { success: false, error: err?.message || 'Failed to assign course to programme.' };
    }
  }

  /**
   * 30. Remove Course from Programme (Does NOT delete canonical course!)
   */
  async removeCourseFromProgramme(params: {
    programmeId: string;
    code: string;
    canonicalCourseId?: string;
    yearOfStudy: number;
    semester: number;
  }): Promise<{ success: boolean; error?: string }> {
    const cleanProgId = params.programmeId.toLowerCase().trim();
    const cleanCode = params.code.trim().toUpperCase();
    const year = Number(params.yearOfStudy);
    const sem = Number(params.semester);
    const canonicalId =
      params.canonicalCourseId?.toLowerCase().trim() ||
      cleanCode.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    const codeSlug = cleanCode.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    try {
      // 1. Delete relationship from programme_courses across both DBs
      const pcId = `${cleanProgId}_${canonicalId}`;
      try {
        await this.deleteDocInBothDatabases('programme_courses', pcId);
      } catch (err) {
        console.warn('Notice removing from programme_courses:', err);
      }

      // Also clean up by query in programme_courses if specific ID differed
      const snapPc = await this.queryBothDatabases('programme_courses', (colRef) =>
        query(
          colRef,
          where('programmeId', '==', cleanProgId),
          where('yearOfStudy', '==', year),
          where('semester', '==', sem),
          where('code', '==', cleanCode)
        )
      );
      for (const d of snapPc) {
        await this.deleteDocInBothDatabases('programme_courses', d.id);
      }

      // 2. Delete entry from catalogue_courses across both DBs
      const ccId = `udsm_${cleanProgId}_${codeSlug}`;
      try {
        await this.deleteDocInBothDatabases('catalogue_courses', ccId);
      } catch (err) {
        console.warn('Notice removing from catalogue_courses:', err);
      }

      const snapCc = await this.queryBothDatabases('catalogue_courses', (colRef) =>
        query(
          colRef,
          where('programmeId', '==', cleanProgId),
          where('yearOfStudy', '==', year),
          where('semester', '==', sem),
          where('code', '==', cleanCode)
        )
      );
      for (const d of snapCc) {
        await this.deleteDocInBothDatabases('catalogue_courses', d.id);
      }

      // Invalidate cache
      this.coursesCache.delete(`${cleanProgId}_y${year}_s${sem}`);

      await this.recordCatalogueAuditLog({
        action: 'remove_course',
        targetType: 'programme_course',
        targetId: `${cleanProgId}_${cleanCode}_y${year}s${sem}`,
        adminUid: auth.currentUser?.uid || 'super_admin',
        adminEmail: auth.currentUser?.email || undefined,
        details: { programmeId: cleanProgId, code: cleanCode, year, sem },
        timestamp: new Date().toISOString(),
      });

      return { success: true };
    } catch (err: any) {
      console.error('Error removing course from programme:', err);
      return { success: false, error: err?.message || 'Failed to remove course from programme.' };
    }
  }

  /**
   * 31. Delete Canonical Course (Protected: blocked if used in any programme or has materials)
   */
  async deleteCanonicalCourse(
    idOrCode: string
  ): Promise<{
    success: boolean;
    hasUsages?: boolean;
    usages?: CourseUsageRecord[];
    materialCount?: number;
    error?: string;
  }> {
    const cleanInput = idOrCode.trim();
    if (!cleanInput) return { success: false, error: 'Course identifier required.' };

    const cleanCode = cleanInput.toUpperCase();
    const cleanId = cleanInput.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

    // 1. Audit all usages across programmes
    const usages = await this.getCourseUsages(cleanCode);
    let materialCount = 0;
    try {
      const matDocs = await this.queryBothDatabases('materials', (colRef) =>
        query(colRef, where('courseCode', '==', cleanCode))
      );
      materialCount = matDocs.length;
    } catch {
      // ignore
    }

    if (usages.length > 0 || materialCount > 0) {
      return {
        success: false,
        hasUsages: true,
        usages,
        materialCount,
        error: `Cannot hard-delete canonical course ${cleanCode}: It is currently assigned to ${usages.length} programme(s) and linked to ${materialCount} material(s). Please Archive the course or remove its programme assignments first to protect curriculum integrity.`,
      };
    }

    // 2. Safe to delete
    try {
      await this.deleteDocInBothDatabases('canonical_courses', cleanId);

      await this.recordCatalogueAuditLog({
        action: 'delete_course',
        targetType: 'canonical_course',
        targetId: cleanId,
        adminUid: auth.currentUser?.uid || 'super_admin',
        adminEmail: auth.currentUser?.email || undefined,
        details: { code: cleanCode },
        timestamp: new Date().toISOString(),
      });

      return { success: true };
    } catch (err: any) {
      console.error('Error deleting canonical course:', err);
      return { success: false, error: err?.message || 'Failed to delete canonical course.' };
    }
  }

  /**
   * 32. Invalidate Courses Cache
   */
  clearCoursesCache(cacheKey?: string) {
    if (cacheKey) {
      this.coursesCache.delete(cacheKey);
    } else {
      this.coursesCache.clear();
    }
  }
}

export const adminCatalogueService = new AdminCatalogueService();
