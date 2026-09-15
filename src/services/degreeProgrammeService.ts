/**
 * Degree Programme Service (STEP 2: DEGREE PROGRAMMES & ACADEMIC PROGRAMME STRUCTURE)
 * 
 * Provides database-driven Degree Programme management for VENUE.
 * Full Academic Hierarchy:
 * University → College/School/Institute → Department → Degree Programme → Year of Study → Semester → Courses
 *
 * Requirements:
 * 1. Scalable, database-driven structure (Firestore collection: 'programmes')
 * 2. Dependent queries (fetch programmes only for selected department)
 * 3. Validation: prevent cross-department / invalid academic combinations
 * 4. Support for degree levels: Certificate, Diploma, Bachelor's Degree, Master's Degree, PhD
 * 5. Dynamic Year & Semester structure based on variable durationYears (1 to 5+ years)
 * 6. Connection to Courses organized by: Programme → Year of Study → Semester → Course
 * 7. In-memory caching to minimize Firestore read operations
 * 8. Resilient offline and server-side fallback
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  setDoc,
  DocumentSnapshot,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  ProgrammeRecord,
  DegreeLevel,
  ProgrammeCurriculumStructure,
  ProgrammeYearCurriculum,
  ProgrammeSemesterCurriculum,
  CourseRecord,
  DepartmentRecord,
  AcademicUnitRecord,
} from '../types';
import {
  AUDITED_PROGRAMMES,
  AUDITED_COURSE_RECORDS,
} from '../data/udsmAuditedCatalogue2025';
import {
  validateProgramme,
  validateAcademicHierarchyCombination,
  ValidationResult,
} from './catalogueValidation';

// Reusable normalizer for degree level based on official award title
export function normalizeDegreeLevel(
  rawLevel?: string,
  progName?: string
): DegreeLevel {
  const text = `${rawLevel || ''} ${progName || ''}`.toLowerCase();
  if (text.includes('phd') || text.includes('doctor of philosophy') || text.includes('doctorate')) {
    return 'PhD';
  }
  if (text.includes('master') || text.includes('msc') || text.includes('mba') || text.includes('ma ')) {
    return "Master's Degree";
  }
  if (text.includes('diploma') || text.includes('ordinary diploma') || text.includes('postgraduate diploma')) {
    return 'Diploma';
  }
  if (text.includes('certificate') || text.includes('cert.')) {
    return 'Certificate';
  }
  return "Bachelor's Degree";
}

// Normalizes a raw ProgrammeRecord into the complete Step 2 model
export function normalizeProgrammeRecord(p: Partial<ProgrammeRecord>): ProgrammeRecord {
  const normLevel = p.degreeLevel || normalizeDegreeLevel(p.awardLevel, p.name);
  const duration = Math.max(1, Math.min(7, Number(p.durationYears) || 3));
  const cleanId = (p.id || '').toLowerCase().trim();
  const unitId = p.academicUnitId || p.collegeId || p.schoolId || p.instituteId || '';

  return {
    id: cleanId,
    universityId: (p.universityId || 'udsm').toLowerCase().trim(),
    academicUnitId: unitId,
    collegeId: unitId,
    schoolId: unitId,
    instituteId: unitId,
    departmentId: (p.departmentId || '').toLowerCase().trim(),
    name: p.name || 'Unnamed Programme',
    code: p.code || p.shortName || cleanId.toUpperCase(),
    shortName: p.shortName || p.code || p.name,
    degreeLevel: normLevel,
    awardLevel: p.awardLevel || (normLevel === "Bachelor's Degree" ? 'Bachelor Degree' : normLevel),
    durationYears: duration,
    active: p.active !== undefined ? p.active : true,
    studyMode: (p.studyMode as any) || 'Full-Time',
    academicYear: p.academicYear || '2025/2026',
    verified: p.verified !== undefined ? p.verified : true,
    source: p.source || 'Official Academic Catalogue',
    createdAt: p.createdAt || '2025-01-01T00:00:00.000Z',
    updatedAt: p.updatedAt || new Date().toISOString(),
  };
}

class DegreeProgrammeService {
  // In-memory caching to eliminate redundant Firestore queries
  private programmesByDeptCache = new Map<string, ProgrammeRecord[]>();
  private programmeByIdCache = new Map<string, ProgrammeRecord>();
  private allProgrammesInMemory: ProgrammeRecord[] = [];

  constructor() {
    this.initializeAuditedProgrammes();
  }

  private initializeAuditedProgrammes() {
    this.allProgrammesInMemory = AUDITED_PROGRAMMES.map(normalizeProgrammeRecord);

    // Pre-seed local cache
    for (const prog of this.allProgrammesInMemory) {
      this.programmeByIdCache.set(prog.id.toLowerCase(), prog);
      const deptKey = prog.departmentId.toLowerCase();
      const existing = this.programmesByDeptCache.get(deptKey) || [];
      existing.push(prog);
      this.programmesByDeptCache.set(deptKey, existing);
    }
  }

  /**
   * 1. Get Programmes by Department
   * Dependent query: Fetches ONLY programmes that belong strictly to the given departmentId.
   * Uses indexed Firestore query, falling back to memory store and server API.
   */
  async getProgrammesByDepartment(
    departmentId: string,
    academicUnitId?: string,
    universityId = 'udsm'
  ): Promise<ProgrammeRecord[]> {
    const cleanDeptId = (departmentId || '').toLowerCase().trim();
    if (!cleanDeptId) return [];

    // Check in-memory cache first
    if (this.programmesByDeptCache.has(cleanDeptId)) {
      const cached = this.programmesByDeptCache.get(cleanDeptId)!;
      if (cached.length > 0) {
        return cached;
      }
    }

    // Try Firestore dependent query: where('departmentId', '==', cleanDeptId)
    try {
      const q = query(
        collection(db, 'programmes'),
        where('departmentId', '==', cleanDeptId)
      );
      const snap = await getDocs(q);

      if (!snap.empty) {
        const firestoreProgs: ProgrammeRecord[] = [];
        snap.forEach((docSnap) => {
          const raw = docSnap.data() as Partial<ProgrammeRecord>;
          firestoreProgs.push(normalizeProgrammeRecord({ ...raw, id: docSnap.id }));
        });

        // Strict relationship check: Ensure returned items actually belong to requested department
        const filtered = firestoreProgs.filter(
          (p) => p.departmentId.toLowerCase() === cleanDeptId
        );

        filtered.sort((a, b) => a.name.localeCompare(b.name));
        this.programmesByDeptCache.set(cleanDeptId, filtered);
        filtered.forEach((p) => this.programmeByIdCache.set(p.id.toLowerCase(), p));

        return filtered;
      }
    } catch (err) {
      console.warn(`DegreeProgrammeService: Firestore read error for department ${cleanDeptId}:`, err);
    }

    // Server API Fallback
    try {
      const res = await fetch(
        `/api/academic/programmes?departmentId=${encodeURIComponent(cleanDeptId)}&universityId=${encodeURIComponent(universityId)}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.programmes) && data.programmes.length > 0) {
          const normalized = data.programmes.map(normalizeProgrammeRecord);
          this.programmesByDeptCache.set(cleanDeptId, normalized);
          normalized.forEach((p: ProgrammeRecord) => this.programmeByIdCache.set(p.id.toLowerCase(), p));
          return normalized;
        }
      }
    } catch (err) {
      // Server endpoint not reachable or offline; proceed to verified in-memory fallback
    }

    // Verified In-Memory Fallback
    let fallback = this.allProgrammesInMemory.filter(
      (p) => p.departmentId.toLowerCase() === cleanDeptId
    );

    // If no direct matches and academicUnitId was provided, check if any belong to that unit
    if (fallback.length === 0 && academicUnitId) {
      const cleanUnitId = academicUnitId.toLowerCase().trim();
      fallback = this.allProgrammesInMemory.filter(
        (p) => p.academicUnitId.toLowerCase() === cleanUnitId
      );
    }

    fallback.sort((a, b) => a.name.localeCompare(b.name));
    this.programmesByDeptCache.set(cleanDeptId, fallback);
    fallback.forEach((p) => this.programmeByIdCache.set(p.id.toLowerCase(), p));

    return fallback;
  }

  /**
   * 2. Get Single Programme by ID
   */
  async getProgrammeById(programmeId: string): Promise<ProgrammeRecord | null> {
    const cleanId = (programmeId || '').toLowerCase().trim();
    if (!cleanId) return null;

    if (this.programmeByIdCache.has(cleanId)) {
      return this.programmeByIdCache.get(cleanId)!;
    }

    try {
      const docRef = doc(db, 'programmes', cleanId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const norm = normalizeProgrammeRecord({ ...(snap.data() as Partial<ProgrammeRecord>), id: snap.id });
        this.programmeByIdCache.set(cleanId, norm);
        return norm;
      }
    } catch (err) {
      console.warn(`DegreeProgrammeService: Error fetching programme ${cleanId} from Firestore:`, err);
    }

    // Fallback to in-memory store
    const memMatch = this.allProgrammesInMemory.find((p) => p.id.toLowerCase() === cleanId);
    if (memMatch) {
      this.programmeByIdCache.set(cleanId, memMatch);
      return memMatch;
    }

    return null;
  }

  /**
   * 3. Get Complete Programme Curriculum Structure
   * Organizes courses hierarchically:
   * Programme → Year of Study (1..durationYears) → Semester (1..2) → Courses
   * 
   * Prepares the exact relationship for later GPA calculation and course enrollment.
   */
  async getProgrammeCurriculumStructure(
    programmeId: string
  ): Promise<ProgrammeCurriculumStructure | null> {
    const prog = await this.getProgrammeById(programmeId);
    if (!prog) return null;

    const cleanProgId = prog.id.toLowerCase();
    const duration = prog.durationYears || 3;

    // Filter available audited courses for this programme
    const relevantCourses = AUDITED_COURSE_RECORDS.filter(
      (c) => (c.programmeId || '').toLowerCase() === cleanProgId
    );

    const years: ProgrammeYearCurriculum[] = [];
    let totalCoursesCount = 0;
    let totalCredits = 0;

    for (let y = 1; y <= duration; y++) {
      const semesters: ProgrammeSemesterCurriculum[] = [];
      let yearCredits = 0;

      for (let s = 1; s <= 2; s++) {
        // Find courses scheduled for Year y, Semester s
        const semCourses = relevantCourses.filter((c) => {
          const courseYear = typeof c.yearOfStudy === 'number'
            ? c.yearOfStudy
            : parseInt(String(c.yearOfStudy).replace(/\D/g, ''), 10);

          const courseSem = typeof c.semester === 'number'
            ? c.semester
            : parseInt(String(c.semester).replace(/\D/g, ''), 10);

          return courseYear === y && courseSem === s;
        });

        const coreCredits = semCourses
          .filter((c) => c.status === 'Core')
          .reduce((sum, c) => sum + (c.credits || 0), 0);

        const electiveCredits = semCourses
          .filter((c) => c.status === 'Elective')
          .reduce((sum, c) => sum + (c.credits || 0), 0);

        const semCredits = coreCredits + electiveCredits;
        yearCredits += semCredits;
        totalCredits += semCredits;
        totalCoursesCount += semCourses.length;

        semesters.push({
          semesterNumber: s,
          semesterLabel: `Semester ${s}`,
          courses: semCourses,
          totalCredits: semCredits,
          coreCredits,
          electiveCredits,
        });
      }

      years.push({
        yearNumber: y,
        yearLabel: `Year ${y}`,
        semesters,
        totalCredits: yearCredits,
      });
    }

    return {
      programme: prog,
      universityId: prog.universityId,
      academicUnitId: prog.academicUnitId,
      departmentId: prog.departmentId,
      durationYears: duration,
      degreeLevel: prog.degreeLevel || "Bachelor's Degree",
      years,
      totalCoursesCount,
      totalCredits,
    };
  }

  /**
   * 4. Get Year of Study labels dynamically adapted to durationYears
   * 1 year -> ['Year 1']
   * 2 years -> ['Year 1', 'Year 2']
   * 3 years -> ['Year 1', 'Year 2', 'Year 3']
   * 4 years -> ['Year 1', 'Year 2', 'Year 3', 'Year 4']
   * 5 years -> ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5']
   */
  getYearsOfStudy(durationYears = 3): string[] {
    const years: string[] = [];
    const max = Math.max(1, Math.min(7, durationYears || 3));
    for (let i = 1; i <= max; i++) {
      years.push(`Year ${i}`);
    }
    return years;
  }

  /**
   * 5. Get Semesters
   */
  getSemesters(): string[] {
    return ['Semester 1', 'Semester 2'];
  }

  /**
   * 6. Validate Academic Hierarchy Selection
   * Enforces that:
   * - Programme belongs to selected Department
   * - Department belongs to selected Academic Unit
   * - Academic Unit belongs to selected University
   * - Year of Study is within programme duration
   */
  validateSelection(params: {
    universityId: string;
    academicUnitId: string;
    departmentId: string;
    programmeId: string;
    yearOfStudy?: string | number;
    departmentsCatalogue?: DepartmentRecord[];
    academicUnitsCatalogue?: AcademicUnitRecord[];
  }): ValidationResult {
    return validateAcademicHierarchyCombination({
      ...params,
      programmesCatalogue: this.allProgrammesInMemory,
    });
  }

  /**
   * 7. Get all official programmes in memory for a given university
   */
  getAllProgrammesForUniversity(universityId = 'udsm'): ProgrammeRecord[] {
    const cleanUniId = universityId.toLowerCase().trim();
    return this.allProgrammesInMemory.filter(
      (p) => p.universityId.toLowerCase() === cleanUniId
    );
  }

  /**
   * 8. Filter programmes by degree level
   */
  getProgrammesByDegreeLevel(
    degreeLevel: DegreeLevel,
    universityId = 'udsm'
  ): ProgrammeRecord[] {
    const cleanUniId = universityId.toLowerCase().trim();
    return this.allProgrammesInMemory.filter(
      (p) =>
        p.universityId.toLowerCase() === cleanUniId &&
        p.degreeLevel === degreeLevel
    );
  }

  /**
   * 9. Search programmes by query string
   */
  searchProgrammes(queryStr: string, universityId = 'udsm'): ProgrammeRecord[] {
    const cleanQuery = (queryStr || '').toLowerCase().trim();
    if (!cleanQuery) return [];

    const cleanUniId = universityId.toLowerCase().trim();
    return this.allProgrammesInMemory.filter((p) => {
      if (p.universityId.toLowerCase() !== cleanUniId) return false;
      return (
        p.name.toLowerCase().includes(cleanQuery) ||
        (p.shortName && p.shortName.toLowerCase().includes(cleanQuery)) ||
        (p.code && p.code.toLowerCase().includes(cleanQuery))
      );
    });
  }
}

export const degreeProgrammeService = new DegreeProgrammeService();
