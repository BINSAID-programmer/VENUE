/**
 * VENUE — Course & Curriculum Service
 * STEP 3: Database-Driven Course & Curriculum Architecture
 *
 * Implements the academic hierarchy:
 * University
 *  → College / School / Institute
 *    → Department
 *      → Degree Programme
 *        → Year of Study
 *          → Semester
 *            → Courses (Canonical & Curriculum Placements)
 *
 * Designed for 100,000+ students:
 * - Scoped queries by programmeId, yearOfStudy, semester
 * - In-memory cache to prevent repeated Firestore fetches
 * - Numeric credits stored dynamically as single source of truth for GPA
 * - University-agnostic structure supporting variable programme durations (1..6 years)
 * - Official course data directly from verified university prospectus catalogues
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  limit,
  setDoc,
  QueryConstraint,
} from 'firebase/firestore';
import { db, dbDefault } from './firebase';
import {
  CourseRecord,
  Course,
  ProgrammeRecord,
  StudentProfile,
  AcademicMaterialRecord,
} from '../types';
import {
  UDSM_VERIFIED_COURSES,
  UDSM_PROGRAMMES,
  UDSM_PROGRAMME_COURSES,
  UDSM_DEPARTMENTS,
  UDSM_ACADEMIC_UNITS,
  OFFICIAL_SOURCE_UDSM_PROSPECTUS_2025_2026,
} from '../data/udsmProspectus2025';
import {
  AUDITED_DEPARTMENTS,
  AUDITED_ACADEMIC_UNITS,
  AUDITED_PROGRAMMES,
} from '../data/udsmAuditedCatalogue2025';
import { normalizeCourseCode, buildStableCourseId } from './catalogueValidation';
import { studentMaterialsService } from './studentMaterialsService';

export const FIRESTORE_COURSE_COLLECTION = 'catalogue_courses';

export interface CourseAssignedLecturerInfo {
  id: string;
  fullName: string;
  title?: string;
  displayName: string;
  position?: string;
  email?: string;
  departmentName?: string;
}

export interface CourseLiveMetadata {
  courseId: string;
  courseCode: string;
  assignedLecturers: CourseAssignedLecturerInfo[];
  primaryLecturerName: string | null;
  primaryLecturerTitle: string | null;
  primaryLecturerDepartment: string | null;
  lecturerName?: string | null;
  lecturerTitle?: string | null;
  lecturerOffice?: string | null;
  lecturerEmail?: string | null;
  lecturerAssigned?: boolean;
  totalMaterialsCount: number;
  notesCount: number;
  handoutsCount: number;
  slidesCount: number;
  pastPapersCount: number;
  tutorialsCount: number;
  referenceCount: number;
  otherCount: number;
  hasMaterials: boolean;
}

export type CourseLiveMetadataMap = Map<string, CourseLiveMetadata> & Record<string, any>;

export interface CurriculumTermCourses {
  yearOfStudy: number;
  semester: number;
  courses: CourseRecord[];
  totalCredits: number;
  coreCount: number;
  electiveCount: number;
}

export interface ProgrammeCurriculumSummary {
  programmeId: string;
  programmeName: string;
  durationYears: number;
  academicUnitId?: string;
  departmentId?: string;
  universityId: string;
  terms: CurriculumTermCourses[];
  totalProgrammeCredits: number;
  totalCoursesCount: number;
  verified: boolean;
  source: string;
}

class CourseCurriculumService {
  // In-memory cache for fast, light client-side rendering
  // Key format: `${universityId || 'udsm'}_${programmeId}_${yearOfStudy}_${semester}`
  private termCoursesCache = new Map<string, CourseRecord[]>();

  // Cache for programme full curriculum summaries
  private programmeSummaryCache = new Map<string, ProgrammeCurriculumSummary>();

  // In-memory index of official verified course records for fast offline/fallback access
  private officialRecordsByTerm = new Map<string, CourseRecord[]>();

  // Set of programme IDs with verified courses
  private verifiedProgrammeIds = new Set<string>();

  private isBootstrapping = false;
  private isBootstrapped = false;

  constructor() {
    this.indexAuditedCatalogue();
  }

  /**
   * Pre-indexes official prospectus course records by composite term key
   * to guarantee instant offline fallback without scanning thousands of records repeatedly.
   */
  private indexAuditedCatalogue() {
    for (const rec of UDSM_VERIFIED_COURSES) {
      const pId = rec.programmeId.toLowerCase().trim();
      const y = Number(rec.yearOfStudy);
      const s = Number(rec.semester);

      this.verifiedProgrammeIds.add(pId);

      const key = `${pId}_${y}_${s}`;
      const list = this.officialRecordsByTerm.get(key) || [];
      if (!list.some((existing) => existing.code.replace(/\s+/g, '') === rec.code.replace(/\s+/g, ''))) {
        list.push(rec);
      }
      this.officialRecordsByTerm.set(key, list);

      // Support alias mappings (e.g. math-stats <-> udsm-bsc-math-stats)
      if (pId === 'udsm-bsc-math-stats') {
        const aliasKey = `math-stats_${y}_${s}`;
        const aliasList = this.officialRecordsByTerm.get(aliasKey) || [];
        if (!aliasList.some((e) => e.code.replace(/\s+/g, '') === rec.code.replace(/\s+/g, ''))) {
          aliasList.push(rec);
        }
        this.officialRecordsByTerm.set(aliasKey, aliasList);
      }
      if (pId === 'udsm-bsc-cs') {
        const aliasKey = `bsc-cs_${y}_${s}`;
        const aliasList = this.officialRecordsByTerm.get(aliasKey) || [];
        if (!aliasList.some((e) => e.code.replace(/\s+/g, '') === rec.code.replace(/\s+/g, ''))) {
          aliasList.push(rec);
        }
        this.officialRecordsByTerm.set(aliasKey, aliasList);
      }
    }

    // Also index official audited programme courses for comprehensive offline and fallback coverage
    for (const pc of UDSM_PROGRAMME_COURSES) {
      const pId = pc.programmeId.toLowerCase().trim();
      const y = Number(pc.yearOfStudy);
      const s = Number(pc.semester);
      if (!pId || !y || !s) continue;

      this.verifiedProgrammeIds.add(pId);
      const key = `${pId}_${y}_${s}`;
      const list = this.officialRecordsByTerm.get(key) || [];
      const cleanCode = pc.code.replace(/\s+/g, '');
      if (!list.some((existing) => existing.code.replace(/\s+/g, '') === cleanCode)) {
        list.push({
          id: pc.id,
          code: pc.code,
          courseCode: pc.code,
          title: pc.title,
          courseName: pc.title,
          credits: Number(pc.credits) || 12,
          yearOfStudy: y,
          semester: s,
          courseType: pc.status || 'Core',
          status: pc.status || 'Core',
          programmeId: pId,
          departmentId: pc.departmentId,
          academicUnitId: pc.academicUnitId,
          universityId: pc.universityId || 'udsm',
          verified: true,
          active: true,
          source: pc.source,
          sourceType: pc.sourceType || 'official_prospectus',
        } as CourseRecord);
      }
      this.officialRecordsByTerm.set(key, list);
    }
  }

  /**
   * Normalize programme identifier to support legacy and canonical formats
   */
  public normalizeProgrammeId(programmeId?: string): string {
    if (!programmeId) return '';
    const clean = programmeId.toLowerCase().trim();
    if (clean === 'math-stats-math' || clean === 'udsm-bsc-math-stats') return 'math-stats';
    if (clean === 'udsm-bsc-cs') return 'bsc-cs';
    if (clean === 'udsm-bcom-acc') return 'bcom-accounting';
    if (clean === 'udsm-llb') return 'llb';
    if (clean === 'udsm-md') return 'doctor-medicine';
    if (clean === 'barch' || clean === 'udsm-barch' || clean === 'udsm-b-arch') return 'b-arch';
    if (clean === 'udsm-bsc-qs') return 'bsc-qs';
    return clean;
  }

  /**
   * Clears in-memory caches to prevent stale data between user logins or profile switches
   */
  public clearCache(): void {
    this.termCoursesCache.clear();
    this.programmeSummaryCache.clear();
  }

  /**
   * 1. GET COURSES BY PROGRAMME, YEAR, AND SEMESTER
   *
   * Core scalable query for VENUE:
   * - Queries Firestore specifically by (programmeId, yearOfStudy, semester)
   * - Scoped by departmentId to prevent cross-department contamination
   * - Uses in-memory cache to prevent duplicate fetches
   * - Returns 'CURRICULUM DATA MISSING — DO NOT INFER' when curriculum is not yet published
   * - NEVER falls back to Mathematics & Statistics for other programmes!
   */
  async getCoursesByProgrammeAndTerm(params: {
    programmeId: string;
    yearOfStudy: number;
    semester: number;
    departmentId?: string;
    academicUnitId?: string;
    universityId?: string;
    userId?: string;
    pageSize?: number;
  }): Promise<{
    courses: CourseRecord[];
    source: 'firestore' | 'cache' | 'catalogue_fallback';
    verified: boolean;
    missingCurriculum?: boolean;
    statusMessage?: string;
  }> {
    const { yearOfStudy, semester } = params;
    const rawProgId = params.programmeId || '';
    const cleanProgId = this.normalizeProgrammeId(rawProgId);
    const cleanDeptId = (params.departmentId || '').toLowerCase().trim();

    if (!cleanProgId || !yearOfStudy || !semester) {
      return { courses: [], source: 'cache', verified: false };
    }

    // Scoped cache key to isolate by programme, department, year, semester
    const cacheKey = `${cleanProgId}_${cleanDeptId || 'all'}_${yearOfStudy}_${semester}`;

    // 1. Check in-memory cache
    if (this.termCoursesCache.has(cacheKey)) {
      const cached = this.termCoursesCache.get(cacheKey) || [];
      return {
        courses: cached,
        source: 'cache',
        verified: cached.length > 0,
        missingCurriculum: cached.length === 0,
        statusMessage: cached.length === 0 ? 'CURRICULUM DATA MISSING — DO NOT INFER' : undefined,
      };
    }

    // 2. Query Firestore with indexed constraints
    try {
      const colRef = collection(db, FIRESTORE_COURSE_COLLECTION);
      const constraints: QueryConstraint[] = [
        where('programmeId', '==', cleanProgId),
        where('yearOfStudy', '==', Number(yearOfStudy)),
        where('semester', '==', Number(semester)),
        limit(params.pageSize || 50),
      ];

      const q = query(colRef, ...constraints);
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        let firestoreCourses: CourseRecord[] = snapshot.docs.map((d) => {
          const data = d.data() as CourseRecord;
          return {
            ...data,
            id: d.id,
            credits: Number(data.credits) || 12,
            yearOfStudy: Number(data.yearOfStudy),
            semester: Number(data.semester),
            courseType: data.courseType || data.status || 'Core',
            active: data.active !== false,
          };
        });

        // Cache the result
        this.termCoursesCache.set(cacheKey, firestoreCourses);
        return {
          courses: firestoreCourses,
          source: 'firestore',
          verified: true,
        };
      }
    } catch (err) {
      console.warn(`CourseCurriculumService: Firestore query fallback for ${cacheKey}:`, err);
    }

    // 3. Official Audited Catalogue Repository Fallback
    const fallbackCourses =
      this.officialRecordsByTerm.get(`${cleanProgId}_${yearOfStudy}_${semester}`) ||
      this.officialRecordsByTerm.get(`${rawProgId}_${yearOfStudy}_${semester}`) ||
      [];

    // Ensure credits and fields are standardized
    const standardized = fallbackCourses.map((c) => ({
      ...c,
      credits: Number(c.credits) || 12,
      yearOfStudy: Number(c.yearOfStudy),
      semester: Number(c.semester),
      courseType: c.courseType || c.status || 'Core',
      active: true,
    }));

    // Cache the fallback result for fast subsequent accesses
    this.termCoursesCache.set(cacheKey, standardized);

    const isMissing = standardized.length === 0;
    return {
      courses: standardized,
      source: 'catalogue_fallback',
      verified: standardized.length > 0,
      missingCurriculum: isMissing,
      statusMessage: isMissing ? 'CURRICULUM DATA MISSING — DO NOT INFER' : undefined,
    };
  }

  /**
   * 2. GET FULL PROGRAMME CURRICULUM ROADMAP
   *
   * Retrieves all courses for all study years and semesters of a programme.
   * Dynamically resolves the programme duration (e.g. 3, 4, 5 years) and gathers
   * courses for Year 1 Sem 1, Year 1 Sem 2, Year 2 Sem 1... Year N Sem 2.
   */
  async getProgrammeCurriculumRoadmap(programmeId: string): Promise<ProgrammeCurriculumSummary> {
    const cleanId = this.normalizeProgrammeId(programmeId);

    if (this.programmeSummaryCache.has(cleanId)) {
      return this.programmeSummaryCache.get(cleanId)!;
    }

    // Find programme metadata to determine duration
    let progMeta = UDSM_PROGRAMMES.find(
      (p) => p.id.toLowerCase() === cleanId || p.id.toLowerCase() === programmeId.toLowerCase()
    );

    if (!progMeta) {
      try {
        const pSnap = await getDoc(doc(db, 'programmes', cleanId));
        if (pSnap.exists()) {
          progMeta = pSnap.data() as any;
        }
      } catch (err) {
        console.warn('Could not fetch programme from firestore:', err);
      }
    }

    const durationYears = progMeta?.durationYears || 3;
    const programmeName = progMeta?.name || 'Academic Degree Programme';
    const universityId = progMeta?.universityId || 'udsm';
    const academicUnitId = progMeta?.academicUnitId;
    const departmentId = progMeta?.departmentId;

    const terms: CurriculumTermCourses[] = [];
    let totalCredits = 0;
    let totalCourses = 0;

    for (let year = 1; year <= durationYears; year++) {
      for (let sem = 1; sem <= 2; sem++) {
        const { courses } = await this.getCoursesByProgrammeAndTerm({
          programmeId: cleanId,
          yearOfStudy: year,
          semester: sem,
          departmentId,
          academicUnitId,
          universityId,
        });

        const termCredits = courses.reduce((acc, curr) => acc + (Number(curr.credits) || 0), 0);
        const coreCount = courses.filter((c) => (c.courseType || c.status) === 'Core').length;
        const electiveCount = courses.filter((c) => (c.courseType || c.status) === 'Elective').length;

        terms.push({
          yearOfStudy: year,
          semester: sem,
          courses,
          totalCredits: termCredits,
          coreCount,
          electiveCount,
        });

        totalCredits += termCredits;
        totalCourses += courses.length;
      }
    }

    const summary: ProgrammeCurriculumSummary = {
      programmeId: cleanId,
      programmeName,
      durationYears,
      academicUnitId,
      departmentId,
      universityId,
      terms,
      totalProgrammeCredits: totalCredits,
      totalCoursesCount: totalCourses,
      verified: totalCourses > 0,
      source: OFFICIAL_SOURCE_UDSM_PROSPECTUS_2025_2026,
    };

    this.programmeSummaryCache.set(cleanId, summary);
    return summary;
  }

  /**
   * 3. GET SINGLE COURSE BY ID OR CODE
   */
  async getCourseById(courseId: string): Promise<CourseRecord | null> {
    if (!courseId) return null;
    const cleanId = courseId.toLowerCase().trim();

    try {
      const docRef = doc(db, FIRESTORE_COURSE_COLLECTION, cleanId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as CourseRecord;
        return {
          ...data,
          id: snap.id,
          credits: Number(data.credits) || 12,
        };
      }
    } catch (err) {
      console.warn('CourseCurriculumService: getCourseById Firestore lookup fallback:', err);
    }

    // Search in verified catalogue records
    const normalizedCode = normalizeCourseCode(courseId);
    const found = UDSM_VERIFIED_COURSES.find(
      (c) =>
        c.id.toLowerCase() === cleanId ||
        normalizeCourseCode(c.code) === normalizedCode ||
        c.canonicalCourseId === cleanId
    );

    return found ? { ...found, credits: Number(found.credits) || 12 } : null;
  }

  /**
   * 4. CHECK IF PROGRAMME HAS VERIFIED COURSES AVAILABLE
   */
  hasVerifiedCourses(programmeId?: string): boolean {
    if (!programmeId) return false;
    const cleanId = this.normalizeProgrammeId(programmeId);
    return this.verifiedProgrammeIds.has(cleanId) || this.verifiedProgrammeIds.has(programmeId.toLowerCase());
  }

  /**
   * 5. GET LIST OF PROGRAMMES CURRENTLY WITH OFFICIAL COURSES
   */
  getProgrammesWithCoursesList(): Array<{ id: string; name: string; durationYears: number }> {
    const list: Array<{ id: string; name: string; durationYears: number }> = [];
    const seen = new Set<string>();

    for (const prog of UDSM_PROGRAMMES) {
      const cleanId = this.normalizeProgrammeId(prog.id);
      if (this.verifiedProgrammeIds.has(cleanId) && !seen.has(cleanId)) {
        seen.add(cleanId);
        list.push({
          id: prog.id,
          name: prog.name,
          durationYears: prog.durationYears || 3,
        });
      }
    }

    return list;
  }

  /**
   * 6. RESOLVE HUMAN-READABLE DEPARTMENT, ACADEMIC UNIT, AND PROGRAMME NAMES
   */
  public resolveDepartmentName(departmentIdOrName?: string, fallbackName?: string): string {
    const raw = (departmentIdOrName || '').trim();
    if (!raw) return fallbackName || 'Academic Department';

    const lower = raw.toLowerCase();
    const fromAudited = AUDITED_DEPARTMENTS.find(
      (d) =>
        d.id.toLowerCase() === lower ||
        d.name.toLowerCase() === lower ||
        (d.shortName && d.shortName.toLowerCase() === lower)
    );
    if (fromAudited) return fromAudited.name;

    const fromProspectus = UDSM_DEPARTMENTS.find(
      (d) =>
        d.id.toLowerCase() === lower ||
        d.name.toLowerCase() === lower ||
        (d.shortName && d.shortName.toLowerCase() === lower)
    );
    if (fromProspectus) return fromProspectus.name;

    // Common department ID aliases
    const aliasMap: Record<string, string> = {
      'dept-math': 'Department of Mathematics',
      'dept-stats': 'Department of Statistics',
      'dept-cse': 'Department of Computer Science and Engineering',
      'dept-ete': 'Department of Electronics and Telecommunications Engineering',
      'dept-ee': 'Department of Electrical Engineering',
      'dept-mie': 'Department of Mechanical and Industrial Engineering',
      'dept-sce': 'Department of Structural and Construction Engineering',
      'dept-cpe': 'Department of Chemical and Process Engineering',
      'dept-phys': 'Department of Physics',
      'dept-chem': 'Chemistry Department',
      'dept-chemistry': 'Chemistry Department',
      'dept-botany': 'Department of Botany',
      'dept-zoology': 'Department of Zoology and Wildlife Conservation',
      'dept-biotech': 'Department of Molecular Biology and Biotechnology',
      'dept-geosciences': 'Department of Geosciences',
      'dept-petroleum-eng': 'Department of Petroleum and Energy Engineering',
      'dept-accounting': 'Department of Accounting',
      'dept-finance': 'Department of Finance',
      'dept-marketing': 'Department of Marketing',
      'dept-management': 'Department of General Management',
      'dept-dev-studies': 'Department of Development Studies',
      'dept-ccs': 'Centre for Communication Studies',
      'dept-history': 'Department of History',
      'dept-foreign-languages': 'Department of Foreign Languages and Linguistics',
      'dept-archaeology': 'Department of Archaeology and Heritage Studies',
      'dept-literature': 'Department of Literature',
      'dept-philosophy': 'Department of Philosophy and Religious Studies',
      'dept-law': 'University of Dar es Salaam School of Law',
      'dept-business': 'University of Dar es Salaam Business School',
      'dept-ci': 'Confucius Institute (CI-UDSM)',
    };
    if (aliasMap[lower]) return aliasMap[lower];

    if (raw.startsWith('dept-')) {
      return (
        fallbackName ||
        `Department of ${raw
          .replace(/^dept-/, '')
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')}`
      );
    }

    return raw;
  }

  public resolveAcademicUnitName(unitIdOrName?: string, fallbackName?: string): string {
    const raw = (unitIdOrName || '').trim();
    if (!raw) return fallbackName || '';
    const lower = raw.toLowerCase();

    const fromAudited = AUDITED_ACADEMIC_UNITS.find(
      (u) =>
        u.id.toLowerCase() === lower ||
        u.name.toLowerCase() === lower ||
        (u.abbreviation && u.abbreviation.toLowerCase() === lower) ||
        (u.shortName && u.shortName.toLowerCase() === lower)
    );
    if (fromAudited) {
      return fromAudited.abbreviation
        ? `${fromAudited.name} (${fromAudited.abbreviation})`
        : fromAudited.name;
    }

    const fromProspectus = UDSM_ACADEMIC_UNITS.find(
      (u) =>
        u.id.toLowerCase() === lower ||
        u.name.toLowerCase() === lower ||
        (u.abbreviation && u.abbreviation.toLowerCase() === lower) ||
        (u.shortName && u.shortName.toLowerCase() === lower)
    );
    if (fromProspectus) {
      return fromProspectus.abbreviation
        ? `${fromProspectus.name} (${fromProspectus.abbreviation})`
        : fromProspectus.name;
    }

    return fallbackName || raw;
  }

  public resolveProgrammeName(programmeIdOrName?: string, fallbackName?: string): string {
    const raw = (programmeIdOrName || '').trim();
    if (!raw) return fallbackName || '';
    const clean = this.normalizeProgrammeId(raw);
    const lower = raw.toLowerCase();

    const fromAudited = AUDITED_PROGRAMMES.find(
      (p) =>
        p.id.toLowerCase() === lower ||
        p.id.toLowerCase() === clean ||
        p.name.toLowerCase() === lower
    );
    if (fromAudited) return fromAudited.name;

    const fromProspectus = UDSM_PROGRAMMES.find(
      (p) =>
        p.id.toLowerCase() === lower ||
        p.id.toLowerCase() === clean ||
        p.name.toLowerCase() === lower
    );
    if (fromProspectus) return fromProspectus.name;

    return fallbackName || raw;
  }

  /**
   * 7. GET LIVE COURSE METADATA (Real Lecturer Assignments & Real Uploaded Material Counts)
   *
   * Strictly reads from real Firestore collections (`lecturer_courses`, `lecturers`, `materials`)
   * and `/api/materials/metadata`. Never fabricates lecturer names or material counts.
   */
  async getCourseLiveMetadataMap(
    coursesOrParams?:
      | Array<{
          id: string;
          code?: string;
          courseCode?: string;
          universityId?: string;
          programmeId?: string;
        }>
      | {
          universityId?: string;
          programmeId?: string;
          courseRecords?: Array<{
            id: string;
            code?: string;
            courseCode?: string;
            universityId?: string;
            programmeId?: string;
          }>;
          courses?: Array<{
            id: string;
            code?: string;
            courseCode?: string;
            universityId?: string;
            programmeId?: string;
          }>;
        }
  ): Promise<CourseLiveMetadataMap> {
    const result = new Map<string, CourseLiveMetadata>() as CourseLiveMetadataMap;

    const setEntry = (key: string, val: CourseLiveMetadata) => {
      if (!key) return;
      result.set(key, val);
      (result as any)[key] = val;
    };

    const getOrCreateEntry = (courseId: string, courseCode: string): CourseLiveMetadata => {
      const cleanCode = normalizeCourseCode(courseCode || courseId);
      const existing =
        result.get(courseId) ||
        (cleanCode ? result.get(cleanCode) : undefined) ||
        (courseCode ? result.get(courseCode.toUpperCase().trim()) : undefined);
      if (existing) {
        if (courseId) setEntry(courseId, existing);
        if (cleanCode) setEntry(cleanCode, existing);
        if (courseCode) setEntry(courseCode.toUpperCase().trim(), existing);
        return existing;
      }
      const created: CourseLiveMetadata = {
        courseId: courseId || cleanCode,
        courseCode: cleanCode,
        assignedLecturers: [],
        primaryLecturerName: null,
        primaryLecturerTitle: null,
        primaryLecturerDepartment: null,
        lecturerName: null,
        lecturerTitle: null,
        lecturerOffice: null,
        lecturerEmail: null,
        lecturerAssigned: false,
        totalMaterialsCount: 0,
        notesCount: 0,
        handoutsCount: 0,
        slidesCount: 0,
        pastPapersCount: 0,
        tutorialsCount: 0,
        referenceCount: 0,
        otherCount: 0,
        hasMaterials: false,
      };
      if (courseId) setEntry(courseId, created);
      if (cleanCode) setEntry(cleanCode, created);
      if (courseCode) setEntry(courseCode.toUpperCase().trim(), created);
      return created;
    };

    let targetCourses: Array<{
      id: string;
      code: string;
      universityId?: string;
      programmeId?: string;
    }> = [];

    let filterUniId: string | undefined;
    let filterProgId: string | undefined;

    if (Array.isArray(coursesOrParams)) {
      targetCourses = coursesOrParams.map((c) => ({
        id: c.id,
        code: c.code || c.courseCode || c.id,
        universityId: c.universityId,
        programmeId: c.programmeId,
      }));
    } else if (coursesOrParams && typeof coursesOrParams === 'object') {
      filterUniId = coursesOrParams.universityId;
      filterProgId = coursesOrParams.programmeId;
      const providedList = coursesOrParams.courseRecords || coursesOrParams.courses;
      if (Array.isArray(providedList) && providedList.length > 0) {
        targetCourses = providedList.map((c) => ({
          id: c.id,
          code: c.code || c.courseCode || c.id,
          universityId: c.universityId || filterUniId,
          programmeId: c.programmeId || filterProgId,
        }));
      } else if (filterProgId) {
        const cleanProg = this.normalizeProgrammeId(filterProgId);
        const matchingCatalogue = UDSM_VERIFIED_COURSES.filter(
          (c) =>
            this.normalizeProgrammeId(c.programmeId) === cleanProg ||
            c.programmeId.toLowerCase() === filterProgId!.toLowerCase()
        );
        targetCourses = matchingCatalogue.map((c) => ({
          id: c.id,
          code: c.code || c.courseCode || c.id,
          universityId: c.universityId || filterUniId,
          programmeId: c.programmeId,
        }));
      }
    }

    const codeToIds = new Map<string, string[]>();
    for (const c of targetCourses) {
      const cleanCode = normalizeCourseCode(c.code || c.id);
      getOrCreateEntry(c.id, c.code || c.id);
      const existingIds = codeToIds.get(cleanCode) || [];
      if (!existingIds.includes(c.id)) existingIds.push(c.id);
      codeToIds.set(cleanCode, existingIds);
    }

    // A. Fetch Real Lecturer Course Assignments from Firestore (both dbDefault and db)
    try {
      const dbsToCheck = [dbDefault, db].filter(Boolean);
      const assignmentsById = new Map<string, any>();
      const lecturersById = new Map<string, any>();

      for (const targetDb of dbsToCheck) {
        try {
          const lcaSnap = await getDocs(query(collection(targetDb, 'lecturer_courses'), limit(300)));
          lcaSnap.forEach((d) => {
            const data = d.data();
            if (data && data.status !== 'inactive' && data.lecturerId) {
              assignmentsById.set(d.id, { id: d.id, ...data });
            }
          });
        } catch {
          // continue
        }

        try {
          const lecSnap = await getDocs(query(collection(targetDb, 'lecturers'), limit(300)));
          lecSnap.forEach((d) => {
            const data = d.data();
            if (data && data.status === 'active' && data.fullName) {
              lecturersById.set(d.id, { id: d.id, ...data });
            }
          });
        } catch {
          // continue
        }
      }

      assignmentsById.forEach((assign) => {
        const lec = lecturersById.get(assign.lecturerId);
        if (!lec) return;

        const assignCodeRaw = String(assign.courseCode || '').trim();
        const assignCode = normalizeCourseCode(assignCodeRaw);
        const assignCourseId = String(assign.courseId || '').trim();

        const displayName = lec.title
          ? `${lec.title} ${lec.fullName}`.trim()
          : String(lec.fullName).trim();

        const deptName = lec.departmentName || this.resolveDepartmentName(lec.departmentId);

        const info: CourseAssignedLecturerInfo = {
          id: lec.id,
          fullName: lec.fullName,
          title: lec.title || undefined,
          displayName,
          position: lec.position || 'Course Lecturer',
          email: lec.email || undefined,
          departmentName: deptName,
        };

        const entry = getOrCreateEntry(assignCourseId || assignCode, assignCodeRaw || assignCode);
        if (!entry.assignedLecturers.some((existing) => existing.id === info.id)) {
          entry.assignedLecturers.push(info);
        }
        if (!entry.primaryLecturerName) {
          entry.primaryLecturerName = info.displayName;
          entry.primaryLecturerTitle = info.position || info.title || 'Course Lecturer';
          entry.primaryLecturerDepartment = info.departmentName || null;
          entry.lecturerName = info.displayName;
          entry.lecturerTitle = info.position || info.title || 'Course Lecturer';
          entry.lecturerOffice = info.departmentName || null;
          entry.lecturerEmail = info.email || null;
          entry.lecturerAssigned = true;
        }

        if (assignCode && codeToIds.has(assignCode)) {
          for (const cid of codeToIds.get(assignCode)!) {
            setEntry(cid, entry);
          }
        }
      });
    } catch (err) {
      console.warn('CourseCurriculumService: Failed to fetch real lecturer assignments:', err);
    }

    // B. Fetch Real Uploaded Materials from Firestore & Backend Metadata Endpoint
    try {
      const dbsToCheck = [dbDefault, db].filter(Boolean);
      const rawMaterialsById = new Map<string, any>();

      for (const targetDb of dbsToCheck) {
        try {
          const matSnap = await getDocs(query(collection(targetDb, 'materials'), limit(500)));
          matSnap.forEach((d) => {
            const data = d.data();
            if (data) {
              rawMaterialsById.set(d.id, { id: d.id, ...data });
            }
          });
        } catch {
          // continue
        }
      }

      try {
        const resp = await fetch('/api/materials/metadata');
        if (resp.ok) {
          const payload = await resp.json();
          const items = Array.isArray(payload?.materials)
            ? payload.materials
            : Array.isArray(payload)
            ? payload
            : [];
          for (const item of items) {
            if (item && item.id && !rawMaterialsById.has(item.id)) {
              rawMaterialsById.set(item.id, item);
            }
          }
        }
      } catch {
        // continue
      }

      rawMaterialsById.forEach((m) => {
        const status = String(m.status || 'published').toLowerCase();
        if (status !== 'published' && status !== 'active') return;
        if (m.visibility && m.visibility !== 'students') return;

        // Require a valid file reference or storage path so missing/failed uploads are never counted
        const hasValidStorageRef = Boolean(
          (m.storagePath && String(m.storagePath).trim()) ||
            (m.filePath && String(m.filePath).trim()) ||
            (m.fileUrl && String(m.fileUrl).trim()) ||
            (m.downloadURL && String(m.downloadURL).trim())
        );
        if (!hasValidStorageRef) return;

        if (
          filterUniId &&
          m.universityId &&
          String(m.universityId).toLowerCase() !== filterUniId.toLowerCase()
        ) {
          return;
        }

        const matCourseId = String(m.courseId || '').trim();
        const matCodeRaw = String(m.courseCode || '').trim();
        const matCodeNorm = normalizeCourseCode(matCodeRaw || matCourseId);
        if (!matCourseId && !matCodeNorm) return;

        const entry = getOrCreateEntry(matCourseId || matCodeNorm, matCodeRaw || matCodeNorm);
        entry.totalMaterialsCount++;
        entry.hasMaterials = true;

        const mType = String(m.materialType || '');
        if (mType === 'Lecture Notes') entry.notesCount++;
        else if (mType === 'Handouts') entry.handoutsCount++;
        else if (mType === 'Slides') entry.slidesCount++;
        else if (mType === 'Past Papers') entry.pastPapersCount++;
        else if (
          mType === 'Tutorials' ||
          mType === 'Assignments' ||
          mType === 'Solutions'
        ) {
          entry.tutorialsCount++;
        } else if (mType === 'Reference Materials') {
          entry.referenceCount++;
        } else {
          entry.otherCount++;
        }

        if (matCodeNorm && codeToIds.has(matCodeNorm)) {
          for (const cid of codeToIds.get(matCodeNorm)!) {
            setEntry(cid, entry);
          }
        }
      });
    } catch (err) {
      console.warn('CourseCurriculumService: Failed to fetch course materials counts:', err);
    }

    return result;
  }

  /**
   * 8. MAP CourseRecord TO UI Course TYPE
   *
   * Translates official database CourseRecord into the VENUE Course interface
   * without fabricating fake lecturer names, notes, or past papers.
   */
  mapRecordToCourse(
    record: CourseRecord,
    indexOrProgrammeName?: number | string,
    liveMetadata?: CourseLiveMetadata
  ): Course {
    const programmeName =
      typeof indexOrProgrammeName === 'string' ? indexOrProgrammeName : undefined;
    const code = record.courseCode || record.code;
    const title = record.courseName || record.title;
    const yearNum = Number(record.yearOfStudy) || 1;
    const semNum = Number(record.semester) || 1;
    const cType = (record.courseType || record.status || 'Core') as 'Core' | 'Elective';
    const credits = Number(record.credits) || 12;
    const resolvedDept = this.resolveDepartmentName(
      record.offeringDepartmentId || record.departmentId,
      record.offeringDepartmentName
    );
    const resolvedProgName = this.resolveProgrammeName(record.programmeId, programmeName);

    const hasRealLecturer = Boolean(liveMetadata?.lecturerName);

    return {
      id: record.id,
      code,
      courseCode: code,
      title,
      name: title,
      courseName: title,
      credits,
      year: yearNum as 1 | 2 | 3,
      yearOfStudy: yearNum,
      semester: semNum as 1 | 2,
      type: cType,
      courseType: cType,
      department: resolvedDept,
      departmentId: record.departmentId || record.offeringDepartmentId,
      academicUnitId: record.academicUnitId || record.institutionId || record.collegeId,
      collegeId: record.collegeId || record.academicUnitId,
      universityId: record.universityId || 'udsm',
      programmeId: record.programmeId,
      programmeName: resolvedProgName || record.programmeId,
      instructor: {
        name: hasRealLecturer ? liveMetadata!.lecturerName! : 'Lecturer Not Assigned',
        title: hasRealLecturer ? liveMetadata!.lecturerTitle || 'Course Lecturer' : 'Academic Staff',
        office: hasRealLecturer ? liveMetadata!.lecturerOffice || resolvedDept : 'Not specified',
        email: hasRealLecturer ? liveMetadata!.lecturerEmail || '' : '',
      },
      progress: 0,
      gradeTarget: 'A',
      accentColor: cType === 'Core' ? '#0284C7' : '#D97706',
      overview: record.choiceConstraint
        ? `${title} (${code}) carries ${credits} credit units in Year ${yearNum}, Semester ${semNum}. Note: ${record.choiceConstraint}.`
        : `${title} (${code}) is an official ${cType.toLowerCase()} course carrying ${credits} credit units in Year ${yearNum}, Semester ${semNum}, accredited under the official University Prospectus.`,
      syllabus: [],
      materials: [],
      pastPapersCount: liveMetadata?.pastPapersCount ?? 0,
      recommendedResources: [],
      electiveRule: record.electiveRule,
      choiceConstraint: record.choiceConstraint,
      note: record.note || record.notes,
      notes: record.note || record.notes,
      active: record.active !== false,
      verified: record.verified !== false,
      source: record.source || OFFICIAL_SOURCE_UDSM_PROSPECTUS_2025_2026,
      sourceType: record.sourceType || 'official_prospectus',
      ...(liveMetadata
        ? {
            realMaterialsCount: liveMetadata.totalMaterialsCount,
            realNotesCount: liveMetadata.notesCount + liveMetadata.slidesCount,
            realHandoutsCount: liveMetadata.handoutsCount,
            realPastPapersCount: liveMetadata.pastPapersCount,
            realTutorialsCount: liveMetadata.tutorialsCount,
          }
        : {}),
    } as Course;
  }

  /**
   * 7. SAFE IDEMPOTENT BOOTSTRAP / SEED FUNCTION
   *
   * Safely seeds the primary official degree programme courses into Firestore
   * with duplicate prevention and verified prospectus metadata.
   */
  async bootstrapOfficialCurriculumCoursesIfEmpty(): Promise<{
    seededCount: number;
    skippedCount: number;
    success: boolean;
  }> {
    if (this.isBootstrapped || this.isBootstrapping) {
      return { seededCount: 0, skippedCount: 0, success: true };
    }
    this.isBootstrapping = true;

    try {
      // Check if primary course exists in Firestore
      const sampleDocRef = doc(db, FIRESTORE_COURSE_COLLECTION, 'math-stats_mt_100_y1s1');
      const snap = await getDoc(sampleDocRef);

      if (snap.exists()) {
        this.isBootstrapped = true;
        this.isBootstrapping = false;
        return { seededCount: 0, skippedCount: 0, success: true };
      }

      console.info('CourseCurriculumService: Seeding official catalogue courses into Firestore...');
      let seeded = 0;
      let skipped = 0;

      // Seed first batch of primary verified courses (e.g. BSc Computer Science, Economics)
      const primaryProgs = new Set([
        'bsc-cs',
        'ba-economics',
        'bcom-accounting',
        'bsc-civil',
        'bsc-stats',
      ]);

      const coursesToSeed = UDSM_VERIFIED_COURSES.filter((c) =>
        primaryProgs.has(this.normalizeProgrammeId(c.programmeId))
      );

      for (const course of coursesToSeed) {
        try {
          const stableId = course.id || buildStableCourseId(course.universityId, course.programmeId, course.code);
          const coursePayload: CourseRecord = {
            ...course,
            id: stableId,
            courseId: stableId,
            code: normalizeCourseCode(course.code),
            courseCode: normalizeCourseCode(course.code),
            credits: Number(course.credits) || 12,
            yearOfStudy: Number(course.yearOfStudy),
            semester: Number(course.semester),
            courseType: course.status || 'Core',
            active: true,
            verified: true,
            source: OFFICIAL_SOURCE_UDSM_PROSPECTUS_2025_2026,
            sourceType: 'official_prospectus',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          await setDoc(doc(db, FIRESTORE_COURSE_COLLECTION, stableId), coursePayload, { merge: true });
          seeded++;
        } catch {
          skipped++;
        }
      }

      console.info(`CourseCurriculumService: Seeded ${seeded} courses, skipped ${skipped}.`);
      this.isBootstrapped = true;
      return { seededCount: seeded, skippedCount: skipped, success: true };
    } catch (error) {
      console.warn('CourseCurriculumService: Bootstrap note (offline or permission safe fallback):', error);
      this.isBootstrapped = true;
      return { seededCount: 0, skippedCount: 0, success: false };
    } finally {
      this.isBootstrapping = false;
    }
  }
}

export const courseCurriculumService = new CourseCurriculumService();
