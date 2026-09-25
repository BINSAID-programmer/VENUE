import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
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

interface CourseDef {
  code: string;
  title: string;
  credits: number;
  year: number;
  semester: number;
  status: 'Core' | 'Elective';
  canonicalId: string;
  deptId: string;
  unitId: string;
}

// ==========================================
// DEPARTMENT 1: Agricultural Engineering
// Programme: Bachelor of Science in Agricultural Engineering and Mechanisation (4 Years)
// ==========================================
const BSC_AEM_COURSES: CourseDef[] = [
  // YEAR 1 — SEMESTER 1
  { code: 'MT 161', title: 'Matrices and Basic Calculus for Non-Majors', credits: 12, year: 1, semester: 1, status: 'Core', canonicalId: 'mt_161', deptId: 'dept-math', unitId: 'conas' },
  { code: 'SC 121', title: 'Statics', credits: 12, year: 1, semester: 1, status: 'Core', canonicalId: 'sc_121', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'BB 171', title: 'Introduction to Computers and Programming for Engineers', credits: 6, year: 1, semester: 1, status: 'Core', canonicalId: 'bb_171', deptId: 'dept-cse', unitId: 'coict' },
  { code: 'EE 151', title: 'Fundamentals of Electrical Engineering I', credits: 8, year: 1, semester: 1, status: 'Core', canonicalId: 'ee_151', deptId: 'dept-ee', unitId: 'coet' },
  { code: 'ME 103', title: 'Engineering Drawing', credits: 8, year: 1, semester: 1, status: 'Core', canonicalId: 'me_103', deptId: 'dept-mie', unitId: 'coet' },
  { code: 'CL 111', title: 'Communication Skills for Engineers I', credits: 12, year: 1, semester: 1, status: 'Core', canonicalId: 'cl_111', deptId: 'dept-foreign-languages', unitId: 'chss' },
  { code: 'DS 112', title: 'Development Perspectives I', credits: 12, year: 1, semester: 1, status: 'Core', canonicalId: 'ds_112', deptId: 'dept-dev-studies', unitId: 'ids' },
  { code: 'AM 111', title: 'Workshop Training I', credits: 4, year: 1, semester: 1, status: 'Core', canonicalId: 'am_111', deptId: 'dept-coaf-ae', unitId: 'coaf' },

  // YEAR 1 — SEMESTER 2
  { code: 'MT 171', title: 'One Variable Calculus and Differential Equations for Non-Majors', credits: 12, year: 1, semester: 2, status: 'Core', canonicalId: 'mt_171', deptId: 'dept-math', unitId: 'conas' },
  { code: 'EE 131', title: 'Fundamentals of Electronics for Engineers', credits: 12, year: 1, semester: 2, status: 'Core', canonicalId: 'ee_131', deptId: 'dept-ee', unitId: 'coet' },
  { code: 'EE 152', title: 'Fundamentals of Electrical Engineering II', credits: 8, year: 1, semester: 2, status: 'Core', canonicalId: 'ee_152', deptId: 'dept-ee', unitId: 'coet' },
  { code: 'ME 105', title: 'Computer Aided Drafting', credits: 8, year: 1, semester: 2, status: 'Core', canonicalId: 'me_105', deptId: 'dept-mie', unitId: 'coet' },
  { code: 'ME 106', title: 'Strength of Materials I', credits: 8, year: 1, semester: 2, status: 'Core', canonicalId: 'me_106', deptId: 'dept-mie', unitId: 'coet' },
  { code: 'DS 113', title: 'Development Perspectives II', credits: 12, year: 1, semester: 2, status: 'Core', canonicalId: 'ds_113', deptId: 'dept-dev-studies', unitId: 'ids' },
  { code: 'AM 112', title: 'Workshop Training II', credits: 4, year: 1, semester: 2, status: 'Core', canonicalId: 'am_112', deptId: 'dept-coaf-ae', unitId: 'coaf' },
  { code: 'AM 101', title: 'Introduction to Agricultural Engineering', credits: 8, year: 1, semester: 2, status: 'Core', canonicalId: 'am_101', deptId: 'dept-coaf-ae', unitId: 'coaf' },

  // YEAR 2 — SEMESTER 1
  { code: 'MT 261', title: 'Several Variable Calculus for Non-Majors', credits: 12, year: 2, semester: 1, status: 'Core', canonicalId: 'mt_261', deptId: 'dept-math', unitId: 'conas' },
  { code: 'WB 211', title: 'Fluid Mechanics for Civil Engineers', credits: 12, year: 2, semester: 1, status: 'Core', canonicalId: 'wb_211', deptId: 'dept-wre', unitId: 'coet' },
  { code: 'ME 206', title: 'Strength of Materials II', credits: 12, year: 2, semester: 1, status: 'Core', canonicalId: 'me_206', deptId: 'dept-mie', unitId: 'coet' },
  { code: 'ME 201', title: 'Design Methodology', credits: 8, year: 2, semester: 1, status: 'Core', canonicalId: 'me_201', deptId: 'dept-mie', unitId: 'coet' },
  { code: 'TR 111', title: 'Engineering Surveying I', credits: 6, year: 2, semester: 1, status: 'Core', canonicalId: 'tr_111', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'AM 201', title: 'Materials Technology for Agricultural Engineering', credits: 8, year: 2, semester: 1, status: 'Core', canonicalId: 'am_201', deptId: 'dept-coaf-ae', unitId: 'coaf' },
  { code: 'AM 203', title: 'Fundamentals of Soil Science', credits: 8, year: 2, semester: 1, status: 'Core', canonicalId: 'am_203', deptId: 'dept-coaf-ae', unitId: 'coaf' },
  { code: 'MT 271', title: 'Statistics for Mathematics Non-Majors', credits: 12, year: 2, semester: 1, status: 'Core', canonicalId: 'mt_271', deptId: 'dept-math', unitId: 'conas' },

  // YEAR 2 — SEMESTER 2
  { code: 'WB 212', title: 'Open Channels Hydraulics', credits: 8, year: 2, semester: 2, status: 'Core', canonicalId: 'wb_212', deptId: 'dept-wre', unitId: 'coet' },
  { code: 'WB 213', title: 'Hydraulics Practicals', credits: 4, year: 2, semester: 2, status: 'Core', canonicalId: 'wb_213', deptId: 'dept-wre', unitId: 'coet' },
  { code: 'ME 226', title: 'Thermodynamics', credits: 12, year: 2, semester: 2, status: 'Core', canonicalId: 'me_226', deptId: 'dept-mie', unitId: 'coet' },
  { code: 'ME 208', title: 'Dynamics', credits: 6, year: 2, semester: 2, status: 'Core', canonicalId: 'me_208', deptId: 'dept-mie', unitId: 'coet' },
  { code: 'TR 112', title: 'Engineering Surveying II', credits: 6, year: 2, semester: 2, status: 'Core', canonicalId: 'tr_112', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'AM 202', title: 'Principles of Agronomy', credits: 12, year: 2, semester: 2, status: 'Core', canonicalId: 'am_202', deptId: 'dept-coaf-ae', unitId: 'coaf' },
  { code: 'AM 200', title: 'Practical Training I', credits: 8, year: 2, semester: 2, status: 'Core', canonicalId: 'am_200', deptId: 'dept-coaf-ae', unitId: 'coaf' },

  // YEAR 3 — SEMESTER 1
  { code: 'AM 301', title: 'Engineering Properties of Biological Materials', credits: 8, year: 3, semester: 1, status: 'Core', canonicalId: 'am_301', deptId: 'dept-coaf-ae', unitId: 'coaf' },
  { code: 'ME 305', title: 'Computer Aided Design', credits: 8, year: 3, semester: 1, status: 'Core', canonicalId: 'me_305', deptId: 'dept-mie', unitId: 'coet' },
  { code: 'AM 302', title: 'Mechatronics', credits: 8, year: 3, semester: 1, status: 'Core', canonicalId: 'am_302', deptId: 'dept-coaf-ae', unitId: 'coaf' },
  { code: 'AM 310', title: 'Agricultural Machinery and Equipment', credits: 12, year: 3, semester: 1, status: 'Core', canonicalId: 'am_310', deptId: 'dept-coaf-ae', unitId: 'coaf' },
  { code: 'AM 508', title: 'Agricultural Machine Elements', credits: 12, year: 3, semester: 1, status: 'Core', canonicalId: 'am_508', deptId: 'dept-coaf-ae', unitId: 'coaf' },
  { code: 'WB 321', title: 'Engineering Hydrology', credits: 12, year: 3, semester: 1, status: 'Core', canonicalId: 'wb_321', deptId: 'dept-wre', unitId: 'coet' },
  { code: 'ME 301', title: 'Mechanical Vibration Analysis', credits: 8, year: 3, semester: 1, status: 'Elective', canonicalId: 'me_301', deptId: 'dept-mie', unitId: 'coet' },
  { code: 'AM 305', title: 'Design of Irrigation Systems', credits: 8, year: 3, semester: 1, status: 'Elective', canonicalId: 'am_305', deptId: 'dept-coaf-ae', unitId: 'coaf' },
  { code: 'AM 506', title: 'Crop Science and Management', credits: 8, year: 3, semester: 1, status: 'Elective', canonicalId: 'am_506', deptId: 'dept-coaf-ae', unitId: 'coaf' },

  // YEAR 3 — SEMESTER 2
  { code: 'ME 125', title: 'Turbomachinery', credits: 8, year: 3, semester: 2, status: 'Core', canonicalId: 'me_125', deptId: 'dept-mie', unitId: 'coet' },
  { code: 'ME 129', title: 'Internal Combustion Engines', credits: 8, year: 3, semester: 2, status: 'Core', canonicalId: 'me_129', deptId: 'dept-mie', unitId: 'coet' },
  { code: 'IE 301', title: 'Research Methods for Engineers', credits: 8, year: 3, semester: 2, status: 'Core', canonicalId: 'ie_301', deptId: 'dept-mie', unitId: 'coet' },
  { code: 'AM 307', title: 'Manufacturing Technology for Agricultural Engineers', credits: 12, year: 3, semester: 2, status: 'Core', canonicalId: 'am_307', deptId: 'dept-coaf-ae', unitId: 'coaf' },
  { code: 'AM 308', title: 'Design of Agro-Processing Machinery', credits: 8, year: 3, semester: 2, status: 'Core', canonicalId: 'am_308', deptId: 'dept-coaf-ae', unitId: 'coaf' },
  { code: 'AM 309', title: 'Agricultural Engineering Design Project', credits: 8, year: 3, semester: 2, status: 'Core', canonicalId: 'am_309', deptId: 'dept-coaf-ae', unitId: 'coaf' },
  { code: 'AM 300', title: 'Practical Training II', credits: 8, year: 3, semester: 2, status: 'Core', canonicalId: 'am_300', deptId: 'dept-coaf-ae', unitId: 'coaf' },
  { code: 'ME 322', title: 'Renewable Energy Technologies', credits: 12, year: 3, semester: 2, status: 'Elective', canonicalId: 'me_322', deptId: 'dept-mie', unitId: 'coet' },
  { code: 'AM 311', title: 'Electrical Power Systems and Machines for Non-majors', credits: 12, year: 3, semester: 2, status: 'Elective', canonicalId: 'am_311', deptId: 'dept-coaf-ae', unitId: 'coaf' },
  { code: 'AM 511', title: 'Agricultural Machinery Management', credits: 12, year: 3, semester: 2, status: 'Elective', canonicalId: 'am_511', deptId: 'dept-coaf-ae', unitId: 'coaf' },
  { code: 'AM 512', title: 'Agricultural Resources Management', credits: 12, year: 3, semester: 2, status: 'Elective', canonicalId: 'am_512', deptId: 'dept-coaf-ae', unitId: 'coaf' },

  // YEAR 4 — SEMESTER 1
  { code: 'AM 400', title: 'Practical Training III', credits: 8, year: 4, semester: 1, status: 'Core', canonicalId: 'am_400', deptId: 'dept-coaf-ae', unitId: 'coaf' },
  { code: 'AM 401', title: 'Mechanics of Farm Machinery', credits: 12, year: 4, semester: 1, status: 'Core', canonicalId: 'am_401', deptId: 'dept-coaf-ae', unitId: 'coaf' },
  { code: 'AM 402', title: 'Post-harvest Handling and Storage of Grains', credits: 8, year: 4, semester: 1, status: 'Core', canonicalId: 'am_402', deptId: 'dept-coaf-ae', unitId: 'coaf' },
  { code: 'AM 403', title: 'Precision Agriculture Technologies', credits: 8, year: 4, semester: 1, status: 'Core', canonicalId: 'am_403', deptId: 'dept-coaf-ae', unitId: 'coaf' },
  { code: 'AM 404', title: 'Fluid Power Systems', credits: 12, year: 4, semester: 1, status: 'Core', canonicalId: 'am_404', deptId: 'dept-coaf-ae', unitId: 'coaf' },
  { code: 'AM 498', title: 'Final Project I', credits: 8, year: 4, semester: 1, status: 'Core', canonicalId: 'am_498', deptId: 'dept-coaf-ae', unitId: 'coaf' },
  { code: 'ME 134', title: 'Computer Aided Manufacturing', credits: 8, year: 4, semester: 1, status: 'Elective', canonicalId: 'me_134', deptId: 'dept-mie', unitId: 'coet' },
  { code: 'AM 405', title: 'Environmental Conservation in Agriculture', credits: 8, year: 4, semester: 1, status: 'Elective', canonicalId: 'am_405', deptId: 'dept-coaf-ae', unitId: 'coaf' },
  { code: 'IE 340', title: 'Engineering Operations Management', credits: 12, year: 4, semester: 1, status: 'Elective', canonicalId: 'ie_340', deptId: 'dept-mie', unitId: 'coet' },
  { code: 'IE 354', title: 'Engineering Project Management', credits: 12, year: 4, semester: 1, status: 'Elective', canonicalId: 'ie_354', deptId: 'dept-mie', unitId: 'coet' },

  // YEAR 4 — SEMESTER 2
  { code: 'AM 406', title: 'Post-harvest Handling and Preservation of Horticultural Produce', credits: 8, year: 4, semester: 2, status: 'Core', canonicalId: 'am_406', deptId: 'dept-coaf-ae', unitId: 'coaf' },
  { code: 'AM 407', title: 'Livestock Handling Systems', credits: 8, year: 4, semester: 2, status: 'Core', canonicalId: 'am_407', deptId: 'dept-coaf-ae', unitId: 'coaf' },
  { code: 'AM 408', title: 'Ergonomics, Safety and Maintenance', credits: 12, year: 4, semester: 2, status: 'Core', canonicalId: 'am_408', deptId: 'dept-coaf-ae', unitId: 'coaf' },
  { code: 'ME 426', title: 'Refrigeration and Air Conditioning', credits: 8, year: 4, semester: 2, status: 'Core', canonicalId: 'me_426', deptId: 'dept-mie', unitId: 'coet' },
  { code: 'EC 410', title: 'General Engineering Procedures and Ethics', credits: 12, year: 4, semester: 2, status: 'Core', canonicalId: 'ec_410', deptId: 'dept-mie', unitId: 'coet' },
  { code: 'AM 410', title: 'Aquaculture Engineering', credits: 8, year: 4, semester: 2, status: 'Core', canonicalId: 'am_410', deptId: 'dept-coaf-ae', unitId: 'coaf' },
  { code: 'AM 499', title: 'Final Project II', credits: 12, year: 4, semester: 2, status: 'Core', canonicalId: 'am_499', deptId: 'dept-coaf-ae', unitId: 'coaf' },
  { code: 'AM 411', title: 'Design of Small Dams', credits: 8, year: 4, semester: 2, status: 'Elective', canonicalId: 'am_411', deptId: 'dept-coaf-ae', unitId: 'coaf' },
  { code: 'IE 465', title: 'Entrepreneurship for Engineers', credits: 12, year: 4, semester: 2, status: 'Elective', canonicalId: 'ie_465', deptId: 'dept-mie', unitId: 'coet' },
  { code: 'AM 412', title: 'Financial and Human Resource Management', credits: 8, year: 4, semester: 2, status: 'Elective', canonicalId: 'am_412', deptId: 'dept-coaf-ae', unitId: 'coaf' },
];

// ==========================================
// DEPARTMENT 2: Agricultural Economics and Business
// Programme: Bachelor of Science in Agricultural and Natural Resources Economics and Business (BSc ANEB) (3 Years)
// ==========================================
const BSC_ANEB_COURSES: CourseDef[] = [
  // YEAR 1 — SEMESTER 1
  { code: 'EC 116', title: 'Introductory Microeconomics I', credits: 12, year: 1, semester: 1, status: 'Core', canonicalId: 'ec_116', deptId: 'dept-economics', unitId: 'udse' },
  { code: 'EC 117', title: 'Introductory Macroeconomics I', credits: 12, year: 1, semester: 1, status: 'Core', canonicalId: 'ec_117', deptId: 'dept-economics', unitId: 'udse' },
  { code: 'AC 100', title: 'Principles of Accounting I', credits: 12, year: 1, semester: 1, status: 'Core', canonicalId: 'ac_100', deptId: 'dept-accounting', unitId: 'udbs' },
  { code: 'EB 100', title: 'Agricultural Economics', credits: 12, year: 1, semester: 1, status: 'Core', canonicalId: 'eb_100', deptId: 'dept-coaf-aeb', unitId: 'coaf' },
  { code: 'DS 112', title: 'Development Perspectives I', credits: 12, year: 1, semester: 1, status: 'Core', canonicalId: 'ds_112', deptId: 'dept-dev-studies', unitId: 'ids' },
  { code: 'EB 101', title: 'Natural Resources Economics I', credits: 12, year: 1, semester: 1, status: 'Core', canonicalId: 'eb_101', deptId: 'dept-coaf-aeb', unitId: 'coaf' },

  // YEAR 1 — SEMESTER 2
  { code: 'EC 126', title: 'Introductory Microeconomics II', credits: 12, year: 1, semester: 2, status: 'Core', canonicalId: 'ec_126', deptId: 'dept-economics', unitId: 'udse' },
  { code: 'EC 127', title: 'Introductory Macroeconomics II', credits: 12, year: 1, semester: 2, status: 'Core', canonicalId: 'ec_127', deptId: 'dept-economics', unitId: 'udse' },
  { code: 'AC 101', title: 'Principles of Accounting II', credits: 12, year: 1, semester: 2, status: 'Core', canonicalId: 'ac_101', deptId: 'dept-accounting', unitId: 'udbs' },
  { code: 'EB 103', title: 'Entrepreneurship and Innovation I', credits: 12, year: 1, semester: 2, status: 'Core', canonicalId: 'eb_103', deptId: 'dept-coaf-aeb', unitId: 'coaf' },
  { code: 'DS 113', title: 'Development Perspectives II', credits: 12, year: 1, semester: 2, status: 'Core', canonicalId: 'ds_113', deptId: 'dept-dev-studies', unitId: 'ids' },
  { code: 'EB 102', title: 'Natural Resources Economics II', credits: 12, year: 1, semester: 2, status: 'Core', canonicalId: 'eb_102', deptId: 'dept-coaf-aeb', unitId: 'coaf' },

  // YEAR 2 — SEMESTER 1
  { code: 'EC 216', title: 'Intermediate Microeconomics I', credits: 12, year: 2, semester: 1, status: 'Core', canonicalId: 'ec_216', deptId: 'dept-economics', unitId: 'udse' },
  { code: 'EC 217', title: 'Intermediate Macroeconomics I', credits: 12, year: 2, semester: 1, status: 'Core', canonicalId: 'ec_217', deptId: 'dept-economics', unitId: 'udse' },
  { code: 'EB 201', title: 'Agricultural Products Marketing I', credits: 12, year: 2, semester: 1, status: 'Core', canonicalId: 'eb_201', deptId: 'dept-coaf-aeb', unitId: 'coaf' },
  { code: 'EC 218', title: 'Quantitative Methods I', credits: 12, year: 2, semester: 1, status: 'Core', canonicalId: 'ec_218', deptId: 'dept-economics', unitId: 'udse' },
  { code: 'EC 219', title: 'Econometrics I', credits: 12, year: 2, semester: 1, status: 'Core', canonicalId: 'ec_219', deptId: 'dept-economics', unitId: 'udse' },
  { code: 'EB 200', title: 'Agribusiness Management', credits: 12, year: 2, semester: 1, status: 'Core', canonicalId: 'eb_200', deptId: 'dept-coaf-aeb', unitId: 'coaf' },

  // YEAR 2 — SEMESTER 2
  { code: 'EC 220', title: 'Development Economics', credits: 12, year: 2, semester: 2, status: 'Core', canonicalId: 'ec_220', deptId: 'dept-economics', unitId: 'udse' },
  { code: 'EC 228', title: 'Quantitative Methods II', credits: 12, year: 2, semester: 2, status: 'Core', canonicalId: 'ec_228', deptId: 'dept-economics', unitId: 'udse' },
  { code: 'EC 229', title: 'Econometrics II', credits: 12, year: 2, semester: 2, status: 'Core', canonicalId: 'ec_229', deptId: 'dept-economics', unitId: 'udse' },
  { code: 'EB 202', title: 'Agricultural Products Marketing II', credits: 12, year: 2, semester: 2, status: 'Core', canonicalId: 'eb_202', deptId: 'dept-coaf-aeb', unitId: 'coaf' },
  { code: 'EB 204', title: 'Business Planning', credits: 12, year: 2, semester: 2, status: 'Core', canonicalId: 'eb_204', deptId: 'dept-coaf-aeb', unitId: 'coaf' },
  { code: 'EB 203', title: 'Fishery Economics and Management', credits: 12, year: 2, semester: 2, status: 'Core', canonicalId: 'eb_203', deptId: 'dept-coaf-aeb', unitId: 'coaf' },
  { code: 'EB 310', title: 'Practical Training', credits: 12, year: 2, semester: 2, status: 'Core', canonicalId: 'eb_310', deptId: 'dept-coaf-aeb', unitId: 'coaf' },

  // YEAR 3 — SEMESTER 1
  { code: 'EB 303', title: 'Entrepreneurship and Innovation II', credits: 12, year: 3, semester: 1, status: 'Core', canonicalId: 'eb_303', deptId: 'dept-coaf-aeb', unitId: 'coaf' },
  { code: 'EB 304', title: 'Economics of Agricultural Marketing I', credits: 12, year: 3, semester: 1, status: 'Core', canonicalId: 'eb_304', deptId: 'dept-coaf-aeb', unitId: 'coaf' },
  { code: 'EB 300', title: 'Economic Management and Policy Analysis', credits: 12, year: 3, semester: 1, status: 'Core', canonicalId: 'eb_300', deptId: 'dept-coaf-aeb', unitId: 'coaf' },
  { code: 'EB 301', title: 'Natural Resource Accounting', credits: 12, year: 3, semester: 1, status: 'Core', canonicalId: 'eb_301', deptId: 'dept-coaf-aeb', unitId: 'coaf' },
  { code: 'EB 302', title: 'Applied Econometrics', credits: 12, year: 3, semester: 1, status: 'Core', canonicalId: 'eb_302', deptId: 'dept-coaf-aeb', unitId: 'coaf' },
  { code: 'EC 372', title: 'Public Sector Economics I', credits: 12, year: 3, semester: 1, status: 'Core', canonicalId: 'ec_372', deptId: 'dept-economics', unitId: 'udse' },

  // YEAR 3 — SEMESTER 2
  { code: 'EB 308', title: 'Management Information Systems', credits: 12, year: 3, semester: 2, status: 'Core', canonicalId: 'eb_308', deptId: 'dept-coaf-aeb', unitId: 'coaf' },
  { code: 'EB 306', title: 'Project Appraisal and Techniques', credits: 12, year: 3, semester: 2, status: 'Core', canonicalId: 'eb_306', deptId: 'dept-coaf-aeb', unitId: 'coaf' },
  { code: 'EB 305', title: 'Economics of Agricultural Marketing II', credits: 12, year: 3, semester: 2, status: 'Core', canonicalId: 'eb_305', deptId: 'dept-coaf-aeb', unitId: 'coaf' },
  { code: 'EC 377', title: 'Industrial Economics', credits: 12, year: 3, semester: 2, status: 'Core', canonicalId: 'ec_377', deptId: 'dept-economics', unitId: 'udse' },
  { code: 'EB 309', title: 'Environmental Economics', credits: 12, year: 3, semester: 2, status: 'Core', canonicalId: 'eb_309', deptId: 'dept-coaf-aeb', unitId: 'coaf' },
  { code: 'EC 382', title: 'Public Sector Economics II', credits: 12, year: 3, semester: 2, status: 'Core', canonicalId: 'ec_382', deptId: 'dept-economics', unitId: 'udse' },
];

async function runImport() {
  console.log('=== STARTING UDSM COAF CATALOGUE IMPORT ===');

  // STEP 1: Verify Existing Academic Unit (CoAF)
  const coafDoc = await getDoc(doc(db, 'academic_units', 'coaf'));
  if (!coafDoc.exists()) {
    throw new Error('Academic unit "coaf" not found in Firestore!');
  }
  const coafUnitData = coafDoc.data();
  console.log(`[PASS] Reused Academic Unit: "${coafUnitData?.name}" (ID: coaf)`);

  // STEP 2: Verify Existing Departments
  const aeDept = await getDoc(doc(db, 'departments', 'dept-coaf-ae'));
  if (!aeDept.exists()) {
    throw new Error('Department "dept-coaf-ae" not found in Firestore!');
  }
  const aebDept = await getDoc(doc(db, 'departments', 'dept-coaf-aeb'));
  if (!aebDept.exists()) {
    throw new Error('Department "dept-coaf-aeb" not found in Firestore!');
  }
  console.log(`[PASS] Reused Department 1: "${aeDept.data()?.name}" (ID: dept-coaf-ae)`);
  console.log(`[PASS] Reused Department 2: "${aebDept.data()?.name}" (ID: dept-coaf-aeb)`);

  // STEP 3: Reuse Existing Programmes
  // Programme 1: bsc-aem
  const aemProgRef = doc(db, 'programmes', 'bsc-aem');
  const aemProgSnap = await getDoc(aemProgRef);
  const aemProgData = {
    id: 'bsc-aem',
    name: 'Bachelor of Science in Agricultural Engineering and Mechanisation',
    shortName: 'BSc AEM',
    awardLevel: 'Bachelor Degree',
    academicUnitId: 'coaf',
    departmentId: 'dept-coaf-ae',
    durationYears: 4,
    studyMode: 'Full-Time',
    universityId: 'udsm',
    academicYear: '2025/2026',
    verified: true,
    source: OFFICIAL_SOURCE,
  };
  await setDoc(aemProgRef, aemProgData, { merge: true });
  console.log(`[PASS] Programme 1: Reused and confirmed "bsc-aem"`);

  // Programme 2: bsc-aneb
  const anebProgRef = doc(db, 'programmes', 'bsc-aneb');
  const anebProgSnap = await getDoc(anebProgRef);
  const anebProgData = {
    id: 'bsc-aneb',
    name: 'Bachelor of Science in Agricultural and Natural Resources Economics and Business',
    shortName: 'BSc ANEB',
    awardLevel: 'Bachelor Degree',
    academicUnitId: 'coaf',
    departmentId: 'dept-coaf-aeb',
    durationYears: 3,
    studyMode: 'Full-Time',
    universityId: 'udsm',
    academicYear: '2025/2026',
    verified: true,
    source: OFFICIAL_SOURCE,
  };
  await setDoc(anebProgRef, anebProgData, { merge: true });
  console.log(`[PASS] Programme 2: Reused and confirmed "bsc-aneb"`);

  // STEP 4: Canonical Courses Processing & Deduplication
  const canonicalSnap = await getDocs(collection(db, 'canonical_courses'));
  const canonicalMap = new Map<string, any>();
  canonicalSnap.docs.forEach((d) => {
    canonicalMap.set(d.id, d.data());
  });

  let canonicalAdded = 0;
  let canonicalReused = 0;
  const processedCanonicalIds = new Set<string>();

  const allCourses = [...BSC_AEM_COURSES, ...BSC_ANEB_COURSES];
  let currentBatch = writeBatch(db);
  let batchCount = 0;

  async function flushBatch() {
    if (batchCount > 0) {
      await currentBatch.commit();
      currentBatch = writeBatch(db);
      batchCount = 0;
    }
  }

  for (const c of allCourses) {
    if (processedCanonicalIds.has(c.canonicalId)) {
      continue;
    }
    processedCanonicalIds.add(c.canonicalId);

    if (canonicalMap.has(c.canonicalId)) {
      canonicalReused++;
    } else {
      const canonicalRecord = {
        id: c.canonicalId,
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
      currentBatch.set(doc(db, 'canonical_courses', c.canonicalId), canonicalRecord, { merge: true });
      batchCount++;
      if (batchCount >= 400) await flushBatch();
      canonicalMap.set(c.canonicalId, canonicalRecord);
      canonicalAdded++;
    }
  }
  await flushBatch();
  console.log(`[PASS] Canonical courses: ${canonicalAdded} new added, ${canonicalReused} existing reused.`);

  // STEP 5: Clean up old synthetic placeholders for bsc-aem
  const currentAemCCSnap = await getDocs(query(collection(db, 'catalogue_courses'), where('programmeId', '==', 'bsc-aem')));
  const currentAemPCSnap = await getDocs(query(collection(db, 'programme_courses'), where('programmeId', '==', 'bsc-aem')));

  const validAemCodes = new Set(BSC_AEM_COURSES.map((c) => c.code.toUpperCase()));
  let obsoleteRemoved = 0;

  for (const d of currentAemCCSnap.docs) {
    const data = d.data();
    if (!validAemCodes.has((data.code || '').toUpperCase())) {
      currentBatch.delete(d.ref);
      batchCount++;
      if (batchCount >= 400) await flushBatch();
      obsoleteRemoved++;
    }
  }

  for (const d of currentAemPCSnap.docs) {
    const data = d.data();
    if (!validAemCodes.has((data.code || '').toUpperCase())) {
      currentBatch.delete(d.ref);
      batchCount++;
      if (batchCount >= 400) await flushBatch();
    }
  }
  await flushBatch();
  console.log(`[PASS] Obsolete placeholders removed for bsc-aem: ${obsoleteRemoved}`);

  // STEP 6: Programme-Course & Catalogue-Courses Writes
  let pcRelationshipsAddedOrCorrected = 0;

  // Process BSC_AEM
  for (const c of BSC_AEM_COURSES) {
    const pcId = `bsc-aem_${c.canonicalId}`;
    const codeLowerDash = c.code.toLowerCase().replace(/\s+/g, '-');
    const ccId = `udsm_bsc-aem_${codeLowerDash}`;

    const pcData = {
      id: pcId,
      programmeId: 'bsc-aem',
      courseId: c.canonicalId,
      code: c.code,
      title: c.title,
      credits: c.credits,
      yearOfStudy: c.year,
      semester: c.semester,
      status: c.status,
      universityId: 'udsm',
      academicUnitId: 'coaf',
      departmentId: 'dept-coaf-ae',
      verified: true,
      source: OFFICIAL_SOURCE,
      academicYear: '2025/2026',
      sourceType: 'official_prospectus',
    };

    const ccData = {
      id: ccId,
      universityId: 'udsm',
      academicUnitId: 'coaf',
      departmentId: 'dept-coaf-ae',
      programmeId: 'bsc-aem',
      canonicalCourseId: c.canonicalId,
      code: c.code,
      title: c.title,
      credits: c.credits,
      yearOfStudy: c.year,
      semester: c.semester,
      status: c.status,
      verified: true,
      source: OFFICIAL_SOURCE,
      academicYear: '2025/2026',
      sourceType: 'official_prospectus',
    };

    currentBatch.set(doc(db, 'programme_courses', pcId), pcData, { merge: true });
    batchCount++;
    if (batchCount >= 400) await flushBatch();

    currentBatch.set(doc(db, 'catalogue_courses', ccId), ccData, { merge: true });
    batchCount++;
    if (batchCount >= 400) await flushBatch();

    pcRelationshipsAddedOrCorrected++;
  }

  // Process BSC_ANEB
  for (const c of BSC_ANEB_COURSES) {
    const pcId = `bsc-aneb_${c.canonicalId}`;
    const codeLowerDash = c.code.toLowerCase().replace(/\s+/g, '-');
    const ccId = `udsm_bsc-aneb_${codeLowerDash}`;

    const pcData = {
      id: pcId,
      programmeId: 'bsc-aneb',
      courseId: c.canonicalId,
      code: c.code,
      title: c.title,
      credits: c.credits,
      yearOfStudy: c.year,
      semester: c.semester,
      status: c.status,
      universityId: 'udsm',
      academicUnitId: 'coaf',
      departmentId: 'dept-coaf-aeb',
      verified: true,
      source: OFFICIAL_SOURCE,
      academicYear: '2025/2026',
      sourceType: 'official_prospectus',
    };

    const ccData = {
      id: ccId,
      universityId: 'udsm',
      academicUnitId: 'coaf',
      departmentId: 'dept-coaf-aeb',
      programmeId: 'bsc-aneb',
      canonicalCourseId: c.canonicalId,
      code: c.code,
      title: c.title,
      credits: c.credits,
      yearOfStudy: c.year,
      semester: c.semester,
      status: c.status,
      verified: true,
      source: OFFICIAL_SOURCE,
      academicYear: '2025/2026',
      sourceType: 'official_prospectus',
    };

    currentBatch.set(doc(db, 'programme_courses', pcId), pcData, { merge: true });
    batchCount++;
    if (batchCount >= 400) await flushBatch();

    currentBatch.set(doc(db, 'catalogue_courses', ccId), ccData, { merge: true });
    batchCount++;
    if (batchCount >= 400) await flushBatch();

    pcRelationshipsAddedOrCorrected++;
  }

  await flushBatch();
  console.log(`[PASS] Programme-Course relationships added/corrected: ${pcRelationshipsAddedOrCorrected}`);

  // STEP 7: Verification & Read-back
  console.log('\n--- VERIFICATION & READ-BACK ---');

  // Verify BSC_AEM courses
  const verifyAemCCSnap = await getDocs(query(collection(db, 'catalogue_courses'), where('programmeId', '==', 'bsc-aem')));
  console.log(`BSc AEM catalogue_courses in Firestore: ${verifyAemCCSnap.size} (Expected: 71)`);
  if (verifyAemCCSnap.size !== 71) {
    throw new Error(`Expected 71 catalogue courses for bsc-aem, got ${verifyAemCCSnap.size}`);
  }

  // Verify BSC_ANEB courses
  const verifyAnebCCSnap = await getDocs(query(collection(db, 'catalogue_courses'), where('programmeId', '==', 'bsc-aneb')));
  console.log(`BSc ANEB catalogue_courses in Firestore: ${verifyAnebCCSnap.size} (Expected: 37)`);
  if (verifyAnebCCSnap.size !== 37) {
    throw new Error(`Expected 37 catalogue courses for bsc-aneb, got ${verifyAnebCCSnap.size}`);
  }

  // Verify all supplied courses exist with exact code, title, credits, status, year, semester
  const aemMap = new Map<string, any>();
  verifyAemCCSnap.docs.forEach((d) => aemMap.set(d.data().code, d.data()));

  for (const c of BSC_AEM_COURSES) {
    const found = aemMap.get(c.code);
    if (!found) throw new Error(`Missing bsc-aem course: ${c.code}`);
    if (found.title !== c.title) throw new Error(`Title mismatch for ${c.code}: "${found.title}" vs "${c.title}"`);
    if (found.credits !== c.credits) throw new Error(`Credits mismatch for ${c.code}: ${found.credits} vs ${c.credits}`);
    if (found.status !== c.status) throw new Error(`Status mismatch for ${c.code}: ${found.status} vs ${c.status}`);
    if (found.yearOfStudy !== c.year) throw new Error(`Year mismatch for ${c.code}: ${found.yearOfStudy} vs ${c.year}`);
    if (found.semester !== c.semester) throw new Error(`Semester mismatch for ${c.code}: ${found.semester} vs ${c.semester}`);
  }

  const anebMap = new Map<string, any>();
  verifyAnebCCSnap.docs.forEach((d) => anebMap.set(d.data().code, d.data()));

  for (const c of BSC_ANEB_COURSES) {
    const found = anebMap.get(c.code);
    if (!found) throw new Error(`Missing bsc-aneb course: ${c.code}`);
    if (found.title !== c.title) throw new Error(`Title mismatch for ${c.code}: "${found.title}" vs "${c.title}"`);
    if (found.credits !== c.credits) throw new Error(`Credits mismatch for ${c.code}: ${found.credits} vs ${c.credits}`);
    if (found.status !== c.status) throw new Error(`Status mismatch for ${c.code}: ${found.status} vs ${c.status}`);
    if (found.yearOfStudy !== c.year) throw new Error(`Year mismatch for ${c.code}: ${found.yearOfStudy} vs ${c.year}`);
    if (found.semester !== c.semester) throw new Error(`Semester mismatch for ${c.code}: ${found.semester} vs ${c.semester}`);
  }

  // Verify shared courses (DS 112 and DS 113) reuse the SAME canonical course ID
  const ds112Aem = aemMap.get('DS 112');
  const ds112Aneb = anebMap.get('DS 112');
  if (ds112Aem.canonicalCourseId !== ds112Aneb.canonicalCourseId) {
    throw new Error('DS 112 canonicalCourseId mismatch between programmes!');
  }
  const ds113Aem = aemMap.get('DS 113');
  const ds113Aneb = anebMap.get('DS 113');
  if (ds113Aem.canonicalCourseId !== ds113Aneb.canonicalCourseId) {
    throw new Error('DS 113 canonicalCourseId mismatch between programmes!');
  }
  console.log(`[PASS] Shared courses (DS 112, DS 113) verified pointing to canonical: ${ds112Aem.canonicalCourseId}, ${ds113Aem.canonicalCourseId}`);

  // Verify Academic Units & Departments unchanged
  const postCoaf = await getDoc(doc(db, 'academic_units', 'coaf'));
  const postAe = await getDoc(doc(db, 'departments', 'dept-coaf-ae'));
  const postAeb = await getDoc(doc(db, 'departments', 'dept-coaf-aeb'));

  if (!postCoaf.exists() || postCoaf.data()?.name !== coafUnitData?.name) {
    throw new Error('Academic unit CoAF was modified!');
  }
  if (!postAe.exists() || !postAeb.exists()) {
    throw new Error('Departments were modified!');
  }
  console.log('[PASS] Academic Unit and Departments verified unchanged.');

  console.log('\n=== IMPORT & VERIFICATION COMPLETE ===');
  console.log({
    canonicalAdded,
    canonicalReused,
    pcRelationshipsAddedOrCorrected,
    aemCoursesTotal: verifyAemCCSnap.size,
    anebCoursesTotal: verifyAnebCCSnap.size,
  });

  process.exit(0);
}

runImport().catch((err) => {
  console.error('FATAL ERROR:', err);
  process.exit(1);
});
