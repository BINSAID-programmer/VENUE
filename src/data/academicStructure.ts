import { Course } from '../types';
import { UDSM_BSC_MATH_STATS_COURSES } from './udsmCatalogue';
import { UDSM_VERIFIED_COURSES } from './udsmProspectus2025';

export interface AcademicUniversity {
  id: string;
  name: string;
  short: string;
}

export interface AcademicCollege {
  id: string;
  universityId: string;
  name: string;
  short?: string;
}

export interface AcademicDepartment {
  id: string;
  collegeId: string;
  universityId: string;
  name: string;
}

export interface AcademicProgramme {
  id: string;
  departmentId: string;
  collegeId: string;
  universityId: string;
  name: string;
  short: string;
  durationYears: number;
  semestersPerYear: number;
}

export const ACADEMIC_UNIVERSITIES: AcademicUniversity[] = [
  { id: 'udsm', name: 'University of Dar es Salaam', short: 'UDSM' },
  { id: 'udom', name: 'University of Dodoma', short: 'UDOM' },
  { id: 'sua', name: 'Sokoine University of Agriculture', short: 'SUA' },
  { id: 'must', name: 'Mbeya University of Science & Tech', short: 'MUST' },
  { id: 'aru', name: 'Ardhi University', short: 'ARU' },
  { id: 'suza', name: 'State University of Zanzibar', short: 'SUZA' },
  { id: 'muhas', name: 'Muhimbili Univ of Health & Allied Sciences', short: 'MUHAS' },
];

export const ACADEMIC_COLLEGES: AcademicCollege[] = [
  // UDSM Colleges
  { id: 'conas', universityId: 'udsm', name: 'College of Natural and Applied Sciences (CoNAS)', short: 'CoNAS' },
  { id: 'coict', universityId: 'udsm', name: 'College of Information and Communication Technologies (CoICT)', short: 'CoICT' },
  { id: 'coet', universityId: 'udsm', name: 'College of Engineering and Technology (CoET)', short: 'CoET' },
  { id: 'coss', universityId: 'udsm', name: 'College of Social Sciences (CoSS)', short: 'CoSS' },
  { id: 'cohu', universityId: 'udsm', name: 'College of Humanities (CoHU)', short: 'CoHU' },
  { id: 'udbs', universityId: 'udsm', name: 'University of Dar es Salaam Business School (UDBS)', short: 'UDBS' },
  { id: 'udsol', universityId: 'udsm', name: 'University of Dar es Salaam School of Law (UDSoL)', short: 'UDSoL' },
  { id: 'soed', universityId: 'udsm', name: 'School of Education (SoED)', short: 'SoED' },
  { id: 'udse', universityId: 'udsm', name: 'University of Dar es Salaam School of Economics (UDSE)', short: 'UDSE' },
  { id: 'sjmc', universityId: 'udsm', name: 'School of Journalism and Mass Communication (SJMC)', short: 'SJMC' },
  { id: 'somg', universityId: 'udsm', name: 'School of Mines and Geosciences (SoMG)', short: 'SoMG' },
  { id: 'ids', universityId: 'udsm', name: 'Institute of Development Studies (IDS)', short: 'IDS' },
  { id: 'coaf', universityId: 'udsm', name: 'College of Agriculture and Food Technology (CoAF)', short: 'CoAF' },
  { id: 'mchas', universityId: 'udsm', name: 'University of Dar es Salaam Mbeya College of Health and Allied Sciences (UDSM-MCHAS)', short: 'UDSM-MCHAS' },
  { id: 'sasft', universityId: 'udsm', name: 'School of Aquatic Sciences and Fisheries Technology (SASFT)', short: 'SASFT' },
  { id: 'iks', universityId: 'udsm', name: 'Institute of Kiswahili Studies (IKS)', short: 'IKS' },
  { id: 'ims', universityId: 'udsm', name: 'Institute of Marine Sciences (IMS)', short: 'IMS' },
  { id: 'ira', universityId: 'udsm', name: 'Institute of Resource Assessment (IRA)', short: 'IRA' },
  { id: 'ci', universityId: 'udsm', name: 'Confucius Institute at the University of Dar es Salaam (CI)', short: 'CI' },
  { id: 'igs', universityId: 'udsm', name: 'Institute of Gender Studies (IGS)', short: 'IGS' },
  { id: 'duce', universityId: 'udsm', name: 'Dar es Salaam University College of Education (DUCE)', short: 'DUCE' },
  { id: 'muce', universityId: 'udsm', name: 'Mkwawa University College of Education (MUCE)', short: 'MUCE' },
  { id: 'udsm-mri', universityId: 'udsm', name: 'University of Dar es Salaam Mineral Resources Institute (UDSM-MRI)', short: 'UDSM-MRI' },

  // UDOM Colleges
  { id: 'cive', universityId: 'udom', name: 'College of Informatics and Virtual Education (CIVE)', short: 'CIVE' },
  { id: 'cnms', universityId: 'udom', name: 'College of Natural and Mathematical Sciences (CNMS)', short: 'CNMS' },
];

export const ACADEMIC_DEPARTMENTS: AcademicDepartment[] = [
  // CoSS Departments (UDSM)
  { id: 'dept-stats', collegeId: 'coss', universityId: 'udsm', name: 'Department of Statistics' },
  { id: 'dept-geography', collegeId: 'coss', universityId: 'udsm', name: 'Department of Geography' },
  { id: 'dept-pspa', collegeId: 'coss', universityId: 'udsm', name: 'Department of Political Science and Public Administration' },
  { id: 'dept-sociology', collegeId: 'coss', universityId: 'udsm', name: 'Department of Sociology and Anthropology' },

  // CoNAS Departments (UDSM)
  { id: 'dept-math', collegeId: 'conas', universityId: 'udsm', name: 'Department of Mathematics' },
  { id: 'dept-phys', collegeId: 'conas', universityId: 'udsm', name: 'Department of Physics' },
  { id: 'dept-chem', collegeId: 'conas', universityId: 'udsm', name: 'Chemistry Department' },
  { id: 'dept-biotech', collegeId: 'conas', universityId: 'udsm', name: 'Department of Molecular Biology and Biotechnology' },
  { id: 'dept-zoology', collegeId: 'conas', universityId: 'udsm', name: 'Department of Zoology & Wildlife Conservation' },
  { id: 'dept-botany', collegeId: 'conas', universityId: 'udsm', name: 'Department of Botany' },

  // CoICT Departments (UDSM)
  { id: 'dept-cse', collegeId: 'coict', universityId: 'udsm', name: 'Department of Computer Science and Engineering' },
  { id: 'dept-ete', collegeId: 'coict', universityId: 'udsm', name: 'Department of Electronics and Telecommunication Engineering' },

  // UDBS Departments (UDSM)
  { id: 'dept-accounting', collegeId: 'udbs', universityId: 'udsm', name: 'Department of Accounting' },
  { id: 'dept-finance', collegeId: 'udbs', universityId: 'udsm', name: 'Department of Finance' },
  { id: 'dept-marketing', collegeId: 'udbs', universityId: 'udsm', name: 'Department of Marketing' },
  { id: 'dept-management', collegeId: 'udbs', universityId: 'udsm', name: 'Department of General Management' },

  // CoHU Departments (UDSM)
  { id: 'dept-creative-arts', collegeId: 'cohu', universityId: 'udsm', name: 'Department of Creative Arts' },
  { id: 'dept-foreign-languages', collegeId: 'cohu', universityId: 'udsm', name: 'Department of Foreign Languages and Linguistics' },
  { id: 'dept-ccs', collegeId: 'cohu', universityId: 'udsm', name: 'Centre for Communication Studies' },
  { id: 'dept-history', collegeId: 'cohu', universityId: 'udsm', name: 'Department of History' },
  { id: 'dept-archaeology', collegeId: 'cohu', universityId: 'udsm', name: 'Department of Archaeology and Heritage Studies' },
  { id: 'dept-literature', collegeId: 'cohu', universityId: 'udsm', name: 'Department of Literature' },
  { id: 'dept-philosophy', collegeId: 'cohu', universityId: 'udsm', name: 'Department of Philosophy and Religious Studies' },

  // CoAF Departments (UDSM)
  { id: 'dept-coaf-aeb', collegeId: 'coaf', universityId: 'udsm', name: 'Department of Agricultural Economics and Business' },
  { id: 'dept-coaf-ae', collegeId: 'coaf', universityId: 'udsm', name: 'Department of Agricultural Engineering' },
  { id: 'dept-coaf-csbt', collegeId: 'coaf', universityId: 'udsm', name: 'Department of Crop Sciences and Beekeeping Technology' },
  { id: 'dept-coaf-fst', collegeId: 'coaf', universityId: 'udsm', name: 'Department of Food Science and Technology' },

  // CoET Departments (UDSM)
  { id: 'dept-sce', collegeId: 'coet', universityId: 'udsm', name: 'Department of Structural and Construction Engineering (SCE)' },
  { id: 'dept-wre', collegeId: 'coet', universityId: 'udsm', name: 'Department of Water Resources Engineering (WRE)' },
  { id: 'dept-tge', collegeId: 'coet', universityId: 'udsm', name: 'Department of Transportation and Geotechnical Engineering (TGE)' },
  { id: 'dept-ee', collegeId: 'coet', universityId: 'udsm', name: 'Department of Electrical Engineering' },
  { id: 'dept-cpe', collegeId: 'coet', universityId: 'udsm', name: 'Department of Chemical and Process Engineering' },
  { id: 'dept-mie', collegeId: 'coet', universityId: 'udsm', name: 'Department of Mechanical and Industrial Engineering' },

  // SoMG Departments (UDSM)
  { id: 'dept-geosciences', collegeId: 'somg', universityId: 'udsm', name: 'Department of Geosciences' },
  { id: 'dept-mining', collegeId: 'somg', universityId: 'udsm', name: 'Mining and Mineral Processing Engineering Department' },
  { id: 'dept-petroleum-eng', collegeId: 'somg', universityId: 'udsm', name: 'Petroleum Science and Engineering Department' },

  // UDSM-MRI Departments (UDSM)
  { id: 'dept-mri-mining', collegeId: 'udsm-mri', universityId: 'udsm', name: 'Mining and Mineral Processing Engineering Department' },
  { id: 'dept-mri-geology', collegeId: 'udsm-mri', universityId: 'udsm', name: 'Geology and Mineral Exploration Department' },

  // UDSE Departments (UDSM) - Official Prospectus School of Economics
  { id: 'dept-economics', collegeId: 'udse', universityId: 'udsm', name: 'Department of Economics' },
  { id: 'dept-applied-economics', collegeId: 'udse', universityId: 'udsm', name: 'Department of Applied Economics' },

  // UDSoL Departments (UDSM)
  { id: 'dept-private-law', collegeId: 'udsol', universityId: 'udsm', name: 'Department of Private Law' },
  { id: 'dept-public-law', collegeId: 'udsol', universityId: 'udsm', name: 'Department of Public Law' },

  // CIVE Departments (UDOM)
  { id: 'dept-cive-cs', collegeId: 'cive', universityId: 'udom', name: 'Department of Computer Science' },
];

export const ACADEMIC_PROGRAMMES: AcademicProgramme[] = [
  // BSc Mathematics & Statistics is available under both Department of Statistics and Department of Mathematics
  {
    id: 'math-stats',
    departmentId: 'dept-stats',
    collegeId: 'conas',
    universityId: 'udsm',
    name: 'BSc Mathematics & Statistics',
    short: 'BSc Math & Stats',
    durationYears: 3,
    semestersPerYear: 2,
  },
  {
    id: 'math-stats-math',
    departmentId: 'dept-math',
    collegeId: 'conas',
    universityId: 'udsm',
    name: 'BSc Mathematics & Statistics',
    short: 'BSc Math & Stats',
    durationYears: 3,
    semestersPerYear: 2,
  },
  {
    id: 'actuarial',
    departmentId: 'dept-math',
    collegeId: 'conas',
    universityId: 'udsm',
    name: 'BSc Actuarial Science',
    short: 'BSc Actuarial',
    durationYears: 3,
    semestersPerYear: 2,
  },
  {
    id: 'pure-math',
    departmentId: 'dept-math',
    collegeId: 'conas',
    universityId: 'udsm',
    name: 'BSc Mathematics',
    short: 'BSc Math',
    durationYears: 3,
    semestersPerYear: 2,
  },
  {
    id: 'stats-single',
    departmentId: 'dept-stats',
    collegeId: 'conas',
    universityId: 'udsm',
    name: 'BSc Statistics',
    short: 'BSc Stats',
    durationYears: 3,
    semestersPerYear: 2,
  },
  {
    id: 'comp-sci',
    departmentId: 'dept-cse',
    collegeId: 'coict',
    universityId: 'udsm',
    name: 'BSc Computer Science',
    short: 'BSc CS',
    durationYears: 3,
    semestersPerYear: 2,
  },
  {
    id: 'udsm-bsc-cs',
    departmentId: 'dept-cse',
    collegeId: 'coict',
    universityId: 'udsm',
    name: 'BSc Computer Science',
    short: 'BSc CS',
    durationYears: 3,
    semestersPerYear: 2,
  },
  {
    id: 'bit',
    departmentId: 'dept-cse',
    collegeId: 'coict',
    universityId: 'udsm',
    name: 'BSc Business Information Technology',
    short: 'BSc BIT',
    durationYears: 3,
    semestersPerYear: 2,
  },
  {
    id: 'udsm-bsc-bis',
    departmentId: 'dept-cse',
    collegeId: 'coict',
    universityId: 'udsm',
    name: 'BSc Business Information Systems',
    short: 'BSc BIS',
    durationYears: 3,
    semestersPerYear: 2,
  },
  {
    id: 'udsm-bsc-cpe',
    departmentId: 'dept-cse',
    collegeId: 'coict',
    universityId: 'udsm',
    name: 'BSc Computer Engineering and Information Technology',
    short: 'BSc CEIT',
    durationYears: 4,
    semestersPerYear: 2,
  },
  {
    id: 'bcom-accounting',
    departmentId: 'dept-accounting',
    collegeId: 'udbs',
    universityId: 'udsm',
    name: 'Bachelor of Commerce in Accounting',
    short: 'BCom Accounting',
    durationYears: 3,
    semestersPerYear: 2,
  },
  {
    id: 'bcom-finance',
    departmentId: 'dept-finance',
    collegeId: 'udbs',
    universityId: 'udsm',
    name: 'Bachelor of Commerce in Finance',
    short: 'BCom Finance',
    durationYears: 3,
    semestersPerYear: 2,
  },
  {
    id: 'ba-economics',
    departmentId: 'dept-economics',
    collegeId: 'udse',
    universityId: 'udsm',
    name: 'Bachelor of Arts in Economics',
    short: 'BA Econ',
    durationYears: 3,
    semestersPerYear: 2,
  },
  {
    id: 'ba-econ-stats',
    departmentId: 'dept-economics',
    collegeId: 'udse',
    universityId: 'udsm',
    name: 'Bachelor of Arts in Economics and Statistics',
    short: 'BA Econ & Stats',
    durationYears: 3,
    semestersPerYear: 2,
  },
  {
    id: 'llb',
    departmentId: 'dept-private-law',
    collegeId: 'udsol',
    universityId: 'udsm',
    name: 'Bachelor of Laws',
    short: 'LL.B',
    durationYears: 4,
    semestersPerYear: 2,
  },
];

/**
 * Simulates asynchronous retrieval of Colleges for a University
 */
export async function fetchCollegesForUniversity(universityId: string): Promise<AcademicCollege[]> {
  await new Promise((resolve) => setTimeout(resolve, 140));
  return ACADEMIC_COLLEGES.filter((col) => col.universityId === universityId);
}

/**
 * Simulates asynchronous retrieval of Departments for a College
 */
export async function fetchDepartmentsForCollege(collegeId: string): Promise<AcademicDepartment[]> {
  await new Promise((resolve) => setTimeout(resolve, 140));
  return ACADEMIC_DEPARTMENTS.filter((dept) => dept.collegeId === collegeId);
}

/**
 * Simulates asynchronous retrieval of Programmes for a Department
 */
export async function fetchProgrammesForDepartment(departmentId: string): Promise<AcademicProgramme[]> {
  await new Promise((resolve) => setTimeout(resolve, 140));
  return ACADEMIC_PROGRAMMES.filter((prog) => prog.departmentId === departmentId);
}

/**
 * Fetch verified courses for selected Programme, Year and Semester.
 * Returns verified courses from UDSM Undergraduate Prospectus 2025/2026 or empty array if no verified data exists.
 * Does NOT invent courses.
 */
export async function fetchBrowseCourses(params: {
  universityId: string;
  programmeId: string;
  year: number;
  semester: number;
}): Promise<Course[]> {
  await new Promise((resolve) => setTimeout(resolve, 120));

  const isUdsm = params.universityId === 'udsm';
  if (!isUdsm) return [];

  const cleanProgId = params.programmeId.toLowerCase().trim();

  // 1. Math & Stats rich catalogue with syllabus
  const isMathStats =
    cleanProgId === 'math-stats' ||
    cleanProgId === 'math-stats-math' ||
    cleanProgId === 'bsc-math-stats' ||
    cleanProgId === 'udsm-bsc-math-stats';

  if (isMathStats) {
    const mathCourses = UDSM_BSC_MATH_STATS_COURSES.filter(
      (course) => course.year === params.year && course.semester === params.semester
    );
    if (mathCourses.length > 0) return mathCourses;
  }

  // 2. Verified courses from UDSM Undergraduate Prospectus 2025/2026
  const matchingRecords = UDSM_VERIFIED_COURSES.filter((c) => {
    const matchesProg =
      c.programmeId.toLowerCase() === cleanProgId ||
      (cleanProgId === 'comp-sci' && c.programmeId === 'udsm-bsc-cs') ||
      (cleanProgId === 'actuarial' && c.programmeId === 'udsm-bsc-actuarial') ||
      (cleanProgId === 'bit' && c.programmeId === 'udsm-bsc-bis');
    return (
      matchesProg &&
      c.yearOfStudy === params.year &&
      c.semester === params.semester &&
      c.verified === true
    );
  });

  if (matchingRecords.length > 0) {
    return matchingRecords.map((rec) => ({
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
      overview: `${rec.title} (${rec.code}) - ${rec.credits} Credits. Official course curriculum from UDSM Undergraduate Prospectus 2025/2026.`,
      syllabus: [],
      materials: [],
      pastPapersCount: 0,
      recommendedResources: [],
    }));
  }

  // If university or programme does not have verified syllabus/curriculum, return empty array
  return [];
}
