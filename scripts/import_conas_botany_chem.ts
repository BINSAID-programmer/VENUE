import { initializeApp } from "firebase/app";
import {
  initializeFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  writeBatch,
  query,
  where
} from "firebase/firestore";
import * as fs from "fs";

interface RawCourseSpec {
  code: string;
  title: string;
  credits: number | string;
  status: "Core" | "Elective";
  year: number;
  semester: number;
  programmeId: string;
  offeringDeptId?: string;
  isPracticalOrProject?: boolean;
  notes?: string;
}

// 1. Department of Botany — B.Sc. with Education
const BOTANY_BSC_ED_COURSES: RawCourseSpec[] = [
  // Year 1 S1
  { code: "BL 120", title: "Cell Biology and Genetics for Teachers", credits: 12, status: "Core", year: 1, semester: 1, programmeId: "bsc-ed", offeringDeptId: "dept-botany" },
  { code: "ZL 121", title: "Invertebrate Zoology", credits: 8, status: "Core", year: 1, semester: 1, programmeId: "bsc-ed", offeringDeptId: "dept-zoology" },
  // Year 1 S2
  { code: "ZL 122", title: "Chordate Zoology", credits: 8, status: "Core", year: 1, semester: 2, programmeId: "bsc-ed", offeringDeptId: "dept-zoology" },
  { code: "BT 131", title: "Plant Structure and Physiology", credits: 12, status: "Core", year: 1, semester: 2, programmeId: "bsc-ed", offeringDeptId: "dept-botany" },
  // Year 2 S1
  { code: "BL 224", title: "Principles and Techniques of Taxonomy", credits: 8, status: "Core", year: 2, semester: 1, programmeId: "bsc-ed", offeringDeptId: "dept-botany" },
  { code: "ZL 213", title: "Vertebrate Anatomy and Physiology I", credits: 12, status: "Core", year: 2, semester: 1, programmeId: "bsc-ed", offeringDeptId: "dept-zoology" },
  { code: "BT 129", title: "Introduction to Plant Evolution", credits: 8, status: "Elective", year: 2, semester: 1, programmeId: "bsc-ed", offeringDeptId: "dept-botany" },
  { code: "BT 228", title: "Community Ecology", credits: 12, status: "Elective", year: 2, semester: 1, programmeId: "bsc-ed", offeringDeptId: "dept-botany" },
  { code: "ZL 203", title: "Parasitology", credits: 12, status: "Elective", year: 2, semester: 1, programmeId: "bsc-ed", offeringDeptId: "dept-zoology" },
  // Year 2 S2
  { code: "BT 137", title: "Introduction to Ecology", credits: 8, status: "Core", year: 2, semester: 2, programmeId: "bsc-ed", offeringDeptId: "dept-botany" },
  { code: "ZL 220", title: "Vertebrate Anatomy and Physiology II", credits: 12, status: "Core", year: 2, semester: 2, programmeId: "bsc-ed", offeringDeptId: "dept-zoology" },
  { code: "ZL 124", title: "Developmental Biology", credits: 8, status: "Elective", year: 2, semester: 2, programmeId: "bsc-ed", offeringDeptId: "dept-zoology" },
  { code: "BT 227", title: "Anatomy of Angiosperms", credits: 8, status: "Elective", year: 2, semester: 2, programmeId: "bsc-ed", offeringDeptId: "dept-botany" },
  // Year 3 S1
  { code: "BL 331", title: "Cell Biology and Molecular Genetics", credits: 12, status: "Core", year: 3, semester: 1, programmeId: "bsc-ed", offeringDeptId: "dept-botany" },
  { code: "BL 315", title: "Ecological Impact Assessment", credits: 8, status: "Elective", year: 3, semester: 1, programmeId: "bsc-ed", offeringDeptId: "dept-botany" },
  // Year 3 S2
  { code: "BL 391", title: "Biology Project for Teachers", credits: 12, status: "Core", year: 3, semester: 2, programmeId: "bsc-ed", offeringDeptId: "dept-botany", isPracticalOrProject: true },
  { code: "ZL 343", title: "Microevolution", credits: 12, status: "Core", year: 3, semester: 2, programmeId: "bsc-ed", offeringDeptId: "dept-zoology" },
];

// 2. Department of Botany — B.Sc. in Botanical Sciences
const BOTANY_BSC_BOTANY_COURSES: RawCourseSpec[] = [
  // Common Courses for this programme
  { code: "DS 112", title: "Perspectives of Development", credits: 12, status: "Core", year: 1, semester: 1, programmeId: "bsc-botany", offeringDeptId: "dept-dev-studies", notes: "Common course for B.Sc. in Botanical Sciences" },
  { code: "EV 200", title: "Environmental Science I", credits: 8, status: "Core", year: 1, semester: 1, programmeId: "bsc-botany", offeringDeptId: "dept-botany", notes: "Common course for B.Sc. in Botanical Sciences" },
  { code: "SC 215", title: "Scientific Methods", credits: 8, status: "Core", year: 1, semester: 1, programmeId: "bsc-botany", offeringDeptId: "dept-botany", notes: "Common course for B.Sc. in Botanical Sciences" },
  { code: "DS 113", title: "Development Perspectives II", credits: 12, status: "Core", year: 1, semester: 2, programmeId: "bsc-botany", offeringDeptId: "dept-dev-studies", notes: "Common course for B.Sc. in Botanical Sciences" },

  // Year 1 S1
  { code: "BT 130", title: "Evolutionary Botany", credits: 12, status: "Core", year: 1, semester: 1, programmeId: "bsc-botany", offeringDeptId: "dept-botany" },
  { code: "BL 111", title: "Introduction to Cell Biology and Genetics", credits: 12, status: "Core", year: 1, semester: 1, programmeId: "bsc-botany", offeringDeptId: "dept-botany" },
  { code: "MT 111", title: "Mathematics for Biological and Chemical Sciences", credits: 8, status: "Core", year: 1, semester: 1, programmeId: "bsc-botany", offeringDeptId: "dept-math" },
  { code: "MC 100", title: "Fundamentals of Microbiology", credits: 12, status: "Core", year: 1, semester: 1, programmeId: "bsc-botany", offeringDeptId: "dept-biotech" },
  { code: "ZL 121", title: "Invertebrate Zoology", credits: 8, status: "Elective", year: 1, semester: 1, programmeId: "bsc-botany", offeringDeptId: "dept-zoology" },
  { code: "AC 102", title: "Fundamentals of Accounting for Non-Business Majors", credits: 12, status: "Elective", year: 1, semester: 1, programmeId: "bsc-botany", offeringDeptId: "dept-accounting" },

  // Year 1 S2
  { code: "CH 113", title: "Chemistry for Life Sciences Students", credits: 12, status: "Core", year: 1, semester: 2, programmeId: "bsc-botany", offeringDeptId: "dept-chem" },
  { code: "BT 112", title: "Principles of Plant Population Genetics", credits: 8, status: "Core", year: 1, semester: 2, programmeId: "bsc-botany", offeringDeptId: "dept-botany" },
  { code: "BT 113", title: "Introduction to Plant Physiology", credits: 8, status: "Core", year: 1, semester: 2, programmeId: "bsc-botany", offeringDeptId: "dept-botany" },
  { code: "BL 113", title: "Ecology I", credits: 8, status: "Core", year: 1, semester: 2, programmeId: "bsc-botany", offeringDeptId: "dept-botany" },
  { code: "WS 101", title: "Ecology and Utilisation of Natural Resources", credits: 8, status: "Core", year: 1, semester: 2, programmeId: "bsc-botany", offeringDeptId: "dept-zoology" },
  { code: "IS 131", title: "Introduction to Informatics and Microcomputers", credits: 8, status: "Core", year: 1, semester: 2, programmeId: "bsc-botany", offeringDeptId: "dept-cse" },
  { code: "BN 131", title: "Biochemistry I", credits: 12, status: "Core", year: 1, semester: 2, programmeId: "bsc-botany", offeringDeptId: "dept-biotech" },
  { code: "CL 107", title: "Communication Skills for Science", credits: 12, status: "Elective", year: 1, semester: 2, programmeId: "bsc-botany", offeringDeptId: "dept-ccs" },
  { code: "ZL 122", title: "Chordate Zoology", credits: 8, status: "Elective", year: 1, semester: 2, programmeId: "bsc-botany", offeringDeptId: "dept-zoology" },

  // Year 2 S1
  { code: "BT 211", title: "Fundamentals of Soil Science", credits: 8, status: "Core", year: 2, semester: 1, programmeId: "bsc-botany", offeringDeptId: "dept-botany" },
  { code: "BT 224", title: "Introduction to Plant Molecular Biology", credits: 12, status: "Core", year: 2, semester: 1, programmeId: "bsc-botany", offeringDeptId: "dept-botany" },
  { code: "BT 225", title: "Taxonomy of Higher Plants", credits: 12, status: "Core", year: 2, semester: 1, programmeId: "bsc-botany", offeringDeptId: "dept-botany" },
  { code: "BL 215", title: "Ecology II", credits: 12, status: "Core", year: 2, semester: 1, programmeId: "bsc-botany", offeringDeptId: "dept-botany" },

  // Year 2 S2
  { code: "BT 223", title: "Biometry for Plant Science", credits: 12, status: "Core", year: 2, semester: 2, programmeId: "bsc-botany", offeringDeptId: "dept-botany" },
  { code: "BT 221", title: "Management and Conservation of Soils", credits: 12, status: "Core", year: 2, semester: 2, programmeId: "bsc-botany", offeringDeptId: "dept-botany" },
  { code: "BT 218", title: "Metabolic Physiology and Plant Growth", credits: 8, status: "Elective", year: 2, semester: 2, programmeId: "bsc-botany", offeringDeptId: "dept-botany" },
  { code: "BT 215", title: "Introduction to Mycology", credits: 8, status: "Elective", year: 2, semester: 2, programmeId: "bsc-botany", offeringDeptId: "dept-botany" },
  { code: "BT 217", title: "Plant Genetics and Evolution", credits: 8, status: "Elective", year: 2, semester: 2, programmeId: "bsc-botany", offeringDeptId: "dept-botany" },
  { code: "BL 210", title: "Immunology for Life Scientists", credits: 12, status: "Elective", year: 2, semester: 2, programmeId: "bsc-botany", offeringDeptId: "dept-biotech" },
  { code: "BL 214", title: "Biostatistics I", credits: 12, status: "Elective", year: 2, semester: 2, programmeId: "bsc-botany", offeringDeptId: "dept-botany" },
  { code: "ZL 236", title: "Introductory Entomology and Parasitology", credits: 12, status: "Elective", year: 2, semester: 2, programmeId: "bsc-botany", offeringDeptId: "dept-zoology" },

  // Year 3 S1
  { code: "BT 329", title: "Plant Ecology and Phytogeography", credits: 12, status: "Core", year: 3, semester: 1, programmeId: "bsc-botany", offeringDeptId: "dept-botany" },
  { code: "BT 349", title: "Management and Monitoring of Fragile Ecosystems", credits: 12, status: "Core", year: 3, semester: 1, programmeId: "bsc-botany", offeringDeptId: "dept-botany" },
  { code: "BL 390", title: "Research Project", credits: 12, status: "Core", year: 3, semester: 1, programmeId: "bsc-botany", offeringDeptId: "dept-botany", isPracticalOrProject: true },
  { code: "BT 352", title: "Horticulture", credits: 8, status: "Elective", year: 3, semester: 1, programmeId: "bsc-botany", offeringDeptId: "dept-botany" },
  { code: "BL 313", title: "Biological Impact Assessment", credits: 8, status: "Elective", year: 3, semester: 1, programmeId: "bsc-botany", offeringDeptId: "dept-botany" },
  { code: "GE 352", title: "Natural Resource Management", credits: 12, status: "Elective", year: 3, semester: 1, programmeId: "bsc-botany", offeringDeptId: "dept-geography" },
  { code: "BT 321", title: "Applied Plant Physiology", credits: 8, status: "Elective", year: 3, semester: 1, programmeId: "bsc-botany", offeringDeptId: "dept-botany" },

  // Year 3 S2
  { code: "BT 319", title: "Practical Training", credits: 8, status: "Core", year: 3, semester: 2, programmeId: "bsc-botany", offeringDeptId: "dept-botany", isPracticalOrProject: true },
  { code: "BT 323", title: "Algal Systematics and Ecology", credits: 12, status: "Core", year: 3, semester: 2, programmeId: "bsc-botany", offeringDeptId: "dept-botany" },
  { code: "BT 327", title: "Anatomy of Angiosperms", credits: 8, status: "Core", year: 3, semester: 2, programmeId: "bsc-botany", offeringDeptId: "dept-botany" },
  { code: "BT 356", title: "Plant Diversity and Conservation", credits: 12, status: "Core", year: 3, semester: 2, programmeId: "bsc-botany", offeringDeptId: "dept-botany" },
  { code: "BT 335", title: "Plant Breeding and Genetic Manipulation", credits: 8, status: "Elective", year: 3, semester: 2, programmeId: "bsc-botany", offeringDeptId: "dept-botany" },
  { code: "BT 341", title: "Economic Botany", credits: 12, status: "Elective", year: 3, semester: 2, programmeId: "bsc-botany", offeringDeptId: "dept-botany" },
  { code: "BT 350", title: "Plant Systematics", credits: 12, status: "Elective", year: 3, semester: 2, programmeId: "bsc-botany", offeringDeptId: "dept-botany" },
  { code: "BT 351", title: "Watershed Management", credits: 12, status: "Elective", year: 3, semester: 2, programmeId: "bsc-botany", offeringDeptId: "dept-botany" },
  { code: "BN 303", title: "Agricultural Biotechnology", credits: 8, status: "Elective", year: 3, semester: 2, programmeId: "bsc-botany", offeringDeptId: "dept-biotech" },
  { code: "BT 333", title: "Plant Pathology", credits: 8, status: "Elective", year: 3, semester: 2, programmeId: "bsc-botany", offeringDeptId: "dept-botany" },
  { code: "BT 337", title: "Plant Tissue Culture", credits: 8, status: "Elective", year: 3, semester: 2, programmeId: "bsc-botany", offeringDeptId: "dept-botany" },
];

// 3. Chemistry Department — B.Sc. with Education
const CHEM_BSC_ED_COURSES: RawCourseSpec[] = [
  // Year 1 S1
  { code: "CH 118", title: "Basic Analytical and Physical Chemistry", credits: 12, status: "Core", year: 1, semester: 1, programmeId: "bsc-ed", offeringDeptId: "dept-chem" },
  { code: "CH 121", title: "Chemistry Practical I", credits: 8, status: "Core", year: 1, semester: 1, programmeId: "bsc-ed", offeringDeptId: "dept-chem", isPracticalOrProject: true },
  // Year 1 S2
  { code: "CH 117", title: "Organic Chemistry I", credits: 12, status: "Core", year: 1, semester: 2, programmeId: "bsc-ed", offeringDeptId: "dept-chem" },
  { code: "CH 175", title: "Basic Inorganic Chemistry", credits: 12, status: "Core", year: 1, semester: 2, programmeId: "bsc-ed", offeringDeptId: "dept-chem" },
  // Year 2 S1
  { code: "CH 243", title: "Organic Chemistry II", credits: 12, status: "Core", year: 2, semester: 1, programmeId: "bsc-ed", offeringDeptId: "dept-chem" },
  { code: "CH 201", title: "Chemical Thermodynamics", credits: 12, status: "Core", year: 2, semester: 1, programmeId: "bsc-ed", offeringDeptId: "dept-chem" },
  { code: "CHE 200", title: "Agricultural Chemistry", credits: 12, status: "Elective", year: 2, semester: 1, programmeId: "bsc-ed", offeringDeptId: "dept-chem" },
  // Year 2 S2
  { code: "CH 241", title: "Chemistry Practical III", credits: 8, status: "Core", year: 2, semester: 2, programmeId: "bsc-ed", offeringDeptId: "dept-chem", isPracticalOrProject: true },
  { code: "CH 290", title: "Chemical Kinetics and Electrochemistry", credits: 12, status: "Core", year: 2, semester: 2, programmeId: "bsc-ed", offeringDeptId: "dept-chem" },
  { code: "CH 293", title: "Food Chemistry", credits: 8, status: "Elective", year: 2, semester: 2, programmeId: "bsc-ed", offeringDeptId: "dept-chem" },
  { code: "CH 294", title: "Analytical Chemistry", credits: 12, status: "Elective", year: 2, semester: 2, programmeId: "bsc-ed", offeringDeptId: "dept-chem" },
  { code: "CH 227", title: "Environmental Chemistry", credits: 12, status: "Elective", year: 2, semester: 2, programmeId: "bsc-ed", offeringDeptId: "dept-chem" },
  // Year 3 S1
  { code: "CH 201", title: "Chemical Thermodynamics", credits: 12, status: "Core", year: 3, semester: 1, programmeId: "bsc-ed", offeringDeptId: "dept-chem", notes: "Repeated placement in Year 3 Semester 1 Core for Education as supplied in syllabus" },
  { code: "CHE 301", title: "Chemistry Laboratory Techniques", credits: 8, status: "Core", year: 3, semester: 1, programmeId: "bsc-ed", offeringDeptId: "dept-chem" },
  { code: "CH 248", title: "Instrumental Methods in Analytical Chemistry", credits: 8, status: "Elective", year: 3, semester: 1, programmeId: "bsc-ed", offeringDeptId: "dept-chem" },
  // Year 3 S2
  { code: "CH 364", title: "Coordination Chemistry", credits: 12, status: "Core", year: 3, semester: 2, programmeId: "bsc-ed", offeringDeptId: "dept-chem", notes: "12 credits in B.Sc. with Education (8 credits in B.Sc. Chemistry)" },
  { code: "CHE 302", title: "Chemistry Project for Teachers", credits: 8, status: "Core", year: 3, semester: 2, programmeId: "bsc-ed", offeringDeptId: "dept-chem", isPracticalOrProject: true },
];

// 4. Chemistry Department — B.Sc. in Chemistry
const CHEM_BSC_CHEM_COURSES: RawCourseSpec[] = [
  // Year 1 S1
  { code: "CH 118", title: "Basic Analytical and Physical Chemistry", credits: 12, status: "Core", year: 1, semester: 1, programmeId: "bsc-chem", offeringDeptId: "dept-chem" },
  { code: "CH 121", title: "Chemistry Practical I", credits: 8, status: "Core", year: 1, semester: 1, programmeId: "bsc-chem", offeringDeptId: "dept-chem", isPracticalOrProject: true },
  { code: "CH 172", title: "Chemical Separation", credits: 12, status: "Core", year: 1, semester: 1, programmeId: "bsc-chem", offeringDeptId: "dept-chem" },
  // Year 1 S2
  { code: "CH 117", title: "Organic Chemistry I", credits: 12, status: "Core", year: 1, semester: 2, programmeId: "bsc-chem", offeringDeptId: "dept-chem" },
  { code: "CH 122", title: "Chemistry Practical II", credits: 8, status: "Core", year: 1, semester: 2, programmeId: "bsc-chem", offeringDeptId: "dept-chem", isPracticalOrProject: true },
  { code: "CH 173", title: "Introduction to Electronic Structure and Spectroscopy", credits: 12, status: "Core", year: 1, semester: 2, programmeId: "bsc-chem", offeringDeptId: "dept-chem" },
  // Year 2 S1
  { code: "CH 201", title: "Chemical Thermodynamics", credits: 12, status: "Core", year: 2, semester: 1, programmeId: "bsc-chem", offeringDeptId: "dept-chem" },
  { code: "CH 243", title: "Organic Chemistry II", credits: 12, status: "Core", year: 2, semester: 1, programmeId: "bsc-chem", offeringDeptId: "dept-chem" },
  { code: "CH 244", title: "Chemistry Practical IV", credits: 8, status: "Core", year: 2, semester: 1, programmeId: "bsc-chem", offeringDeptId: "dept-chem", isPracticalOrProject: true },
  { code: "CH 248", title: "Instrumental Methods in Analytical Chemistry", credits: 8, status: "Core", year: 2, semester: 1, programmeId: "bsc-chem", offeringDeptId: "dept-chem" },
  { code: "CH 262", title: "Analytical and Environmental Chemistry", credits: 12, status: "Core", year: 2, semester: 1, programmeId: "bsc-chem", offeringDeptId: "dept-chem" },
  { code: "SC 215", title: "Scientific Methods", credits: 8, status: "Elective", year: 2, semester: 1, programmeId: "bsc-chem", offeringDeptId: "dept-botany" },
  // Year 2 S2
  { code: "CH 219", title: "Systematic Inorganic Chemistry", credits: 12, status: "Core", year: 2, semester: 2, programmeId: "bsc-chem", offeringDeptId: "dept-chem" },
  { code: "CH 241", title: "Chemistry Practical III", credits: 8, status: "Core", year: 2, semester: 2, programmeId: "bsc-chem", offeringDeptId: "dept-chem", isPracticalOrProject: true },
  { code: "CH 245", title: "Chemistry Practical V", credits: 8, status: "Core", year: 2, semester: 2, programmeId: "bsc-chem", offeringDeptId: "dept-chem", isPracticalOrProject: true },
  { code: "CH 280", title: "Organic Structure, Reactions and Mechanisms", credits: 12, status: "Core", year: 2, semester: 2, programmeId: "bsc-chem", offeringDeptId: "dept-chem" },
  { code: "CH 290", title: "Chemical Kinetics and Electrochemistry", credits: 12, status: "Core", year: 2, semester: 2, programmeId: "bsc-chem", offeringDeptId: "dept-chem" },
  { code: "CH 299", title: "Practical Training", credits: 8, status: "Core", year: 2, semester: 2, programmeId: "bsc-chem", offeringDeptId: "dept-chem", isPracticalOrProject: true },
  { code: "PH 249", title: "Fundamentals of Materials Science", credits: 8, status: "Elective", year: 2, semester: 2, programmeId: "bsc-chem", offeringDeptId: "dept-phys", notes: "8 credits in B.Sc. Chemistry" },
  // Year 3 S1
  { code: "CH 314", title: "Project Work", credits: "12 (6)", status: "Core", year: 3, semester: 1, programmeId: "bsc-chem", offeringDeptId: "dept-chem", isPracticalOrProject: true, notes: "12 (6) credits" },
  { code: "CH 303", title: "Organic Synthesis", credits: 12, status: "Core", year: 3, semester: 1, programmeId: "bsc-chem", offeringDeptId: "dept-chem" },
  { code: "CH 341", title: "Chemistry Practical VI", credits: 8, status: "Core", year: 3, semester: 1, programmeId: "bsc-chem", offeringDeptId: "dept-chem", isPracticalOrProject: true },
  { code: "CH 377", title: "Industrial Chemistry", credits: 12, status: "Core", year: 3, semester: 1, programmeId: "bsc-chem", offeringDeptId: "dept-chem" },
  { code: "CH 315", title: "Surface and Colloids Chemistry", credits: 8, status: "Elective", year: 3, semester: 1, programmeId: "bsc-chem", offeringDeptId: "dept-chem" },
  { code: "CH 371", title: "Quality Control and Assurance", credits: 8, status: "Elective", year: 3, semester: 1, programmeId: "bsc-chem", offeringDeptId: "dept-chem" },
  { code: "CH 308", title: "Polymer Chemistry", credits: 8, status: "Elective", year: 3, semester: 1, programmeId: "bsc-chem", offeringDeptId: "dept-chem" },
  { code: "CH 353", title: "Biochemistry", credits: 8, status: "Elective", year: 3, semester: 1, programmeId: "bsc-chem", offeringDeptId: "dept-chem" },
  { code: "CH 363", title: "Chemical Waste Management", credits: 8, status: "Elective", year: 3, semester: 1, programmeId: "bsc-chem", offeringDeptId: "dept-chem" },
  // Year 3 S2
  { code: "CH 314", title: "Project Work", credits: "12 (6)", status: "Core", year: 3, semester: 2, programmeId: "bsc-chem", offeringDeptId: "dept-chem", isPracticalOrProject: true, notes: "12 (6) credits" },
  { code: "CH 323", title: "Organic Spectroscopy", credits: 8, status: "Core", year: 3, semester: 2, programmeId: "bsc-chem", offeringDeptId: "dept-chem" },
  { code: "CH 364", title: "Coordination Chemistry", credits: 8, status: "Core", year: 3, semester: 2, programmeId: "bsc-chem", offeringDeptId: "dept-chem", notes: "8 credits in B.Sc. Chemistry" },
  { code: "CH 394", title: "Fundamentals of Theoretical Chemistry", credits: 12, status: "Core", year: 3, semester: 2, programmeId: "bsc-chem", offeringDeptId: "dept-chem" },
  { code: "CH 379", title: "Organometallic Chemistry", credits: 12, status: "Core", year: 3, semester: 2, programmeId: "bsc-chem", offeringDeptId: "dept-chem" },
  { code: "CH 399", title: "Practical Training", credits: 8, status: "Core", year: 3, semester: 2, programmeId: "bsc-chem", offeringDeptId: "dept-chem", isPracticalOrProject: true, notes: "Practical Training in Year 3 Semester 2" },
  { code: "CH 337", title: "Fuel Chemistry and Technology", credits: 8, status: "Elective", year: 3, semester: 2, programmeId: "bsc-chem", offeringDeptId: "dept-chem", notes: "Fuel Chemistry and Technology (8 cr, Elective in BSc Chem; vs Petroleum Chemistry practical's III 12 cr in BSc Pet Chem)" },
  { code: "CH 391", title: "Advanced Electrochemistry", credits: 8, status: "Elective", year: 3, semester: 2, programmeId: "bsc-chem", offeringDeptId: "dept-chem" },
  { code: "CH 305", title: "Chemistry of Natural Products", credits: 8, status: "Elective", year: 3, semester: 2, programmeId: "bsc-chem", offeringDeptId: "dept-chem" },
  { code: "CH 351", title: "Forensic Chemistry", credits: 8, status: "Elective", year: 3, semester: 2, programmeId: "bsc-chem", offeringDeptId: "dept-chem" },
  { code: "CH 374", title: "Bio-Inorganic Chemistry", credits: 8, status: "Elective", year: 3, semester: 2, programmeId: "bsc-chem", offeringDeptId: "dept-chem" },
];

// 5. Chemistry Department — B.Sc. in Petroleum Chemistry
const CHEM_BSC_PET_CHEM_COURSES: RawCourseSpec[] = [
  // Year 1 S1
  { code: "CH 118", title: "Basic Analytical and Physical Chemistry", credits: 12, status: "Core", year: 1, semester: 1, programmeId: "bsc-pet-chem", offeringDeptId: "dept-chem" },
  { code: "CH 121", title: "Chemistry Practical I", credits: 8, status: "Core", year: 1, semester: 1, programmeId: "bsc-pet-chem", offeringDeptId: "dept-chem", isPracticalOrProject: true },
  { code: "CH 172", title: "Chemical Separation", credits: 12, status: "Core", year: 1, semester: 1, programmeId: "bsc-pet-chem", offeringDeptId: "dept-chem" },
  { code: "MT 111", title: "Mathematics for Biological and Chemical Sciences", credits: 8, status: "Core", year: 1, semester: 1, programmeId: "bsc-pet-chem", offeringDeptId: "dept-math" },
  { code: "GY 100", title: "Introduction to Geology and Geological Processes", credits: 12, status: "Core", year: 1, semester: 1, programmeId: "bsc-pet-chem", offeringDeptId: "dept-geosciences" },
  // Year 1 S2
  { code: "CH 117", title: "Organic Chemistry I", credits: 12, status: "Core", year: 1, semester: 2, programmeId: "bsc-pet-chem", offeringDeptId: "dept-chem" },
  { code: "CH 122", title: "Chemistry Practical II", credits: 8, status: "Core", year: 1, semester: 2, programmeId: "bsc-pet-chem", offeringDeptId: "dept-chem", isPracticalOrProject: true },
  { code: "CH 173", title: "Introduction to Electronic Structure and Spectroscopy", credits: 12, status: "Core", year: 1, semester: 2, programmeId: "bsc-pet-chem", offeringDeptId: "dept-chem" },
  { code: "CH 174", title: "Scientific Methods in Chemistry", credits: 12, status: "Core", year: 1, semester: 2, programmeId: "bsc-pet-chem", offeringDeptId: "dept-chem" },
  { code: "IS 131", title: "Introduction to Informatics & Microcomputers", credits: 8, status: "Elective", year: 1, semester: 2, programmeId: "bsc-pet-chem", offeringDeptId: "dept-cse" },
  { code: "GY 120", title: "Earth Materials (Rocks and Minerals)", credits: 12, status: "Elective", year: 1, semester: 2, programmeId: "bsc-pet-chem", offeringDeptId: "dept-geosciences" },
  { code: "OG 101", title: "Introduction to Petroleum Engineering", credits: 12, status: "Elective", year: 1, semester: 2, programmeId: "bsc-pet-chem", offeringDeptId: "dept-petroleum-eng" },
  // Year 2 S1
  { code: "CH 201", title: "Chemical Thermodynamics", credits: 12, status: "Core", year: 2, semester: 1, programmeId: "bsc-pet-chem", offeringDeptId: "dept-chem" },
  { code: "CH 243", title: "Organic Chemistry II", credits: 12, status: "Core", year: 2, semester: 1, programmeId: "bsc-pet-chem", offeringDeptId: "dept-chem" },
  { code: "CH 251", title: "Formation and Composition of Petroleum", credits: 12, status: "Core", year: 2, semester: 1, programmeId: "bsc-pet-chem", offeringDeptId: "dept-chem" },
  { code: "CH 248", title: "Instrumental Methods in Analytical Chemistry", credits: 8, status: "Core", year: 2, semester: 1, programmeId: "bsc-pet-chem", offeringDeptId: "dept-chem" },
  { code: "CH 254", title: "Petroleum Chemistry Practical I", credits: 12, status: "Core", year: 2, semester: 1, programmeId: "bsc-pet-chem", offeringDeptId: "dept-chem", isPracticalOrProject: true },
  { code: "CH 262", title: "Analytical and Environmental Chemistry", credits: 12, status: "Core", year: 2, semester: 1, programmeId: "bsc-pet-chem", offeringDeptId: "dept-chem" },
  // Year 2 S2
  { code: "CH 252", title: "Chemistry of Coal", credits: 12, status: "Core", year: 2, semester: 2, programmeId: "bsc-pet-chem", offeringDeptId: "dept-chem" },
  { code: "CH 253", title: "Surface Chemistry for Petroleum Industry", credits: 12, status: "Core", year: 2, semester: 2, programmeId: "bsc-pet-chem", offeringDeptId: "dept-chem" },
  { code: "CH 255", title: "Petroleum Chemistry Practical II", credits: 12, status: "Core", year: 2, semester: 2, programmeId: "bsc-pet-chem", offeringDeptId: "dept-chem", isPracticalOrProject: true },
  { code: "CH 245", title: "Chemistry Practical V", credits: 8, status: "Elective", year: 2, semester: 2, programmeId: "bsc-pet-chem", offeringDeptId: "dept-chem", isPracticalOrProject: true },
  { code: "CH 280", title: "Organic Structure, Reactions and Mechanisms", credits: 12, status: "Elective", year: 2, semester: 2, programmeId: "bsc-pet-chem", offeringDeptId: "dept-chem" },
  { code: "PH 249", title: "Fundamentals of Materials Science", credits: 8, status: "Elective", year: 2, semester: 2, programmeId: "bsc-pet-chem", offeringDeptId: "dept-phys", notes: "8 credits in B.Sc. Petroleum Chemistry" },
  // Year 3 S1
  { code: "CH 336", title: "Petroleum Refining and Petrochemicals", credits: 12, status: "Core", year: 3, semester: 1, programmeId: "bsc-pet-chem", offeringDeptId: "dept-chem" },
  { code: "CH 337", title: "Petroleum Chemistry practical's III", credits: 12, status: "Core", year: 3, semester: 1, programmeId: "bsc-pet-chem", offeringDeptId: "dept-chem", isPracticalOrProject: true, notes: "Source title wording preserved as supplied: Petroleum Chemistry practical's III (12 credits)" },
  { code: "CH 338", title: "Corrosion and its Control in the Petroleum Industry", credits: 12, status: "Core", year: 3, semester: 1, programmeId: "bsc-pet-chem", offeringDeptId: "dept-chem" },
  { code: "CH 341", title: "Chemistry practical VI", credits: 8, status: "Core", year: 3, semester: 1, programmeId: "bsc-pet-chem", offeringDeptId: "dept-chem", isPracticalOrProject: true },
  { code: "CH 308", title: "Polymer Chemistry", credits: 8, status: "Elective", year: 3, semester: 1, programmeId: "bsc-pet-chem", offeringDeptId: "dept-chem" },
  { code: "CH 314", title: "Project Work", credits: 12, status: "Elective", year: 3, semester: 1, programmeId: "bsc-pet-chem", offeringDeptId: "dept-chem", isPracticalOrProject: true, notes: "12 credits Elective in B.Sc. Petroleum Chemistry" },
  { code: "CH 331", title: "Chemometrics", credits: 8, status: "Elective", year: 3, semester: 1, programmeId: "bsc-pet-chem", offeringDeptId: "dept-chem" },
  { code: "CH 334", title: "Fuel Cells", credits: 12, status: "Elective", year: 3, semester: 1, programmeId: "bsc-pet-chem", offeringDeptId: "dept-chem" },
  { code: "CH 363", title: "Chemical Waste Management", credits: 8, status: "Elective", year: 3, semester: 1, programmeId: "bsc-pet-chem", offeringDeptId: "dept-chem" },
  { code: "CH 377", title: "Industrial Chemistry", credits: 12, status: "Elective", year: 3, semester: 1, programmeId: "bsc-pet-chem", offeringDeptId: "dept-chem" },
  { code: "CP 473", title: "Risk Assessment and Management", credits: 12, status: "Elective", year: 3, semester: 1, programmeId: "bsc-pet-chem", offeringDeptId: "dept-cpe" },
  { code: "GM 100", title: "Principles and Practice of Management", credits: 12, status: "Elective", year: 3, semester: 1, programmeId: "bsc-pet-chem", offeringDeptId: "dept-management" },
  // Year 3 S2
  { code: "OG 310", title: "Industrial Health Safety and Environmental Protection in Petroleum Engineering", credits: 12, status: "Core", year: 3, semester: 2, programmeId: "bsc-pet-chem", offeringDeptId: "dept-petroleum-eng" },
  { code: "CH 323", title: "Organic Spectroscopy", credits: 8, status: "Core", year: 3, semester: 2, programmeId: "bsc-pet-chem", offeringDeptId: "dept-chem" },
  { code: "CH 339", title: "Petroleum Chemistry Practical IV", credits: 12, status: "Core", year: 3, semester: 2, programmeId: "bsc-pet-chem", offeringDeptId: "dept-chem", isPracticalOrProject: true },
  { code: "OG 477", title: "Petroleum Refining Techniques", credits: 12, status: "Core", year: 3, semester: 2, programmeId: "bsc-pet-chem", offeringDeptId: "dept-petroleum-eng" },
  { code: "CH 399", title: "Practical Training", credits: 8, status: "Core", year: 3, semester: 2, programmeId: "bsc-pet-chem", offeringDeptId: "dept-chem", isPracticalOrProject: true, notes: "Practical Training in Year 3 Semester 2" },
  { code: "CH 314", title: "Project Work", credits: 12, status: "Elective", year: 3, semester: 2, programmeId: "bsc-pet-chem", offeringDeptId: "dept-chem", isPracticalOrProject: true, notes: "12 credits Elective in B.Sc. Petroleum Chemistry" },
  { code: "GY 445", title: "Oil and Gas Policy and Environmental Law", credits: 12, status: "Elective", year: 3, semester: 2, programmeId: "bsc-pet-chem", offeringDeptId: "dept-geosciences" },
  { code: "CH 335", title: "Chemistry of Biofuels", credits: 12, status: "Elective", year: 3, semester: 2, programmeId: "bsc-pet-chem", offeringDeptId: "dept-chem" },
];

// 6. Chemistry Department — B.Sc. in Chemistry and Physics
const CHEM_BSC_CHEM_PHYS_COURSES: RawCourseSpec[] = [
  // Year 1 S1
  { code: "CH 118", title: "Basic Analytical and Physical Chemistry", credits: 12, status: "Core", year: 1, semester: 1, programmeId: "bsc-chem-phys", offeringDeptId: "dept-chem" },
  { code: "CH 121", title: "Chemistry practical I", credits: 8, status: "Core", year: 1, semester: 1, programmeId: "bsc-chem-phys", offeringDeptId: "dept-chem", isPracticalOrProject: true },
  { code: "CH 172", title: "Chemical Separation", credits: 12, status: "Core", year: 1, semester: 1, programmeId: "bsc-chem-phys", offeringDeptId: "dept-chem" },
  { code: "PH 122", title: "Classical Mechanics", credits: 8, status: "Core", year: 1, semester: 1, programmeId: "bsc-chem-phys", offeringDeptId: "dept-phys" },
  { code: "PH 124", title: "Optics", credits: 8, status: "Core", year: 1, semester: 1, programmeId: "bsc-chem-phys", offeringDeptId: "dept-phys" },
  { code: "PH 133", title: "Vibrations and Waves", credits: 8, status: "Core", year: 1, semester: 1, programmeId: "bsc-chem-phys", offeringDeptId: "dept-phys" },
  { code: "IS 131", title: "Introduction to Informatics and Microcomputers", credits: 8, status: "Elective", year: 1, semester: 1, programmeId: "bsc-chem-phys", offeringDeptId: "dept-cse" },
  // Year 1 S2
  { code: "CH 117", title: "Organic Chemistry I", credits: 12, status: "Core", year: 1, semester: 2, programmeId: "bsc-chem-phys", offeringDeptId: "dept-chem" },
  { code: "CH 173", title: "Introduction to Electronic Structure and Spectroscopy", credits: 12, status: "Core", year: 1, semester: 2, programmeId: "bsc-chem-phys", offeringDeptId: "dept-chem" },
  { code: "PH 116", title: "Experimental Methods of Physics I", credits: 8, status: "Core", year: 1, semester: 2, programmeId: "bsc-chem-phys", offeringDeptId: "dept-phys", isPracticalOrProject: true },
  { code: "PH 121", title: "Electricity and Magnetism", credits: 8, status: "Core", year: 1, semester: 2, programmeId: "bsc-chem-phys", offeringDeptId: "dept-phys" },
  { code: "PH 126", title: "Analogy Electronics", credits: 8, status: "Core", year: 1, semester: 2, programmeId: "bsc-chem-phys", offeringDeptId: "dept-phys", notes: "Source title preserved as supplied: Analogy Electronics" },
  { code: "CH 174", title: "Scientific Methods in Chemistry", credits: 12, status: "Elective", year: 1, semester: 2, programmeId: "bsc-chem-phys", offeringDeptId: "dept-chem" },
  // Year 2 S1
  { code: "EV 200", title: "Environmental Science I", credits: 8, status: "Core", year: 2, semester: 1, programmeId: "bsc-chem-phys", offeringDeptId: "dept-botany" },
  { code: "CH 243", title: "Organic Chemistry II", credits: 12, status: "Core", year: 2, semester: 1, programmeId: "bsc-chem-phys", offeringDeptId: "dept-chem" },
  { code: "CH 248", title: "Instrumental Methods in Analytical Chemistry", credits: 8, status: "Core", year: 2, semester: 1, programmeId: "bsc-chem-phys", offeringDeptId: "dept-chem" },
  { code: "PH 204", title: "Mathematical Methods for Physics", credits: 12, status: "Core", year: 2, semester: 1, programmeId: "bsc-chem-phys", offeringDeptId: "dept-phys" },
  { code: "PH 210", title: "Physics Practical Training I", credits: 8, status: "Core", year: 2, semester: 1, programmeId: "bsc-chem-phys", offeringDeptId: "dept-phys", isPracticalOrProject: true },
  { code: "PH 224", title: "Digital Electronics", credits: 8, status: "Core", year: 2, semester: 1, programmeId: "bsc-chem-phys", offeringDeptId: "dept-phys" },
  { code: "PH 247", title: "Experimental Methods of Physics II", credits: 8, status: "Core", year: 2, semester: 1, programmeId: "bsc-chem-phys", offeringDeptId: "dept-phys", isPracticalOrProject: true },
  { code: "CH 262", title: "Analytical and Environmental Chemistry", credits: 12, status: "Elective", year: 2, semester: 1, programmeId: "bsc-chem-phys", offeringDeptId: "dept-chem" },
  { code: "PH 222", title: "Advanced Mechanics", credits: 8, status: "Elective", year: 2, semester: 1, programmeId: "bsc-chem-phys", offeringDeptId: "dept-phys" },
  // Year 2 S2
  { code: "CH 219", title: "Systematic Inorganic Chemistry", credits: 12, status: "Core", year: 2, semester: 2, programmeId: "bsc-chem-phys", offeringDeptId: "dept-chem" },
  { code: "CH 241", title: "Chemistry Practicals III", credits: 8, status: "Core", year: 2, semester: 2, programmeId: "bsc-chem-phys", offeringDeptId: "dept-chem", isPracticalOrProject: true },
  { code: "CH 290", title: "Chemical Kinetics and Electrochemistry", credits: 12, status: "Core", year: 2, semester: 2, programmeId: "bsc-chem-phys", offeringDeptId: "dept-chem" },
  { code: "PH 217", title: "Quantum Physics", credits: 12, status: "Core", year: 2, semester: 2, programmeId: "bsc-chem-phys", offeringDeptId: "dept-phys" },
  { code: "PH 220", title: "Statistical Thermodynamics", credits: 12, status: "Core", year: 2, semester: 2, programmeId: "bsc-chem-phys", offeringDeptId: "dept-phys" },
  { code: "PH 229", title: "Computational Physics", credits: 8, status: "Core", year: 2, semester: 2, programmeId: "bsc-chem-phys", offeringDeptId: "dept-phys" },
  { code: "CH 280", title: "Organic Structure, Reactions and Mechanisms", credits: 12, status: "Elective", year: 2, semester: 2, programmeId: "bsc-chem-phys", offeringDeptId: "dept-chem" },
  { code: "PH 249", title: "Fundamentals of Materials Science", credits: 12, status: "Elective", year: 2, semester: 2, programmeId: "bsc-chem-phys", offeringDeptId: "dept-phys", notes: "12 credits in B.Sc. Chemistry and Physics (vs 8 cr in BSc Chem)" },
  // Year 3 S1
  { code: "CH 201", title: "Chemical Thermodynamics", credits: 12, status: "Core", year: 3, semester: 1, programmeId: "bsc-chem-phys", offeringDeptId: "dept-chem" },
  { code: "CH 314", title: "Project Work", credits: "12 (6)", status: "Core", year: 3, semester: 1, programmeId: "bsc-chem-phys", offeringDeptId: "dept-chem", isPracticalOrProject: true, notes: "Joint Project Work CH 314 / PH 346: 12(6) / 8(4) credits" },
  { code: "PH 346", title: "Project Work", credits: "8 (4)", status: "Core", year: 3, semester: 1, programmeId: "bsc-chem-phys", offeringDeptId: "dept-phys", isPracticalOrProject: true, notes: "Joint Project Work CH 314 / PH 346: 12(6) / 8(4) credits" },
  { code: "CH 323", title: "Organic Spectroscopy", credits: 8, status: "Core", year: 3, semester: 1, programmeId: "bsc-chem-phys", offeringDeptId: "dept-chem" },
  { code: "CH 341", title: "Chemistry Practical VI", credits: 8, status: "Core", year: 3, semester: 1, programmeId: "bsc-chem-phys", offeringDeptId: "dept-chem", isPracticalOrProject: true },
  { code: "CH 399", title: "Chemistry Practical Training II", credits: 8, status: "Core", year: 3, semester: 1, programmeId: "bsc-chem-phys", offeringDeptId: "dept-chem", isPracticalOrProject: true, notes: "Chemistry Practical Training II (8 credits in Year 3 Semester 1)" },
  { code: "PH 320", title: "Atomic Physics", credits: 12, status: "Core", year: 3, semester: 1, programmeId: "bsc-chem-phys", offeringDeptId: "dept-phys" },
  { code: "CH 303", title: "Organic Synthesis", credits: 12, status: "Elective", year: 3, semester: 1, programmeId: "bsc-chem-phys", offeringDeptId: "dept-chem" },
  { code: "CH 308", title: "Polymer Chemistry", credits: 8, status: "Elective", year: 3, semester: 1, programmeId: "bsc-chem-phys", offeringDeptId: "dept-chem" },
  { code: "CH 318", title: "Medicinal Chemistry", credits: 8, status: "Elective", year: 3, semester: 1, programmeId: "bsc-chem-phys", offeringDeptId: "dept-chem" },
  { code: "CH 363", title: "Chemical Waste Management", credits: 8, status: "Elective", year: 3, semester: 1, programmeId: "bsc-chem-phys", offeringDeptId: "dept-chem" },
  { code: "CH 371", title: "Quality Control and Assurance", credits: 8, status: "Elective", year: 3, semester: 1, programmeId: "bsc-chem-phys", offeringDeptId: "dept-chem" },
  { code: "PH 317", title: "Fundamentals of Electrodynamics", credits: 8, status: "Elective", year: 3, semester: 1, programmeId: "bsc-chem-phys", offeringDeptId: "dept-phys" },
  { code: "PH 319", title: "Fundamentals of Atmospheric Physics", credits: 8, status: "Elective", year: 3, semester: 1, programmeId: "bsc-chem-phys", offeringDeptId: "dept-phys" },
  { code: "PH 334", title: "Energy and Environment", credits: 8, status: "Elective", year: 3, semester: 1, programmeId: "bsc-chem-phys", offeringDeptId: "dept-phys" },
  // Year 3 S2
  { code: "CH 364", title: "Coordination Chemistry", credits: 8, status: "Core", year: 3, semester: 2, programmeId: "bsc-chem-phys", offeringDeptId: "dept-chem", notes: "8 credits in B.Sc. Chemistry and Physics" },
  { code: "CH 394", title: "Fundamentals of Theoretical Chemistry", credits: 12, status: "Core", year: 3, semester: 2, programmeId: "bsc-chem-phys", offeringDeptId: "dept-chem" },
  { code: "PH 326", title: "Nuclear Physics and Applications", credits: 12, status: "Core", year: 3, semester: 2, programmeId: "bsc-chem-phys", offeringDeptId: "dept-phys" },
  { code: "PH 332", title: "Solid State Physics", credits: 8, status: "Core", year: 3, semester: 2, programmeId: "bsc-chem-phys", offeringDeptId: "dept-phys" },
  { code: "PH 347", title: "Electromagnetism", credits: 8, status: "Core", year: 3, semester: 2, programmeId: "bsc-chem-phys", offeringDeptId: "dept-phys" },
  { code: "PH 359", title: "Astrophysics", credits: 8, status: "Core", year: 3, semester: 2, programmeId: "bsc-chem-phys", offeringDeptId: "dept-phys" },
  { code: "CH 305", title: "Chemistry of Natural Products", credits: 8, status: "Elective", year: 3, semester: 2, programmeId: "bsc-chem-phys", offeringDeptId: "dept-chem" },
  { code: "CH 335", title: "Chemistry of Biofuels", credits: 12, status: "Elective", year: 3, semester: 2, programmeId: "bsc-chem-phys", offeringDeptId: "dept-chem" },
  { code: "CH 351", title: "Forensic Chemistry", credits: 8, status: "Elective", year: 3, semester: 2, programmeId: "bsc-chem-phys", offeringDeptId: "dept-chem" },
  { code: "CH 374", title: "Bio-Inorganic chemistry", credits: 8, status: "Elective", year: 3, semester: 2, programmeId: "bsc-chem-phys", offeringDeptId: "dept-chem" },
  { code: "CH 379", title: "Organometallic Chemistry", credits: 12, status: "Elective", year: 3, semester: 2, programmeId: "bsc-chem-phys", offeringDeptId: "dept-chem" },
  { code: "CH 381", title: "Physical Organic Chemistry", credits: 8, status: "Elective", year: 3, semester: 2, programmeId: "bsc-chem-phys", offeringDeptId: "dept-chem" },
  { code: "PH 364", title: "The Earth-Atmosphere System", credits: 8, status: "Elective", year: 3, semester: 2, programmeId: "bsc-chem-phys", offeringDeptId: "dept-phys" },
];

async function main() {
  const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf8"));
  const app = initializeApp(config);
  const dbNamed = initializeFirestore(app, { experimentalForceLongPolling: true }, config.firestoreDatabaseId);
  const dbDefault = initializeFirestore(app, { experimentalForceLongPolling: true });

  console.log("=== STEP 1: VERIFY ACADEMIC UNIT & DEPARTMENTS ===");
  // CoNAS
  const conasDoc = await getDoc(doc(dbNamed, "academic_units", "conas"));
  if (!conasDoc.exists()) {
    throw new Error("Academic unit conas does not exist!");
  }
  console.log("✔ CoNAS verified:", conasDoc.data()?.name);

  // Department of Botany
  const botanyDoc = await getDoc(doc(dbNamed, "departments", "dept-botany"));
  if (!botanyDoc.exists()) {
    throw new Error("Department dept-botany does not exist!");
  }
  console.log("✔ Department of Botany verified:", botanyDoc.data()?.name);

  // Chemistry Department
  const chemDoc = await getDoc(doc(dbNamed, "departments", "dept-chem"));
  if (!chemDoc.exists()) {
    throw new Error("Department dept-chem does not exist!");
  }
  console.log("✔ Chemistry Department verified:", chemDoc.data()?.name);

  console.log("\n=== STEP 2: VERIFY AND SET UP PROGRAMMES ===");
  // Ensure bsc-ed has departmentIds including dept-botany and dept-chem
  const bscEdDoc = await getDoc(doc(dbNamed, "programmes", "bsc-ed"));
  if (bscEdDoc.exists()) {
    const existingData = bscEdDoc.data();
    const deptIds = new Set(existingData.departmentIds || [existingData.departmentId]);
    deptIds.add("dept-botany");
    deptIds.add("dept-chem");
    deptIds.add("dept-math");
    const updatedEdData = {
      ...existingData,
      departmentIds: Array.from(deptIds),
      collegeId: "conas",
      academicUnitId: "conas",
    };
    await setDoc(doc(dbNamed, "programmes", "bsc-ed"), updatedEdData, { merge: true });
    await setDoc(doc(dbDefault, "programmes", "bsc-ed"), updatedEdData, { merge: true });
    console.log("✔ Reused bsc-ed with updated multi-department links:", Array.from(deptIds));
  } else {
    throw new Error("bsc-ed does not exist!");
  }

  // Ensure bsc-botany exists
  const bscBotanyDoc = await getDoc(doc(dbNamed, "programmes", "bsc-botany"));
  if (!bscBotanyDoc.exists()) throw new Error("bsc-botany does not exist!");
  console.log("✔ Reused bsc-botany:", bscBotanyDoc.data()?.name);

  // Ensure bsc-chem exists
  const bscChemDoc = await getDoc(doc(dbNamed, "programmes", "bsc-chem"));
  if (!bscChemDoc.exists()) throw new Error("bsc-chem does not exist!");
  console.log("✔ Reused bsc-chem:", bscChemDoc.data()?.name);

  // Ensure bsc-pet-chem exists
  const bscPetChemDoc = await getDoc(doc(dbNamed, "programmes", "bsc-pet-chem"));
  if (!bscPetChemDoc.exists()) throw new Error("bsc-pet-chem does not exist!");
  console.log("✔ Reused bsc-pet-chem:", bscPetChemDoc.data()?.name);

  // Ensure bsc-chem-phys is created if not exists
  const bscChemPhysRef = doc(dbNamed, "programmes", "bsc-chem-phys");
  const bscChemPhysDoc = await getDoc(bscChemPhysRef);
  let chemPhysCreated = false;
  if (!bscChemPhysDoc.exists()) {
    const chemPhysData = {
      id: "bsc-chem-phys",
      name: "Bachelor of Science in Chemistry and Physics",
      shortName: "BSc Chem & Phys",
      awardLevel: "Bachelor Degree",
      departmentId: "dept-chem",
      academicUnitId: "conas",
      collegeId: "conas",
      universityId: "udsm",
      durationYears: 3,
      semestersPerYear: 2,
      studyMode: "Full-Time",
      academicYear: "2025/2026",
      source: "UDSM Undergraduate Prospectus 2025/2026 (Official Source of Truth)",
      sourceType: "official_prospectus",
      verified: true
    };
    await setDoc(doc(dbNamed, "programmes", "bsc-chem-phys"), chemPhysData);
    await setDoc(doc(dbDefault, "programmes", "bsc-chem-phys"), chemPhysData);
    chemPhysCreated = true;
    console.log("✔ Created bsc-chem-phys under dept-chem in both DBs");
  } else {
    console.log("✔ Reused existing bsc-chem-phys");
  }

  console.log("\n=== STEP 3: CLEAN UP OBSOLETE PLACEHOLDER COURSES ===");
  // Remove old placeholder courses for bsc-botany, bsc-chem, bsc-pet-chem, bsc-chem-phys
  const progsToClean = ["bsc-botany", "bsc-chem", "bsc-pet-chem", "bsc-chem-phys"];
  let purgedCount = 0;
  for (const pid of progsToClean) {
    const qProg = query(collection(dbNamed, "programme_courses"), where("programmeId", "==", pid));
    const snapProg = await getDocs(qProg);
    const qCat = query(collection(dbNamed, "catalogue_courses"), where("programmeId", "==", pid));
    const snapCat = await getDocs(qCat);

    const batchNamed = writeBatch(dbNamed);
    const batchDefault = writeBatch(dbDefault);

    snapProg.docs.forEach(d => {
      batchNamed.delete(d.ref);
      batchDefault.delete(doc(dbDefault, "programme_courses", d.id));
      purgedCount++;
    });
    snapCat.docs.forEach(d => {
      batchNamed.delete(d.ref);
      batchDefault.delete(doc(dbDefault, "catalogue_courses", d.id));
    });

    await batchNamed.commit();
    await batchDefault.commit();
  }
  console.log(`✔ Cleaned up ${purgedCount} obsolete/placeholder curriculum records for Botany & Chemistry programmes.`);

  console.log("\n=== STEP 4: RECONCILE CANONICAL COURSES ===");
  const allCurriculumSpecs: RawCourseSpec[] = [
    ...BOTANY_BSC_ED_COURSES,
    ...BOTANY_BSC_BOTANY_COURSES,
    ...CHEM_BSC_ED_COURSES,
    ...CHEM_BSC_CHEM_COURSES,
    ...CHEM_BSC_PET_CHEM_COURSES,
    ...CHEM_BSC_CHEM_PHYS_COURSES
  ];

  const canonSnap = await getDocs(collection(dbNamed, "canonical_courses"));
  const existingCanonicalMap = new Map<string, any>();
  canonSnap.forEach(d => {
    const data = d.data();
    const code = (data.code || "").trim().toUpperCase();
    if (code) {
      existingCanonicalMap.set(code, { docId: d.id, ...data });
    }
  });

  const conflictsDetected: any[] = [];
  const canonicalToCreate = new Map<string, any>();
  let canonicalReusedCount = 0;

  for (const spec of allCurriculumSpecs) {
    const codeUpper = spec.code.trim().toUpperCase();
    const existing = existingCanonicalMap.get(codeUpper);

    if (existing) {
      canonicalReusedCount++;
      // Check for discrepancies
      const titleDiff = (existing.title || "").trim().toLowerCase() !== spec.title.trim().toLowerCase();
      const existingCreditsNum = Number(existing.credits);
      const suppliedCreditsNum = typeof spec.credits === "number" ? spec.credits : parseInt(String(spec.credits));
      const creditDiff = !isNaN(existingCreditsNum) && !isNaN(suppliedCreditsNum) && existingCreditsNum !== suppliedCreditsNum;

      if (titleDiff || creditDiff) {
        conflictsDetected.push({
          courseCode: codeUpper,
          existingTitle: existing.title,
          suppliedTitle: spec.title,
          existingCredits: existing.credits,
          suppliedCredits: spec.credits,
          affectedProgramme: spec.programmeId,
          affectedYearSemester: `Y${spec.year}S${spec.semester}`,
          actionTaken: "Existing canonical course preserved untouched without overwriting; curriculum relationship records supplied title and credits."
        });
      }
    } else {
      if (!canonicalToCreate.has(codeUpper)) {
        const slug = codeUpper.toLowerCase().replace(/[^a-z0-9]/g, "_");
        const creditsVal = typeof spec.credits === "number" ? spec.credits : parseInt(String(spec.credits)) || 8;
        canonicalToCreate.set(codeUpper, {
          id: slug,
          code: codeUpper,
          title: spec.title,
          credits: creditsVal,
          departmentId: spec.offeringDeptId || "dept-chem",
          academicUnitId: "conas",
          universityId: "udsm",
          level: "Undergraduate",
          verified: true,
          source: "UDSM Undergraduate Prospectus 2025/2026 (Official Source of Truth)",
          sourceType: "official_prospectus",
          academicYear: "2025/2026"
        });
      }
    }
  }

  console.log(`Reusing ${canonicalReusedCount} canonical course references across curriculum.`);
  console.log(`Creating ${canonicalToCreate.size} new unique canonical courses in Firestore.`);

  // Write new canonical courses in chunks of 200
  const canonEntries = Array.from(canonicalToCreate.values());
  for (let i = 0; i < canonEntries.length; i += 200) {
    const chunk = canonEntries.slice(i, i + 200);
    const bNamed = writeBatch(dbNamed);
    const bDef = writeBatch(dbDefault);
    for (const c of chunk) {
      bNamed.set(doc(dbNamed, "canonical_courses", c.id), c);
      bDef.set(doc(dbDefault, "canonical_courses", c.id), c);
    }
    await bNamed.commit();
    await bDef.commit();
  }
  console.log("✔ New canonical courses written to both DBs.");

  console.log("\n=== STEP 5: WRITE CURRICULUM RELATIONSHIPS ===");
  // Write curriculum records to both programme_courses and catalogue_courses
  let relCreatedCount = 0;
  for (let i = 0; i < allCurriculumSpecs.length; i += 150) {
    const chunk = allCurriculumSpecs.slice(i, i + 150);
    const bNamed = writeBatch(dbNamed);
    const bDef = writeBatch(dbDefault);

    for (const spec of chunk) {
      const codeUpper = spec.code.trim().toUpperCase();
      const codeSlug = codeUpper.toLowerCase().replace(/[^a-z0-9]/g, "_");
      // Unique document id combining programmeId, codeSlug, year, semester
      const relDocId = `${spec.programmeId}_${codeSlug}_y${spec.year}s${spec.semester}`;

      const relData: any = {
        id: relDocId,
        programmeId: spec.programmeId,
        courseId: codeSlug,
        code: codeUpper,
        title: spec.title,
        credits: spec.credits,
        status: spec.status,
        courseType: spec.status,
        yearOfStudy: spec.year,
        year: spec.year,
        semester: spec.semester,
        offeringDepartmentId: spec.offeringDeptId || "dept-chem",
        departmentId: spec.offeringDeptId || "dept-chem",
        academicUnitId: "conas",
        collegeId: "conas",
        universityId: "udsm",
        academicYear: "2025/2026",
        source: "UDSM Undergraduate Prospectus 2025/2026 (Official Source of Truth)",
        sourceType: "official_prospectus",
        verified: true,
      };

      if (spec.isPracticalOrProject) {
        relData.isPracticalOrProject = true;
      }
      if (spec.notes) {
        relData.note = spec.notes;
        relData.notes = spec.notes;
      }

      bNamed.set(doc(dbNamed, "programme_courses", relDocId), relData);
      bDef.set(doc(dbDefault, "programme_courses", relDocId), relData);

      bNamed.set(doc(dbNamed, "catalogue_courses", relDocId), relData);
      bDef.set(doc(dbDefault, "catalogue_courses", relDocId), relData);

      relCreatedCount++;
    }

    await bNamed.commit();
    await bDef.commit();
  }
  console.log(`✔ Created ${relCreatedCount} curriculum relationships across programme_courses and catalogue_courses in both DBs.`);

  // Write audit report
  const auditReport = {
    college: {
      id: "conas",
      name: conasDoc.data()?.name,
      status: "reused"
    },
    departments: [
      { id: "dept-botany", name: botanyDoc.data()?.name, status: "reused" },
      { id: "dept-chem", name: chemDoc.data()?.name, status: "reused" }
    ],
    programmes: [
      { id: "bsc-ed", name: "Bachelor of Science with Education", status: "reused (joint programme for Botany, Chemistry & Math)", coursesCount: BOTANY_BSC_ED_COURSES.length + CHEM_BSC_ED_COURSES.length },
      { id: "bsc-botany", name: "Bachelor of Science in Botanical Sciences", status: "reused", coursesCount: BOTANY_BSC_BOTANY_COURSES.length },
      { id: "bsc-chem", name: "Bachelor of Science in Chemistry", status: "reused", coursesCount: CHEM_BSC_CHEM_COURSES.length },
      { id: "bsc-pet-chem", name: "Bachelor of Science in Petroleum Chemistry", status: "reused", coursesCount: CHEM_BSC_PET_CHEM_COURSES.length },
      { id: "bsc-chem-phys", name: "Bachelor of Science in Chemistry and Physics", status: chemPhysCreated ? "created" : "reused", coursesCount: CHEM_BSC_CHEM_PHYS_COURSES.length }
    ],
    canonicalCoursesReused: canonicalReusedCount,
    canonicalCoursesCreated: canonicalToCreate.size,
    curriculumRelationshipsCreated: relCreatedCount,
    conflictsDetected
  };

  fs.writeFileSync("./scripts/conas_botany_chem_audit_report.json", JSON.stringify(auditReport, null, 2), "utf8");
  console.log("✔ Audit report written to ./scripts/conas_botany_chem_audit_report.json");
  process.exit(0);
}

main().catch(err => {
  console.error("Import failed:", err);
  process.exit(1);
});
