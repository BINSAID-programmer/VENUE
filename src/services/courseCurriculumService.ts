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
import { db } from './firebase';
import {
  CourseRecord,
  Course,
  ProgrammeRecord,
  StudentProfile,
} from '../types';
import {
  UDSM_VERIFIED_COURSES,
  UDSM_PROGRAMMES,
  OFFICIAL_SOURCE_UDSM_PROSPECTUS_2025_2026,
} from '../data/udsmProspectus2025';
import { normalizeCourseCode, buildStableCourseId } from './catalogueValidation';

export const FIRESTORE_COURSE_COLLECTION = 'catalogue_courses';

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
    return clean;
  }

  /**
   * 1. GET COURSES BY PROGRAMME, YEAR, AND SEMESTER
   *
   * Core scalable query for VENUE:
   * - Queries Firestore specifically by (programmeId, yearOfStudy, semester)
   * - Uses in-memory cache to prevent duplicate fetches
   * - Falls back to verified audited catalogue data if offline or not yet seeded
   * - Never loads the entire university catalogue at once
   */
  async getCoursesByProgrammeAndTerm(params: {
    programmeId: string;
    yearOfStudy: number;
    semester: number;
    universityId?: string;
    pageSize?: number;
  }): Promise<{
    courses: CourseRecord[];
    source: 'firestore' | 'cache' | 'catalogue_fallback';
    verified: boolean;
  }> {
    const { yearOfStudy, semester } = params;
    const rawProgId = params.programmeId || '';
    const cleanProgId = this.normalizeProgrammeId(rawProgId);

    if (!cleanProgId || !yearOfStudy || !semester) {
      return { courses: [], source: 'cache', verified: true };
    }

    const cacheKey = `${cleanProgId}_${yearOfStudy}_${semester}`;

    // 1. Check in-memory cache
    if (this.termCoursesCache.has(cacheKey)) {
      return {
        courses: this.termCoursesCache.get(cacheKey) || [],
        source: 'cache',
        verified: true,
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
        const firestoreCourses: CourseRecord[] = snapshot.docs.map((d) => {
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
      this.officialRecordsByTerm.get(cacheKey) ||
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

    return {
      courses: standardized,
      source: 'catalogue_fallback',
      verified: standardized.length > 0,
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
    const progMeta = UDSM_PROGRAMMES.find(
      (p) => p.id.toLowerCase() === cleanId || p.id.toLowerCase() === programmeId.toLowerCase()
    );

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
   * 6. MAP CourseRecord TO UI Course TYPE
   *
   * Translates official database CourseRecord into the VENUE Course interface
   * without fabricating fake lecturer names, notes, or past papers.
   */
  mapRecordToCourse(record: CourseRecord, programmeName?: string): Course {
    const code = record.courseCode || record.code;
    const title = record.courseName || record.title;
    const yearNum = Number(record.yearOfStudy) || 1;
    const semNum = Number(record.semester) || 1;
    const cType = (record.courseType || record.status || 'Core') as 'Core' | 'Elective';
    const credits = Number(record.credits) || 12;

    return {
      id: record.id,
      code,
      courseCode: code,
      title,
      courseName: title,
      credits,
      year: yearNum,
      yearOfStudy: yearNum,
      semester: semNum,
      type: cType,
      courseType: cType,
      department: record.departmentId || 'Academic Department',
      academicUnitId: record.academicUnitId || record.institutionId || record.collegeId,
      collegeId: record.collegeId || record.academicUnitId,
      universityId: record.universityId || 'udsm',
      programmeId: record.programmeId,
      programmeName: programmeName || record.programmeId,
      instructor: {
        name: 'Faculty Academic Staff',
        title: 'Lecturer / Course Instructor',
        office: 'Academic Department Office',
      },
      progress: 0,
      gradeTarget: 'A',
      accentColor: cType === 'Core' ? '#0284C7' : '#D97706',
      overview: `${title} (${code}) is an official ${cType.toLowerCase()} course carrying ${credits} credit units in Year ${yearNum}, Semester ${semNum}, accredited under the official University Prospectus.`,
      syllabus: [],
      materials: [],
      pastPapersCount: 0,
      recommendedResources: [],
      active: record.active !== false,
      verified: record.verified !== false,
      source: record.source || OFFICIAL_SOURCE_UDSM_PROSPECTUS_2025_2026,
      sourceType: record.sourceType || 'official_prospectus',
    };
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
      // Check if primary course 'udsm_math-stats_mt-100' exists in Firestore
      const sampleDocRef = doc(db, FIRESTORE_COURSE_COLLECTION, 'udsm_math-stats_mt-100');
      const snap = await getDoc(sampleDocRef);

      if (snap.exists()) {
        this.isBootstrapped = true;
        this.isBootstrapping = false;
        return { seededCount: 0, skippedCount: 0, success: true };
      }

      console.info('CourseCurriculumService: Seeding official catalogue courses into Firestore...');
      let seeded = 0;
      let skipped = 0;

      // Seed first batch of primary verified courses (e.g. BSc Math & Stats, BSc Computer Science, Economics)
      const primaryProgs = new Set([
        'math-stats',
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

  /**
   * Clears in-memory caches (useful after profile updates or admin edits)
   */
  clearCache() {
    this.termCoursesCache.clear();
    this.programmeSummaryCache.clear();
  }
}

export const courseCurriculumService = new CourseCurriculumService();
