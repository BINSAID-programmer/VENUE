import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import * as fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app);

const OFFICIAL_SOURCE = 'UDSM Undergraduate Prospectus 2025/2026 (Official Source of Truth)';

interface CourseInput {
  code: string;
  title: string;
  credits: number;
  year: number;
  semester: number;
  status: 'Core' | 'Elective';
  deptId: string;
  unitId: string;
}

// PROGRAMME 1: Bachelor of Architecture (5 Years, dept-sce, coet)
const BARCH_COURSES: CourseInput[] = [
  // YEAR 1 — SEMESTER 1
  { code: 'AR 111', title: 'Studio Design Project I', credits: 16, year: 1, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'AR 121', title: 'Architectural Graphics I', credits: 8, year: 1, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'AR 131', title: 'History and Theory of Architecture I', credits: 8, year: 1, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'AR 151', title: 'Building Materials I', credits: 8, year: 1, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'SC 161', title: 'Mechanics for Architects', credits: 8, year: 1, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'TW 107', title: 'Building, Setting out, Formwork & Brick Work Skills', credits: 6, year: 1, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'TW 113', title: 'Carpentry and Joinery', credits: 6, year: 1, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'DS 114', title: 'Development Perspectives I', credits: 8, year: 1, semester: 1, status: 'Core', deptId: 'dept-dev-studies', unitId: 'ids' },
  { code: 'CL 111', title: 'Communication Skills for Engineers', credits: 12, year: 1, semester: 1, status: 'Core', deptId: 'dept-foreign-languages', unitId: 'cohu' },

  // YEAR 1 — SEMESTER 2
  { code: 'AR 112', title: 'Studio Design Project II', credits: 16, year: 1, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'AR 122', title: 'Architectural Graphics II', credits: 8, year: 1, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'AR 132', title: 'History and Theory of Architecture II', credits: 8, year: 1, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'AR 152', title: 'Building Materials II', credits: 8, year: 1, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'SC 155', title: 'Building Construction I', credits: 8, year: 1, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'TR 168', title: 'Introduction to Geomatics for Architects', credits: 8, year: 1, semester: 2, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'TW 151', title: 'Welding and Fabrication', credits: 6, year: 1, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'TW 145', title: 'Plumbing Skills and Pipe Fittings Installations', credits: 6, year: 1, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'DS 115', title: 'Development Perspectives II', credits: 8, year: 1, semester: 2, status: 'Core', deptId: 'dept-dev-studies', unitId: 'ids' },

  // YEAR 2 — SEMESTER 1
  { code: 'AR 213', title: 'Studio Design Project III', credits: 20, year: 2, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'AR 233', title: 'History of World Architecture', credits: 8, year: 2, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'AR 232', title: 'Building Services I', credits: 8, year: 2, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'SC 202', title: 'Building Economics', credits: 8, year: 2, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'SC 223', title: 'Building Structures I', credits: 8, year: 2, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },

  // YEAR 2 — SEMESTER 2
  { code: 'AR 224', title: 'Architectural Graphics - Computer Aided', credits: 8, year: 2, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'SC 220', title: 'Building Materials II', credits: 8, year: 2, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'AR 214', title: 'Studio Design Project IV', credits: 24, year: 2, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'AR 223', title: 'Architectural Rendering', credits: 8, year: 2, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'AR 254', title: 'Professional Practice I', credits: 12, year: 2, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'AR 261', title: 'Settlement Planning', credits: 8, year: 2, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'AR 243', title: 'Building Services II', credits: 8, year: 2, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'AR 100', title: 'Practical Training I', credits: 8, year: 2, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },

  // YEAR 3 — SEMESTER 1
  { code: 'AR 315', title: 'Studio Design Project V', credits: 24, year: 3, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'SC 311', title: 'Building Services III', credits: 8, year: 3, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'AR 364', title: 'Urban Design', credits: 8, year: 3, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'AR 354', title: 'Professional Practice II', credits: 12, year: 3, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'WR 460', title: 'Management of Solid and Hazardous Waste', credits: 12, year: 3, semester: 1, status: 'Elective', deptId: 'dept-wre', unitId: 'coet' },
  { code: 'SC 429', title: 'Management of Construction Projects', credits: 12, year: 3, semester: 1, status: 'Elective', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'SC 402', title: 'Maintenance and Rehabilitation of Constructed Facilities', credits: 12, year: 3, semester: 1, status: 'Elective', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'AR 447', title: 'Architectural Science', credits: 12, year: 3, semester: 1, status: 'Elective', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'ME 201', title: 'Design Methodology', credits: 12, year: 3, semester: 1, status: 'Elective', deptId: 'dept-mie', unitId: 'coet' },

  // YEAR 3 — SEMESTER 2
  { code: 'AR 316', title: 'Studio Design Project VI', credits: 24, year: 3, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'SC 323', title: 'Analysis of Building Structures', credits: 8, year: 3, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'SC 301', title: 'Building Construction II', credits: 8, year: 3, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'AR 372', title: 'Architectural Specification', credits: 8, year: 3, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'AR 334', title: 'Architectural Conservation', credits: 8, year: 3, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'AR 200', title: 'Practical Training II', credits: 8, year: 3, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'ME 206', title: 'Strength of Materials II', credits: 12, year: 3, semester: 2, status: 'Elective', deptId: 'dept-mie', unitId: 'coet' },

  // YEAR 4 — SEMESTER 1
  { code: 'AR 417', title: 'Studio Design Project VII', credits: 24, year: 4, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'SC 403', title: 'Research Methodology', credits: 8, year: 4, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'WR 470', title: 'Environmental Impact Assessment', credits: 12, year: 4, semester: 1, status: 'Core', deptId: 'dept-wre', unitId: 'coet' },
  { code: 'AR 452', title: 'Architectural Project Management', credits: 8, year: 4, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'SC 423', title: 'Building Structures II', credits: 8, year: 4, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },

  // YEAR 4 — SEMESTER 2
  { code: 'AR 418', title: 'Studio Design Project VIII', credits: 24, year: 4, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'AR 462', title: 'Urban Sociology', credits: 8, year: 4, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'AR 451', title: 'Entrepreneurship', credits: 12, year: 4, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'SC 404', title: 'Project Procurement', credits: 8, year: 4, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'AR 300', title: 'Practical Training III', credits: 8, year: 4, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'AR 465', title: 'Urban Development and Housing', credits: 12, year: 4, semester: 2, status: 'Elective', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'AR 467', title: 'Basics of Interior Design', credits: 12, year: 4, semester: 2, status: 'Elective', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'AR 466', title: 'Basics of Landscape Design', credits: 12, year: 4, semester: 2, status: 'Elective', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'AR 488', title: 'Design for Emerging Technologies', credits: 12, year: 4, semester: 2, status: 'Elective', deptId: 'dept-sce', unitId: 'coet' },

  // YEAR 5 — SEMESTER 1
  { code: 'AR 585', title: 'Studio Design Project IX', credits: 16, year: 5, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'AR 598', title: 'Final Project 1', credits: 24, year: 5, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },

  // YEAR 5 — SEMESTER 2
  { code: 'AR 599', title: 'Final Project 2', credits: 40, year: 5, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'AR 400', title: 'Practical Training IV', credits: 8, year: 5, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
];

// PROGRAMME 2: Bachelor of Science in Quantity Surveying (4 Years, dept-sce, coet)
const BSC_QS_COURSES: CourseInput[] = [
  // YEAR 1 — SEMESTER 1
  { code: 'CL 111', title: 'Communication Skills for Engineering', credits: 8, year: 1, semester: 1, status: 'Core', deptId: 'dept-foreign-languages', unitId: 'cohu' },
  { code: 'DS 114', title: 'Development Perspectives I', credits: 8, year: 1, semester: 1, status: 'Core', deptId: 'dept-dev-studies', unitId: 'ids' },
  { code: 'SC 121', title: 'Statics', credits: 8, year: 1, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'EC 116', title: 'Introduction to Micro Economics', credits: 8, year: 1, semester: 1, status: 'Core', deptId: 'dept-economics', unitId: 'coss' },
  { code: 'SC 112', title: 'Civil Engineering Materials I', credits: 12, year: 1, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'QS 176', title: 'Introduction to Information Technology', credits: 8, year: 1, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'TR 111', title: 'Engineering Surveying I', credits: 8, year: 1, semester: 1, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'QS 122', title: 'Building Technology I', credits: 12, year: 1, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },

  // YEAR 1 — SEMESTER 2
  { code: 'SC 113', title: 'Civil Engineering Materials II', credits: 8, year: 1, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'SC 101', title: 'Mechanics of Materials', credits: 8, year: 1, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'QS 132', title: 'Measurement of Building Works I', credits: 12, year: 1, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'QS 125', title: 'Building Technology II', credits: 12, year: 1, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'DS 115', title: 'Development Perspectives II', credits: 8, year: 1, semester: 2, status: 'Core', deptId: 'dept-dev-studies', unitId: 'ids' },
  { code: 'TR 112', title: 'Engineering Surveying II', credits: 8, year: 1, semester: 2, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'QS 151', title: 'Project Work I', credits: 8, year: 1, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },

  // YEAR 2 — SEMESTER 1
  { code: 'MT 271', title: 'Statistics for Non Majors', credits: 12, year: 2, semester: 1, status: 'Core', deptId: 'dept-math', unitId: 'conas' },
  { code: 'SC 212', title: 'Civil Engineering Materials II', credits: 8, year: 2, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'QS 213', title: 'Design of Structures I', credits: 8, year: 2, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'QS 222', title: 'Building Technology III', credits: 12, year: 2, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'QS 232', title: 'Measurement of Building Works II', credits: 12, year: 2, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'SC 202', title: 'Building Economics', credits: 8, year: 2, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'QS 243', title: 'Law for Quantity Surveyors I', credits: 8, year: 2, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'QS 251', title: 'Project Work II', credits: 8, year: 2, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },

  // YEAR 2 — SEMESTER 2
  { code: 'QS 214', title: 'Design of Structures II', credits: 8, year: 2, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'QS 223', title: 'Building Services', credits: 12, year: 2, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'QS 224', title: 'Building Construction I', credits: 12, year: 2, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'QS 239', title: 'Measurement of Building Works III', credits: 12, year: 2, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'QS 241', title: 'Management Theory', credits: 12, year: 2, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'QS 252', title: 'Project Work III', credits: 8, year: 2, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'QS 100', title: 'Practical Training I', credits: 8, year: 2, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },

  // YEAR 3 — SEMESTER 1
  { code: 'QS 324', title: 'Civil Engineering Construction II', credits: 8, year: 3, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'QS 333', title: 'Measurement of Civil Engineering Works I', credits: 12, year: 3, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'QS 334', title: 'Measurement of Building Services', credits: 12, year: 3, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'QS 336', title: 'Estimating and Price Analysis', credits: 8, year: 3, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'QS 343', title: 'Law for Quantity Surveyor II', credits: 8, year: 3, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'QS 351', title: 'Project Work IV', credits: 8, year: 3, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'QS 361', title: 'Value Management', credits: 8, year: 3, semester: 1, status: 'Elective', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'QS 366', title: 'Structural and Condition Surveys', credits: 8, year: 3, semester: 1, status: 'Elective', deptId: 'dept-sce', unitId: 'coet' },

  // YEAR 3 — SEMESTER 2
  { code: 'QS 339', title: 'Measurement of Civil Engineering Works II', credits: 12, year: 3, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'QS 335', title: 'Construction Economics I', credits: 12, year: 3, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'QS 338', title: 'Procurement', credits: 12, year: 3, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'QS 344', title: 'Financial Accounting', credits: 8, year: 3, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'QS 352', title: 'Project Work V', credits: 8, year: 3, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'QS 200', title: 'Practical Training II', credits: 8, year: 3, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'QS 364', title: 'Property Development', credits: 8, year: 3, semester: 2, status: 'Elective', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'QS 362', title: 'Maintenance Management and Technology', credits: 8, year: 3, semester: 2, status: 'Elective', deptId: 'dept-sce', unitId: 'coet' },

  // YEAR 4 — SEMESTER 1
  { code: 'QS 435', title: 'Construction Economics II', credits: 12, year: 4, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'QS 437', title: 'Contract Administration', credits: 12, year: 4, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'QS 442', title: 'Construction Management', credits: 12, year: 4, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'QS 452', title: 'Architectural Project Management', credits: 8, year: 4, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'AR 451', title: 'Project Work VI', credits: 8, year: 4, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'SC 312', title: 'Research Methodology', credits: 8, year: 4, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'QS 498', title: 'Final Project I', credits: 8, year: 4, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'QS 363', title: 'Human Resource Management', credits: 8, year: 4, semester: 1, status: 'Elective', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'QS 367', title: 'Public Finance and Taxation', credits: 8, year: 4, semester: 1, status: 'Elective', deptId: 'dept-sce', unitId: 'coet' },

  // YEAR 4 — SEMESTER 2
  { code: 'SC 432', title: 'Ethics and Professional Practice', credits: 8, year: 4, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'IE 445', title: 'Entrepreneurship', credits: 12, year: 4, semester: 2, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { code: 'SC 404', title: 'Project Procurement', credits: 8, year: 4, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'QS 300', title: 'Practical Training III', credits: 8, year: 4, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'QS 499', title: 'Final Year Project II', credits: 16, year: 4, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'QS 368', title: 'Real Estate Market Analysis', credits: 8, year: 4, semester: 2, status: 'Elective', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'QS 365', title: 'Control and Regulation of Buildings', credits: 8, year: 4, semester: 2, status: 'Elective', deptId: 'dept-sce', unitId: 'coet' },
];

/**
 * Checks if an existing course is clearly the same academic course,
 * distinguishing genuine cross-departmental / cross-programme variations
 * from incompatible subjects that merely share a code.
 */
function isClearlySameAcademicCourse(code: string, suppliedTitle: string, existingTitle: string): boolean {
  const codeNorm = code.toUpperCase().replace(/\s+/g, '');
  const sTitleNorm = suppliedTitle.toLowerCase().replace(/[^a-z0-9]/g, '');
  const eTitleNorm = existingTitle.toLowerCase().replace(/[^a-z0-9]/g, '');

  // Exact normalised title match
  if (sTitleNorm === eTitleNorm) return true;

  // Substring or prefix matches
  if (sTitleNorm.includes(eTitleNorm) || eTitleNorm.includes(sTitleNorm)) return true;

  // Known equivalent curricular variations in UDSM Prospectus:
  const knownEquivalents: { [code: string]: string[] } = {
    'CL111': ['communicationskillsforengineers', 'communicationskillsforengineering', 'communicationskillsforengineersi'],
    'SC112': ['constructionmaterialsi', 'civilengineeringmaterialsi'],
    'SC121': ['statics'],
    'TR111': ['engineeringsurveyingi'],
    'TR112': ['engineeringsurveyingii'],
    'MT271': ['statisticsfornonmajors', 'statisticsformathematicsnonmajors'],
    'SC312': ['researchmethodology', 'researchmethodologyforcivilengineers'],
    'SC432': ['ethicsandprofessionalpractice', 'civilengineeringproceduresethics', 'civilengineeringproceduresandethics'],
    'IE445': ['entrepreneurship', 'entrepreneurshipforengineers'],
    'EC116': ['introductiontomicroeconomics', 'introductorymicroeconomicsi', 'principlesofmicroeconomicsi'],
    'WR470': ['environmentalimpactassessment'],
    'SC402': ['maintenanceandrehabilitationofconstructedfacilities'],
    'DS114': ['developmentperspectivesi'],
    'DS115': ['developmentperspectivesii'],
  };

  const list = knownEquivalents[codeNorm];
  if (list) {
    const sMatch = list.some(k => sTitleNorm.includes(k) || k.includes(sTitleNorm));
    const eMatch = list.some(k => eTitleNorm.includes(k) || k.includes(eTitleNorm));
    if (sMatch && eMatch) return true;
  }

  // Explicit known conflicts where subjects are completely different:
  // ME 201: Thermodynamics I vs Design Methodology -> FALSE
  // SC 101: Civil Engineering Drawing I vs Mechanics of Materials -> FALSE
  // AR 451: Entrepreneurship vs Project Work VI -> FALSE
  return false;
}

async function run() {
  console.log('=== STARTING COET BATCH 2: STRUCTURAL AND CONSTRUCTION ENGINEERING (SCE) IMPORT ===\n');

  // STEP 1: Verify Academic Unit (DO NOT modify)
  const coetDoc = await getDoc(doc(db, 'academic_units', 'coet'));
  if (!coetDoc.exists()) {
    throw new Error('Academic Unit "coet" not found!');
  }
  console.log(`[PASS] Confirmed Academic Unit: "${coetDoc.data()?.name}" (ID: coet)`);

  // STEP 2: Verify Department (DO NOT modify)
  const sceDeptDoc = await getDoc(doc(db, 'departments', 'dept-sce'));
  if (!sceDeptDoc.exists()) {
    throw new Error('Department "dept-sce" not found!');
  }
  console.log(`[PASS] Confirmed Department: "${sceDeptDoc.data()?.name}" (ID: dept-sce, Unit: ${sceDeptDoc.data()?.academicUnitId})`);

  // STEP 3: Setup Programmes under dept-sce
  const programmesToImport = [
    {
      id: 'b-arch',
      name: 'Bachelor of Architecture',
      shortName: 'BArch',
      durationYears: 5,
      courses: BARCH_COURSES,
    },
    {
      id: 'bsc-qs',
      name: 'Bachelor of Science in Quantity Surveying',
      shortName: 'BSc QS',
      durationYears: 4,
      courses: BSC_QS_COURSES,
    },
  ];

  for (const prog of programmesToImport) {
    const progDoc = await getDoc(doc(db, 'programmes', prog.id));
    const progData = {
      ...(progDoc.exists() ? progDoc.data() : {}),
      id: prog.id,
      name: prog.name,
      shortName: prog.shortName,
      departmentId: 'dept-sce',
      academicUnitId: 'coet',
      durationYears: prog.durationYears,
      studyMode: 'Full-Time',
      awardLevel: 'Bachelor Degree',
      universityId: 'udsm',
      academicYear: '2025/2026',
      verified: true,
      source: OFFICIAL_SOURCE,
    };
    await setDoc(doc(db, 'programmes', prog.id), progData, { merge: true });
    console.log(`[PASS] Confirmed Programme: "${prog.name}" (${prog.id}) [${prog.durationYears} Years] under Department "dept-sce"`);
  }

  // STEP 4: Inspect Existing Canonical Courses & Conflict Detection
  console.log('\n--- Fetching existing canonical courses ---');
  const existingCanonicalSnap = await getDocs(collection(db, 'canonical_courses'));
  const canonicalMapByCode = new Map<string, any[]>();
  existingCanonicalSnap.docs.forEach((d) => {
    const data = d.data();
    const code = (data.code || '').toUpperCase().trim();
    if (code) {
      if (!canonicalMapByCode.has(code)) canonicalMapByCode.set(code, []);
      canonicalMapByCode.get(code)!.push({ canonicalId: d.id, id: d.id, ...data });
    }
  });

  const coursesCreated: string[] = [];
  const coursesReused: string[] = [];
  const relationshipsCreated: { progId: string; code: string; title: string; cr: number; canonicalId: string; term: string }[] = [];
  const flaggedConflicts: {
    progId: string;
    code: string;
    suppliedTitle: string;
    suppliedCredits: number;
    existingTitle: string;
    existingCredits: number;
    reason: string;
  }[] = [];
  const skippedRecords: {
    progId: string;
    code: string;
    title: string;
    credits: number;
    year: number;
    semester: number;
    status: string;
    reason: string;
  }[] = [];

  let currentBatch = writeBatch(db);
  let batchCount = 0;

  async function flushBatch() {
    if (batchCount > 0) {
      await currentBatch.commit();
      currentBatch = writeBatch(db);
      batchCount = 0;
    }
  }

  for (const prog of programmesToImport) {
    console.log(`\n================ Processing Programme: ${prog.name} (${prog.id}) ================`);

    // Clean up any stale courses for this programme before re-populating cleanly
    const oldCcSnap = await getDocs(query(collection(db, 'catalogue_courses'), where('programmeId', '==', prog.id)));
    const oldPcSnap = await getDocs(query(collection(db, 'programme_courses'), where('programmeId', '==', prog.id)));
    for (const d of oldCcSnap.docs) {
      currentBatch.delete(d.ref);
      batchCount++;
      if (batchCount >= 400) await flushBatch();
    }
    for (const d of oldPcSnap.docs) {
      currentBatch.delete(d.ref);
      batchCount++;
      if (batchCount >= 400) await flushBatch();
    }
    await flushBatch();

    for (const c of prog.courses) {
      const codeUpper = c.code.toUpperCase().trim();
      const existingList = canonicalMapByCode.get(codeUpper);

      if (existingList && existingList.length > 0) {
        // We found existing canonical course(s) with this code!
        // 1. Check for exact match
        const exactMatch = existingList.find(
          (e) =>
            e.title?.toLowerCase().trim() === c.title.toLowerCase().trim() &&
            (e.defaultCredits === c.credits || e.credits === c.credits)
        );

        if (exactMatch) {
          const matchCanonicalId = exactMatch.canonicalId || exactMatch.id;
          // Exact match! Reuse canonical course
          coursesReused.push(`[${c.code}] "${c.title}" (${c.credits} cr) -> Canonical: ${matchCanonicalId}`);
          
          // Create Programme-Course relationship
          const codeSlug = c.code.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
          const pcId = `${prog.id}_${matchCanonicalId}`;
          const ccId = `udsm_${prog.id}_${codeSlug}`;

          const pcData = {
            id: pcId,
            programmeId: prog.id,
            courseId: matchCanonicalId,
            code: c.code,
            title: c.title,
            credits: c.credits,
            yearOfStudy: c.year,
            semester: c.semester,
            status: c.status,
            universityId: 'udsm',
            academicUnitId: 'coet',
            departmentId: 'dept-sce',
            verified: true,
            source: OFFICIAL_SOURCE,
            academicYear: '2025/2026',
            sourceType: 'official_prospectus',
          };

          const ccData = {
            id: ccId,
            programmeId: prog.id,
            canonicalCourseId: matchCanonicalId,
            code: c.code,
            title: c.title,
            credits: c.credits,
            yearOfStudy: c.year,
            semester: c.semester,
            courseType: c.status,
            status: c.status,
            academicUnitId: 'coet',
            departmentId: 'dept-sce',
            universityId: 'udsm',
            active: true,
            verified: true,
            source: OFFICIAL_SOURCE,
            academicYear: '2025/2026',
            sourceType: 'official_prospectus',
          };

          currentBatch.set(doc(db, 'programme_courses', pcId), pcData, { merge: true });
          currentBatch.set(doc(db, 'catalogue_courses', ccId), ccData, { merge: true });
          batchCount += 2;
          if (batchCount >= 400) await flushBatch();

          relationshipsCreated.push({
            progId: prog.id,
            code: c.code,
            title: c.title,
            cr: c.credits,
            canonicalId: matchCanonicalId,
            term: `Y${c.year}S${c.semester}`,
          });
        } else {
          // Title or credits differ!
          const primaryExisting = existingList[0];
          const primaryCanonicalId = primaryExisting.canonicalId || primaryExisting.id;
          const isSameAcademicCourse = isClearlySameAcademicCourse(c.code, c.title, primaryExisting.title);

          if (isSameAcademicCourse) {
            // Clearly the same academic course with credit or title variation!
            // PRESERVE existing canonical course untouched (DO NOT overwrite it!)
            // Link programme relationship with the programme's exact title and credits
            coursesReused.push(
              `[${c.code}] "${c.title}" (${c.credits} cr) -> Linked to Canonical ${primaryCanonicalId} ("${primaryExisting.title}", ${primaryExisting.defaultCredits ?? primaryExisting.credits} cr) [Variation preserved]`
            );

            const codeSlug = c.code.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            const pcId = `${prog.id}_${primaryCanonicalId}`;
            const ccId = `udsm_${prog.id}_${codeSlug}`;

            const pcData = {
              id: pcId,
              programmeId: prog.id,
              courseId: primaryCanonicalId,
              code: c.code,
              title: c.title,
              credits: c.credits,
              yearOfStudy: c.year,
              semester: c.semester,
              status: c.status,
              universityId: 'udsm',
              academicUnitId: 'coet',
              departmentId: 'dept-sce',
              verified: true,
              source: OFFICIAL_SOURCE,
              academicYear: '2025/2026',
              sourceType: 'official_prospectus',
            };

            const ccData = {
              id: ccId,
              programmeId: prog.id,
              canonicalCourseId: primaryCanonicalId,
              code: c.code,
              title: c.title,
              credits: c.credits,
              yearOfStudy: c.year,
              semester: c.semester,
              courseType: c.status,
              status: c.status,
              academicUnitId: 'coet',
              departmentId: 'dept-sce',
              universityId: 'udsm',
              active: true,
              verified: true,
              source: OFFICIAL_SOURCE,
              academicYear: '2025/2026',
              sourceType: 'official_prospectus',
            };

            currentBatch.set(doc(db, 'programme_courses', pcId), pcData, { merge: true });
            currentBatch.set(doc(db, 'catalogue_courses', ccId), ccData, { merge: true });
            batchCount += 2;
            if (batchCount >= 400) await flushBatch();

            relationshipsCreated.push({
              progId: prog.id,
              code: c.code,
              title: c.title,
              cr: c.credits,
              canonicalId: primaryExisting.canonicalId,
              term: `Y${c.year}S${c.semester}`,
            });
          } else {
            // NOT the same academic course! (e.g. ME 201 Design Methodology vs Thermodynamics I; SC 101 Mechanics of Materials vs Drawing; AR 451 Project Work VI vs Entrepreneurship)
            // STOP individual course import, PRESERVE existing canonical course, and FLAG conflict for manual review.
            const conflictReason = `Academic subject conflict: Supplied "${c.title}" (${c.credits} cr) is a different academic subject than existing canonical "${primaryExisting.title}" (${primaryExisting.defaultCredits ?? primaryExisting.credits} cr, dept: ${primaryExisting.departmentId})`;
            flaggedConflicts.push({
              progId: prog.id,
              code: c.code,
              suppliedTitle: c.title,
              suppliedCredits: c.credits,
              existingTitle: primaryExisting.title,
              existingCredits: primaryExisting.defaultCredits ?? primaryExisting.credits,
              reason: conflictReason,
            });

            skippedRecords.push({
              progId: prog.id,
              code: c.code,
              title: c.title,
              credits: c.credits,
              year: c.year,
              semester: c.semester,
              status: c.status,
              reason: `STOPPED import: Existing canonical course preserved untouched without overwriting. (${conflictReason})`,
            });
          }
        }
      } else {
        // No canonical course exists with this code -> Create new canonical course
        const generatedId = c.code.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
        const canonicalRecord = {
          id: generatedId,
          canonicalId: generatedId,
          code: c.code,
          title: c.title,
          defaultCredits: c.credits,
          departmentId: c.deptId,
          academicUnitId: c.unitId,
          universityId: 'udsm',
          verified: true,
          source: OFFICIAL_SOURCE,
          academicYear: '2025/2026',
          sourceType: 'official_prospectus',
        };

        currentBatch.set(doc(db, 'canonical_courses', generatedId), canonicalRecord, { merge: true });
        batchCount++;
        if (batchCount >= 400) await flushBatch();

        canonicalMapByCode.set(codeUpper, [canonicalRecord]);
        coursesCreated.push(`[${c.code}] "${c.title}" (${c.credits} cr) -> Created: ${generatedId}`);

        // Create Programme-Course relationship
        const codeSlug = c.code.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        const pcId = `${prog.id}_${generatedId}`;
        const ccId = `udsm_${prog.id}_${codeSlug}`;

        const pcData = {
          id: pcId,
          programmeId: prog.id,
          courseId: generatedId,
          code: c.code,
          title: c.title,
          credits: c.credits,
          yearOfStudy: c.year,
          semester: c.semester,
          status: c.status,
          universityId: 'udsm',
          academicUnitId: 'coet',
          departmentId: 'dept-sce',
          verified: true,
          source: OFFICIAL_SOURCE,
          academicYear: '2025/2026',
          sourceType: 'official_prospectus',
        };

        const ccData = {
          id: ccId,
          programmeId: prog.id,
          canonicalCourseId: generatedId,
          code: c.code,
          title: c.title,
          credits: c.credits,
          yearOfStudy: c.year,
          semester: c.semester,
          courseType: c.status,
          status: c.status,
          academicUnitId: 'coet',
          departmentId: 'dept-sce',
          universityId: 'udsm',
          active: true,
          verified: true,
          source: OFFICIAL_SOURCE,
          academicYear: '2025/2026',
          sourceType: 'official_prospectus',
        };

        currentBatch.set(doc(db, 'programme_courses', pcId), pcData, { merge: true });
        currentBatch.set(doc(db, 'catalogue_courses', ccId), ccData, { merge: true });
        batchCount += 2;
        if (batchCount >= 400) await flushBatch();

        relationshipsCreated.push({
          progId: prog.id,
          code: c.code,
          title: c.title,
          cr: c.credits,
          canonicalId: generatedId,
          term: `Y${c.year}S${c.semester}`,
        });
      }
    }
  }

  await flushBatch();

  console.log('\n================ IMPORT SUMMARY ================');
  console.log(`Programmes Configured: ${programmesToImport.length} (Bachelor of Architecture [5 Yrs], BSc in Quantity Surveying [4 Yrs])`);
  console.log(`New Canonical Courses Created: ${coursesCreated.length}`);
  console.log(`Existing Canonical Courses Reused / Linked: ${coursesReused.length}`);
  console.log(`Programme-Course Relationships Created: ${relationshipsCreated.length}`);
  console.log(`Conflicts Detected & Flagged for Manual Review: ${flaggedConflicts.length}`);
  console.log(`Records Skipped to Preserve Data Integrity: ${skippedRecords.length}`);

  console.log('\n--- DETAILED CONFLICTS & SKIPPED RECORDS ---');
  flaggedConflicts.forEach(f => {
    console.log(`[CONFLICT] Programme ${f.progId} | Code: ${f.code}`);
    console.log(`   Supplied: "${f.suppliedTitle}" (${f.suppliedCredits} cr)`);
    console.log(`   Existing: "${f.existingTitle}" (${f.existingCredits} cr)`);
    console.log(`   Action: ${f.reason}`);
  });

  process.exit(0);
}

run().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});
