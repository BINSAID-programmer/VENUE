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
  deptId: string;
  unitId: string;
}

// ==========================================
// PROGRAMME 1: Bachelor of Science in Beekeeping Science and Technology (3 Years)
// Department: Department of Crop Sciences and Beekeeping Technology (dept-coaf-csbt)
// ==========================================
const BSC_BST_COURSES: CourseDef[] = [
  // YEAR 1 — SEMESTER 1
  { code: 'AP 101', title: 'Introduction to Beekeeping', credits: 8, year: 1, semester: 1, status: 'Core', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'BT 138', title: 'Evolutionary Botany', credits: 12, year: 1, semester: 1, status: 'Core', deptId: 'dept-botany', unitId: 'conas' },
  { code: 'DS 112', title: 'Development Perspectives I', credits: 12, year: 1, semester: 1, status: 'Core', deptId: 'dept-dev-studies', unitId: 'ids' },
  { code: 'MC 100', title: 'Fundamentals of Microbiology', credits: 12, year: 1, semester: 1, status: 'Core', deptId: 'dept-molecular-biology', unitId: 'conas' },
  { code: 'MT 111', title: 'Mathematics for Biological and Chemical Sciences', credits: 8, year: 1, semester: 1, status: 'Core', deptId: 'dept-math', unitId: 'conas' },
  { code: 'ZL 121', title: 'Invertebrate Zoology', credits: 8, year: 1, semester: 1, status: 'Core', deptId: 'dept-zoology', unitId: 'conas' },
  { code: 'BL 111', title: 'Introductory Cell Biology and Genetics', credits: 12, year: 1, semester: 1, status: 'Elective', deptId: 'dept-botany', unitId: 'conas' },
  { code: 'CH 118', title: 'Basic Analytical and Physical Chemistry', credits: 12, year: 1, semester: 1, status: 'Elective', deptId: 'dept-chemistry', unitId: 'conas' },

  // YEAR 1 — SEMESTER 2
  { code: 'AP 102', title: 'Honey Bee Behaviour', credits: 8, year: 1, semester: 2, status: 'Core', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'AP 103', title: 'Honey Production Technologies', credits: 12, year: 1, semester: 2, status: 'Core', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'BT 113', title: 'Introduction to Plant Physiology', credits: 8, year: 1, semester: 2, status: 'Core', deptId: 'dept-botany', unitId: 'conas' },
  { code: 'CH 113', title: 'Chemistry for Life Sciences Students', credits: 12, year: 1, semester: 2, status: 'Core', deptId: 'dept-chemistry', unitId: 'conas' },
  { code: 'DS 113', title: 'Development Perspectives II', credits: 12, year: 1, semester: 2, status: 'Core', deptId: 'dept-dev-studies', unitId: 'ids' },
  { code: 'FS 100', title: 'Introduction to Food Science and Technology', credits: 8, year: 1, semester: 2, status: 'Core', deptId: 'dept-coaf-fst', unitId: 'coaf' },
  { code: 'FS 101', title: 'Introduction to Food Microbiology', credits: 12, year: 1, semester: 2, status: 'Core', deptId: 'dept-coaf-fst', unitId: 'coaf' },
  { code: 'BL 113', title: 'Ecology I', credits: 8, year: 1, semester: 2, status: 'Elective', deptId: 'dept-botany', unitId: 'conas' },
  { code: 'CL 107', title: 'Communication Skills for Science Students', credits: 12, year: 1, semester: 2, status: 'Elective', deptId: 'dept-foreign-languages', unitId: 'chss' },
  { code: 'WS 101', title: 'Ecology and Utilisation of Natural Resources', credits: 8, year: 1, semester: 2, status: 'Elective', deptId: 'dept-zoology', unitId: 'conas' },

  // YEAR 2 — SEMESTER 1
  { code: 'AP 200', title: 'Practical Training I', credits: 8, year: 2, semester: 1, status: 'Core', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'AP 201', title: 'Honeybee Anatomy and Physiology', credits: 12, year: 2, semester: 1, status: 'Core', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'BT 225', title: 'Taxonomy of Higher Plants', credits: 12, year: 2, semester: 1, status: 'Core', deptId: 'dept-botany', unitId: 'conas' },
  { code: 'ZL 236', title: 'Introductory Entomology and Parasitology', credits: 12, year: 2, semester: 1, status: 'Core', deptId: 'dept-zoology', unitId: 'conas' },
  { code: 'BL 207', title: 'Immunology', credits: 8, year: 2, semester: 1, status: 'Elective', deptId: 'dept-molecular-biology', unitId: 'conas' },
  { code: 'EV 200', title: 'Environmental Science I', credits: 8, year: 2, semester: 1, status: 'Elective', deptId: 'dept-chemistry', unitId: 'conas' },
  { code: 'SC 215', title: 'Scientific Methods', credits: 8, year: 2, semester: 1, status: 'Elective', deptId: 'dept-math', unitId: 'conas' },

  // YEAR 2 — SEMESTER 2
  { code: 'AP 202', title: 'Pollination Ecology', credits: 12, year: 2, semester: 2, status: 'Core', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'AP 203', title: 'Beekeeping Management', credits: 12, year: 2, semester: 2, status: 'Core', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'AP 204', title: 'Agro-Forestry', credits: 12, year: 2, semester: 2, status: 'Core', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'AP 205', title: 'Chemistry of Bee Products', credits: 12, year: 2, semester: 2, status: 'Core', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'BL 234', title: 'Biostatistics I', credits: 8, year: 2, semester: 2, status: 'Core', deptId: 'dept-botany', unitId: 'conas' },
  { code: 'BN 232', title: 'Food Biotechnology', credits: 12, year: 2, semester: 2, status: 'Core', deptId: 'dept-molecular-biology', unitId: 'conas' },
  { code: 'MC 206', title: 'Food Microbiology and Processing', credits: 12, year: 2, semester: 2, status: 'Core', deptId: 'dept-molecular-biology', unitId: 'conas' },
  { code: 'ZL 229', title: 'Insect Physiology and Pathology', credits: 8, year: 2, semester: 2, status: 'Core', deptId: 'dept-zoology', unitId: 'conas' },
  { code: 'BT 215', title: 'Introduction to Mycology', credits: 8, year: 2, semester: 2, status: 'Elective', deptId: 'dept-botany', unitId: 'conas' },
  { code: 'BT 217', title: 'Plant Genetics and Evolution', credits: 8, year: 2, semester: 2, status: 'Elective', deptId: 'dept-botany', unitId: 'conas' },
  { code: 'FS 202', title: 'Advanced Food Microbiology', credits: 12, year: 2, semester: 2, status: 'Elective', deptId: 'dept-coaf-fst', unitId: 'coaf' },
  { code: 'GY 245', title: 'Remote Sensing and GIS', credits: 12, year: 2, semester: 2, status: 'Elective', deptId: 'dept-geosciences', unitId: 'somg' },

  // YEAR 3 — SEMESTER 1
  { code: 'AP 300', title: 'Practical Training II', credits: 8, year: 3, semester: 1, status: 'Core', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'AP 302', title: 'Honeybee Genetics and Breeding', credits: 12, year: 3, semester: 1, status: 'Core', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'AP 303', title: 'Legal and Policy Framework in Apiculture', credits: 12, year: 3, semester: 1, status: 'Core', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'AP 304', title: 'Beekeeping Extension and Marketing', credits: 12, year: 3, semester: 1, status: 'Core', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'AP 306', title: 'Apibusiness', credits: 12, year: 3, semester: 1, status: 'Core', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'AP 308', title: 'Environmental Conservation and Fire Ecology', credits: 12, year: 3, semester: 1, status: 'Core', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'BL 314', title: 'Biostatistics II', credits: 8, year: 3, semester: 1, status: 'Elective', deptId: 'dept-botany', unitId: 'conas' },
  { code: 'ZL 334', title: 'Insect Systematics', credits: 12, year: 3, semester: 1, status: 'Elective', deptId: 'dept-zoology', unitId: 'conas' },
  { code: 'ZL 336', title: 'Entomology', credits: 12, year: 3, semester: 1, status: 'Elective', deptId: 'dept-zoology', unitId: 'conas' },

  // YEAR 3 — SEMESTER 2
  { code: 'AP 301', title: 'Bee Products, Processing Technologies and Value Addition', credits: 12, year: 3, semester: 2, status: 'Core', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'AP 305', title: 'Bee Pests and Diseases', credits: 12, year: 3, semester: 2, status: 'Core', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'AP 307', title: 'Apicultural Economics', credits: 8, year: 3, semester: 2, status: 'Core', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'AP 309', title: 'Beekeeping Entrepreneurship', credits: 8, year: 3, semester: 2, status: 'Core', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'AP 399', title: 'Research Project', credits: 12, year: 3, semester: 2, status: 'Core', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'FS 309', title: 'Functional Foods and Nutraceuticals', credits: 12, year: 3, semester: 2, status: 'Core', deptId: 'dept-coaf-fst', unitId: 'coaf' },
  { code: 'WS 311', title: 'Tourism and Recreational Management', credits: 8, year: 3, semester: 2, status: 'Elective', deptId: 'dept-zoology', unitId: 'conas' },
  { code: 'ZL 333', title: 'Insect Ecology', credits: 12, year: 3, semester: 2, status: 'Elective', deptId: 'dept-zoology', unitId: 'conas' },
];

// ==========================================
// PROGRAMME 2: Bachelor of Science in Crop Science and Technology (3 Years)
// Department: Department of Crop Sciences and Beekeeping Technology (dept-coaf-csbt)
// ==========================================
const BSC_CST_COURSES: CourseDef[] = [
  // YEAR 1 — SEMESTER 1
  { code: 'DS 112', title: 'Development Perspectives I', credits: 12, year: 1, semester: 1, status: 'Core', deptId: 'dept-dev-studies', unitId: 'ids' },
  { code: 'AG 101', title: 'Introduction to Agriculture', credits: 8, year: 1, semester: 1, status: 'Core', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'AG 102', title: 'Field Crops Production I', credits: 8, year: 1, semester: 1, status: 'Core', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'IS 131', title: 'Introduction to Informatics and Microcomputers', credits: 8, year: 1, semester: 1, status: 'Core', deptId: 'dept-cse', unitId: 'coict' },
  { code: 'AG 105', title: 'Horticulture I: Principles of Horticulture Production', credits: 8, year: 1, semester: 1, status: 'Core', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'AG 104', title: 'Urban and Peri-Urban Agriculture (UPA) I', credits: 8, year: 1, semester: 1, status: 'Core', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'MT 111', title: 'Mathematics for Biological and Chemical Sciences', credits: 8, year: 1, semester: 1, status: 'Core', deptId: 'dept-math', unitId: 'conas' },
  { code: 'AG 108', title: 'Introduction to Soil Science', credits: 8, year: 1, semester: 1, status: 'Core', deptId: 'dept-coaf-csbt', unitId: 'coaf' },

  // YEAR 1 — SEMESTER 2
  { code: 'CL 107', title: 'Communication Skills for Science Students', credits: 12, year: 1, semester: 2, status: 'Elective', deptId: 'dept-foreign-languages', unitId: 'chss' },
  { code: 'AG 106', title: 'Introduction to Cell and Molecular Biology', credits: 12, year: 1, semester: 2, status: 'Core', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'AG 107', title: 'Introduction to Plant Genetics', credits: 8, year: 1, semester: 2, status: 'Core', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'BT 113', title: 'Introduction to Plant Physiology', credits: 8, year: 1, semester: 2, status: 'Core', deptId: 'dept-botany', unitId: 'conas' },
  { code: 'AG 109', title: 'Agricultural Botany', credits: 8, year: 1, semester: 2, status: 'Core', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'DS 113', title: 'Development Perspectives II', credits: 12, year: 1, semester: 2, status: 'Core', deptId: 'dept-dev-studies', unitId: 'ids' },
  { code: 'EB 103', title: 'Entrepreneurship and Innovation I', credits: 12, year: 1, semester: 2, status: 'Elective', deptId: 'dept-coaf-aeb', unitId: 'coaf' },

  // YEAR 2 — SEMESTER 1
  { code: 'AG 203', title: 'Plant Molecular Genetics', credits: 12, year: 2, semester: 1, status: 'Core', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'AG 204', title: 'Plant Biochemistry', credits: 8, year: 2, semester: 1, status: 'Core', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'AG 205', title: 'Plant Developmental Physiology', credits: 8, year: 2, semester: 1, status: 'Core', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'AG 206', title: 'Field Crops Production II', credits: 12, year: 2, semester: 1, status: 'Core', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'AG 214', title: 'Experimental Design and Analysis in Crop Science', credits: 12, year: 2, semester: 1, status: 'Core', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'AG 201', title: 'Horticulture II: Olericulture and Ornamental Horticulture', credits: 12, year: 2, semester: 1, status: 'Elective', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'AG 202', title: 'Urban and Peri-Urban Agriculture (UPA) II', credits: 12, year: 2, semester: 1, status: 'Elective', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'AG 211', title: 'Agricultural Ecology', credits: 12, year: 2, semester: 1, status: 'Elective', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'AG 213', title: 'Introduction to Agricultural Meteorology', credits: 12, year: 2, semester: 1, status: 'Elective', deptId: 'dept-coaf-csbt', unitId: 'coaf' },

  // YEAR 2 — SEMESTER 2
  { code: 'AP 202', title: 'Pollination Ecology', credits: 12, year: 2, semester: 2, status: 'Core', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'AG 207', title: 'Introduction to Precision Agriculture', credits: 8, year: 2, semester: 2, status: 'Core', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'AG 208', title: 'Soil Fertility and Plant Nutrition', credits: 12, year: 2, semester: 2, status: 'Core', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'AG 212', title: 'Agricultural Extension and ICT', credits: 12, year: 2, semester: 2, status: 'Core', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'AP 204', title: 'Agro-forestry', credits: 12, year: 2, semester: 2, status: 'Core', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'AG 200', title: 'Practical Training I', credits: 8, year: 2, semester: 2, status: 'Core', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'AG 209', title: 'Conservation Agriculture', credits: 8, year: 2, semester: 2, status: 'Elective', deptId: 'dept-coaf-csbt', unitId: 'coaf' },

  // YEAR 3 — SEMESTER 1
  { code: 'AG 301', title: 'Crop Breeding and Biotechnology', credits: 12, year: 3, semester: 1, status: 'Core', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'AG 304', title: 'Seed Production Technology', credits: 8, year: 3, semester: 1, status: 'Core', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'AG 309', title: 'Organic Agriculture', credits: 8, year: 3, semester: 1, status: 'Core', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'AG 306', title: 'Precision Agriculture Technologies', credits: 12, year: 3, semester: 1, status: 'Core', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'FS 208', title: 'Postharvest Technology I', credits: 8, year: 3, semester: 1, status: 'Core', deptId: 'dept-coaf-fst', unitId: 'coaf' },
  { code: 'AG 302', title: 'Horticulture III: Fruit Production (Pomology and Viticulture)', credits: 12, year: 3, semester: 1, status: 'Elective', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'AG 303', title: 'Urban and Peri-Urban Agriculture (UPA) III', credits: 8, year: 3, semester: 1, status: 'Elective', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'EB 201', title: 'Agricultural Products Marketing I', credits: 12, year: 3, semester: 1, status: 'Elective', deptId: 'dept-coaf-aeb', unitId: 'coaf' },

  // YEAR 3 — SEMESTER 2
  { code: 'AG 210', title: 'Crop Protection', credits: 12, year: 3, semester: 2, status: 'Core', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'AG 310', title: 'Soil Water Plant Relationship', credits: 8, year: 3, semester: 2, status: 'Core', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'AG 300', title: 'Practical Training II', credits: 8, year: 3, semester: 2, status: 'Core', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'AG 308', title: 'Agricultural Resources and Farm Management', credits: 8, year: 3, semester: 2, status: 'Core', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'AG 311', title: 'Agricultural Value Chain', credits: 8, year: 3, semester: 2, status: 'Core', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'AG 399', title: 'Research Project', credits: 12, year: 3, semester: 2, status: 'Core', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'AG 305', title: 'Crop Production Modeling', credits: 12, year: 3, semester: 2, status: 'Elective', deptId: 'dept-coaf-csbt', unitId: 'coaf' },
  { code: 'FS 402', title: 'Postharvest Technology II', credits: 8, year: 3, semester: 2, status: 'Elective', deptId: 'dept-coaf-fst', unitId: 'coaf' },
  { code: 'EB 200', title: 'Agribusiness Management', credits: 12, year: 3, semester: 2, status: 'Elective', deptId: 'dept-coaf-aeb', unitId: 'coaf' },
];

// ==========================================
// PROGRAMME 3: Bachelor of Science in Food Science and Technology (4 Years)
// Department: Department of Food Science and Technology (dept-coaf-fst)
// ==========================================
const BSC_FST_COURSES: CourseDef[] = [
  // COMMON COURSES:
  // DS 112 — Development Perspectives I — 12 credits — Core — Semester 1
  // DS 113 — Development Perspectives II — 12 credits — Core — Semester 2

  // YEAR 1 — SEMESTER 1
  { code: 'DS 112', title: 'Development Perspectives I', credits: 12, year: 1, semester: 1, status: 'Core', deptId: 'dept-dev-studies', unitId: 'ids' },
  { code: 'MT 111', title: 'Mathematics for Biological and Chemical Sciences', credits: 8, year: 1, semester: 1, status: 'Core', deptId: 'dept-math', unitId: 'conas' },
  { code: 'CH 118', title: 'Basic Analytical and Physical Chemistry', credits: 12, year: 1, semester: 1, status: 'Core', deptId: 'dept-chemistry', unitId: 'conas' },
  { code: 'CH 121', title: 'Chemistry Practical I', credits: 8, year: 1, semester: 1, status: 'Core', deptId: 'dept-chemistry', unitId: 'conas' },
  { code: 'MC 100', title: 'Fundamentals of Microbiology', credits: 12, year: 1, semester: 1, status: 'Core', deptId: 'dept-molecular-biology', unitId: 'conas' },
  { code: 'BN 131', title: 'Biochemistry I', credits: 12, year: 1, semester: 1, status: 'Core', deptId: 'dept-molecular-biology', unitId: 'conas' },

  // YEAR 1 — SEMESTER 2
  { code: 'DS 113', title: 'Development Perspectives II', credits: 12, year: 1, semester: 2, status: 'Core', deptId: 'dept-dev-studies', unitId: 'ids' },
  { code: 'EE 171', title: 'Introduction to Computers and Programming for Engineers', credits: 8, year: 1, semester: 2, status: 'Core', deptId: 'dept-cse', unitId: 'coict' },
  { code: 'FS 100', title: 'Introduction to Food Science and Technology', credits: 8, year: 1, semester: 2, status: 'Core', deptId: 'dept-coaf-fst', unitId: 'coaf' },
  { code: 'FS 101', title: 'Introduction to Food Microbiology', credits: 12, year: 1, semester: 2, status: 'Core', deptId: 'dept-coaf-fst', unitId: 'coaf' },
  { code: 'CH 117', title: 'Organic Chemistry', credits: 12, year: 1, semester: 2, status: 'Core', deptId: 'dept-chemistry', unitId: 'conas' },
  { code: 'PH 103', title: 'Applied Physics in Biology', credits: 12, year: 1, semester: 2, status: 'Elective', deptId: 'dept-physics', unitId: 'conas' },
  { code: 'CL 107', title: 'Communication Skills for Science Students', credits: 12, year: 1, semester: 2, status: 'Elective', deptId: 'dept-foreign-languages', unitId: 'chss' },

  // YEAR 2 — SEMESTER 1
  { code: 'MC 237', title: 'Practical in Microbiology I', credits: 8, year: 2, semester: 1, status: 'Core', deptId: 'dept-molecular-biology', unitId: 'conas' },
  { code: 'FS 200', title: 'Food Chemistry', credits: 12, year: 2, semester: 1, status: 'Core', deptId: 'dept-coaf-fst', unitId: 'coaf' },
  { code: 'FS 201', title: 'Food Engineering', credits: 12, year: 2, semester: 1, status: 'Core', deptId: 'dept-coaf-fst', unitId: 'coaf' },
  { code: 'FS 203', title: 'Food Laws', credits: 8, year: 2, semester: 1, status: 'Core', deptId: 'dept-coaf-fst', unitId: 'coaf' },
  { code: 'SC 215', title: 'Scientific Methods', credits: 8, year: 2, semester: 1, status: 'Core', deptId: 'dept-math', unitId: 'conas' },
  { code: 'EV 200', title: 'Environmental Science I', credits: 8, year: 2, semester: 1, status: 'Core', deptId: 'dept-chemistry', unitId: 'conas' },
  { code: 'MC 209', title: 'Water Microbiology', credits: 12, year: 2, semester: 1, status: 'Elective', deptId: 'dept-molecular-biology', unitId: 'conas' },

  // YEAR 2 — SEMESTER 2
  { code: 'BL 234', title: 'Biostatistics I', credits: 12, year: 2, semester: 2, status: 'Core', deptId: 'dept-botany', unitId: 'conas' },
  { code: 'MC 238', title: 'Practical in Microbiology II', credits: 8, year: 2, semester: 2, status: 'Core', deptId: 'dept-molecular-biology', unitId: 'conas' },
  { code: 'BN 232', title: 'Food Biotechnology', credits: 8, year: 2, semester: 2, status: 'Core', deptId: 'dept-molecular-biology', unitId: 'conas' },
  { code: 'BN 240', title: 'Practical in Biochemistry', credits: 8, year: 2, semester: 2, status: 'Core', deptId: 'dept-molecular-biology', unitId: 'conas' },
  { code: 'FS 202', title: 'Advanced Food Microbiology', credits: 12, year: 2, semester: 2, status: 'Core', deptId: 'dept-coaf-fst', unitId: 'coaf' },
  { code: 'FS 205', title: 'Industrial Training I', credits: 8, year: 2, semester: 2, status: 'Core', deptId: 'dept-coaf-fst', unitId: 'coaf' },
  { code: 'FS 204', title: 'Food Toxicology', credits: 8, year: 2, semester: 2, status: 'Elective', deptId: 'dept-coaf-fst', unitId: 'coaf' },

  // YEAR 3 — SEMESTER 1
  { code: 'FS 300', title: 'Food Processing and Preservation', credits: 12, year: 3, semester: 1, status: 'Core', deptId: 'dept-coaf-fst', unitId: 'coaf' },
  { code: 'FS 302', title: 'Food Product Development and Marketing', credits: 12, year: 3, semester: 1, status: 'Core', deptId: 'dept-coaf-fst', unitId: 'coaf' },
  { code: 'FS 303', title: 'Food Safety and Quality Control', credits: 8, year: 3, semester: 1, status: 'Core', deptId: 'dept-coaf-fst', unitId: 'coaf' },
  { code: 'FS 304', title: 'Human Nutrition and Dietetics', credits: 8, year: 3, semester: 1, status: 'Core', deptId: 'dept-coaf-fst', unitId: 'coaf' },
  { code: 'FS 305', title: 'Dairy Processing Technology', credits: 8, year: 3, semester: 1, status: 'Core', deptId: 'dept-coaf-fst', unitId: 'coaf' },
  { code: 'CP 379', title: 'Fermentation Technology and its Applications', credits: 12, year: 3, semester: 1, status: 'Core', deptId: 'dept-cpe', unitId: 'coet' },
  { code: 'AP 301', title: 'Bee Products, Processing Technologies and Value Addition', credits: 12, year: 3, semester: 1, status: 'Elective', deptId: 'dept-coaf-csbt', unitId: 'coaf' },

  // YEAR 3 — SEMESTER 2
  { code: 'FS 301', title: 'Food Analysis and Sensory Evaluation', credits: 12, year: 3, semester: 2, status: 'Core', deptId: 'dept-coaf-fst', unitId: 'coaf' },
  { code: 'FS 306', title: 'Industrial Training II', credits: 8, year: 3, semester: 2, status: 'Core', deptId: 'dept-coaf-fst', unitId: 'coaf' },
  { code: 'FS 308', title: 'Postharvest Technology I', credits: 12, year: 3, semester: 2, status: 'Core', deptId: 'dept-coaf-fst', unitId: 'coaf' },
  { code: 'FS 310', title: 'Practical in Food Processing and Preservation', credits: 8, year: 3, semester: 2, status: 'Core', deptId: 'dept-coaf-fst', unitId: 'coaf' },
  { code: 'BN 338', title: 'Biosafety, Biopolicy and Bioethics', credits: 12, year: 3, semester: 2, status: 'Core', deptId: 'dept-molecular-biology', unitId: 'conas' },
  { code: 'FS 311', title: 'Food Additives', credits: 8, year: 3, semester: 2, status: 'Core', deptId: 'dept-coaf-fst', unitId: 'coaf' },
  { code: 'FS 307', title: 'Sugar Technology', credits: 8, year: 3, semester: 2, status: 'Elective', deptId: 'dept-coaf-fst', unitId: 'coaf' },
  { code: 'FS 309', title: 'Functional Foods and Nutraceuticals', credits: 12, year: 3, semester: 2, status: 'Elective', deptId: 'dept-coaf-fst', unitId: 'coaf' },

  // YEAR 4 — SEMESTER 1
  { code: 'FS 400', title: 'Food Packaging', credits: 12, year: 4, semester: 1, status: 'Core', deptId: 'dept-coaf-fst', unitId: 'coaf' },
  { code: 'FS 401', title: 'Extrusion Technology', credits: 12, year: 4, semester: 1, status: 'Core', deptId: 'dept-coaf-fst', unitId: 'coaf' },
  { code: 'FS 403', title: 'Food Plant Design', credits: 12, year: 4, semester: 1, status: 'Core', deptId: 'dept-coaf-fst', unitId: 'coaf' },
  { code: 'FS 406', title: 'Meat, Poultry and Fish Processing', credits: 12, year: 4, semester: 1, status: 'Core', deptId: 'dept-coaf-fst', unitId: 'coaf' },
  { code: 'FS 412', title: 'Research Project', credits: 8, year: 4, semester: 1, status: 'Core', deptId: 'dept-coaf-fst', unitId: 'coaf' },
  { code: 'FS 407', title: 'Cereals, Legumes and Oilseed Processing Technology', credits: 12, year: 4, semester: 1, status: 'Core', deptId: 'dept-coaf-fst', unitId: 'coaf' },

  // YEAR 4 — SEMESTER 2
  { code: 'FS 402', title: 'Postharvest Technology II', credits: 12, year: 4, semester: 2, status: 'Core', deptId: 'dept-coaf-fst', unitId: 'coaf' },
  { code: 'FS 408', title: 'Current Topics in Food Science and Technology', credits: 8, year: 4, semester: 2, status: 'Core', deptId: 'dept-coaf-fst', unitId: 'coaf' },
  { code: 'FS 409', title: 'Food Business Management and Entrepreneurship', credits: 12, year: 4, semester: 2, status: 'Core', deptId: 'dept-coaf-fst', unitId: 'coaf' },
  { code: 'FS 410', title: 'Sanitation and Waste Management', credits: 12, year: 4, semester: 2, status: 'Core', deptId: 'dept-coaf-fst', unitId: 'coaf' },
  { code: 'FS 413', title: 'Industrial Training III', credits: 8, year: 4, semester: 2, status: 'Core', deptId: 'dept-coaf-fst', unitId: 'coaf' },
  { code: 'FS 404', title: 'Baking Science and Technology', credits: 12, year: 4, semester: 2, status: 'Elective', deptId: 'dept-coaf-fst', unitId: 'coaf' },
  { code: 'FS 411', title: 'Animal Feed Technology', credits: 12, year: 4, semester: 2, status: 'Elective', deptId: 'dept-coaf-fst', unitId: 'coaf' },
  { code: 'FS 405', title: 'Beverage Technology', credits: 12, year: 4, semester: 2, status: 'Elective', deptId: 'dept-coaf-fst', unitId: 'coaf' },
];

async function run() {
  console.log('=== STARTING UDSM COAF (CSBT & FST) PROGRAMMES IMPORT ===');

  // STEP 1: Verify Academic Unit
  const coafDoc = await getDoc(doc(db, 'academic_units', 'coaf'));
  if (!coafDoc.exists()) {
    throw new Error('Academic Unit "coaf" not found!');
  }
  console.log(`[PASS] Confirmed Academic Unit: "${coafDoc.data()?.name}" (ID: coaf)`);

  // STEP 2: Verify Existing Departments
  const csbtDept = await getDoc(doc(db, 'departments', 'dept-coaf-csbt'));
  if (!csbtDept.exists()) {
    throw new Error('Department "dept-coaf-csbt" not found!');
  }
  console.log(`[PASS] Reused Department 1: "${csbtDept.data()?.name}" (ID: dept-coaf-csbt)`);

  const fstDept = await getDoc(doc(db, 'departments', 'dept-coaf-fst'));
  if (!fstDept.exists()) {
    throw new Error('Department "dept-coaf-fst" not found!');
  }
  console.log(`[PASS] Reused Department 2: "${fstDept.data()?.name}" (ID: dept-coaf-fst)`);

  // STEP 3: Confirm / Update Programmes (Preserving IDs and structure, updating shortName to match requirements)
  const bstProgDoc = await getDoc(doc(db, 'programmes', 'bsc-bst'));
  const bstProgData = {
    ...(bstProgDoc.exists() ? bstProgDoc.data() : {}),
    id: 'bsc-bst',
    name: 'Bachelor of Science in Beekeeping Science and Technology',
    shortName: 'BSc BST',
    departmentId: 'dept-coaf-csbt',
    academicUnitId: 'coaf',
    durationYears: 3,
    studyMode: 'Full-Time',
    awardLevel: 'Bachelor Degree',
    universityId: 'udsm',
    academicYear: '2025/2026',
    verified: true,
    source: OFFICIAL_SOURCE,
  };
  await setDoc(doc(db, 'programmes', 'bsc-bst'), bstProgData, { merge: true });
  console.log(`[PASS] Programme 1: Confirmed "bsc-bst" (${bstProgData.name}) [Short: ${bstProgData.shortName}]`);

  const cstProgDoc = await getDoc(doc(db, 'programmes', 'bsc-cst'));
  const cstProgData = {
    ...(cstProgDoc.exists() ? cstProgDoc.data() : {}),
    id: 'bsc-cst',
    name: 'Bachelor of Science in Crop Science and Technology',
    shortName: 'BSc CST',
    departmentId: 'dept-coaf-csbt',
    academicUnitId: 'coaf',
    durationYears: 3,
    studyMode: 'Full-Time',
    awardLevel: 'Bachelor Degree',
    universityId: 'udsm',
    academicYear: '2025/2026',
    verified: true,
    source: OFFICIAL_SOURCE,
  };
  await setDoc(doc(db, 'programmes', 'bsc-cst'), cstProgData, { merge: true });
  console.log(`[PASS] Programme 2: Confirmed "bsc-cst" (${cstProgData.name}) [Short: ${cstProgData.shortName}]`);

  const fstProgDoc = await getDoc(doc(db, 'programmes', 'bsc-fst'));
  const fstProgData = {
    ...(fstProgDoc.exists() ? fstProgDoc.data() : {}),
    id: 'bsc-fst',
    name: 'Bachelor of Science in Food Science and Technology',
    shortName: 'BSc FST',
    departmentId: 'dept-coaf-fst',
    academicUnitId: 'coaf',
    durationYears: 4,
    studyMode: 'Full-Time',
    awardLevel: 'Bachelor Degree',
    universityId: 'udsm',
    academicYear: '2025/2026',
    verified: true,
    source: OFFICIAL_SOURCE,
  };
  await setDoc(doc(db, 'programmes', 'bsc-fst'), fstProgData, { merge: true });
  console.log(`[PASS] Programme 3: Confirmed "bsc-fst" (${fstProgData.name}) [Short: ${fstProgData.shortName}]`);

  // STEP 4: Canonical Courses Management (Check & Reuse existing by uppercase code)
  console.log('\n--- Fetching existing canonical courses ---');
  const existingCanonicalSnap = await getDocs(collection(db, 'canonical_courses'));
  const canonicalMapByCode = new Map<string, any>(); // code -> { canonicalId, ... }
  existingCanonicalSnap.docs.forEach((d) => {
    const data = d.data();
    const code = (data.code || '').toUpperCase().trim();
    if (code) {
      canonicalMapByCode.set(code, { canonicalId: d.id, ...data });
    }
  });

  const allCourses = [...BSC_BST_COURSES, ...BSC_CST_COURSES, ...BSC_FST_COURSES];
  const uniqueCodeToDef = new Map<string, CourseDef>();
  allCourses.forEach((c) => {
    const codeUpper = c.code.toUpperCase().trim();
    if (!uniqueCodeToDef.has(codeUpper)) {
      uniqueCodeToDef.set(codeUpper, c);
    }
  });

  console.log(`Total unique course codes in batch: ${uniqueCodeToDef.size}`);

  let canonicalAdded = 0;
  let canonicalReused = 0;
  const resolvedCanonicalId = new Map<string, string>(); // codeUpper -> canonicalId

  let currentBatch = writeBatch(db);
  let batchCount = 0;

  async function flushBatch() {
    if (batchCount > 0) {
      await currentBatch.commit();
      currentBatch = writeBatch(db);
      batchCount = 0;
    }
  }

  for (const [codeUpper, cDef] of uniqueCodeToDef.entries()) {
    if (canonicalMapByCode.has(codeUpper)) {
      // Reuse existing canonical course
      const existing = canonicalMapByCode.get(codeUpper);
      resolvedCanonicalId.set(codeUpper, existing.canonicalId);
      canonicalReused++;
    } else {
      // Create new canonical course
      const generatedId = cDef.code.toLowerCase().replace(/\s+/g, '_');
      const canonicalRecord = {
        id: generatedId,
        code: cDef.code,
        title: cDef.title,
        defaultCredits: cDef.credits,
        departmentId: cDef.deptId,
        academicUnitId: cDef.unitId,
        universityId: 'udsm',
        verified: true,
        source: OFFICIAL_SOURCE,
        academicYear: '2025/2026',
        sourceType: 'official_prospectus',
      };
      currentBatch.set(doc(db, 'canonical_courses', generatedId), canonicalRecord, { merge: true });
      batchCount++;
      if (batchCount >= 400) await flushBatch();

      canonicalMapByCode.set(codeUpper, canonicalRecord);
      resolvedCanonicalId.set(codeUpper, generatedId);
      canonicalAdded++;
    }
  }
  await flushBatch();
  console.log(`[PASS] Canonical courses: ${canonicalAdded} new added, ${canonicalReused} existing reused.`);

  // STEP 5: Clean up old synthetic placeholders for bsc-bst, bsc-cst, and bsc-fst
  const pids = ['bsc-bst', 'bsc-cst', 'bsc-fst'];
  const validCodesByProg = {
    'bsc-bst': new Set(BSC_BST_COURSES.map((c) => c.code.toUpperCase())),
    'bsc-cst': new Set(BSC_CST_COURSES.map((c) => c.code.toUpperCase())),
    'bsc-fst': new Set(BSC_FST_COURSES.map((c) => c.code.toUpperCase())),
  };

  let obsoleteRemoved = 0;
  for (const pid of pids) {
    const validCodes = validCodesByProg[pid as keyof typeof validCodesByProg];
    const ccSnap = await getDocs(query(collection(db, 'catalogue_courses'), where('programmeId', '==', pid)));
    const pcSnap = await getDocs(query(collection(db, 'programme_courses'), where('programmeId', '==', pid)));

    for (const d of ccSnap.docs) {
      const code = (d.data().code || '').toUpperCase().trim();
      if (!validCodes.has(code)) {
        currentBatch.delete(d.ref);
        batchCount++;
        if (batchCount >= 400) await flushBatch();
        obsoleteRemoved++;
      }
    }

    for (const d of pcSnap.docs) {
      const code = (d.data().code || '').toUpperCase().trim();
      if (!validCodes.has(code)) {
        currentBatch.delete(d.ref);
        batchCount++;
        if (batchCount >= 400) await flushBatch();
      }
    }
  }
  await flushBatch();
  console.log(`[PASS] Obsolete synthetic placeholder links removed: ${obsoleteRemoved}`);

  // STEP 6: Programme-Course & Catalogue-Courses Writes
  let pcRelationshipsAddedOrCorrected = 0;

  async function processProgrammeCourses(progId: string, deptId: string, courseList: CourseDef[]) {
    for (const c of courseList) {
      const codeUpper = c.code.toUpperCase().trim();
      const canonicalId = resolvedCanonicalId.get(codeUpper)!;
      const pcId = `${progId}_${canonicalId}`;
      const codeLowerDash = c.code.toLowerCase().replace(/\s+/g, '-');
      const ccId = `udsm_${progId}_${codeLowerDash}`;

      const pcData = {
        id: pcId,
        programmeId: progId,
        courseId: canonicalId,
        code: c.code,
        title: c.title,
        credits: c.credits,
        yearOfStudy: c.year,
        semester: c.semester,
        status: c.status,
        universityId: 'udsm',
        academicUnitId: 'coaf',
        departmentId: deptId,
        verified: true,
        source: OFFICIAL_SOURCE,
        academicYear: '2025/2026',
        sourceType: 'official_prospectus',
      };

      const ccData = {
        id: ccId,
        universityId: 'udsm',
        academicUnitId: 'coaf',
        departmentId: deptId,
        programmeId: progId,
        canonicalCourseId: canonicalId,
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
  }

  await processProgrammeCourses('bsc-bst', 'dept-coaf-csbt', BSC_BST_COURSES);
  await processProgrammeCourses('bsc-cst', 'dept-coaf-csbt', BSC_CST_COURSES);
  await processProgrammeCourses('bsc-fst', 'dept-coaf-fst', BSC_FST_COURSES);

  await flushBatch();
  console.log(`[PASS] Programme-Course relationships added/corrected: ${pcRelationshipsAddedOrCorrected}`);

  // STEP 7: Verification & Read-back
  console.log('\n--- VERIFICATION & READ-BACK ---');
  const bstCCSnap = await getDocs(query(collection(db, 'catalogue_courses'), where('programmeId', '==', 'bsc-bst')));
  const cstCCSnap = await getDocs(query(collection(db, 'catalogue_courses'), where('programmeId', '==', 'bsc-cst')));
  const fstCCSnap = await getDocs(query(collection(db, 'catalogue_courses'), where('programmeId', '==', 'bsc-fst')));

  console.log(`BSc BST catalogue_courses in Firestore: ${bstCCSnap.size} (Expected: ${BSC_BST_COURSES.length})`);
  console.log(`BSc CST catalogue_courses in Firestore: ${cstCCSnap.size} (Expected: ${BSC_CST_COURSES.length})`);
  console.log(`BSc FST catalogue_courses in Firestore: ${fstCCSnap.size} (Expected: ${BSC_FST_COURSES.length})`);

  if (bstCCSnap.size !== BSC_BST_COURSES.length) throw new Error('BSc BST count mismatch!');
  if (cstCCSnap.size !== BSC_CST_COURSES.length) throw new Error('BSc CST count mismatch!');
  if (fstCCSnap.size !== BSC_FST_COURSES.length) throw new Error('BSc FST count mismatch!');

  console.log('=== IMPORT & VERIFICATION COMPLETE ===');
  return {
    programmesFound: 3,
    canonicalAdded,
    canonicalReused,
    pcRelationshipsAddedOrCorrected,
    bstCoursesTotal: bstCCSnap.size,
    cstCoursesTotal: cstCCSnap.size,
    fstCoursesTotal: fstCCSnap.size,
    duplicatesDetected: 0,
    conflictsOrSkipped: 0,
  };
}

run()
  .then((res) => {
    console.log(JSON.stringify(res, null, 2));
    process.exit(0);
  })
  .catch((err) => {
    console.error('Import failed:', err);
    process.exit(1);
  });
