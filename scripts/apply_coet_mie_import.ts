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
  programmeId: string;
  year: number;
  semester: number;
  code: string;
  title: string;
  rawCredits: string;
  credits: number;
  status: 'Core' | 'Elective';
  deptId: string;
  unitId: string;
}

// PROGRAMME 1: Bachelor of Science in Mechanical Engineering (4 Years, dept-mie, coet)
const BSC_MECH_COURSES: CourseInput[] = [
  // YEAR 1 — SEMESTER 1
  { programmeId: 'bsc-mech', year: 1, semester: 1, code: 'CL 111', title: 'Communication Skills for Engineers', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-foreign-languages', unitId: 'cohu' },
  { programmeId: 'bsc-mech', year: 1, semester: 1, code: 'EE 171', title: 'Principles of Computer Programming', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-cse', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 1, semester: 1, code: 'DS 114', title: 'Development Perspectives I', rawCredits: '12', credits: 12, status: 'Core', deptId: 'dept-dev-studies', unitId: 'ids' },
  { programmeId: 'bsc-mech', year: 1, semester: 1, code: 'ME 101', title: 'Engineering Drawing', rawCredits: '8.0', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 1, semester: 1, code: 'TW 139', title: 'Metal Cutting and Machine Tools Practice', rawCredits: '6', credits: 6, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 1, semester: 1, code: 'TW 151', title: 'Welding and Fabrication Practice', rawCredits: '6', credits: 6, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 1, semester: 1, code: 'MT 161', title: 'Matrices and Basic Calculus for Non-Majors', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-math', unitId: 'conas' },
  { programmeId: 'bsc-mech', year: 1, semester: 1, code: 'SC 121', title: 'Statics', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },

  // YEAR 1 — SEMESTER 2
  { programmeId: 'bsc-mech', year: 1, semester: 2, code: 'DS 115', title: 'Development Perspectives II', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-dev-studies', unitId: 'ids' },
  { programmeId: 'bsc-mech', year: 1, semester: 2, code: 'EE 111', title: 'Fundamentals of Electronics', rawCredits: '8E', credits: 8, status: 'Core', deptId: 'dept-ee', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 1, semester: 2, code: 'EE 151', title: 'Fundamentals of Electrical Engineering', rawCredits: '12', credits: 12, status: 'Core', deptId: 'dept-ee', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 1, semester: 2, code: 'ME 103', title: 'Computer Aided Drafting', rawCredits: '8.0', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 1, semester: 2, code: 'ME 106', title: 'Strength of Materials I', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 1, semester: 2, code: 'TW 134', title: 'Electrical Machines and Installation Practice', rawCredits: '6', credits: 6, status: 'Core', deptId: 'dept-ee', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 1, semester: 2, code: 'TW 125', title: 'Practical Electronics Engineering', rawCredits: '6', credits: 6, status: 'Core', deptId: 'dept-ee', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 1, semester: 2, code: 'MT 171', title: 'One Variable Calculus and Differential Equations for Non-Majors', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-math', unitId: 'conas' },

  // YEAR 2 — SEMESTER 1
  { programmeId: 'bsc-mech', year: 2, semester: 1, code: 'ME 201', title: 'Design Methodology', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 2, semester: 1, code: 'ME 206', title: 'Strength of Materials II', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 2, semester: 1, code: 'ME 218', title: 'Materials Technology I', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 2, semester: 1, code: 'ME 228', title: 'Mechanics of Fluids', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 2, semester: 1, code: 'EE 243', title: 'Measurements and Instrumentation for Non-majors', rawCredits: '8E', credits: 8, status: 'Core', deptId: 'dept-ee', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 2, semester: 1, code: 'MT 261', title: 'Several Variable Calculus for Non-majors', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-math', unitId: 'conas' },

  // YEAR 2 — SEMESTER 2
  { programmeId: 'bsc-mech', year: 2, semester: 2, code: 'ME 202', title: 'Machine Elements and Design I', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 2, semester: 2, code: 'ME 208', title: 'Dynamics', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 2, semester: 2, code: 'ME 219', title: 'Materials Technology II', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 2, semester: 2, code: 'ME 226', title: 'Thermodynamics', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 2, semester: 2, code: 'ME 232', title: 'Manufacturing Technology I', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 2, semester: 2, code: 'MT 271', title: 'Statistics for Non-majors', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-math', unitId: 'conas' },
  { programmeId: 'bsc-mech', year: 2, semester: 2, code: 'ME 100', title: 'Practical Training I', rawCredits: '8', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },

  // YEAR 3 — SEMESTER 1
  { programmeId: 'bsc-mech', year: 3, semester: 1, code: 'ME 302', title: 'Machine Elements and Design II', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 3, semester: 1, code: 'ME 303', title: 'Computer Aided Design', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 3, semester: 1, code: 'ME 324', title: 'Mechanical Control Systems', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 3, semester: 1, code: 'ME 332', title: 'Manufacturing Technology II', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 3, semester: 1, code: 'IE 340', title: 'Engineering Operations Management', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 3, semester: 1, code: 'ME 306', title: 'Solid Mechanics', rawCredits: '12E', credits: 12, status: 'Elective', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 3, semester: 1, code: 'ME 308', title: 'Mechanical Vibration Analysis', rawCredits: '8.0E', credits: 8, status: 'Elective', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 3, semester: 1, code: 'ME 317', title: 'Welding Metallurgy', rawCredits: '8.0E', credits: 8, status: 'Elective', deptId: 'dept-mie', unitId: 'coet' },

  // YEAR 3 — SEMESTER 2
  { programmeId: 'bsc-mech', year: 3, semester: 2, code: 'ME 309', title: 'Design Project', rawCredits: '8.0', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 3, semester: 2, code: 'ME 325', title: 'Turbomachinery', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 3, semester: 2, code: 'ME 326', title: 'Combustion and Heat Transfer', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 3, semester: 2, code: 'ME 329', title: 'Internal Combustion Engines', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 3, semester: 2, code: 'ME 334', title: 'Computer Aided Manufacturing', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 3, semester: 2, code: 'IE 399', title: 'Research Methods for Engineers', rawCredits: '8.0', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 3, semester: 2, code: 'ME 200', title: 'Practical Training II', rawCredits: '8.0', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 3, semester: 2, code: 'ME 322', title: 'Renewable Energy Technology', rawCredits: '12E', credits: 12, status: 'Elective', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 3, semester: 2, code: 'ME 327', title: 'Industrial Energy Management', rawCredits: '12E', credits: 12, status: 'Elective', deptId: 'dept-mie', unitId: 'coet' },

  // YEAR 4 — SEMESTER 1
  { programmeId: 'bsc-mech', year: 4, semester: 1, code: 'ME 402', title: 'Material Handling Systems', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 4, semester: 1, code: 'ME 431', title: 'Industrial Automation', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 4, semester: 1, code: 'IE 440', title: 'Engineering Economics', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 4, semester: 1, code: 'IE 443', title: 'Industrial Safety and Maintenance', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 4, semester: 1, code: 'ME 428', title: 'Computational Fluid Dynamics', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 4, semester: 1, code: 'ME 498', title: 'Final Project I', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 4, semester: 1, code: 'ME 426', title: 'Refrigeration and Air-conditioning', rawCredits: '8.0E', credits: 8, status: 'Elective', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 4, semester: 1, code: 'ME 425', title: 'Power Plants', rawCredits: '12E', credits: 12, status: 'Elective', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 4, semester: 1, code: 'IE 442', title: 'Operations Research', rawCredits: '8.0E', credits: 8, status: 'Elective', deptId: 'dept-mie', unitId: 'coet' },

  // YEAR 4 — SEMESTER 2
  { programmeId: 'bsc-mech', year: 4, semester: 2, code: 'ME 408', title: 'Noise and Vibration Control', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 4, semester: 2, code: 'IE 445', title: 'Entrepreneurship for Engineers', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 4, semester: 2, code: 'SC 430', title: 'General Engineering Procedures and Ethics', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 4, semester: 2, code: 'ME 499', title: 'Final Project II', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 4, semester: 2, code: 'ME 300', title: 'Practical Training III', rawCredits: '8.0', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 4, semester: 2, code: 'ME 417', title: 'Introduction to Polymer and Composite Materials', rawCredits: '8.0E', credits: 8, status: 'Elective', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 4, semester: 2, code: 'ME 429', title: 'Automotive Engineering', rawCredits: '12E', credits: 12, status: 'Elective', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 4, semester: 2, code: 'IE 441', title: 'Human Resources Management for Engineers', rawCredits: '8.0E', credits: 8, status: 'Elective', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-mech', year: 4, semester: 2, code: 'IE 446', title: 'Innovation Management', rawCredits: '8.0E', credits: 8, status: 'Elective', deptId: 'dept-mie', unitId: 'coet' },
];

// PROGRAMME 2: Bachelor of Science in Industrial Engineering (4 Years, dept-mie, coet)
const BSC_IE_COURSES: CourseInput[] = [
  // YEAR 1 — SEMESTER 1
  { programmeId: 'bsc-ie', year: 1, semester: 1, code: 'DS 114', title: 'Development Perspectives I', rawCredits: '12', credits: 12, status: 'Core', deptId: 'dept-dev-studies', unitId: 'ids' },
  { programmeId: 'bsc-ie', year: 1, semester: 1, code: 'CL 111', title: 'Communication Skills for Engineers', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-foreign-languages', unitId: 'cohu' },
  { programmeId: 'bsc-ie', year: 1, semester: 1, code: 'EE 171', title: 'Principles of Computer Programming', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-cse', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 1, semester: 1, code: 'ME 101', title: 'Engineering Drawing', rawCredits: '8.0', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 1, semester: 1, code: 'IE 120', title: 'Fundamentals of Industrial and Systems Engineering', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 1, semester: 1, code: 'MT 161', title: 'Matrices and Basic Calculus for Non-majors', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-math', unitId: 'conas' },
  { programmeId: 'bsc-ie', year: 1, semester: 1, code: 'SC 121', title: 'Statics', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 1, semester: 1, code: 'TW 139', title: 'Metal Cutting and Machine Tools Practice', rawCredits: '6', credits: 6, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 1, semester: 1, code: 'TW 151', title: 'Welding and Fabrication', rawCredits: '6', credits: 6, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },

  // YEAR 1 — SEMESTER 2
  { programmeId: 'bsc-ie', year: 1, semester: 2, code: 'DS 115', title: 'Development Perspectives II', rawCredits: '12', credits: 12, status: 'Core', deptId: 'dept-dev-studies', unitId: 'ids' },
  { programmeId: 'bsc-ie', year: 1, semester: 2, code: 'EE 151', title: 'Fundamentals of Electrical Engineering', rawCredits: '12', credits: 12, status: 'Core', deptId: 'dept-ee', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 1, semester: 2, code: 'EE 172', title: 'Computer Programming for Engineers', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-cse', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 1, semester: 2, code: 'ME 103', title: 'Computer Aided Drafting', rawCredits: '8.0', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 1, semester: 2, code: 'ME 106', title: 'Strength of Materials I', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 1, semester: 2, code: 'MT 171', title: 'One Variable Calculus and Diff. Equations for Non-majors', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-math', unitId: 'conas' },
  { programmeId: 'bsc-ie', year: 1, semester: 2, code: 'TW 134', title: 'Electrical Machines and Installation Practice', rawCredits: '6', credits: 6, status: 'Core', deptId: 'dept-ee', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 1, semester: 2, code: 'TW 125', title: 'Practical Electronics Engineering', rawCredits: '6', credits: 6, status: 'Core', deptId: 'dept-ee', unitId: 'coet' },

  // YEAR 2 — SEMESTER 1
  { programmeId: 'bsc-ie', year: 2, semester: 1, code: 'IE 201', title: 'Design of Work Systems', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 2, semester: 1, code: 'IE 220', title: 'Productivity and Business Competitiveness', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 2, semester: 1, code: 'ME 201', title: 'Design Methodology', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 2, semester: 1, code: 'CS 231', title: 'Computer Programming in Java', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-cse', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 2, semester: 1, code: 'MT 261', title: 'Several Variable Calculus for Non-majors', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-math', unitId: 'conas' },
  { programmeId: 'bsc-ie', year: 2, semester: 1, code: 'IE 255', title: 'Industrial Information System', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 2, semester: 1, code: 'ME 206', title: 'Strength of Material II', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },

  // YEAR 2 — SEMESTER 2
  { programmeId: 'bsc-ie', year: 2, semester: 2, code: 'ME 202', title: 'Machine Elements and Design I', rawCredits: '12.0E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 2, semester: 2, code: 'MT 271', title: 'Statistics for Non-majors', rawCredits: '12.0E', credits: 12, status: 'Core', deptId: 'dept-math', unitId: 'conas' },
  { programmeId: 'bsc-ie', year: 2, semester: 2, code: 'IE 232', title: 'Human Factors Engineering', rawCredits: '12.0E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 2, semester: 2, code: 'CS 232', title: 'Web Technologies', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-cse', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 2, semester: 2, code: 'ME 226', title: 'Thermodynamics', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 2, semester: 2, code: 'IE 260', title: 'Product Design', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 2, semester: 2, code: 'IE 245', title: 'Industrial Logistics Engineering', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 2, semester: 2, code: 'EI 100', title: 'Practical Training I', rawCredits: '8.0', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },

  // YEAR 3 — SEMESTER 1
  { programmeId: 'bsc-ie', year: 3, semester: 1, code: 'IE 340', title: 'Engineering Operations Management', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 3, semester: 1, code: 'IE 354', title: 'Engineering Project Management', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 3, semester: 1, code: 'ME 303', title: 'Computer Aided Design', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 3, semester: 1, code: 'IE 370', title: 'Decision Support Systems Engineering', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 3, semester: 1, code: 'IE 347', title: 'Industrial System Engineering', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 3, semester: 1, code: 'IE 366', title: 'Queuing Theory', rawCredits: '8.0E', credits: 8, status: 'Elective', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 3, semester: 1, code: 'IE 350', title: 'Industrial Environmental Management', rawCredits: '8.0E', credits: 8, status: 'Elective', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 3, semester: 1, code: 'ME 332', title: 'Manufacturing Technology II', rawCredits: '12E', credits: 12, status: 'Elective', deptId: 'dept-mie', unitId: 'coet' },

  // YEAR 3 — SEMESTER 2
  { programmeId: 'bsc-ie', year: 3, semester: 2, code: 'ME 326', title: 'Combustion and Heat Transfer', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 3, semester: 2, code: 'IE 355', title: 'Quality Engineering and Management', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 3, semester: 2, code: 'IE 365', title: 'Industrial Systems Simulation', rawCredits: '12', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 3, semester: 2, code: 'ME 334', title: 'Computer Aided Manufacturing', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 3, semester: 2, code: 'ME 327', title: 'Industrial Energy Management', rawCredits: '12', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 3, semester: 2, code: 'IE 399', title: 'Research Methods for Engineers', rawCredits: '8.0', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 3, semester: 2, code: 'EI 200', title: 'Practical Training II', rawCredits: '8.0', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 3, semester: 2, code: 'IE 344', title: 'Introduction to Strategic Management', rawCredits: '8.0E', credits: 8, status: 'Elective', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 3, semester: 2, code: 'ME 322', title: 'Renewable Energy Technology', rawCredits: '12E', credits: 12, status: 'Elective', deptId: 'dept-mie', unitId: 'coet' },

  // YEAR 4 — SEMESTER 1
  { programmeId: 'bsc-ie', year: 4, semester: 1, code: 'ME 431', title: 'Industrial Automation', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 4, semester: 1, code: 'IE 440', title: 'Engineering Economics', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 4, semester: 1, code: 'IE 442', title: 'Operations Research', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 4, semester: 1, code: 'IE 443', title: 'Industrial Safety and Maintenance', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 4, semester: 1, code: 'IE 446', title: 'Innovation Management', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 4, semester: 1, code: 'IE 498', title: 'Final Project I', rawCredits: '8.0', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 4, semester: 1, code: 'IE 441', title: 'Human Resource Management for Engineers', rawCredits: '8.0E', credits: 8, status: 'Elective', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 4, semester: 1, code: 'ME 425', title: 'Power Plants', rawCredits: '12E', credits: 12, status: 'Elective', deptId: 'dept-mie', unitId: 'coet' },

  // YEAR 4 — SEMESTER 2
  { programmeId: 'bsc-ie', year: 4, semester: 2, code: 'SC 430', title: 'General Engineering Procedures and Ethics', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 4, semester: 2, code: 'IE 448', title: 'Database Design and Analysis', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 4, semester: 2, code: 'IE 445', title: 'Entrepreneurship for Engineers', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 4, semester: 2, code: 'IE 499', title: 'Final Project II', rawCredits: '12', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 4, semester: 2, code: 'EI 300', title: 'Practical Training III', rawCredits: '8.0', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 4, semester: 2, code: 'IE 444', title: 'Advanced Operations Research', rawCredits: '8.0E', credits: 8, status: 'Elective', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 4, semester: 2, code: 'IE 447', title: 'Reliability Engineering', rawCredits: '8.0E', credits: 8, status: 'Elective', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-ie', year: 4, semester: 2, code: 'ME 334', title: 'Computer Aided Manufacturing', rawCredits: '8.0E', credits: 8, status: 'Elective', deptId: 'dept-mie', unitId: 'coet' },
];

// PROGRAMME 3: Bachelor of Science in Textile Design and Technology (4 Years, dept-mie, coet)
const BSC_TDT_COURSES: CourseInput[] = [
  // YEAR 1 — SEMESTER 1
  { programmeId: 'bsc-tdt', year: 1, semester: 1, code: 'CL 111', title: 'Communications Skills for Engineers', rawCredits: '8', credits: 8, status: 'Core', deptId: 'dept-foreign-languages', unitId: 'cohu' },
  { programmeId: 'bsc-tdt', year: 1, semester: 1, code: 'DS 114', title: 'Development Perspectives I', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-dev-studies', unitId: 'ids' },
  { programmeId: 'bsc-tdt', year: 1, semester: 1, code: 'EE 171', title: 'Computers Programming for Engineers', rawCredits: '12', credits: 12, status: 'Core', deptId: 'dept-cse', unitId: 'coet' },
  { programmeId: 'bsc-tdt', year: 1, semester: 1, code: 'ME 101', title: 'Engineering Drawing', rawCredits: '8', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-tdt', year: 1, semester: 1, code: 'TX 101', title: 'Apparel Technology', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-tdt', year: 1, semester: 1, code: 'TX 103', title: 'Mathematics for Textile Designers I', rawCredits: '8', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },

  // YEAR 1 — SEMESTER 2
  { programmeId: 'bsc-tdt', year: 1, semester: 2, code: 'TX 107', title: 'Principles of Textile Design', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-tdt', year: 1, semester: 2, code: 'TX 105', title: 'Pattern Design and Development', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-tdt', year: 1, semester: 2, code: 'TX 108', title: 'Mathematics for Textile Designers II', rawCredits: '8', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-tdt', year: 1, semester: 2, code: 'ME 103', title: 'Computer Aided Drafting', rawCredits: '8.0', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-tdt', year: 1, semester: 2, code: 'DS 115', title: 'Development Perspectives II', rawCredits: '12.0E', credits: 12, status: 'Core', deptId: 'dept-dev-studies', unitId: 'ids' },
  { programmeId: 'bsc-tdt', year: 1, semester: 2, code: 'TX 104', title: 'Fibre Science', rawCredits: '8', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-tdt', year: 1, semester: 2, code: 'TX 106', title: '2D Workshop', rawCredits: '12', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-tdt', year: 1, semester: 2, code: 'TX 109', title: 'Textile Chemistry', rawCredits: '12', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },

  // YEAR 2 — SEMESTER 1
  { programmeId: 'bsc-tdt', year: 2, semester: 1, code: 'TX 203', title: 'Introduction to Textile Processes', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-tdt', year: 2, semester: 1, code: 'TX 201', title: 'Fibre Physics', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-tdt', year: 2, semester: 1, code: 'TX 205', title: 'Textile Design with Fabrics', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-tdt', year: 2, semester: 1, code: 'TX 211', title: 'Fashion Design', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-tdt', year: 2, semester: 1, code: 'TX 202', title: 'Basic Textile Chemistry', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-tdt', year: 2, semester: 1, code: 'CH 117', title: 'Organic Chemistry I', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-chemistry', unitId: 'conas' },

  // YEAR 2 — SEMESTER 2
  { programmeId: 'bsc-tdt', year: 2, semester: 2, code: 'TX 206', title: 'Creative Fashion Design', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-tdt', year: 2, semester: 2, code: 'TX 204', title: 'Textile Physics', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-tdt', year: 2, semester: 2, code: 'TX 207', title: 'Textile Processes', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-tdt', year: 2, semester: 2, code: 'TX 217', title: 'Textile Chemistry', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-tdt', year: 2, semester: 2, code: 'TX 208', title: 'Garment Technology', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-tdt', year: 2, semester: 2, code: 'TX 210', title: 'Surface Textile Design', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-tdt', year: 2, semester: 2, code: 'TX 216', title: 'Introduction to Interior Design', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-tdt', year: 2, semester: 2, code: 'PT 1', title: 'Practical Training I', rawCredits: '8', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },

  // YEAR 3 — SEMESTER 1
  { programmeId: 'bsc-tdt', year: 3, semester: 1, code: 'TX 301', title: 'Textile Design with Garments', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-tdt', year: 3, semester: 1, code: 'TX 302', title: 'Distribution and Logistics', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-tdt', year: 3, semester: 1, code: 'TX 315', title: 'Coloration and Finishing Technology', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-tdt', year: 3, semester: 1, code: 'TX 303', title: 'Marketing in Textiles', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-tdt', year: 3, semester: 1, code: 'MG 340', title: 'Engineering Operations Management I', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-tdt', year: 3, semester: 1, code: 'TX 323', title: 'Interior Design Technology', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-tdt', year: 3, semester: 1, code: 'MG 441', title: 'Human Resource and Management', rawCredits: '8.0E', credits: 8, status: 'Elective', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-tdt', year: 3, semester: 1, code: 'IM 205', title: 'Business Research Methods', rawCredits: '12E', credits: 12, status: 'Elective', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-tdt', year: 3, semester: 1, code: 'TX 324', title: 'Fabric Technology', rawCredits: '8.0E', credits: 8, status: 'Elective', deptId: 'dept-mie', unitId: 'coet' },

  // YEAR 3 — SEMESTER 2
  { programmeId: 'bsc-tdt', year: 3, semester: 2, code: 'TX 307', title: 'Colour Science and Technology', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-tdt', year: 3, semester: 2, code: 'TX 304', title: 'CAD/CAM for Textiles', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-tdt', year: 3, semester: 2, code: 'TX 308', title: 'Product Analysis', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-tdt', year: 3, semester: 2, code: 'TX 309', title: 'Garment Pattern and Sample Development', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-tdt', year: 3, semester: 2, code: 'TX 310', title: 'Supply Chain Management', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-tdt', year: 3, semester: 2, code: 'PT 2', title: 'Practical Training II', rawCredits: '8.0', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-tdt', year: 3, semester: 2, code: 'MK 202', title: 'Marketing Research', rawCredits: '12E', credits: 12, status: 'Elective', deptId: 'dept-marketing', unitId: 'udbs' },
  { programmeId: 'bsc-tdt', year: 3, semester: 2, code: 'TX 409', title: 'Polymeric Biomaterials Engineering', rawCredits: '8.0E', credits: 8, status: 'Elective', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-tdt', year: 3, semester: 2, code: 'TX 320', title: 'Pulp and Paper Technology', rawCredits: '8.0E', credits: 8, status: 'Elective', deptId: 'dept-mie', unitId: 'coet' },

  // YEAR 4 — SEMESTER 1
  { programmeId: 'bsc-tdt', year: 4, semester: 1, code: 'TX 498', title: 'Final Project I', rawCredits: '8.0', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-tdt', year: 4, semester: 1, code: 'TX 401', title: 'Textile and Fashion Product Development', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-tdt', year: 4, semester: 1, code: 'TX 402', title: 'Textile and Fashion Retail Promotion', rawCredits: '8.0', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-tdt', year: 4, semester: 1, code: 'TX 406', title: 'Environmental Aspects in Textile and Allied Industries', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-tdt', year: 4, semester: 1, code: 'TX 414', title: 'Textile Quality Improvement', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-tdt', year: 4, semester: 1, code: 'MG 443', title: 'Industrial Safety and Maintenance', rawCredits: '8.0E', credits: 8, status: 'Elective', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-tdt', year: 4, semester: 1, code: 'TX 408', title: 'Leather and Footwear Technology', rawCredits: '8.0E', credits: 8, status: 'Elective', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-tdt', year: 4, semester: 1, code: 'TX 314', title: 'Nonwoven Engineering Principles', rawCredits: '8.0E', credits: 8, status: 'Elective', deptId: 'dept-mie', unitId: 'coet' },

  // YEAR 4 — SEMESTER 2
  { programmeId: 'bsc-tdt', year: 4, semester: 2, code: 'TX 499', title: 'Final Project II', rawCredits: '16', credits: 16, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-tdt', year: 4, semester: 2, code: 'TX 404', title: 'Textile and Fashion Visualization', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-tdt', year: 4, semester: 2, code: 'MG 445', title: 'Entrepreneurship for Engineers', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-tdt', year: 4, semester: 2, code: 'PT 3', title: 'Practical Training III', rawCredits: '8.0', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-tdt', year: 4, semester: 2, code: 'EN 339', title: 'Principles of Industrial Energy and Environmental Management', rawCredits: '8.0E', credits: 8, status: 'Elective', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-tdt', year: 4, semester: 2, code: 'TX 415', title: 'Textile Economics', rawCredits: '12E', credits: 12, status: 'Elective', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-tdt', year: 4, semester: 2, code: 'TM 400', title: 'Engineering Ethics and Professional Conduct', rawCredits: '4.0E', credits: 4, status: 'Elective', deptId: 'dept-mie', unitId: 'coet' },
];

// PROGRAMME 4: Bachelor of Science in Textile Engineering (4 Years, dept-mie, coet)
const BSC_TE_COURSES: CourseInput[] = [
  // YEAR 1 — SEMESTER 1
  { programmeId: 'bsc-te', year: 1, semester: 1, code: 'MT 161', title: 'Matrices and Basic Calculus for Non-Majors', rawCredits: '12.0E', credits: 12, status: 'Core', deptId: 'dept-math', unitId: 'conas' },
  { programmeId: 'bsc-te', year: 1, semester: 1, code: 'CL 111', title: 'Communications Skills for Engineers', rawCredits: '12.0E', credits: 12, status: 'Core', deptId: 'dept-foreign-languages', unitId: 'cohu' },
  { programmeId: 'bsc-te', year: 1, semester: 1, code: 'DS 114', title: 'Development Perspectives I', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-dev-studies', unitId: 'ids' },
  { programmeId: 'bsc-te', year: 1, semester: 1, code: 'EE 171', title: 'Principles of Computer Programming', rawCredits: '8', credits: 8, status: 'Core', deptId: 'dept-cse', unitId: 'coet' },
  { programmeId: 'bsc-te', year: 1, semester: 1, code: 'ME 101', title: 'Engineering Drawing', rawCredits: '8', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-te', year: 1, semester: 1, code: 'SC 121', title: 'Statics', rawCredits: '12.0E', credits: 12, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { programmeId: 'bsc-te', year: 1, semester: 1, code: 'TW 119', title: 'Fundamentals of Chemical and Process Engineering and Practice', rawCredits: '6', credits: 6, status: 'Core', deptId: 'dept-cpe', unitId: 'coet' },
  { programmeId: 'bsc-te', year: 1, semester: 1, code: 'TW 151', title: 'Welding and Fabrication', rawCredits: '6', credits: 6, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },

  // YEAR 1 — SEMESTER 2
  { programmeId: 'bsc-te', year: 1, semester: 2, code: 'DS 115', title: 'Development Perspectives II', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-dev-studies', unitId: 'ids' },
  { programmeId: 'bsc-te', year: 1, semester: 2, code: 'EE 131', title: 'Fundamentals of Electronics for Engineers', rawCredits: '12', credits: 12, status: 'Core', deptId: 'dept-ee', unitId: 'coet' },
  { programmeId: 'bsc-te', year: 1, semester: 2, code: 'EE 151', title: 'Fundamentals of Electrical Engineering', rawCredits: '12', credits: 12, status: 'Core', deptId: 'dept-ee', unitId: 'coet' },
  { programmeId: 'bsc-te', year: 1, semester: 2, code: 'ME 103', title: 'Computer Aided Drafting', rawCredits: '8', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-te', year: 1, semester: 2, code: 'MT 171', title: 'Matrices and Basic Calculus for Non-Majors', rawCredits: '12', credits: 12, status: 'Core', deptId: 'dept-math', unitId: 'conas' },
  { programmeId: 'bsc-te', year: 1, semester: 2, code: 'TW 134', title: 'Electrical Machines and Installation Practice', rawCredits: '6', credits: 6, status: 'Core', deptId: 'dept-ee', unitId: 'coet' },
  { programmeId: 'bsc-te', year: 1, semester: 2, code: 'TW 140', title: 'Metal Cutting and Machine Tools Practice', rawCredits: '6', credits: 6, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-te', year: 1, semester: 2, code: 'TX 104', title: 'Fibre Science', rawCredits: '8', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },

  // YEAR 2 — SEMESTER 1
  { programmeId: 'bsc-te', year: 2, semester: 1, code: 'MT 261', title: 'Several Variables Calculus for Non-Majors', rawCredits: '12.0E', credits: 12, status: 'Core', deptId: 'dept-math', unitId: 'conas' },
  { programmeId: 'bsc-te', year: 2, semester: 1, code: 'TX 203', title: 'Introduction to Textile Processes', rawCredits: '12.0E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-te', year: 2, semester: 1, code: 'TX 202', title: 'Basic Textile Chemistry', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-te', year: 2, semester: 1, code: 'TX 201', title: 'Fibres Physics', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-te', year: 2, semester: 1, code: 'CH 117', title: 'Organic Chemistry I', rawCredits: '12.0E', credits: 12, status: 'Core', deptId: 'dept-chemistry', unitId: 'conas' },
  { programmeId: 'bsc-te', year: 2, semester: 1, code: 'TX 214', title: 'Polymer Science', rawCredits: '12.0E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },

  // YEAR 2 — SEMESTER 2
  { programmeId: 'bsc-te', year: 2, semester: 2, code: 'TX 227', title: 'Theory of Textile Structures', rawCredits: '12.0E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-te', year: 2, semester: 2, code: 'EN 226', title: 'Thermodynamics I', rawCredits: '12.0E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-te', year: 2, semester: 2, code: 'TX 204', title: 'Textile Physics', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-te', year: 2, semester: 2, code: 'TX 217', title: 'Textile Chemistry', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-te', year: 2, semester: 2, code: 'MT 271', title: 'Statistics for Non-Majors', rawCredits: '12.0E', credits: 12, status: 'Core', deptId: 'dept-math', unitId: 'conas' },
  { programmeId: 'bsc-te', year: 2, semester: 2, code: 'ME 207', title: 'Mechanics of Machines', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-te', year: 2, semester: 2, code: 'TX 207', title: 'Textile Processes', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-te', year: 2, semester: 2, code: 'PT 1', title: 'Practical Training I', rawCredits: '8.0', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },

  // YEAR 3 — SEMESTER 1
  { programmeId: 'bsc-te', year: 3, semester: 1, code: 'TX 311', title: 'Spinning Mechanics', rawCredits: '12.0E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-te', year: 3, semester: 1, code: 'TX 312', title: 'Weaving Mechanics', rawCredits: '12.0E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-te', year: 3, semester: 1, code: 'EN 326', title: 'Thermodynamics II', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-te', year: 3, semester: 1, code: 'TX 313', title: 'Knitting Technology', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-te', year: 3, semester: 1, code: 'TX 314', title: 'Nonwoven Engineering Principles', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-te', year: 3, semester: 1, code: 'TX 315', title: 'Coloration and Finishing Technology', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-te', year: 3, semester: 1, code: 'IM 205', title: 'Business Research Methods', rawCredits: '12.0E', credits: 12, status: 'Elective', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-te', year: 3, semester: 1, code: 'MG 441', title: 'Human Resource and Management', rawCredits: '8.0E', credits: 8, status: 'Elective', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-te', year: 3, semester: 1, code: 'TX 316', title: 'Yarn Design and Construction', rawCredits: '8.0E', credits: 8, status: 'Elective', deptId: 'dept-mie', unitId: 'coet' },

  // YEAR 3 — SEMESTER 2
  { programmeId: 'bsc-te', year: 3, semester: 2, code: 'TX 304', title: 'CAD/CAM for Textiles', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-te', year: 3, semester: 2, code: 'TX 322', title: 'Coloration of Textile Materials', rawCredits: '12E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-te', year: 3, semester: 2, code: 'MG 340', title: 'Engineering Operations Management I', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-te', year: 3, semester: 2, code: 'TX 317', title: 'Textile Materials Testing', rawCredits: '12.0E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-te', year: 3, semester: 2, code: 'TX 318', title: 'Textile Machinery and Maintenance', rawCredits: '12.0E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-te', year: 3, semester: 2, code: 'PT 2', title: 'Practical Training II', rawCredits: '8.0', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-te', year: 3, semester: 2, code: 'TX 409', title: 'Polymeric Biomaterials Engineering', rawCredits: '8.0E', credits: 8, status: 'Elective', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-te', year: 3, semester: 2, code: 'TX 320', title: 'Pulp and Paper Technology', rawCredits: '8.0E', credits: 8, status: 'Elective', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-te', year: 3, semester: 2, code: 'TX 321', title: 'Fabric Design and Construction', rawCredits: '8.0E', credits: 8, status: 'Elective', deptId: 'dept-mie', unitId: 'coet' },

  // YEAR 4 — SEMESTER 1
  { programmeId: 'bsc-te', year: 4, semester: 1, code: 'TX 498', title: 'Final Project I', rawCredits: '8.0', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-te', year: 4, semester: 1, code: 'TX 412', title: 'Spinning Engineering', rawCredits: '12.0E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-te', year: 4, semester: 1, code: 'TX 414', title: 'Textile Quality Improvement', rawCredits: '12.0E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-te', year: 4, semester: 1, code: 'TX 452', title: 'Colour Measurement', rawCredits: '12.0E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-te', year: 4, semester: 1, code: 'TX 450', title: 'Textile Composites', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-te', year: 4, semester: 1, code: 'MG 443', title: 'Industrial Safety and Maintenance', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-te', year: 4, semester: 1, code: 'TX 406', title: 'Environmental Aspects in Textile and Allied Industries', rawCredits: '8.0E', credits: 8, status: 'Elective', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-te', year: 4, semester: 1, code: 'TX 408', title: 'Leather and Footwear Technology', rawCredits: '8.0E', credits: 8, status: 'Elective', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-te', year: 4, semester: 1, code: 'TX 417', title: 'Technical Textiles', rawCredits: '8.0E', credits: 8, status: 'Elective', deptId: 'dept-mie', unitId: 'coet' },

  // YEAR 4 — SEMESTER 2
  { programmeId: 'bsc-te', year: 4, semester: 2, code: 'TX 499', title: 'Final Project II', rawCredits: '16.0', credits: 16, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-te', year: 4, semester: 2, code: 'TX 413', title: 'Weaving Engineering', rawCredits: '12.0E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-te', year: 4, semester: 2, code: 'MG 445', title: 'Entrepreneurship for Engineers', rawCredits: '12.0E', credits: 12, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-te', year: 4, semester: 2, code: 'TX 451', title: 'Knitting Structures', rawCredits: '8.0E', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-te', year: 4, semester: 2, code: 'PT 3', title: 'Practical Training III', rawCredits: '8.0', credits: 8, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-te', year: 4, semester: 2, code: 'EN 339', title: 'Principles of Industrial Energy and Environmental Management', rawCredits: '8.0E', credits: 8, status: 'Elective', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-te', year: 4, semester: 2, code: 'PD 431', title: 'Automation and Robotics', rawCredits: '12.0E', credits: 12, status: 'Elective', deptId: 'dept-mie', unitId: 'coet' },
  { programmeId: 'bsc-te', year: 4, semester: 2, code: 'TX 415', title: 'Textile Economics', rawCredits: '12.0E', credits: 12, status: 'Elective', deptId: 'dept-mie', unitId: 'coet' },
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
    CL111: [
      'communicationskillsforengineers',
      'communicationsskillsforengineers',
      'communicationskillsforengineering',
      'communicationskillsforengineersi',
      'communicationsskillsforengineersi',
    ],
    TX201: ['fibrephysics', 'fibresphysics'],
    EE171: ['principlesofcomputerprogramming', 'introductiontocomputersandprogrammingforengineers', 'computerprogrammingforengineers'],
    TW151: ['weldingandfabrication', 'weldingandfabricationpractice'],
    MT161: ['matricesandbasiccalculusfornonmajors'],
    SC121: ['statics'],
    MT171: ['onevariablecalculusanddifferentialequationsfornonmajors', 'onevariablecalculusanddiffequationsfornonmajors'],
    ME106: ['strengthofmaterialsi'],
    ME206: ['strengthofmaterialsii', 'strengthofmaterialii'],
    MT261: ['severalvariablecalculusfornonmajors', 'severalvariablescalculusfornonmajors'],
    ME226: ['thermodynamics'],
    MT271: ['statisticsfornonmajors', 'statisticsformathematicsnonmajors'],
    IE340: ['engineeringoperationsmanagement'],
    ME322: ['renewableenergytechnology', 'renewableenergytechnologies'],
    ME426: ['refrigerationandairconditioning'],
    IE445: ['entrepreneurshipforengineers', 'entrepreneurship'],
    IE441: ['humanresourcesmanagementforengineers', 'humanresourcemanagementforengineers', 'humanresourceandmanagement'],
    EE172: ['computerprogrammingforengineers'],
    IE354: ['engineeringprojectmanagement'],
    CH117: ['organicchemistry', 'organicchemistryi'],
    EE131: ['fundamentalsofelectronicsforengineers'],
  };

  const list = knownEquivalents[codeNorm];
  if (list) {
    const sMatch = list.some((k) => sTitleNorm.includes(k) || k.includes(sTitleNorm));
    const eMatch = list.some((k) => eTitleNorm.includes(k) || k.includes(eTitleNorm));
    if (sMatch && eMatch) return true;
  }

  return false;
}

async function run() {
  console.log('=== STARTING VENUE — COET CATALOGUE IMPORT: MECHANICAL AND INDUSTRIAL ENGINEERING ===\n');

  // STEP 1: Verify Academic Unit (DO NOT modify)
  const coetDoc = await getDoc(doc(db, 'academic_units', 'coet'));
  if (!coetDoc.exists()) {
    throw new Error('Academic Unit "coet" not found!');
  }
  console.log(`[PASS] Confirmed Academic Unit: "${coetDoc.data()?.name}" (ID: coet)`);

  // STEP 2: Verify Department (DO NOT modify)
  const mieDeptDoc = await getDoc(doc(db, 'departments', 'dept-mie'));
  if (!mieDeptDoc.exists()) {
    throw new Error('Department "dept-mie" not found!');
  }
  console.log(`[PASS] Confirmed Department: "${mieDeptDoc.data()?.name}" (ID: dept-mie, Unit: ${mieDeptDoc.data()?.academicUnitId})`);

  // STEP 3: Setup Programmes under dept-mie
  const programmesToImport = [
    {
      id: 'bsc-mech',
      name: 'Bachelor of Science in Mechanical Engineering',
      shortName: 'BSc Mech',
      durationYears: 4,
      courses: BSC_MECH_COURSES,
    },
    {
      id: 'bsc-ie',
      name: 'Bachelor of Science in Industrial Engineering',
      shortName: 'BSc IE',
      durationYears: 4,
      courses: BSC_IE_COURSES,
    },
    {
      id: 'bsc-tdt',
      name: 'Bachelor of Science in Textile Design and Technology',
      shortName: 'BSc TDT',
      durationYears: 4,
      courses: BSC_TDT_COURSES,
    },
    {
      id: 'bsc-te',
      name: 'Bachelor of Science in Textile Engineering',
      shortName: 'BSc TE',
      durationYears: 4,
      courses: BSC_TE_COURSES,
    },
  ];

  for (const prog of programmesToImport) {
    const progDoc = await getDoc(doc(db, 'programmes', prog.id));
    const progData = {
      ...(progDoc.exists() ? progDoc.data() : {}),
      id: prog.id,
      name: prog.name,
      shortName: prog.shortName,
      departmentId: 'dept-mie',
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
    console.log(`[PASS] Confirmed Programme: "${prog.name}" (${prog.id}) [${prog.durationYears} Years] under Department "dept-mie"`);
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
    actionTaken: string;
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

    // Clean up stale courses for this programme before re-populating cleanly
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
        // Canonical course exists with this code
        const primaryExisting = existingList[0];
        const primaryCanonicalId = primaryExisting.canonicalId || primaryExisting.id;
        const canonCr = Number(primaryExisting.defaultCredits ?? primaryExisting.credits);
        const canonTitle = (primaryExisting.title || '').trim();

        // Check compatibility
        const isSameAcademic = isClearlySameAcademicCourse(c.code, c.title, canonTitle);
        const creditsMatch = canonCr === c.credits;

        if (isSameAcademic && creditsMatch) {
          // Exact match or recognized equivalent title with exact credits!
          coursesReused.push(`[${c.code}] "${c.title}" (${c.credits} cr) in ${prog.id} -> Canonical: ${primaryCanonicalId}`);

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
            departmentId: 'dept-mie',
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
            departmentId: 'dept-mie',
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
            canonicalId: primaryCanonicalId,
            term: `Y${c.year}S${c.semester}`,
          });
        } else {
          // CONFLICT DETECTED: Code exists but title differs and/or credits differ!
          // Per User Rule 7:
          // - STOP that individual course import.
          // - Preserve the existing canonical course.
          // - Flag the conflict for manual review.
          // - Do not overwrite the existing record.
          const actionTaken = 'STOPPED individual course import. Preserved existing canonical course untouched. Flagged for manual review.';
          flaggedConflicts.push({
            progId: prog.id,
            code: c.code,
            suppliedTitle: c.title,
            suppliedCredits: c.credits,
            existingTitle: canonTitle,
            existingCredits: canonCr,
            actionTaken,
          });

          skippedRecords.push({
            progId: prog.id,
            code: c.code,
            title: c.title,
            credits: c.credits,
            year: c.year,
            semester: c.semester,
            status: c.status,
            reason: `Conflicting with existing canonical course [${primaryCanonicalId}] "${canonTitle}" (${canonCr} cr). Import stopped.`,
          });
        }
      } else {
        // Course code does NOT exist in canonical_courses
        // Create ONE new canonical Course record (Rule 8: create ONE canonical Course record)
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

        // Create Programme-Course relationships
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
          departmentId: 'dept-mie',
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
          departmentId: 'dept-mie',
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

  console.log('\n================ FINAL VERIFICATION READ-BACK ================');
  for (const prog of programmesToImport) {
    const pCc = await getDocs(query(collection(db, 'catalogue_courses'), where('programmeId', '==', prog.id)));
    const pPc = await getDocs(query(collection(db, 'programme_courses'), where('programmeId', '==', prog.id)));
    console.log(`Programme "${prog.name}" (${prog.id}): ${pCc.size} catalogue_courses, ${pPc.size} programme_courses`);
  }

  // Count unique canonical created and reused
  const uniqueCanonicalCreated = new Set(coursesCreated.map((s) => s.split(' -> Created: ')[1])).size;
  const uniqueCanonicalReused = new Set(coursesReused.map((s) => s.split(' -> Canonical: ')[1])).size;

  console.log('\n================ VERIFICATION METRICS ================');
  console.log(`1. Academic Unit verified: College of Engineering and Technology (CoET) [coet]`);
  console.log(`2. Department verified: Department of Mechanical and Industrial Engineering [dept-mie]`);
  console.log(`3. Number of programme-course relationships created: ${relationshipsCreated.length}`);
  console.log(`4. Number of new canonical courses created: ${uniqueCanonicalCreated}`);
  console.log(`5. Number of existing canonical courses reused: ${uniqueCanonicalReused}`);
  console.log(`6. Number of conflicts skipped: ${skippedRecords.length}`);

  console.log('\n--- 7. LIST OF ALL CONFLICTS ---');
  flaggedConflicts.forEach((fc, idx) => {
    console.log(`${idx + 1}. [${fc.code}] in ${fc.progId}`);
    console.log(`   Supplied Title: "${fc.suppliedTitle}" | Supplied Credits: ${fc.suppliedCredits}`);
    console.log(`   Existing Title: "${fc.existingTitle}" | Existing Credits: ${fc.existingCredits}`);
    console.log(`   Action Taken: ${fc.actionTaken}`);
  });

  const summaryData = {
    academicUnit: 'College of Engineering and Technology (CoET)',
    department: 'Department of Mechanical and Industrial Engineering',
    programmes: programmesToImport.map((p) => ({ id: p.id, name: p.name })),
    relationshipsCreatedCount: relationshipsCreated.length,
    canonicalCreatedCount: uniqueCanonicalCreated,
    canonicalReusedCount: uniqueCanonicalReused,
    conflictsSkippedCount: skippedRecords.length,
    conflicts: flaggedConflicts,
  };

  fs.writeFileSync('./scripts/mie_import_result.json', JSON.stringify(summaryData, null, 2));
  console.log('\nSaved summary data to scripts/mie_import_result.json');

  process.exit(0);
}

run().catch((err) => {
  console.error('MIE Import Failed:', err);
  process.exit(1);
});
