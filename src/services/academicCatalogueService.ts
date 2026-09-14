import {
  UniversityRecord,
  AcademicUnitRecord,
  DepartmentRecord,
  ProgrammeRecord,
  AcademicYearRecord,
  CourseRecord,
  Course,
  StudentProfile,
} from '../types';
import { UDSM_BSC_MATH_STATS_COURSES } from '../data/udsmCatalogue';
import { firestoreCatalogueService } from './firestoreCatalogueService';
import {
  UDSM_ACADEMIC_UNITS,
  UDSM_PROGRAMMES,
  UDSM_VERIFIED_COURSES,
  OFFICIAL_SOURCE_UDSM_PROSPECTUS_2025_2026,
} from '../data/udsmProspectus2025';

// ============================================================================
// OFFICIAL ACADEMIC CATALOGUE REPOSITORY (SOURCE OF TRUTH)
// ============================================================================

const OFFICIAL_SOURCE_UDSM =
  'UDSM Undergraduate Prospectus 2023/2024 (CoNAS Curricula) & TCU Approved Programmes List';

/**
 * 1. UNIVERSITIES
 */
export const UNIVERSITIES: UniversityRecord[] = [
  {
    id: 'udsm',
    name: 'University of Dar es Salaam',
    shortName: 'UDSM',
    country: 'Tanzania',
    status: 'active',
    verified: true,
    source: 'Tanzania Commission for Universities (TCU) Institutional Registry & UDSM Charter',
  },
  {
    id: 'udom',
    name: 'University of Dodoma',
    shortName: 'UDOM',
    country: 'Tanzania',
    status: 'active',
    verified: false,
    source: 'TCU Institutional Registry',
  },
  {
    id: 'sua',
    name: 'Sokoine University of Agriculture',
    shortName: 'SUA',
    country: 'Tanzania',
    status: 'active',
    verified: false,
    source: 'TCU Institutional Registry',
  },
  {
    id: 'must',
    name: 'Mbeya University of Science and Technology',
    shortName: 'MUST',
    country: 'Tanzania',
    status: 'active',
    verified: false,
    source: 'TCU Institutional Registry',
  },
  {
    id: 'aru',
    name: 'Ardhi University',
    shortName: 'ARU',
    country: 'Tanzania',
    status: 'active',
    verified: false,
    source: 'TCU Institutional Registry',
  },
  {
    id: 'suza',
    name: 'State University of Zanzibar',
    shortName: 'SUZA',
    country: 'Tanzania',
    status: 'active',
    verified: false,
    source: 'TCU Institutional Registry',
  },
  {
    id: 'muhas',
    name: 'Muhimbili University of Health and Allied Sciences',
    shortName: 'MUHAS',
    country: 'Tanzania',
    status: 'active',
    verified: false,
    source: 'TCU Institutional Registry',
  },
];

/**
 * 2. ACADEMIC UNITS (Colleges, Schools, Institutes, Centres)
 */
export const ACADEMIC_UNITS: AcademicUnitRecord[] = [
  // Audited Official UDSM Academic Units (22 units: Colleges, Constituent Colleges, Schools, Institutes)
  ...UDSM_ACADEMIC_UNITS,

  // UDOM Academic Units (Placeholders for multi-university scalability)
  {
    id: 'cive',
    universityId: 'udom',
    name: 'College of Informatics and Virtual Education',
    shortName: 'CIVE',
    type: 'College',
    verified: false,
    source: 'TCU Institutional Registry (Pending syllabus verification)',
  },
  {
    id: 'cnms',
    universityId: 'udom',
    name: 'College of Natural and Mathematical Sciences',
    shortName: 'CNMS',
    type: 'College',
    verified: false,
    source: 'TCU Institutional Registry (Pending syllabus verification)',
  },
];

/**
 * 3. DEPARTMENTS
 */
export const DEPARTMENTS: DepartmentRecord[] = [
  // CoNAS Departments (UDSM)
  {
    id: 'dept-stats',
    universityId: 'udsm',
    academicUnitId: 'conas',
    name: 'Department of Statistics',
    verified: true,
    source: OFFICIAL_SOURCE_UDSM,
  },
  {
    id: 'dept-math',
    universityId: 'udsm',
    academicUnitId: 'conas',
    name: 'Department of Mathematics',
    verified: true,
    source: OFFICIAL_SOURCE_UDSM,
  },
  {
    id: 'dept-phys',
    universityId: 'udsm',
    academicUnitId: 'conas',
    name: 'Department of Physics',
    verified: true,
    source: OFFICIAL_SOURCE_UDSM,
  },
  {
    id: 'dept-chem',
    universityId: 'udsm',
    academicUnitId: 'conas',
    name: 'Department of Chemistry',
    verified: true,
    source: OFFICIAL_SOURCE_UDSM,
  },
  {
    id: 'dept-biotech',
    universityId: 'udsm',
    academicUnitId: 'conas',
    name: 'Department of Molecular Biology and Biotechnology',
    verified: true,
    source: OFFICIAL_SOURCE_UDSM,
  },
  {
    id: 'dept-zoology',
    universityId: 'udsm',
    academicUnitId: 'conas',
    name: 'Department of Zoology and Wildlife Conservation',
    verified: true,
    source: OFFICIAL_SOURCE_UDSM,
  },
  {
    id: 'dept-botany',
    universityId: 'udsm',
    academicUnitId: 'conas',
    name: 'Department of Botany',
    verified: true,
    source: OFFICIAL_SOURCE_UDSM,
  },

  // CoICT Departments (UDSM)
  {
    id: 'dept-cse',
    universityId: 'udsm',
    academicUnitId: 'coict',
    name: 'Department of Computer Science and Engineering',
    verified: true,
    source: OFFICIAL_SOURCE_UDSM,
  },
  {
    id: 'dept-ete',
    universityId: 'udsm',
    academicUnitId: 'coict',
    name: 'Department of Electronics and Telecommunication Engineering',
    verified: true,
    source: OFFICIAL_SOURCE_UDSM,
  },

  // UDOM CIVE Department
  {
    id: 'dept-cive-cs',
    universityId: 'udom',
    academicUnitId: 'cive',
    name: 'Department of Computer Science',
    verified: false,
    source: 'TCU Institutional Registry',
  },
];

/**
 * 4. PROGRAMMES
 */
export const PROGRAMMES: ProgrammeRecord[] = [
  // BSc Mathematics & Statistics (Jointly run by Department of Statistics & Department of Mathematics)
  {
    id: 'math-stats',
    universityId: 'udsm',
    academicUnitId: 'conas',
    departmentId: 'dept-stats',
    name: 'BSc Mathematics and Statistics',
    shortName: 'BSc Math & Stats',
    awardLevel: 'Bachelor',
    durationYears: 3,
    studyMode: 'Full-Time',
    academicYear: '2023/2024',
    verified: true,
    source: OFFICIAL_SOURCE_UDSM,
  },
  {
    id: 'math-stats-math',
    universityId: 'udsm',
    academicUnitId: 'conas',
    departmentId: 'dept-math',
    name: 'BSc Mathematics and Statistics',
    shortName: 'BSc Math & Stats',
    awardLevel: 'Bachelor',
    durationYears: 3,
    studyMode: 'Full-Time',
    academicYear: '2023/2024',
    verified: true,
    source: OFFICIAL_SOURCE_UDSM,
  },
  {
    id: 'bsc-actuarial',
    universityId: 'udsm',
    academicUnitId: 'conas',
    departmentId: 'dept-math',
    name: 'BSc Actuarial Science',
    shortName: 'BSc Actuarial',
    awardLevel: 'Bachelor',
    durationYears: 3,
    studyMode: 'Full-Time',
    academicYear: '2023/2024',
    verified: false,
    source: OFFICIAL_SOURCE_UDSM,
  },
  {
    id: 'bsc-cs',
    universityId: 'udsm',
    academicUnitId: 'coict',
    departmentId: 'dept-cse',
    name: 'BSc Computer Science',
    shortName: 'BSc CS',
    awardLevel: 'Bachelor',
    durationYears: 3,
    studyMode: 'Full-Time',
    academicYear: '2023/2024',
    verified: false,
    source: OFFICIAL_SOURCE_UDSM,
  },
];

/**
 * 5. COURSES
 * Verified course records linked to universityId & programmeId.
 */
export const COURSES: CourseRecord[] = [
  // YEAR 1 — SEMESTER 1
  {
    id: 'mt-100',
    universityId: 'udsm',
    programmeId: 'math-stats',
    code: 'MT 100',
    title: 'Foundations of Analysis',
    credits: 12,
    yearOfStudy: 1,
    semester: 1,
    status: 'Core',
    verified: true,
    source: OFFICIAL_SOURCE_UDSM,
  },
  {
    id: 'mt-127',
    universityId: 'udsm',
    programmeId: 'math-stats',
    code: 'MT 127',
    title: 'Linear Algebra 1',
    credits: 12,
    yearOfStudy: 1,
    semester: 1,
    status: 'Core',
    verified: true,
    source: OFFICIAL_SOURCE_UDSM,
  },
  {
    id: 'st-113',
    universityId: 'udsm',
    programmeId: 'math-stats',
    code: 'ST 113',
    title: 'Basic Statistics',
    credits: 12,
    yearOfStudy: 1,
    semester: 1,
    status: 'Core',
    verified: true,
    source: OFFICIAL_SOURCE_UDSM,
  },
  {
    id: 'fn-100',
    universityId: 'udsm',
    programmeId: 'math-stats',
    code: 'FN 100',
    title: 'Principles of Microeconomics',
    credits: 12,
    yearOfStudy: 1,
    semester: 1,
    status: 'Core',
    verified: true,
    source: OFFICIAL_SOURCE_UDSM,
  },
  {
    id: 'ds-112',
    universityId: 'udsm',
    programmeId: 'math-stats',
    code: 'DS 112',
    title: 'Development Perspectives I',
    credits: 12,
    yearOfStudy: 1,
    semester: 1,
    status: 'Core',
    verified: true,
    source: OFFICIAL_SOURCE_UDSM,
  },
  {
    id: 'st-118',
    universityId: 'udsm',
    programmeId: 'math-stats',
    code: 'ST 118',
    title: 'Probability and Distribution Theory I',
    credits: 12,
    yearOfStudy: 1,
    semester: 1,
    status: 'Elective',
    verified: true,
    source: OFFICIAL_SOURCE_UDSM,
  },
  {
    id: 'mt-136',
    universityId: 'udsm',
    programmeId: 'math-stats',
    code: 'MT 136',
    title: 'Ordinary Differential Equations I',
    credits: 12,
    yearOfStudy: 1,
    semester: 1,
    status: 'Elective',
    verified: true,
    source: OFFICIAL_SOURCE_UDSM,
  },

  // YEAR 1 — SEMESTER 2
  {
    id: 'mt-114',
    universityId: 'udsm',
    programmeId: 'math-stats',
    code: 'MT 114',
    title: 'Advanced Calculus',
    credits: 12,
    yearOfStudy: 1,
    semester: 2,
    status: 'Core',
    verified: true,
    source: OFFICIAL_SOURCE_UDSM,
  },
  {
    id: 'mt-120',
    universityId: 'udsm',
    programmeId: 'math-stats',
    code: 'MT 120',
    title: 'Functions of a Single Variable',
    credits: 12,
    yearOfStudy: 1,
    semester: 2,
    status: 'Core',
    verified: true,
    source: OFFICIAL_SOURCE_UDSM,
  },
  {
    id: 'st-114',
    universityId: 'udsm',
    programmeId: 'math-stats',
    code: 'ST 114',
    title: 'Probability and Distribution Theory II',
    credits: 12,
    yearOfStudy: 1,
    semester: 2,
    status: 'Core',
    verified: true,
    source: OFFICIAL_SOURCE_UDSM,
  },
  {
    id: 'fn-101',
    universityId: 'udsm',
    programmeId: 'math-stats',
    code: 'FN 101',
    title: 'Principles of Macroeconomics',
    credits: 12,
    yearOfStudy: 1,
    semester: 2,
    status: 'Core',
    verified: true,
    source: OFFICIAL_SOURCE_UDSM,
  },
  {
    id: 'ds-113',
    universityId: 'udsm',
    programmeId: 'math-stats',
    code: 'DS 113',
    title: 'Development Perspectives II',
    credits: 12,
    yearOfStudy: 1,
    semester: 2,
    status: 'Core',
    verified: true,
    source: OFFICIAL_SOURCE_UDSM,
  },
  {
    id: 'mt-180',
    universityId: 'udsm',
    programmeId: 'math-stats',
    code: 'MT 180',
    title: 'Mathematical Software and Computing',
    credits: 12,
    yearOfStudy: 1,
    semester: 2,
    status: 'Elective',
    verified: true,
    source: OFFICIAL_SOURCE_UDSM,
  },
  {
    id: 'st-121',
    universityId: 'udsm',
    programmeId: 'math-stats',
    code: 'ST 121',
    title: 'Statistical Inference I',
    credits: 12,
    yearOfStudy: 1,
    semester: 2,
    status: 'Elective',
    verified: true,
    source: OFFICIAL_SOURCE_UDSM,
  },

  // YEAR 2 — SEMESTER 1
  {
    id: 'mt-201',
    universityId: 'udsm',
    programmeId: 'math-stats',
    code: 'MT 201',
    title: 'Real Analysis',
    credits: 12,
    yearOfStudy: 2,
    semester: 1,
    status: 'Core',
    verified: true,
    source: OFFICIAL_SOURCE_UDSM,
  },
  {
    id: 'mt-227',
    universityId: 'udsm',
    programmeId: 'math-stats',
    code: 'MT 227',
    title: 'Linear Algebra 2',
    credits: 12,
    yearOfStudy: 2,
    semester: 1,
    status: 'Core',
    verified: true,
    source: OFFICIAL_SOURCE_UDSM,
  },
  {
    id: 'st-210',
    universityId: 'udsm',
    programmeId: 'math-stats',
    code: 'ST 210',
    title: 'Probability Distributions and MGFs',
    credits: 12,
    yearOfStudy: 2,
    semester: 1,
    status: 'Core',
    verified: true,
    source: OFFICIAL_SOURCE_UDSM,
  },
  {
    id: 'st-215',
    universityId: 'udsm',
    programmeId: 'math-stats',
    code: 'ST 215',
    title: 'Statistical Inference II',
    credits: 12,
    yearOfStudy: 2,
    semester: 1,
    status: 'Core',
    verified: true,
    source: OFFICIAL_SOURCE_UDSM,
  },
  {
    id: 'mt-233',
    universityId: 'udsm',
    programmeId: 'math-stats',
    code: 'MT 233',
    title: 'Partial Differential Equations',
    credits: 12,
    yearOfStudy: 2,
    semester: 1,
    status: 'Elective',
    verified: true,
    source: OFFICIAL_SOURCE_UDSM,
  },
  {
    id: 'st-211',
    universityId: 'udsm',
    programmeId: 'math-stats',
    code: 'ST 211',
    title: 'Non-Parametric Statistics',
    credits: 12,
    yearOfStudy: 2,
    semester: 1,
    status: 'Elective',
    verified: true,
    source: OFFICIAL_SOURCE_UDSM,
  },

  // YEAR 2 — SEMESTER 2
  {
    id: 'mt-220',
    universityId: 'udsm',
    programmeId: 'math-stats',
    code: 'MT 220',
    title: 'Functions of Several Variables',
    credits: 12,
    yearOfStudy: 2,
    semester: 2,
    status: 'Core',
    verified: true,
    source: OFFICIAL_SOURCE_UDSM,
  },
  {
    id: 'mt-278',
    universityId: 'udsm',
    programmeId: 'math-stats',
    code: 'MT 278',
    title: 'Numerical Analysis 1',
    credits: 12,
    yearOfStudy: 2,
    semester: 2,
    status: 'Core',
    verified: true,
    source: OFFICIAL_SOURCE_UDSM,
  },
  {
    id: 'st-220',
    universityId: 'udsm',
    programmeId: 'math-stats',
    code: 'ST 220',
    title: 'Sample Surveys and Applied Sampling',
    credits: 12,
    yearOfStudy: 2,
    semester: 2,
    status: 'Core',
    verified: true,
    source: OFFICIAL_SOURCE_UDSM,
  },
  {
    id: 'st-222',
    universityId: 'udsm',
    programmeId: 'math-stats',
    code: 'ST 222',
    title: 'Statistical Computing and Data Analysis',
    credits: 12,
    yearOfStudy: 2,
    semester: 2,
    status: 'Core',
    verified: true,
    source: OFFICIAL_SOURCE_UDSM,
  },
  {
    id: 'mt-264',
    universityId: 'udsm',
    programmeId: 'math-stats',
    code: 'MT 264',
    title: 'Abstract Algebra',
    credits: 12,
    yearOfStudy: 2,
    semester: 2,
    status: 'Elective',
    verified: true,
    source: OFFICIAL_SOURCE_UDSM,
  },
  {
    id: 'st-217',
    universityId: 'udsm',
    programmeId: 'math-stats',
    code: 'ST 217',
    title: 'Time Series Analysis I',
    credits: 12,
    yearOfStudy: 2,
    semester: 2,
    status: 'Elective',
    verified: true,
    source: OFFICIAL_SOURCE_UDSM,
  },

  // YEAR 3 — SEMESTER 1
  {
    id: 'mt-310',
    universityId: 'udsm',
    programmeId: 'math-stats',
    code: 'MT 310',
    title: 'Complex Analysis',
    credits: 12,
    yearOfStudy: 3,
    semester: 1,
    status: 'Core',
    verified: true,
    source: OFFICIAL_SOURCE_UDSM,
  },
  {
    id: 'mt-370',
    universityId: 'udsm',
    programmeId: 'math-stats',
    code: 'MT 370',
    title: 'Operations Research 1',
    credits: 12,
    yearOfStudy: 3,
    semester: 1,
    status: 'Core',
    verified: true,
    source: OFFICIAL_SOURCE_UDSM,
  },
  {
    id: 'st-310',
    universityId: 'udsm',
    programmeId: 'math-stats',
    code: 'ST 310',
    title: 'Multivariate Statistical Analysis',
    credits: 12,
    yearOfStudy: 3,
    semester: 1,
    status: 'Core',
    verified: true,
    source: OFFICIAL_SOURCE_UDSM,
  },
  {
    id: 'st-319',
    universityId: 'udsm',
    programmeId: 'math-stats',
    code: 'ST 319',
    title: 'Design and Analysis of Experiments',
    credits: 12,
    yearOfStudy: 3,
    semester: 1,
    status: 'Elective',
    verified: true,
    source: OFFICIAL_SOURCE_UDSM,
  },
  {
    id: 'mt-378',
    universityId: 'udsm',
    programmeId: 'math-stats',
    code: 'MT 378',
    title: 'Queuing Theory and Inventory Models',
    credits: 12,
    yearOfStudy: 3,
    semester: 1,
    status: 'Elective',
    verified: true,
    source: OFFICIAL_SOURCE_UDSM,
  },

  // YEAR 3 — SEMESTER 2
  {
    id: 'st-318',
    universityId: 'udsm',
    programmeId: 'math-stats',
    code: 'ST 318',
    title: 'Sampling Theory and Methodology',
    credits: 12,
    yearOfStudy: 3,
    semester: 2,
    status: 'Core',
    verified: true,
    source: OFFICIAL_SOURCE_UDSM,
  },
  {
    id: 'st-321',
    universityId: 'udsm',
    programmeId: 'math-stats',
    code: 'ST 321',
    title: 'Regression Analysis',
    credits: 12,
    yearOfStudy: 3,
    semester: 2,
    status: 'Core',
    verified: true,
    source: OFFICIAL_SOURCE_UDSM,
  },
  {
    id: 'mt-398',
    universityId: 'udsm',
    programmeId: 'math-stats',
    code: 'MT 398',
    title: 'Practical Training',
    credits: 8,
    yearOfStudy: 3,
    semester: 2,
    status: 'Core',
    verified: true,
    source: OFFICIAL_SOURCE_UDSM,
  },
  {
    id: 'mt-389',
    universityId: 'udsm',
    programmeId: 'math-stats',
    code: 'MT 389',
    title: 'Project',
    credits: 8,
    yearOfStudy: 3,
    semester: 2,
    status: 'Core',
    verified: true,
    source: OFFICIAL_SOURCE_UDSM,
  },
  {
    id: 'mt-360',
    universityId: 'udsm',
    programmeId: 'math-stats',
    code: 'MT 360',
    title: 'Functional Analysis',
    credits: 12,
    yearOfStudy: 3,
    semester: 2,
    status: 'Core',
    verified: true,
    source: OFFICIAL_SOURCE_UDSM,
  },
  {
    id: 'mt-346',
    universityId: 'udsm',
    programmeId: 'math-stats',
    code: 'MT 346',
    title: 'Fluid Mechanics',
    credits: 12,
    yearOfStudy: 3,
    semester: 2,
    status: 'Elective',
    verified: true,
    source: OFFICIAL_SOURCE_UDSM,
  },
  {
    id: 'st-312',
    universityId: 'udsm',
    programmeId: 'math-stats',
    code: 'ST 312',
    title: 'Stochastic Processes',
    credits: 12,
    yearOfStudy: 3,
    semester: 2,
    status: 'Elective',
    verified: true,
    source: OFFICIAL_SOURCE_UDSM,
  },
];

// ============================================================================
// INDEXED CACHE & FAST PARENT-ID QUERY SERVICE
// ============================================================================

class AcademicCatalogueService {
  // In-memory indexed maps by parent ID
  private unitsByUniId = new Map<string, AcademicUnitRecord[]>();
  private deptsByUnitId = new Map<string, DepartmentRecord[]>();
  private progsByDeptId = new Map<string, ProgrammeRecord[]>();
  private coursesByCompositeKey = new Map<string, CourseRecord[]>();
  private enrichedCoursesMap = new Map<string, Course>();

  constructor() {
    this.buildIndexes();
  }

  private buildIndexes() {
    // Index Academic Units by universityId
    for (const unit of ACADEMIC_UNITS) {
      const list = this.unitsByUniId.get(unit.universityId) || [];
      list.push(unit);
      this.unitsByUniId.set(unit.universityId, list);
    }

    // Index Departments by academicUnitId
    for (const dept of DEPARTMENTS) {
      const list = this.deptsByUnitId.get(dept.academicUnitId) || [];
      list.push(dept);
      this.deptsByUnitId.set(dept.academicUnitId, list);
    }

    // Index Programmes by departmentId (including UDSM 2025 prospectus programmes)
    for (const prog of [...PROGRAMMES, ...UDSM_PROGRAMMES]) {
      const list = this.progsByDeptId.get(prog.departmentId) || [];
      if (!list.some((p) => p.id === prog.id)) {
        list.push(prog);
      }
      this.progsByDeptId.set(prog.departmentId, list);
    }

    // Index Courses by composite key: `${programmeId}_${yearOfStudy}_${semester}`
    for (const c of [...COURSES, ...UDSM_VERIFIED_COURSES]) {
      const key = `${c.programmeId}_${c.yearOfStudy}_${c.semester}`;
      const list = this.coursesByCompositeKey.get(key) || [];
      if (!list.some((existing) => existing.code.toLowerCase().replace(/\s+/g, '') === c.code.toLowerCase().replace(/\s+/g, ''))) {
        list.push(c);
      }
      this.coursesByCompositeKey.set(key, list);

      // Also index with normalized programme IDs
      if (c.programmeId === 'udsm-bsc-math-stats') {
        const mathKey = `math-stats_${c.yearOfStudy}_${c.semester}`;
        const mathList = this.coursesByCompositeKey.get(mathKey) || [];
        if (!mathList.some((existing) => existing.code === c.code)) {
          mathList.push(c);
        }
        this.coursesByCompositeKey.set(mathKey, mathList);
      }
    }

    // Index enriched Course objects from UDSM catalogue
    for (const course of UDSM_BSC_MATH_STATS_COURSES) {
      this.enrichedCoursesMap.set(course.id, course);
      this.enrichedCoursesMap.set(course.code.toLowerCase().replace(/\s+/g, '-'), course);
    }
  }

  /**
   * 1. Get list of universities (with pagination and Firestore sync)
   */
  async getUniversities(pageSize = 30): Promise<UniversityRecord[]> {
    try {
      const res = await firestoreCatalogueService.getUniversities({ pageSize });
      if (res.items.length > 0) {
        return res.items;
      }
    } catch {
      // Local fallback
    }
    return UNIVERSITIES.slice(0, pageSize);
  }

  /**
   * 2. Get Academic Units for a University (filtered by parent universityId)
   */
  async getAcademicUnits(universityId: string, pageSize = 40): Promise<AcademicUnitRecord[]> {
    if (!universityId) return [];
    try {
      const res = await firestoreCatalogueService.getAcademicUnits(universityId, { pageSize });
      if (res.items.length > 0) {
        return res.items;
      }
    } catch {
      // Local fallback
    }
    return this.unitsByUniId.get(universityId) || [];
  }

  /**
   * 3. Get Departments for an Academic Unit (filtered by parent academicUnitId)
   */
  async getDepartments(academicUnitId: string, pageSize = 40): Promise<DepartmentRecord[]> {
    if (!academicUnitId) return [];
    try {
      const res = await firestoreCatalogueService.getDepartments(academicUnitId, { pageSize });
      if (res.items.length > 0) {
        return res.items;
      }
    } catch {
      // Local fallback
    }
    return this.deptsByUnitId.get(academicUnitId) || [];
  }

  /**
   * 4. Get Programmes for a Department (filtered by parent departmentId)
   */
  async getProgrammes(departmentId: string, pageSize = 40): Promise<ProgrammeRecord[]> {
    if (!departmentId) return [];
    try {
      const res = await firestoreCatalogueService.getProgrammes(departmentId, { pageSize });
      if (res.items.length > 0) {
        return res.items;
      }
    } catch {
      // Local fallback
    }
    return this.progsByDeptId.get(departmentId) || [];
  }

  /**
   * 5. Get Academic Years for a University
   */
  async getAcademicYears(universityId: string): Promise<AcademicYearRecord[]> {
    if (!universityId) return [];
    try {
      const years = await firestoreCatalogueService.getAcademicYears(universityId);
      if (years.length > 0) {
        return years;
      }
    } catch {
      // Local fallback
    }
    return [
      {
        id: `${universityId}_2023_2024`,
        universityId,
        year: '2023/2024',
        isCurrent: true,
        semesters: [1, 2],
        verified: true,
        source: 'UDSM Academic Calendar',
      },
    ];
  }

  /**
   * 6. Get Courses for a Programme + Year + Semester (only verified official courses)
   */
  async getCourses(
    programmeId: string,
    yearOfStudy: number,
    semester: number,
    pageSize = 30
  ): Promise<CourseRecord[]> {
    if (!programmeId || !yearOfStudy || !semester) return [];
    try {
      const res = await firestoreCatalogueService.getCoursesByProgrammeAndTerm({
        programmeId,
        yearOfStudy,
        semester,
        pageSize,
      });
      if (res.items.length > 0) {
        return res.items.filter((c) => c.verified === true);
      }
    } catch {
      // Local fallback
    }

    const key = `${programmeId}_${yearOfStudy}_${semester}`;
    const found = this.coursesByCompositeKey.get(key) || [];
    return found.filter((c) => c.verified === true);
  }

  /**
   * 6. Query full Course objects for Student Coursework or Browse Materials
   * Maps CourseRecord into the application's rich Course structure (syllabus, materials, past papers).
   */
  async getCoursesForStudent(params: {
    universityId?: string;
    programmeId?: string;
    yearOfStudy?: string | number;
    semester?: string | number;
  }): Promise<Course[]> {
    const uniId = (params.universityId || '').toLowerCase().trim();
    const progId = (params.programmeId || '').toLowerCase().trim();

    // Parse year and semester numbers
    let y = 0;
    if (typeof params.yearOfStudy === 'number') {
      y = params.yearOfStudy;
    } else if (params.yearOfStudy) {
      const match = String(params.yearOfStudy).match(/(\d+)/);
      if (match) y = parseInt(match[1], 10);
    }

    let s = 0;
    if (typeof params.semester === 'number') {
      s = params.semester;
    } else if (params.semester) {
      const match = String(params.semester).match(/(\d+)/);
      if (match) s = parseInt(match[1], 10);
    }

    if (!y || !s) return [];

    // Verify university is UDSM
    const isUdsm = uniId === 'udsm' || uniId.includes('dar es salaam');
    if (!isUdsm) {
      return [];
    }

    // Retrieve course records from structured collection
    let records = await this.getCourses(progId, y, s);

    // Fallbacks for programme aliases
    if (records.length === 0) {
      if (progId === 'math-stats' || progId === 'math-stats-math' || progId.includes('mathematics') || progId.includes('stats')) {
        records = await this.getCourses('udsm-bsc-math-stats', y, s);
        if (records.length === 0) {
          records = await this.getCourses('math-stats', y, s);
        }
      } else if (progId === 'bsc-cs' || progId === 'udsm-bsc-cs' || progId.includes('computer')) {
        records = await this.getCourses('udsm-bsc-cs', y, s);
      } else if (progId === 'bsc-actuarial' || progId === 'udsm-bsc-actuarial' || progId.includes('actuarial')) {
        records = await this.getCourses('udsm-bsc-actuarial', y, s);
      }
    }

    // Enrich with full course syllabus and materials from verified UDSM catalogue
    return records.map((rec) => {
      const existing =
        this.enrichedCoursesMap.get(rec.id) ||
        this.enrichedCoursesMap.get(rec.code.toLowerCase().replace(/\s+/g, '-'));

      if (existing) {
        return {
          ...existing,
          universityId: rec.universityId,
          programmeId: rec.programmeId,
          year: rec.yearOfStudy as 1 | 2 | 3,
          semester: rec.semester as 1 | 2,
          type: rec.status,
        };
      }

      // Safe fallback strictly matching Course interface
      return {
        id: rec.id,
        code: rec.code,
        title: rec.title,
        credits: rec.credits,
        year: rec.yearOfStudy as 1 | 2 | 3,
        semester: rec.semester as 1 | 2,
        type: rec.status,
        department: rec.departmentId || 'Academic Department',
        universityId: rec.universityId,
        programmeId: rec.programmeId,
        instructor: {
          name: 'Faculty Instructor',
          title: 'Lecturer',
          office: 'UDSM Campus',
        },
        progress: 0,
        gradeTarget: 'A',
        accentColor: '#0284C7',
        overview: `${rec.title} (${rec.code}) - Official course curriculum from UDSM Undergraduate Prospectus 2025/2026.`,
        syllabus: [],
        materials: [],
        pastPapersCount: 0,
        recommendedResources: [],
      };
    });
  }

  /**
   * Helper to check if academic data is in preparation for a given selection
   */
  isDataBeingPrepared(universityId?: string, programmeId?: string): boolean {
    if (!universityId) return false;
    if (universityId !== 'udsm') return true;
    if (!programmeId) return false;

    const cleanProg = programmeId.toLowerCase().trim();
    const verifiedProgs = [
      'math-stats',
      'math-stats-math',
      'udsm-bsc-math-stats',
      'udsm-bsc-cs',
      'bsc-cs',
      'udsm-bsc-bis',
      'udsm-bsc-actuarial',
      'bsc-actuarial',
      'udsm-bsc-cpe',
      'udsm-bed-sc',
    ];

    return !verifiedProgs.includes(cleanProg);
  }
}

export const academicCatalogueService = new AcademicCatalogueService();
