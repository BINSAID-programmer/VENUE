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

export interface AcademicSubStream {
  id: string;
  slug: string;
  name: string;
  description?: string;
}

export interface AcademicSpecialisation {
  id: string;
  name: string;
  code?: string;
  description?: string;
  subStreams?: AcademicSubStream[];
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
  specialisations?: AcademicSpecialisation[];
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

  // Confucius Institute Departments (UDSM)
  { id: 'dept-ci', collegeId: 'ci', universityId: 'udsm', name: 'Confucius Institute (CI-UDSM)' },

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
  {
    id: 'math-stats',
    departmentId: 'dept-math',
    collegeId: 'conas',
    universityId: 'udsm',
    name: 'Bachelor of Science in Mathematics and Statistics',
    short: 'BSc Math & Stats',
    durationYears: 3,
    semestersPerYear: 2,
  },
  {
    id: 'bsc-ed',
    departmentId: 'dept-math',
    collegeId: 'conas',
    universityId: 'udsm',
    name: 'Bachelor of Science with Education',
    short: 'BSc Ed (Math)',
    durationYears: 3,
    semestersPerYear: 2,
  },
  {
    id: 'bsc-ed-botany',
    departmentId: 'dept-botany',
    collegeId: 'conas',
    universityId: 'udsm',
    name: 'Bachelor of Science with Education',
    short: 'BSc Ed (Botany)',
    durationYears: 3,
    semestersPerYear: 2,
  },
  {
    id: 'bsc-ed-chem',
    departmentId: 'dept-chem',
    collegeId: 'conas',
    universityId: 'udsm',
    name: 'Bachelor of Science with Education',
    short: 'BSc Ed (Chem)',
    durationYears: 3,
    semestersPerYear: 2,
  },
  {
    id: 'bsc-ed-phys',
    departmentId: 'dept-phys',
    collegeId: 'conas',
    universityId: 'udsm',
    name: 'Bachelor of Science with Education',
    short: 'BSc Ed (Phys)',
    durationYears: 3,
    semestersPerYear: 2,
  },
  {
    id: 'bsc-botany',
    departmentId: 'dept-botany',
    collegeId: 'conas',
    universityId: 'udsm',
    name: 'Bachelor of Science in Botanical Sciences',
    short: 'BSc Botany',
    durationYears: 3,
    semestersPerYear: 2,
  },
  {
    id: 'bsc-chem',
    departmentId: 'dept-chem',
    collegeId: 'conas',
    universityId: 'udsm',
    name: 'Bachelor of Science in Chemistry',
    short: 'BSc Chem',
    durationYears: 3,
    semestersPerYear: 2,
  },
  {
    id: 'bsc-pet-chem',
    departmentId: 'dept-chem',
    collegeId: 'conas',
    universityId: 'udsm',
    name: 'Bachelor of Science in Petroleum Chemistry',
    short: 'BSc Pet Chem',
    durationYears: 3,
    semestersPerYear: 2,
  },
  {
    id: 'bsc-chem-phys',
    departmentId: 'dept-chem',
    collegeId: 'conas',
    universityId: 'udsm',
    name: 'Bachelor of Science in Chemistry and Physics',
    short: 'BSc Chem & Phys',
    durationYears: 3,
    semestersPerYear: 2,
  },
  {
    id: 'bsc-actuarial',
    departmentId: 'dept-math',
    collegeId: 'conas',
    universityId: 'udsm',
    name: 'Bachelor of Science in Actuarial Sciences',
    short: 'BSc Actuarial',
    durationYears: 3,
    semestersPerYear: 2,
  },
  {
    id: 'bsc-mol-bio',
    departmentId: 'dept-biotech',
    collegeId: 'conas',
    universityId: 'udsm',
    name: 'Bachelor of Science in Molecular Biology and Biotechnology',
    short: 'BSc Mol Bio & Biotech',
    durationYears: 3,
    semestersPerYear: 2,
  },
  {
    id: 'bsc-microbio',
    departmentId: 'dept-biotech',
    collegeId: 'conas',
    universityId: 'udsm',
    name: 'Bachelor of Science in Microbiology',
    short: 'BSc Microbiology',
    durationYears: 3,
    semestersPerYear: 2,
  },
  {
    id: 'bsc-app-micr-chem',
    departmentId: 'dept-biotech',
    collegeId: 'conas',
    universityId: 'udsm',
    name: 'Bachelor of Science in Applied Microbiology and Chemistry',
    short: 'BSc App Micr & Chem',
    durationYears: 3,
    semestersPerYear: 2,
  },
  {
    id: 'stats-single',
    departmentId: 'dept-stats',
    collegeId: 'coss',
    universityId: 'udsm',
    name: 'BSc Statistics',
    short: 'BSc Stats',
    durationYears: 3,
    semestersPerYear: 2,
  },
  {
    id: 'bsc-cs',
    departmentId: 'dept-cse',
    collegeId: 'coict',
    universityId: 'udsm',
    name: 'Bachelor of Science in Computer Science',
    short: 'BSc CS',
    durationYears: 3,
    semestersPerYear: 2,
  },
  {
    id: 'bsc-ceit',
    departmentId: 'dept-cse',
    collegeId: 'coict',
    universityId: 'udsm',
    name: 'Bachelor of Science in Computer Engineering and Information Technology',
    short: 'BSc CEIT',
    durationYears: 4,
    semestersPerYear: 2,
  },
  {
    id: 'bsc-bit',
    departmentId: 'dept-cse',
    collegeId: 'coict',
    universityId: 'udsm',
    name: 'Bachelor of Science in Business Information Technology',
    short: 'BSc BIT',
    durationYears: 3,
    semestersPerYear: 2,
  },
  {
    id: 'bsc-esc',
    departmentId: 'dept-ete',
    collegeId: 'coict',
    universityId: 'udsm',
    name: 'Bachelor of Science in Electronic Science and Communication',
    short: 'BSc ESC',
    durationYears: 3,
    semestersPerYear: 2,
  },
  {
    id: 'bsc-telecom',
    departmentId: 'dept-ete',
    collegeId: 'coict',
    universityId: 'udsm',
    name: 'Bachelor of Science in Telecommunications Engineering',
    short: 'BSc Telecom',
    durationYears: 4,
    semestersPerYear: 2,
  },
  {
    id: 'bsc-elec',
    departmentId: 'dept-ete',
    collegeId: 'coict',
    universityId: 'udsm',
    name: 'Bachelor of Science in Electronics Engineering',
    short: 'BSc ELE',
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
  {
    id: 'ba-art-design',
    departmentId: 'dept-creative-arts',
    collegeId: 'cohu',
    universityId: 'udsm',
    name: 'Bachelor of Arts in Art and Design',
    short: 'BA Art & Design',
    durationYears: 3,
    semestersPerYear: 2,
  },
  {
    id: 'ba-music',
    departmentId: 'dept-creative-arts',
    collegeId: 'cohu',
    universityId: 'udsm',
    name: 'Bachelor of Arts in Music',
    short: 'BA Music',
    durationYears: 3,
    semestersPerYear: 2,
  },
  {
    id: 'ba-theatre',
    departmentId: 'dept-creative-arts',
    collegeId: 'cohu',
    universityId: 'udsm',
    name: 'Bachelor of Arts in Theatre Arts',
    short: 'BA Theatre',
    durationYears: 3,
    semestersPerYear: 2,
  },
  {
    id: 'ba-film-tv',
    departmentId: 'dept-creative-arts',
    collegeId: 'cohu',
    universityId: 'udsm',
    name: 'Bachelor of Arts in Film and Television',
    short: 'BA Film & Television',
    durationYears: 3,
    semestersPerYear: 2,
  },
  {
    id: 'ba-language-studies',
    departmentId: 'dept-foreign-languages',
    collegeId: 'cohu',
    universityId: 'udsm',
    name: 'Bachelor of Arts in Language Studies',
    short: 'B.A. (Language Studies)',
    durationYears: 3,
    semestersPerYear: 2,
  },
  {
    id: 'ba-history',
    departmentId: 'dept-history',
    collegeId: 'cohu',
    universityId: 'udsm',
    name: 'Bachelor of Arts in History',
    short: 'B.A. (History)',
    durationYears: 3,
    semestersPerYear: 2,
  },
  {
    id: 'ba-diplomatic-military-history',
    departmentId: 'dept-history',
    collegeId: 'cohu',
    universityId: 'udsm',
    name: 'Bachelor of Arts in Diplomatic and Military History',
    short: 'B.A. (Diplomatic and Military History)',
    durationYears: 3,
    semestersPerYear: 2,
  },
  {
    id: 'ba-history-cultural-heritage-tourism',
    departmentId: 'dept-history',
    collegeId: 'cohu',
    universityId: 'udsm',
    name: 'Bachelor of Arts in History, Cultural Heritage Management and Tourism',
    short: 'B.A. (History, Cultural Heritage & Tourism)',
    durationYears: 3,
    semestersPerYear: 2,
  },
  {
    id: 'ba-history-political-science',
    departmentId: 'dept-history',
    collegeId: 'cohu',
    universityId: 'udsm',
    name: 'Bachelor of Arts in History and Political Science',
    short: 'B.A. (History & Political Science)',
    durationYears: 3,
    semestersPerYear: 2,
  },
  {
    id: 'ba-archaeology',
    departmentId: 'dept-archaeology',
    collegeId: 'cohu',
    universityId: 'udsm',
    name: 'Bachelor of Arts in Archaeology',
    short: 'B.A. (Archaeology)',
    durationYears: 3,
    semestersPerYear: 2,
  },
  {
    id: 'ba-heritage',
    departmentId: 'dept-archaeology',
    collegeId: 'cohu',
    universityId: 'udsm',
    name: 'Bachelor of Arts in Heritage Management',
    short: 'B.A. (Heritage Management)',
    durationYears: 3,
    semestersPerYear: 2,
  },
  {
    id: 'ba-archaeology-history',
    departmentId: 'dept-archaeology',
    collegeId: 'cohu',
    universityId: 'udsm',
    name: 'Bachelor of Arts in Archaeology and History',
    short: 'B.A. (Archaeology & History)',
    durationYears: 3,
    semestersPerYear: 2,
  },
  {
    id: 'ba-archaeology-geography',
    departmentId: 'dept-archaeology',
    collegeId: 'cohu',
    universityId: 'udsm',
    name: 'Bachelor of Arts in Archaeology and Geography',
    short: 'B.A. (Archaeology & Geography)',
    durationYears: 3,
    semestersPerYear: 2,
  },
  {
    id: 'ba-literature',
    departmentId: 'dept-literature',
    collegeId: 'cohu',
    universityId: 'udsm',
    name: 'Bachelor of Arts in Literature',
    short: 'B.A. (Literature)',
    durationYears: 3,
    semestersPerYear: 2,
  },
  {
    id: 'ba-philosophy',
    departmentId: 'dept-philosophy',
    collegeId: 'cohu',
    universityId: 'udsm',
    name: 'Bachelor of Arts in Philosophy and Ethics',
    short: 'B.A. (Philosophy and Ethics)',
    durationYears: 3,
    semestersPerYear: 2,
  },
  {
    id: 'ba-ed-chinese',
    departmentId: 'dept-ci',
    collegeId: 'ci',
    universityId: 'udsm',
    name: 'Bachelor of Arts with Education (Chinese and English)',
    short: 'B.A. Education (Chinese and English Language)',
    durationYears: 3,
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
  try {
    const { collection, getDocs, query, where } = await import('firebase/firestore');
    const { db } = await import('../services/firebase');
    const q = query(collection(db, 'departments'), where('academicUnitId', '==', collegeId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          collegeId: d.academicUnitId || d.collegeId || collegeId,
          universityId: d.universityId || 'udsm',
          name: d.name,
          short: d.shortName || d.name,
        };
      });
    }
  } catch (e) {
    console.warn('Error fetching departments from Firestore:', e);
  }
  await new Promise((resolve) => setTimeout(resolve, 140));
  return ACADEMIC_DEPARTMENTS.filter((dept) => dept.collegeId === collegeId);
}

/**
 * Simulates asynchronous retrieval of Programmes for a Department
 */
export async function fetchProgrammesForDepartment(departmentId: string): Promise<AcademicProgramme[]> {
  try {
    const { collection, getDocs, query, where } = await import('firebase/firestore');
    const { db } = await import('../services/firebase');
    const q1 = query(collection(db, 'programmes'), where('departmentId', '==', departmentId));
    const q2 = query(collection(db, 'programmes'), where('departmentIds', 'array-contains', departmentId));
    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    
    const map = new Map<string, AcademicProgramme>();
    [...snap1.docs, ...snap2.docs].forEach((doc) => {
      const d = doc.data();
      map.set(doc.id, {
        id: doc.id,
        departmentId: d.departmentId || departmentId,
        collegeId: d.academicUnitId || d.collegeId || 'conas',
        universityId: d.universityId || 'udsm',
        name: d.name,
        short: d.shortName || d.name,
        durationYears: d.durationYears || 3,
        semestersPerYear: 2,
        specialisations: d.specialisations || [],
      });
    });

    if (map.size > 0) {
      return Array.from(map.values());
    }
  } catch (e) {
    console.warn('Error fetching programmes from Firestore:', e);
  }
  return ACADEMIC_PROGRAMMES.filter((prog) => 
    prog.departmentId === departmentId || 
    (prog.id === 'bsc-ed' && ['dept-botany', 'dept-chem', 'dept-math'].includes(departmentId))
  );
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
  specialisationId?: string;
  subStreamSlug?: string;
}): Promise<Course[]> {
  const isUdsm = params.universityId === 'udsm';
  if (!isUdsm) return [];

  let cleanProgId = params.programmeId.toLowerCase().trim();
  if (cleanProgId === 'actuarial') cleanProgId = 'bsc-actuarial';

  // 1. Query Firestore first for live catalogue data
  try {
    const { collection, getDocs, query, where } = await import('firebase/firestore');
    const { db } = await import('../services/firebase');
    const q = query(
      collection(db, 'catalogue_courses'),
      where('programmeId', '==', cleanProgId),
      where('yearOfStudy', '==', Number(params.year)),
      where('semester', '==', Number(params.semester))
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      let docRecords = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];

      // Filter by specialisation if selected
      if (params.specialisationId) {
        docRecords = docRecords.filter(
          (rec) => rec.specialisationId === params.specialisationId
        );
      }

      // Filter by subStreamSlug if selected
      if (params.subStreamSlug) {
        docRecords = docRecords.filter(
          (rec) => rec.subStreamSlug === params.subStreamSlug
        );
      }

      return docRecords.map((rec) => {
        return {
          id: rec.id,
          code: rec.code,
          title: rec.title,
          credits: rec.credits,
          year: Number(rec.yearOfStudy || params.year),
          semester: Number(rec.semester || params.semester) as 1 | 2,
          type: (rec.status || rec.courseType || 'Core') as 'Core' | 'Elective',
          department:
            rec.offeringDepartmentName ||
            (rec.offeringDepartmentId === 'dept-ete' || rec.departmentId === 'dept-ete'
              ? 'Department of Electronics and Telecommunications Engineering'
              : rec.offeringDepartmentId === 'dept-cse' || rec.departmentId === 'dept-cse'
              ? 'Department of Computer Science and Engineering'
              : rec.offeringDepartmentId === 'dept-ee' || rec.departmentId === 'dept-ee'
              ? 'Department of Electrical Engineering'
              : rec.offeringDepartmentId === 'dept-mie' || rec.departmentId === 'dept-mie'
              ? 'Department of Mechanical and Industrial Engineering'
              : rec.offeringDepartmentId === 'dept-sce' || rec.departmentId === 'dept-sce'
              ? 'Department of Structural and Construction Engineering'
              : rec.offeringDepartmentId === 'dept-math' || rec.departmentId === 'dept-math'
              ? 'Department of Mathematics'
              : rec.offeringDepartmentId === 'dept-phys' || rec.departmentId === 'dept-phys'
              ? 'Department of Physics'
              : rec.offeringDepartmentId === 'dept-chemistry' || rec.departmentId === 'dept-chemistry' || rec.offeringDepartmentId === 'dept-chem' || rec.departmentId === 'dept-chem'
              ? 'Chemistry Department'
              : rec.offeringDepartmentId === 'dept-botany' || rec.departmentId === 'dept-botany'
              ? 'Department of Botany'
              : rec.offeringDepartmentId === 'dept-zoology' || rec.departmentId === 'dept-zoology'
              ? 'Department of Zoology & Wildlife Conservation'
              : rec.offeringDepartmentId === 'dept-biotech' || rec.departmentId === 'dept-biotech'
              ? 'Department of Molecular Biology and Biotechnology'
              : rec.offeringDepartmentId === 'dept-geosciences' || rec.departmentId === 'dept-geosciences'
              ? 'Department of Geosciences'
              : rec.offeringDepartmentId === 'dept-petroleum-eng' || rec.departmentId === 'dept-petroleum-eng'
              ? 'Department of Petroleum and Energy Engineering'
              : rec.offeringDepartmentId === 'dept-cpe' || rec.departmentId === 'dept-cpe'
              ? 'Department of Chemical and Process Engineering'
              : rec.offeringDepartmentId === 'dept-stats' || rec.departmentId === 'dept-stats'
              ? 'Department of Statistics'
              : rec.offeringDepartmentId === 'dept-accounting' || rec.departmentId === 'dept-accounting'
              ? 'Department of Accounting'
              : rec.offeringDepartmentId === 'dept-finance' || rec.departmentId === 'dept-finance'
              ? 'Department of Finance'
              : rec.offeringDepartmentId === 'dept-marketing' || rec.departmentId === 'dept-marketing'
              ? 'Department of Marketing'
              : rec.offeringDepartmentId === 'dept-management' || rec.departmentId === 'dept-management'
              ? 'Department of General Management'
              : rec.offeringDepartmentId === 'dept-dev-studies' || rec.departmentId === 'dept-dev-studies'
              ? 'Department of Development Studies'
              : rec.offeringDepartmentId === 'dept-ccs' || rec.departmentId === 'dept-ccs'
              ? 'Centre for Communication Studies'
              : rec.offeringDepartmentId === 'dept-history' || rec.departmentId === 'dept-history'
              ? 'Department of History'
              : rec.offeringDepartmentId === 'dept-foreign-languages' || rec.departmentId === 'dept-foreign-languages'
              ? 'Department of Foreign Languages and Linguistics'
              : rec.offeringDepartmentId === 'dept-archaeology' || rec.departmentId === 'dept-archaeology'
              ? 'Department of Archaeology and Heritage Studies'
              : rec.offeringDepartmentId === 'dept-literature' || rec.departmentId === 'dept-literature'
              ? 'Department of Literature'
              : rec.offeringDepartmentId === 'dept-philosophy' || rec.departmentId === 'dept-philosophy'
              ? 'Department of Philosophy and Religious Studies'
              : rec.offeringDepartmentId === 'dept-law' || rec.departmentId === 'dept-law'
              ? 'University of Dar es Salaam School of Law'
              : rec.offeringDepartmentId === 'dept-business' || rec.departmentId === 'dept-business'
              ? 'University of Dar es Salaam Business School'
              : rec.offeringDepartmentId === 'dept-ci' || rec.departmentId === 'dept-ci'
              ? 'Confucius Institute (CI-UDSM)'
              : rec.offeringDepartmentId || rec.departmentId || 'College of Information and Communication Technologies'),
          universityId: rec.universityId || 'udsm',
          programmeId: rec.programmeId || cleanProgId,
          specialisation: rec.specialisation || rec.track || rec.stream,
          specialisationId: rec.specialisationId,
          subStream: rec.subStream || rec.track || rec.stream,
          subStreamSlug: rec.subStreamSlug,
          electiveRule: rec.electiveRule || rec.electiveChoiceRule,
          note: rec.note || rec.notes,
          instructor: {
            name: 'Faculty Instructor',
            title: 'Lecturer',
            office: 'UDSM Campus',
          },
          progress: 0,
          gradeTarget: 'A',
          accentColor: '#0284C7',
          overview: (rec.stream || rec.track || rec.subStream)
            ? `[${rec.stream || rec.track || rec.subStream}] ${rec.title} (${rec.code}) - ${rec.credits} Credits.${
                (rec.electiveRule || rec.electiveChoiceRule) ? ` (${rec.electiveRule || rec.electiveChoiceRule})` : ''
              }${(rec.note || rec.notes) ? ` Note: ${rec.note || rec.notes}` : ''}`
            : `${rec.title} (${rec.code}) - ${rec.credits} Credits.${
                (rec.electiveRule || rec.electiveChoiceRule) ? ` (${rec.electiveRule || rec.electiveChoiceRule})` : ''
              }${(rec.note || rec.notes) ? ` Note: ${rec.note || rec.notes}` : ''} Official course curriculum from UDSM Undergraduate Prospectus 2025/2026.`,
          syllabus: [],
          materials: [],
          pastPapersCount: 0,
          recommendedResources: [],
        };
      });
    }
  } catch (e) {
    console.warn('Error fetching courses from Firestore:', e);
  }

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
