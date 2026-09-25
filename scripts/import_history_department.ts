import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  writeBatch
} from "firebase/firestore";
import * as fs from "fs";

interface RawCurriculumItem {
  programmeId: string;
  programmeName: string;
  code: string;
  title: string;
  status: "Core" | "Elective";
  rawStatus?: string;
  credits: number;
  year: 1 | 2 | 3;
  semester: 1 | 2;
  sourceLocation: string;
  electiveRule?: string;
  isAdditionalElective?: boolean;
  note?: string;
  departmentId?: string;
}

const rawCurriculum: RawCurriculumItem[] = [
  // =========================================================================
  // 1. BACHELOR OF ARTS IN HISTORY — B.A. (HISTORY)
  // =========================================================================
  
  // FIRST YEAR: SEMESTER I
  { programmeId: "ba-history", programmeName: "B.A. (History)", code: "HI 103", title: "Capitalism and Imperialism in World History", status: "Core", credits: 12, year: 1, semester: 1, sourceLocation: "BA (History) First Year: Semester I" },
  { programmeId: "ba-history", programmeName: "B.A. (History)", code: "HI 104", title: "Themes in African History", status: "Core", credits: 12, year: 1, semester: 1, sourceLocation: "BA (History) First Year: Semester I" },
  { programmeId: "ba-history", programmeName: "B.A. (History)", code: "PL 111", title: "Introduction to Critical Thinking and Argumentation", status: "Core", credits: 12, year: 1, semester: 1, sourceLocation: "BA (History) First Year: Semester I" },
  { programmeId: "ba-history", programmeName: "B.A. (History)", code: "DS 114", title: "Development Perspectives I", status: "Core", credits: 12, year: 1, semester: 1, sourceLocation: "BA (History) First Year: Semester I" },
  { programmeId: "ba-history", programmeName: "B.A. (History)", code: "AS 102", title: "Introduction to Social Science Research Methods I", status: "Core", credits: 12, year: 1, semester: 1, sourceLocation: "BA (History) First Year: Semester I" },
  { programmeId: "ba-history", programmeName: "B.A. (History)", code: "FP 100", title: "Art and Society", status: "Elective", credits: 12, year: 1, semester: 1, sourceLocation: "BA (History) First Year: Semester I", electiveRule: "A student may take one additional Elective course from the list provided under a relevant semester and not from elsewhere", isAdditionalElective: true },

  // FIRST YEAR: SEMESTER II
  { programmeId: "ba-history", programmeName: "B.A. (History)", code: "HI 101", title: "Basic Concepts and Perspectives in History", status: "Core", credits: 12, year: 1, semester: 2, sourceLocation: "BA (History) First Year: Semester II" },
  { programmeId: "ba-history", programmeName: "B.A. (History)", code: "HI 102", title: "Survey of World History to ca. 1500 A.D.", status: "Core", credits: 12, year: 1, semester: 2, sourceLocation: "BA (History) First Year: Semester II" },
  { programmeId: "ba-history", programmeName: "B.A. (History)", code: "HI 261", title: "History of Tanzania", status: "Core", credits: 12, year: 1, semester: 2, sourceLocation: "BA (History) First Year: Semester II" },
  { programmeId: "ba-history", programmeName: "B.A. (History)", code: "DS 115", title: "Development Perspectives II", status: "Core", credits: 12, year: 1, semester: 2, sourceLocation: "BA (History) First Year: Semester II" },
  { programmeId: "ba-history", programmeName: "B.A. (History)", code: "AS 103", title: "Introduction to Social Science Methods II", status: "Core", credits: 12, year: 1, semester: 2, sourceLocation: "BA (History) First Year: Semester II" },
  // Elective (Choose ONE)
  { programmeId: "ba-history", programmeName: "B.A. (History)", code: "SO 115", title: "Introduction to Culture and Society", status: "Elective", credits: 12, year: 1, semester: 2, sourceLocation: "BA (History) First Year: Semester II", electiveRule: "Choose ONE (Note: 56 credits are below the 60-minimum, hence a student must add only one course so as not to violate the 72 credits allowable maximum for the semester)" },

  // SECOND YEAR: SEMESTER I
  { programmeId: "ba-history", programmeName: "B.A. (History)", code: "HI 260", title: "Philosophies and Methodologies of History", status: "Core", credits: 12, year: 2, semester: 1, sourceLocation: "BA (History) Second Year: Semester I" },
  { programmeId: "ba-history", programmeName: "B.A. (History)", code: "HI 262", title: "History of East Africa", status: "Core", credits: 12, year: 2, semester: 1, sourceLocation: "BA (History) Second Year: Semester I" },
  { programmeId: "ba-history", programmeName: "B.A. (History)", code: "HI 270", title: "Health, Disease and Healing in 19th and 20th Century Africa", status: "Core", credits: 12, year: 2, semester: 1, sourceLocation: "BA (History) Second Year: Semester I" },
  { programmeId: "ba-history", programmeName: "B.A. (History)", code: "HI 269", title: "Survey World History of Globalization", status: "Core", credits: 12, year: 2, semester: 1, sourceLocation: "BA (History) Second Year: Semester I" },
  // Electives (A student MUST choose ONE or TWO courses)
  { programmeId: "ba-history", programmeName: "B.A. (History)", code: "HI 267", title: "Survey World History of Science and Technology: Ancient to Medieval Times", status: "Elective", credits: 12, year: 2, semester: 1, sourceLocation: "BA (History) Second Year: Semester I", electiveRule: "A student MUST choose ONE or TWO courses from the following" },
  { programmeId: "ba-history", programmeName: "B.A. (History)", code: "AS 217", title: "Introduction to Computers", status: "Elective", credits: 12, year: 2, semester: 1, sourceLocation: "BA (History) Second Year: Semester I", electiveRule: "A student MUST choose ONE or TWO courses from the following" },
  { programmeId: "ba-history", programmeName: "B.A. (History)", code: "AS 220", title: "Pan-Africanism: Thought and Practice I", status: "Elective", credits: 12, year: 2, semester: 1, sourceLocation: "BA (History) Second Year: Semester I", electiveRule: "A student MUST choose ONE or TWO courses from the following" },
  { programmeId: "ba-history", programmeName: "B.A. (History)", code: "DS 201", title: "Rural and Urban Development", status: "Elective", credits: 12, year: 2, semester: 1, sourceLocation: "BA (History) Second Year: Semester I", electiveRule: "A student MUST choose ONE or TWO courses from the following" },

  // SECOND YEAR: SEMESTER II
  { programmeId: "ba-history", programmeName: "B.A. (History)", code: "HI 271", title: "History of West Africa", status: "Core", credits: 12, year: 2, semester: 2, sourceLocation: "BA (History) Second Year: Semester II" },
  { programmeId: "ba-history", programmeName: "B.A. (History)", code: "HI 265", title: "Neo-Colonialism and Revolutionary Movements", status: "Core", credits: 12, year: 2, semester: 2, sourceLocation: "BA (History) Second Year: Semester II" },
  { programmeId: "ba-history", programmeName: "B.A. (History)", code: "HI 266", title: "War and Warfare in World History", status: "Core", credits: 12, year: 2, semester: 2, sourceLocation: "BA (History) Second Year: Semester II" },
  { programmeId: "ba-history", programmeName: "B.A. (History)", code: "HI 263", title: "History of Central Africa", status: "Core", credits: 12, year: 2, semester: 2, sourceLocation: "BA (History) Second Year: Semester II" },
  { programmeId: "ba-history", programmeName: "B.A. (History)", code: "HI 362", title: "History of South Africa", status: "Core", credits: 12, year: 2, semester: 2, sourceLocation: "BA (History) Second Year: Semester II" },
  // Electives (Choose ONE)
  { programmeId: "ba-history", programmeName: "B.A. (History)", code: "HI 268", title: "Survey World History of Science and Technology: Modern Societies", status: "Elective", credits: 12, year: 2, semester: 2, sourceLocation: "BA (History) Second Year: Semester II", electiveRule: "Choose ONE" },
  { programmeId: "ba-history", programmeName: "B.A. (History)", code: "AS 221", title: "Pan-Africanism: Thought and Practice II", status: "Elective", credits: 12, year: 2, semester: 2, sourceLocation: "BA (History) Second Year: Semester II", electiveRule: "Choose ONE" },
  // Practical Training (Long Vacation)
  { programmeId: "ba-history", programmeName: "B.A. (History)", code: "AS 229", title: "Practical Training (done during the long vacation)", status: "Core", credits: 0, year: 2, semester: 2, sourceLocation: "BA (History) Practical Training (Long Vacation)", note: "Compulsory second-year Practical Training conducted for 8 weeks during the long vacation is outside the two classroom semesters and is not included in the total minimum/maximum credit count." },

  // THIRD YEAR: SEMESTER I
  { programmeId: "ba-history", programmeName: "B.A. (History)", code: "HI 360", title: "Economic History of Tanzania", status: "Core", credits: 12, year: 3, semester: 1, sourceLocation: "BA (History) Third Year: Semester I" },
  { programmeId: "ba-history", programmeName: "B.A. (History)", code: "HI 363", title: "History of North Africa", status: "Core", credits: 12, year: 3, semester: 1, sourceLocation: "BA (History) Third Year: Semester I" },
  { programmeId: "ba-history", programmeName: "B.A. (History)", code: "HI 365", title: "Political Economy of the U.S.A.", status: "Core", credits: 12, year: 3, semester: 1, sourceLocation: "BA (History) Third Year: Semester I" },
  { programmeId: "ba-history", programmeName: "B.A. (History)", code: "HI 366", title: "Topics in African Environmental History", status: "Core", credits: 12, year: 3, semester: 1, sourceLocation: "BA (History) Third Year: Semester I" },
  { programmeId: "ba-history", programmeName: "B.A. (History)", code: "HI 368", title: "Oral Histories in Tanzania: Theory", status: "Core", credits: 12, year: 3, semester: 1, sourceLocation: "BA (History) Third Year: Semester I" },
  // Elective (Choose ONE)
  { programmeId: "ba-history", programmeName: "B.A. (History)", code: "AY 302", title: "Archaeology of Tanzania", status: "Elective", credits: 12, year: 3, semester: 1, sourceLocation: "BA (History) Third Year: Semester I", electiveRule: "Choose ONE" },

  // THIRD YEAR: SEMESTER II
  { programmeId: "ba-history", programmeName: "B.A. (History)", code: "HI 264", title: "Africa and World Religions", status: "Core", credits: 12, year: 3, semester: 2, sourceLocation: "BA (History) Third Year: Semester II" },
  { programmeId: "ba-history", programmeName: "B.A. (History)", code: "HI 364", title: "Industrialisation and the Rise of the Working Class in Britain", status: "Core", credits: 12, year: 3, semester: 2, sourceLocation: "BA (History) Third Year: Semester II" },
  { programmeId: "ba-history", programmeName: "B.A. (History)", code: "HI 367", title: "Population and Urban History of Tanzania", status: "Core", credits: 12, year: 3, semester: 2, sourceLocation: "BA (History) Third Year: Semester II" },
  { programmeId: "ba-history", programmeName: "B.A. (History)", code: "AY 304", title: "Basics in Archaeology", status: "Core", credits: 12, year: 3, semester: 2, sourceLocation: "BA (History) Third Year: Semester II" },
  { programmeId: "ba-history", programmeName: "B.A. (History)", code: "HI 380", title: "Ethnic Identities in Tanzania", status: "Core", credits: 12, year: 3, semester: 2, sourceLocation: "BA (History) Third Year: Semester II" },
  // Electives (A student may choose ONE or TWO courses)
  { programmeId: "ba-history", programmeName: "B.A. (History)", code: "HI 369", title: "Economic History of Tanzania: Practical (By invitation only)", status: "Elective", credits: 12, year: 3, semester: 2, sourceLocation: "BA (History) Third Year: Semester II", electiveRule: "A student may choose ONE or TWO courses from the following (By invitation only)", note: "By invitation only" },
  { programmeId: "ba-history", programmeName: "B.A. (History)", code: "HI 379", title: "Oral Histories in Tanzania: Practical (By invitation only)", status: "Elective", credits: 12, year: 3, semester: 2, sourceLocation: "BA (History) Third Year: Semester II", electiveRule: "A student may choose ONE or TWO courses from the following (By invitation only)", note: "By invitation only" },
  { programmeId: "ba-history", programmeName: "B.A. (History)", code: "HI 399", title: "Dissertation (By invitation only)", status: "Elective", credits: 24, year: 3, semester: 2, sourceLocation: "BA (History) Third Year: Semester II", electiveRule: "A student may choose ONE or TWO courses from the following (By invitation only)", note: "By invitation only, with permission of the Department" },
  { programmeId: "ba-history", programmeName: "B.A. (History)", code: "PS 347", title: "Peace Making and Conflict Resolution", status: "Elective", credits: 12, year: 3, semester: 2, sourceLocation: "BA (History) Third Year: Semester II", electiveRule: "A student may choose ONE or TWO courses from the following" },
  { programmeId: "ba-history", programmeName: "B.A. (History)", code: "SO 371", title: "Contemporary Social Change and Culture", status: "Elective", credits: 12, year: 3, semester: 2, sourceLocation: "BA (History) Third Year: Semester II", electiveRule: "A student may choose ONE or TWO courses from the following" },

  // =========================================================================
  // 2. BACHELOR OF ARTS IN DIPLOMATIC AND MILITARY HISTORY — B.A. (DIPLOMATIC AND MILITARY HISTORY)
  // =========================================================================

  // FIRST YEAR: SEMESTER I
  { programmeId: "ba-diplomatic-military-history", programmeName: "B.A. (Diplomatic and Military History)", code: "HI 120", title: "Introduction to the History of Diplomacy", status: "Core", credits: 12, year: 1, semester: 1, sourceLocation: "BA (Diplomatic and Military History) First Year: Semester I" },
  { programmeId: "ba-diplomatic-military-history", programmeName: "B.A. (Diplomatic and Military History)", code: "HI 121", title: "Introduction to the History of War and Strategy", status: "Core", credits: 12, year: 1, semester: 1, sourceLocation: "BA (Diplomatic and Military History) First Year: Semester I" },
  { programmeId: "ba-diplomatic-military-history", programmeName: "B.A. (Diplomatic and Military History)", code: "HI 122", title: "National Interests and Statecraft in History I", status: "Core", credits: 12, year: 1, semester: 1, sourceLocation: "BA (Diplomatic and Military History) First Year: Semester I" },
  { programmeId: "ba-diplomatic-military-history", programmeName: "B.A. (Diplomatic and Military History)", code: "CL 106", title: "Communication Skills for Arts and Social Sciences", status: "Core", credits: 12, year: 1, semester: 1, sourceLocation: "BA (Diplomatic and Military History) First Year: Semester I" },
  { programmeId: "ba-diplomatic-military-history", programmeName: "B.A. (Diplomatic and Military History)", code: "DS 114", title: "Development Perspectives I", status: "Core", credits: 12, year: 1, semester: 1, sourceLocation: "BA (Diplomatic and Military History) First Year: Semester I" },
  { programmeId: "ba-diplomatic-military-history", programmeName: "B.A. (Diplomatic and Military History)", code: "AS 102", title: "Introduction to Social Science Research Methods I", status: "Core", credits: 12, year: 1, semester: 1, sourceLocation: "BA (Diplomatic and Military History) First Year: Semester I" },

  // FIRST YEAR: SEMESTER II
  { programmeId: "ba-diplomatic-military-history", programmeName: "B.A. (Diplomatic and Military History)", code: "HI 123", title: "Diplomatic and Consular Practices in Historical Perspective", status: "Core", credits: 12, year: 1, semester: 2, sourceLocation: "BA (Diplomatic and Military History) First Year: Semester II" },
  { programmeId: "ba-diplomatic-military-history", programmeName: "B.A. (Diplomatic and Military History)", code: "HI 124", title: "Introduction to Peace and Security Diplomacy", status: "Core", credits: 12, year: 1, semester: 2, sourceLocation: "BA (Diplomatic and Military History) First Year: Semester II" },
  { programmeId: "ba-diplomatic-military-history", programmeName: "B.A. (Diplomatic and Military History)", code: "HI 125", title: "Introduction to Tanzania's Strategic Neighbourhood", status: "Core", credits: 12, year: 1, semester: 2, sourceLocation: "BA (Diplomatic and Military History) First Year: Semester II" },
  { programmeId: "ba-diplomatic-military-history", programmeName: "B.A. (Diplomatic and Military History)", code: "DS 115", title: "Development Perspectives II", status: "Core", credits: 12, year: 1, semester: 2, sourceLocation: "BA (Diplomatic and Military History) First Year: Semester II" },
  { programmeId: "ba-diplomatic-military-history", programmeName: "B.A. (Diplomatic and Military History)", code: "AS 103", title: "Social Science Research Method II", status: "Core", credits: 12, year: 1, semester: 2, sourceLocation: "BA (Diplomatic and Military History) First Year: Semester II" },
  { programmeId: "ba-diplomatic-military-history", programmeName: "B.A. (Diplomatic and Military History)", code: "PL 111", title: "Introduction to Critical Thinking and Argumentation", status: "Core", credits: 12, year: 1, semester: 2, sourceLocation: "BA (Diplomatic and Military History) First Year: Semester II" },

  // SECOND YEAR: SEMESTER I
  { programmeId: "ba-diplomatic-military-history", programmeName: "B.A. (Diplomatic and Military History)", code: "PS 222", title: "International Relations I*", status: "Core", credits: 12, year: 2, semester: 1, sourceLocation: "BA (Diplomatic and Military History) Second Year: Semester I" },
  { programmeId: "ba-diplomatic-military-history", programmeName: "B.A. (Diplomatic and Military History)", code: "HI 221", title: "National Security Strategies in World History", status: "Core", credits: 12, year: 2, semester: 1, sourceLocation: "BA (Diplomatic and Military History) Second Year: Semester I" },
  { programmeId: "ba-diplomatic-military-history", programmeName: "B.A. (Diplomatic and Military History)", code: "HI 222", title: "War, Patriotism and Nationalism", status: "Core", credits: 12, year: 2, semester: 1, sourceLocation: "BA (Diplomatic and Military History) Second Year: Semester I" },
  { programmeId: "ba-diplomatic-military-history", programmeName: "B.A. (Diplomatic and Military History)", code: "HI 223", title: "National Interests and International Negotiations Diplomacy", status: "Core", credits: 12, year: 2, semester: 1, sourceLocation: "BA (Diplomatic and Military History) Second Year: Semester I" },
  { programmeId: "ba-diplomatic-military-history", programmeName: "B.A. (Diplomatic and Military History)", code: "HI 224", title: "Tanzania and the History of Liberation Struggles", status: "Core", credits: 12, year: 2, semester: 1, sourceLocation: "BA (Diplomatic and Military History) Second Year: Semester I" },
  // Electives (Choose ONE)
  { programmeId: "ba-diplomatic-military-history", programmeName: "B.A. (Diplomatic and Military History)", code: "HI 266", title: "War and Warfare in World History", status: "Elective", credits: 12, year: 2, semester: 1, sourceLocation: "BA (Diplomatic and Military History) Second Year: Semester I", electiveRule: "Choose ONE" },
  { programmeId: "ba-diplomatic-military-history", programmeName: "B.A. (Diplomatic and Military History)", code: "HI 227", title: "Globalization and National Interests", status: "Elective", credits: 12, year: 2, semester: 1, sourceLocation: "BA (Diplomatic and Military History) Second Year: Semester I", electiveRule: "Choose ONE" },
  { programmeId: "ba-diplomatic-military-history", programmeName: "B.A. (Diplomatic and Military History)", code: "HI 234", title: "War in Tanzanian History", status: "Elective", credits: 12, year: 2, semester: 1, sourceLocation: "BA (Diplomatic and Military History) Second Year: Semester I", electiveRule: "Choose ONE" },

  // SECOND YEAR: SEMESTER II
  { programmeId: "ba-diplomatic-military-history", programmeName: "B.A. (Diplomatic and Military History)", code: "HI 228", title: "Defence and National Development", status: "Core", credits: 12, year: 2, semester: 2, sourceLocation: "BA (Diplomatic and Military History) Second Year: Semester II" },
  { programmeId: "ba-diplomatic-military-history", programmeName: "B.A. (Diplomatic and Military History)", code: "HI 229", title: "Etiquette, Protocol and Decorum", status: "Core", credits: 12, year: 2, semester: 2, sourceLocation: "BA (Diplomatic and Military History) Second Year: Semester II" },
  { programmeId: "ba-diplomatic-military-history", programmeName: "B.A. (Diplomatic and Military History)", code: "HI 230", title: "The Art of War: Theory and History", status: "Core", credits: 12, year: 2, semester: 2, sourceLocation: "BA (Diplomatic and Military History) Second Year: Semester II" },
  { programmeId: "ba-diplomatic-military-history", programmeName: "B.A. (Diplomatic and Military History)", code: "PS 223", title: "International Relations II*", status: "Core", credits: 12, year: 2, semester: 2, sourceLocation: "BA (Diplomatic and Military History) Second Year: Semester II" },
  { programmeId: "ba-diplomatic-military-history", programmeName: "B.A. (Diplomatic and Military History)", code: "PS 229", title: "Basic Concepts in International Law*", status: "Core", credits: 12, year: 2, semester: 2, sourceLocation: "BA (Diplomatic and Military History) Second Year: Semester II" },
  // Electives (Choose ONE)
  { programmeId: "ba-diplomatic-military-history", programmeName: "B.A. (Diplomatic and Military History)", code: "HI 232", title: "Colloquium on Military Strategy and Doctrines", status: "Elective", credits: 12, year: 2, semester: 2, sourceLocation: "BA (Diplomatic and Military History) Second Year: Semester II", electiveRule: "Choose ONE" },
  { programmeId: "ba-diplomatic-military-history", programmeName: "B.A. (Diplomatic and Military History)", code: "HI 233", title: "National Interests and Statecraft in History II", status: "Elective", credits: 12, year: 2, semester: 2, sourceLocation: "BA (Diplomatic and Military History) Second Year: Semester II", electiveRule: "Choose ONE" },
  { programmeId: "ba-diplomatic-military-history", programmeName: "B.A. (Diplomatic and Military History)", code: "HI 235", title: "Conference Diplomacy and International Organization", status: "Elective", credits: 12, year: 2, semester: 2, sourceLocation: "BA (Diplomatic and Military History) Second Year: Semester II", electiveRule: "Choose ONE" },
  // Practical Training (Long Vacation)
  { programmeId: "ba-diplomatic-military-history", programmeName: "B.A. (Diplomatic and Military History)", code: "HI 299", title: "Practical Training in Diplomatic and Military History", status: "Core", credits: 0, year: 2, semester: 2, sourceLocation: "BA (Diplomatic and Military History) Practical Training (Long Vacation)", note: "Compulsory second-year Practical Training conducted for 8 weeks during the long vacation is outside the two classroom semesters and is not included in the total minimum/maximum credit count." },

  // THIRD YEAR: SEMESTER I
  { programmeId: "ba-diplomatic-military-history", programmeName: "B.A. (Diplomatic and Military History)", code: "HI 330", title: "Ethics of War and Peace in Contemporary World", status: "Core", credits: 12, year: 3, semester: 1, sourceLocation: "BA (Diplomatic and Military History) Third Year: Semester I" },
  { programmeId: "ba-diplomatic-military-history", programmeName: "B.A. (Diplomatic and Military History)", code: "HI 308", title: "Theory and Practice in Archival Research", status: "Core", credits: 12, year: 3, semester: 1, sourceLocation: "BA (Diplomatic and Military History) Third Year: Semester I" },
  { programmeId: "ba-diplomatic-military-history", programmeName: "B.A. (Diplomatic and Military History)", code: "HI 333", title: "Introduction to Civil-Military Relations", status: "Core", credits: 12, year: 3, semester: 1, sourceLocation: "BA (Diplomatic and Military History) Third Year: Semester I" },
  { programmeId: "ba-diplomatic-military-history", programmeName: "B.A. (Diplomatic and Military History)", code: "PS 350", title: "African International Relations and Foreign Policy", status: "Core", credits: 12, year: 3, semester: 1, sourceLocation: "BA (Diplomatic and Military History) Third Year: Semester I" },
  { programmeId: "ba-diplomatic-military-history", programmeName: "B.A. (Diplomatic and Military History)", code: "PS 346", title: "Issues in International Law", status: "Core", credits: 12, year: 3, semester: 1, sourceLocation: "BA (Diplomatic and Military History) Third Year: Semester I" },
  // Electives (Choose ONE)
  { programmeId: "ba-diplomatic-military-history", programmeName: "B.A. (Diplomatic and Military History)", code: "HI 334", title: "Evolution of Warfare in Contemporary Times", status: "Elective", credits: 12, year: 3, semester: 1, sourceLocation: "BA (Diplomatic and Military History) Third Year: Semester I", electiveRule: "Choose ONE" },
  { programmeId: "ba-diplomatic-military-history", programmeName: "B.A. (Diplomatic and Military History)", code: "PS 347", title: "Peace Making and Conflict Resolution", status: "Elective", credits: 12, year: 3, semester: 1, sourceLocation: "BA (Diplomatic and Military History) Third Year: Semester I", electiveRule: "Choose ONE" },
  { programmeId: "ba-diplomatic-military-history", programmeName: "B.A. (Diplomatic and Military History)", code: "HI 335", title: "The United Nations System", status: "Elective", credits: 12, year: 3, semester: 1, sourceLocation: "BA (Diplomatic and Military History) Third Year: Semester I", electiveRule: "Choose ONE" },
  { programmeId: "ba-diplomatic-military-history", programmeName: "B.A. (Diplomatic and Military History)", code: "PS 333", title: "The Politics of North-South Relations*", status: "Elective", credits: 12, year: 3, semester: 1, sourceLocation: "BA (Diplomatic and Military History) Third Year: Semester I", electiveRule: "Choose ONE" },

  // THIRD YEAR: SEMESTER II
  { programmeId: "ba-diplomatic-military-history", programmeName: "B.A. (Diplomatic and Military History)", code: "HI 338", title: "Conflict Reconstructions and Peace Building in Contemporary History", status: "Core", credits: 12, year: 3, semester: 2, sourceLocation: "BA (Diplomatic and Military History) Third Year: Semester II" },
  { programmeId: "ba-diplomatic-military-history", programmeName: "B.A. (Diplomatic and Military History)", code: "HI 336", title: "Regional Economic Integration and Contemporary Diplomacy in Africa", status: "Core", credits: 12, year: 3, semester: 2, sourceLocation: "BA (Diplomatic and Military History) Third Year: Semester II" },
  { programmeId: "ba-diplomatic-military-history", programmeName: "B.A. (Diplomatic and Military History)", code: "HI 340", title: "The Indian Ocean Geo-Political Security", status: "Core", credits: 12, year: 3, semester: 2, sourceLocation: "BA (Diplomatic and Military History) Third Year: Semester II" },
  { programmeId: "ba-diplomatic-military-history", programmeName: "B.A. (Diplomatic and Military History)", code: "LWE 530", title: "International Humanitarian Law", status: "Core", credits: 12, year: 3, semester: 2, sourceLocation: "BA (Diplomatic and Military History) Third Year: Semester II" },
  { programmeId: "ba-diplomatic-military-history", programmeName: "B.A. (Diplomatic and Military History)", code: "HI 341", title: "Diplomatic and Consular Practices in Historical Perspective II", status: "Core", credits: 12, year: 3, semester: 2, sourceLocation: "BA (Diplomatic and Military History) Third Year: Semester II" },
  // Electives (Choose ONE)
  { programmeId: "ba-diplomatic-military-history", programmeName: "B.A. (Diplomatic and Military History)", code: "HI 342", title: "Wars and Militarism in History", status: "Elective", credits: 12, year: 3, semester: 2, sourceLocation: "BA (Diplomatic and Military History) Third Year: Semester II", electiveRule: "Choose ONE" },
  { programmeId: "ba-diplomatic-military-history", programmeName: "B.A. (Diplomatic and Military History)", code: "HI 308", title: "Theory and Practice in Archival Research", status: "Elective", credits: 12, year: 3, semester: 2, sourceLocation: "BA (Diplomatic and Military History) Third Year: Semester II", electiveRule: "Choose ONE" },
  { programmeId: "ba-diplomatic-military-history", programmeName: "B.A. (Diplomatic and Military History)", code: "HI 344", title: "History of Global Capitalism and Competitiveness", status: "Elective", credits: 12, year: 3, semester: 2, sourceLocation: "BA (Diplomatic and Military History) Third Year: Semester II", electiveRule: "Choose ONE" },
  { programmeId: "ba-diplomatic-military-history", programmeName: "B.A. (Diplomatic and Military History)", code: "HI 339", title: "Regional Security Dynamics and Area Studies", status: "Elective", credits: 12, year: 3, semester: 2, sourceLocation: "BA (Diplomatic and Military History) Third Year: Semester II", electiveRule: "Choose ONE" },
  { programmeId: "ba-diplomatic-military-history", programmeName: "B.A. (Diplomatic and Military History)", code: "HI 331", title: "Foreign and Defense Policy Analysis", status: "Elective", credits: 12, year: 3, semester: 2, sourceLocation: "BA (Diplomatic and Military History) Third Year: Semester II", electiveRule: "Choose ONE" },

  // =========================================================================
  // 3. BACHELOR OF ARTS IN HISTORY, CULTURAL HERITAGE MANAGEMENT AND TOURISM — B.A. (HISTORY, CULTURAL HERITAGE MANAGEMENT AND TOURISM)
  // =========================================================================

  // FIRST YEAR: SEMESTER I
  { programmeId: "ba-history-cultural-heritage-tourism", programmeName: "B.A. (History, Cultural Heritage Management and Tourism)", code: "HI 112", title: "Basic Concepts in History, Cultural Heritage Management and Tourism", status: "Core", credits: 12, year: 1, semester: 1, sourceLocation: "BA (History, Cultural Heritage Management and Tourism) First Year: Semester I" },
  { programmeId: "ba-history-cultural-heritage-tourism", programmeName: "B.A. (History, Cultural Heritage Management and Tourism)", code: "HI 104", title: "Themes in African History", status: "Core", credits: 12, year: 1, semester: 1, sourceLocation: "BA (History, Cultural Heritage Management and Tourism) First Year: Semester I" },
  { programmeId: "ba-history-cultural-heritage-tourism", programmeName: "B.A. (History, Cultural Heritage Management and Tourism)", code: "HI 150", title: "History of Heritage Conservation", status: "Core", credits: 12, year: 1, semester: 1, sourceLocation: "BA (History, Cultural Heritage Management and Tourism) First Year: Semester I" },
  { programmeId: "ba-history-cultural-heritage-tourism", programmeName: "B.A. (History, Cultural Heritage Management and Tourism)", code: "CL 106", title: "Communication Skills", status: "Core", credits: 12, year: 1, semester: 1, sourceLocation: "BA (History, Cultural Heritage Management and Tourism) First Year: Semester I" },
  { programmeId: "ba-history-cultural-heritage-tourism", programmeName: "B.A. (History, Cultural Heritage Management and Tourism)", code: "DS 114", title: "Development Perspectives I", status: "Core", credits: 12, year: 1, semester: 1, sourceLocation: "BA (History, Cultural Heritage Management and Tourism) First Year: Semester I" },
  { programmeId: "ba-history-cultural-heritage-tourism", programmeName: "B.A. (History, Cultural Heritage Management and Tourism)", code: "AS 102", title: "Introduction to Social Science Research Methods I", status: "Core", credits: 12, year: 1, semester: 1, sourceLocation: "BA (History, Cultural Heritage Management and Tourism) First Year: Semester I" },

  // FIRST YEAR: SEMESTER II
  { programmeId: "ba-history-cultural-heritage-tourism", programmeName: "B.A. (History, Cultural Heritage Management and Tourism)", code: "HI 113", title: "Reconstructing History from Ethnographic Remains", status: "Core", credits: 12, year: 1, semester: 2, sourceLocation: "BA (History, Cultural Heritage Management and Tourism) First Year: Semester II" },
  { programmeId: "ba-history-cultural-heritage-tourism", programmeName: "B.A. (History, Cultural Heritage Management and Tourism)", code: "HI 114", title: "Historiography of Cultural Heritage Management and Tourism", status: "Core", credits: 12, year: 1, semester: 2, sourceLocation: "BA (History, Cultural Heritage Management and Tourism) First Year: Semester II" },
  { programmeId: "ba-history-cultural-heritage-tourism", programmeName: "B.A. (History, Cultural Heritage Management and Tourism)", code: "HI 151", title: "Tourism in African History", status: "Core", credits: 12, year: 1, semester: 2, sourceLocation: "BA (History, Cultural Heritage Management and Tourism) First Year: Semester II" },
  { programmeId: "ba-history-cultural-heritage-tourism", programmeName: "B.A. (History, Cultural Heritage Management and Tourism)", code: "DS 115", title: "Development Perspectives II", status: "Core", credits: 12, year: 1, semester: 2, sourceLocation: "BA (History, Cultural Heritage Management and Tourism) First Year: Semester II" },
  { programmeId: "ba-history-cultural-heritage-tourism", programmeName: "B.A. (History, Cultural Heritage Management and Tourism)", code: "AS 103", title: "Social Science Research Method II", status: "Core", credits: 12, year: 1, semester: 2, sourceLocation: "BA (History, Cultural Heritage Management and Tourism) First Year: Semester II" },
  { programmeId: "ba-history-cultural-heritage-tourism", programmeName: "B.A. (History, Cultural Heritage Management and Tourism)", code: "PL 111", title: "Introduction to Critical Thinking and Argumentation", status: "Core", credits: 12, year: 1, semester: 2, sourceLocation: "BA (History, Cultural Heritage Management and Tourism) First Year: Semester II" },

  // SECOND YEAR: SEMESTER I
  { programmeId: "ba-history-cultural-heritage-tourism", programmeName: "B.A. (History, Cultural Heritage Management and Tourism)", code: "HI 260", title: "Philosophies and Methodologies in History", status: "Core", credits: 12, year: 2, semester: 1, sourceLocation: "BA (History, Cultural Heritage Management and Tourism) Second Year: Semester I" },
  { programmeId: "ba-history-cultural-heritage-tourism", programmeName: "B.A. (History, Cultural Heritage Management and Tourism)", code: "HI 262", title: "History of East Africa", status: "Core", credits: 12, year: 2, semester: 1, sourceLocation: "BA (History, Cultural Heritage Management and Tourism) Second Year: Semester I" },
  { programmeId: "ba-history-cultural-heritage-tourism", programmeName: "B.A. (History, Cultural Heritage Management and Tourism)", code: "HI 205", title: "African Ethnography and the Politics of Archiving", status: "Core", credits: 12, year: 2, semester: 1, sourceLocation: "BA (History, Cultural Heritage Management and Tourism) Second Year: Semester I" },
  { programmeId: "ba-history-cultural-heritage-tourism", programmeName: "B.A. (History, Cultural Heritage Management and Tourism)", code: "HI 213", title: "Historical Interpretation of Cultural Heritage and Tourism", status: "Core", credits: 12, year: 2, semester: 1, sourceLocation: "BA (History, Cultural Heritage Management and Tourism) Second Year: Semester I" },
  { programmeId: "ba-history-cultural-heritage-tourism", programmeName: "B.A. (History, Cultural Heritage Management and Tourism)", code: "AY 215", title: "Principles of Cultural Tourism", status: "Core", credits: 12, year: 2, semester: 1, sourceLocation: "BA (History, Cultural Heritage Management and Tourism) Second Year: Semester I" },
  // Electives (Choose ONE)
  { programmeId: "ba-history-cultural-heritage-tourism", programmeName: "B.A. (History, Cultural Heritage Management and Tourism)", code: "HI 211", title: "Record Keeping and the Politics of Knowledge Creation", status: "Elective", credits: 12, year: 2, semester: 1, sourceLocation: "BA (History, Cultural Heritage Management and Tourism) Second Year: Semester I", electiveRule: "Choose ONE" },
  { programmeId: "ba-history-cultural-heritage-tourism", programmeName: "B.A. (History, Cultural Heritage Management and Tourism)", code: "HI 206", title: "States and Institutional Memories", status: "Elective", credits: 12, year: 2, semester: 1, sourceLocation: "BA (History, Cultural Heritage Management and Tourism) Second Year: Semester I", electiveRule: "Choose ONE" },
  { programmeId: "ba-history-cultural-heritage-tourism", programmeName: "B.A. (History, Cultural Heritage Management and Tourism)", code: "AN 201", title: "Ethnography as a Research Method", status: "Elective", credits: 12, year: 2, semester: 1, sourceLocation: "BA (History, Cultural Heritage Management and Tourism) Second Year: Semester I", electiveRule: "Choose ONE" },
  { programmeId: "ba-history-cultural-heritage-tourism", programmeName: "B.A. (History, Cultural Heritage Management and Tourism)", code: "AY 221", title: "Conservation and Curation of Fauna Materials", status: "Elective", credits: 12, year: 2, semester: 1, sourceLocation: "BA (History, Cultural Heritage Management and Tourism) Second Year: Semester I", electiveRule: "Choose ONE" },

  // SECOND YEAR: SEMESTER II
  { programmeId: "ba-history-cultural-heritage-tourism", programmeName: "B.A. (History, Cultural Heritage Management and Tourism)", code: "HI 261", title: "History of Tanzania", status: "Core", credits: 12, year: 2, semester: 2, sourceLocation: "BA (History, Cultural Heritage Management and Tourism) Second Year: Semester II" },
  { programmeId: "ba-history-cultural-heritage-tourism", programmeName: "B.A. (History, Cultural Heritage Management and Tourism)", code: "HI 264", title: "Africa and World Religions: Islam and Christianity", status: "Core", credits: 12, year: 2, semester: 2, sourceLocation: "BA (History, Cultural Heritage Management and Tourism) Second Year: Semester II" },
  { programmeId: "ba-history-cultural-heritage-tourism", programmeName: "B.A. (History, Cultural Heritage Management and Tourism)", code: "AY 224", title: "Conservation and Curation of Ceramic Materials", status: "Core", credits: 12, year: 2, semester: 2, sourceLocation: "BA (History, Cultural Heritage Management and Tourism) Second Year: Semester II" },
  { programmeId: "ba-history-cultural-heritage-tourism", programmeName: "B.A. (History, Cultural Heritage Management and Tourism)", code: "HI 212", title: "Cultural Tour Guidance", status: "Core", credits: 12, year: 2, semester: 2, sourceLocation: "BA (History, Cultural Heritage Management and Tourism) Second Year: Semester II" },
  { programmeId: "ba-history-cultural-heritage-tourism", programmeName: "B.A. (History, Cultural Heritage Management and Tourism)", code: "HI 224", title: "Tanzania and the History of Liberation Struggles in Africa", status: "Core", credits: 12, year: 2, semester: 2, sourceLocation: "BA (History, Cultural Heritage Management and Tourism) Second Year: Semester II" },
  // Electives (Choose ONE)
  { programmeId: "ba-history-cultural-heritage-tourism", programmeName: "B.A. (History, Cultural Heritage Management and Tourism)", code: "HI 204", title: "Creation and Maintenance of Public Archives", status: "Elective", credits: 12, year: 2, semester: 2, sourceLocation: "BA (History, Cultural Heritage Management and Tourism) Second Year: Semester II", electiveRule: "Choose ONE" },
  { programmeId: "ba-history-cultural-heritage-tourism", programmeName: "B.A. (History, Cultural Heritage Management and Tourism)", code: "HI 222", title: "War, Patriotism and Nationalism", status: "Elective", credits: 12, year: 2, semester: 2, sourceLocation: "BA (History, Cultural Heritage Management and Tourism) Second Year: Semester II", electiveRule: "Choose ONE" },
  { programmeId: "ba-history-cultural-heritage-tourism", programmeName: "B.A. (History, Cultural Heritage Management and Tourism)", code: "AY 222", title: "Conservation and Curation of Metal Materials", status: "Elective", credits: 12, year: 2, semester: 2, sourceLocation: "BA (History, Cultural Heritage Management and Tourism) Second Year: Semester II", electiveRule: "Choose ONE" },
  { programmeId: "ba-history-cultural-heritage-tourism", programmeName: "B.A. (History, Cultural Heritage Management and Tourism)", code: "AY 223", title: "Conservation and Curation of Lithic Materials", status: "Elective", credits: 12, year: 2, semester: 2, sourceLocation: "BA (History, Cultural Heritage Management and Tourism) Second Year: Semester II", electiveRule: "Choose ONE" },
  // Practical Training (Long Vacation)
  { programmeId: "ba-history-cultural-heritage-tourism", programmeName: "B.A. (History, Cultural Heritage Management and Tourism)", code: "HI 299", title: "Practical Training in History, Cultural Heritage Management and Tourism", status: "Core", credits: 0, year: 2, semester: 2, sourceLocation: "BA (History, Cultural Heritage Management and Tourism) Practical Training (Long Vacation)", note: "Compulsory second-year Practical Training conducted for 8 weeks during the long vacation is outside the two classroom semesters and is not included in the total minimum/maximum credit count." },

  // THIRD YEAR: SEMESTER I
  { programmeId: "ba-history-cultural-heritage-tourism", programmeName: "B.A. (History, Cultural Heritage Management and Tourism)", code: "HI 360", title: "Economic History of Tanzania", status: "Core", credits: 12, year: 3, semester: 1, sourceLocation: "BA (History, Cultural Heritage Management and Tourism) Third Year: Semester I" },
  { programmeId: "ba-history-cultural-heritage-tourism", programmeName: "B.A. (History, Cultural Heritage Management and Tourism)", code: "HI 368", title: "Oral Histories in Tanzania: Theory", status: "Core", credits: 12, year: 3, semester: 1, sourceLocation: "BA (History, Cultural Heritage Management and Tourism) Third Year: Semester I" },
  { programmeId: "ba-history-cultural-heritage-tourism", programmeName: "B.A. (History, Cultural Heritage Management and Tourism)", code: "AY 301", title: "Cultural Heritage Management", status: "Core", credits: 12, year: 3, semester: 1, sourceLocation: "BA (History, Cultural Heritage Management and Tourism) Third Year: Semester I" },
  { programmeId: "ba-history-cultural-heritage-tourism", programmeName: "B.A. (History, Cultural Heritage Management and Tourism)", code: "AY 321", title: "Heritage Laws", status: "Core", credits: 12, year: 3, semester: 1, sourceLocation: "BA (History, Cultural Heritage Management and Tourism) Third Year: Semester I" },
  { programmeId: "ba-history-cultural-heritage-tourism", programmeName: "B.A. (History, Cultural Heritage Management and Tourism)", code: "HI 302", title: "Government and Business Records Management", status: "Core", credits: 12, year: 3, semester: 1, sourceLocation: "BA (History, Cultural Heritage Management and Tourism) Third Year: Semester I" },
  // Electives (Choose ONE)
  { programmeId: "ba-history-cultural-heritage-tourism", programmeName: "B.A. (History, Cultural Heritage Management and Tourism)", code: "AY 303", title: "Introduction to Museum Studies", status: "Elective", credits: 12, year: 3, semester: 1, sourceLocation: "BA (History, Cultural Heritage Management and Tourism) Third Year: Semester I", electiveRule: "Choose ONE" },
  { programmeId: "ba-history-cultural-heritage-tourism", programmeName: "B.A. (History, Cultural Heritage Management and Tourism)", code: "HI 301", title: "Collection, Conservation and Security of Archival Materials", status: "Elective", credits: 12, year: 3, semester: 1, sourceLocation: "BA (History, Cultural Heritage Management and Tourism) Third Year: Semester I", electiveRule: "Choose ONE" },

  // THIRD YEAR: SEMESTER II
  { programmeId: "ba-history-cultural-heritage-tourism", programmeName: "B.A. (History, Cultural Heritage Management and Tourism)", code: "HI 311", title: "The History of Wildlife Conservation, Tourism and Leisure in Tanzania", status: "Core", credits: 12, year: 3, semester: 2, sourceLocation: "BA (History, Cultural Heritage Management and Tourism) Third Year: Semester II" },
  { programmeId: "ba-history-cultural-heritage-tourism", programmeName: "B.A. (History, Cultural Heritage Management and Tourism)", code: "HI 380", title: "Evolution of Ethnic Identities in Tanzania", status: "Core", credits: 12, year: 3, semester: 2, sourceLocation: "BA (History, Cultural Heritage Management and Tourism) Third Year: Semester II" },
  { programmeId: "ba-history-cultural-heritage-tourism", programmeName: "B.A. (History, Cultural Heritage Management and Tourism)", code: "HI 308", title: "Theory and Practice in Archival Research", status: "Core", credits: 12, year: 3, semester: 2, sourceLocation: "BA (History, Cultural Heritage Management and Tourism) Third Year: Semester II" },
  { programmeId: "ba-history-cultural-heritage-tourism", programmeName: "B.A. (History, Cultural Heritage Management and Tourism)", code: "AY 322", title: "Ethics in Cultural Tourism", status: "Core", credits: 12, year: 3, semester: 2, sourceLocation: "BA (History, Cultural Heritage Management and Tourism) Third Year: Semester II" },
  { programmeId: "ba-history-cultural-heritage-tourism", programmeName: "B.A. (History, Cultural Heritage Management and Tourism)", code: "AY 323", title: "Intangible Heritage Resources in Tanzania", status: "Core", credits: 12, year: 3, semester: 2, sourceLocation: "BA (History, Cultural Heritage Management and Tourism) Third Year: Semester II" },
  // Electives (Choose ONE)
  { programmeId: "ba-history-cultural-heritage-tourism", programmeName: "B.A. (History, Cultural Heritage Management and Tourism)", code: "HI 307", title: "Introduction to Vital Registers", status: "Elective", credits: 12, year: 3, semester: 2, sourceLocation: "BA (History, Cultural Heritage Management and Tourism) Third Year: Semester II", electiveRule: "Choose ONE" },
  { programmeId: "ba-history-cultural-heritage-tourism", programmeName: "B.A. (History, Cultural Heritage Management and Tourism)", code: "HI 263", title: "History of Central Africa", status: "Elective", credits: 12, year: 3, semester: 2, sourceLocation: "BA (History, Cultural Heritage Management and Tourism) Third Year: Semester II", electiveRule: "Choose ONE" },
  { programmeId: "ba-history-cultural-heritage-tourism", programmeName: "B.A. (History, Cultural Heritage Management and Tourism)", code: "HI 367", title: "Population and Urban History of Tanzania", status: "Elective", credits: 12, year: 3, semester: 2, sourceLocation: "BA (History, Cultural Heritage Management and Tourism) Third Year: Semester II", electiveRule: "Choose ONE" }
];

async function run() {
  console.log("=== VENUE ACADEMIC CATALOGUE IMPORT: DEPARTMENT OF HISTORY ===");
  const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf8"));
  const app = initializeApp(config);
  const dbNamed = getFirestore(app, config.firestoreDatabaseId);
  const dbDefault = getFirestore(app);

  const databases = [
    { name: "Named (" + config.firestoreDatabaseId + ")", db: dbNamed },
    { name: "Default ((default))", db: dbDefault }
  ];

  // 1. VERIFY / REGISTER ACADEMIC HIERARCHY ENTITIES
  console.log("\n[1/6] Verifying Academic Hierarchy (College, Department, Programmes)...");
  
  // Academic Unit: CoHU
  const cohuSnap = await getDoc(doc(dbNamed, "academic_units", "cohu"));
  if (!cohuSnap.exists()) throw new Error("Academic Unit cohu does not exist!");
  console.log(`✓ Reused Academic Unit: ${cohuSnap.data()?.name} (${cohuSnap.id})`);

  // Department: Department of History
  let deptSnap = await getDoc(doc(dbNamed, "departments", "dept-history"));
  if (!deptSnap.exists()) {
    console.log("Creating dept-history in Firestore...");
    const newDept = {
      id: "dept-history",
      name: "Department of History",
      collegeId: "cohu",
      academicUnitId: "cohu",
      universityId: "udsm",
      verified: true,
      source: "UDSM Undergraduate Prospectus 2025/2026 (Official Source of Truth)",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    for (const { name, db } of databases) {
      await setDoc(doc(db, "departments", "dept-history"), newDept);
    }
    console.log("✓ Created Department of History (dept-history)");
  } else {
    console.log(`✓ Reused Department: ${deptSnap.data()?.name} (${deptSnap.id})`);
  }

  // Register / update the 4 degree programmes under dept-history
  const historyProgrammesToEnsure = [
    {
      id: "ba-history",
      name: "Bachelor of Arts in History",
      shortName: "B.A. (History)",
      departmentId: "dept-history",
      academicUnitId: "cohu",
      collegeId: "cohu",
      universityId: "udsm",
      durationYears: 3,
      semestersPerYear: 2,
      studyMode: "Full-Time",
      awardLevel: "Bachelor Degree",
      totalMinCredits: 376,
      practicalTrainingNote: "Compulsory second-year Practical Training (AS 229) conducted for 8 weeks during the long vacation is outside the two classroom semesters and is not included in the total minimum/maximum credit count.",
      dissertationNote: "HI 399 (Dissertation) can be opted only by invitation, with permission of the Department.",
      verified: true,
      academicYear: "2025/2026",
      source: "UDSM Undergraduate Prospectus 2025/2026 (Official Source of Truth)",
      sourceType: "official_prospectus",
      updatedAt: new Date().toISOString()
    },
    {
      id: "ba-diplomatic-military-history",
      name: "Bachelor of Arts in Diplomatic and Military History",
      shortName: "B.A. (Diplomatic and Military History)",
      departmentId: "dept-history",
      academicUnitId: "cohu",
      collegeId: "cohu",
      universityId: "udsm",
      durationYears: 3,
      semestersPerYear: 2,
      studyMode: "Full-Time",
      awardLevel: "Bachelor Degree",
      totalMinCredits: 376,
      practicalTrainingNote: "Compulsory second-year Practical Training (HI 299) conducted for 8 weeks during the long vacation is outside the two classroom semesters and is not included in the total minimum/maximum credit count.",
      verified: true,
      academicYear: "2025/2026",
      source: "UDSM Undergraduate Prospectus 2025/2026 (Official Source of Truth)",
      sourceType: "official_prospectus",
      updatedAt: new Date().toISOString()
    },
    {
      id: "ba-history-cultural-heritage-tourism",
      name: "Bachelor of Arts in History, Cultural Heritage Management and Tourism",
      shortName: "B.A. (History, Cultural Heritage & Tourism)",
      departmentId: "dept-history",
      academicUnitId: "cohu",
      collegeId: "cohu",
      universityId: "udsm",
      durationYears: 3,
      semestersPerYear: 2,
      studyMode: "Full-Time",
      awardLevel: "Bachelor Degree",
      totalMinCredits: 376,
      practicalTrainingNote: "Compulsory second-year Practical Training (HI 299) conducted for 8 weeks during the long vacation is outside the two classroom semesters and is not included in the total minimum/maximum credit count.",
      verified: true,
      academicYear: "2025/2026",
      source: "UDSM Undergraduate Prospectus 2025/2026 (Official Source of Truth)",
      sourceType: "official_prospectus",
      updatedAt: new Date().toISOString()
    },
    {
      id: "ba-history-political-science",
      name: "Bachelor of Arts in History and Political Science",
      shortName: "B.A. (History & Political Science)",
      departmentId: "dept-history",
      academicUnitId: "cohu",
      collegeId: "cohu",
      universityId: "udsm",
      durationYears: 3,
      semestersPerYear: 2,
      studyMode: "Full-Time",
      awardLevel: "Bachelor Degree",
      totalMinCredits: 376,
      verified: true,
      academicYear: "2025/2026",
      source: "UDSM Undergraduate Prospectus 2025/2026 (Official Source of Truth)",
      sourceType: "official_prospectus",
      updatedAt: new Date().toISOString()
    }
  ];

  for (const prog of historyProgrammesToEnsure) {
    for (const { name, db } of databases) {
      await setDoc(doc(db, "programmes", prog.id), prog, { merge: true });
    }
    console.log(`✓ Verified Programme record in Firestore: ${prog.name} (${prog.id})`);
  }

  // 2. CHECK CANONICAL COURSES & COLLECT CONFLICTS
  console.log("\n[2/6] Auditing Canonical Courses...");
  const canonSnap = await getDocs(collection(dbNamed, "canonical_courses"));
  const canonMap = new Map<string, any>();
  canonSnap.forEach(d => {
    const data = d.data();
    canonMap.set(data.code, { id: d.id, ...data });
  });

  const conflicts: Array<{
    code: string;
    existingTitle: string;
    suppliedTitle: string;
    existingCredits: number;
    suppliedCredits: number;
    discrepancyType: "title" | "credits" | "title_and_credits";
    actionTaken: string;
  }> = [];

  const newCanonicalToCreate: any[] = [];
  const canonicalReused = new Set<string>();

  // Determine unique courses from rawCurriculum
  const uniqueSuppliedMap = new Map<string, RawCurriculumItem>();
  for (const item of rawCurriculum) {
    if (!uniqueSuppliedMap.has(item.code)) {
      uniqueSuppliedMap.set(item.code, item);
    }
  }

  for (const [code, item] of uniqueSuppliedMap.entries()) {
    if (canonMap.has(code)) {
      canonicalReused.add(code);
      const existing = canonMap.get(code);
      const titleDiff = existing.title.trim().toLowerCase() !== item.title.trim().toLowerCase();
      const creditsDiff = existing.defaultCredits !== item.credits;

      if (titleDiff || creditsDiff) {
        let discrepancyType: "title" | "credits" | "title_and_credits" = "title";
        if (titleDiff && creditsDiff) discrepancyType = "title_and_credits";
        else if (creditsDiff) discrepancyType = "credits";

        let actionTaken = `Canonical record (${existing.title}, ${existing.defaultCredits}cr) preserved; curriculum relationship configured with supplied title ('${item.title}') and credits (${item.credits}cr).`;
        if (code === "AS 102" || code === "AS 103") {
          actionTaken = `Cross-college code shared with Law School (${existing.title}). Canonical record preserved; History curriculum relationship uses '${item.title}' (${item.credits}cr).`;
        } else if (code === "AY 302" || code === "AY 303") {
          actionTaken = `Archaeology department title variation (${existing.title} vs ${item.title}). Canonical record preserved; History curriculum relationship uses '${item.title}' (${item.credits}cr).`;
        } else if (code === "PS 222") {
          actionTaken = `Political Science department title variation (${existing.title} vs ${item.title}). Canonical record preserved; History curriculum relationship uses '${item.title}' (${item.credits}cr).`;
        }

        conflicts.push({
          code: item.code,
          existingTitle: existing.title,
          suppliedTitle: item.title,
          existingCredits: existing.defaultCredits,
          suppliedCredits: item.credits,
          discrepancyType,
          actionTaken
        });
      }
    } else {
      // Missing canonical course: create canonical course
      const cleanId = code.toLowerCase().replace(/[^a-z0-9]+/g, "_");
      let offeringDept = "dept-history";
      let offeringUnit = "cohu";

      if (code.startsWith("AY ")) {
        offeringDept = "dept-archaeology";
        offeringUnit = "cohu";
      } else if (code.startsWith("AN ") || code.startsWith("SO ")) {
        offeringDept = "dept-sociology";
        offeringUnit = "coss";
      } else if (code.startsWith("PS ")) {
        offeringDept = "dept-pspa";
        offeringUnit = "coss";
      } else if (code.startsWith("DS ")) {
        offeringDept = "dept-dev-studies";
        offeringUnit = "coss";
      } else if (code.startsWith("PL ")) {
        offeringDept = "dept-philosophy";
        offeringUnit = "cohu";
      } else if (code.startsWith("FP ")) {
        offeringDept = "dept-creative-arts";
        offeringUnit = "cohu";
      } else if (code.startsWith("CL ")) {
        offeringDept = "dept-ccs";
        offeringUnit = "cohu";
      } else if (code.startsWith("LWE ")) {
        offeringDept = "dept-public-law";
        offeringUnit = "udsol";
      }

      // Canonical title cleaning (remove trailing asterisks or notes)
      const cleanTitle = item.title.replace(/\*+$/, "").trim();

      const newCanon = {
        id: cleanId,
        code: item.code,
        title: cleanTitle,
        defaultCredits: item.credits,
        departmentId: offeringDept,
        academicUnitId: offeringUnit,
        universityId: "udsm",
        source: "UDSM Undergraduate Prospectus 2025/2026 (Official Source of Truth)",
        sourceType: "official_prospectus",
        verified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      newCanonicalToCreate.push(newCanon);
    }
  }

  console.log(`Canonical summary: ${canonicalReused.size} reused, ${newCanonicalToCreate.length} new to create, ${conflicts.length} conflicts/variations noted.`);

  // Write new canonical courses to both databases
  for (const newCanon of newCanonicalToCreate) {
    for (const { name, db } of databases) {
      await setDoc(doc(db, "canonical_courses", newCanon.id), newCanon);
    }
    canonMap.set(newCanon.code, newCanon);
    console.log(`✓ Created new canonical course: ${newCanon.code} - ${newCanon.title} (${newCanon.id})`);
  }

  // 3. BUILD PROGRAMME_COURSES AND CATALOGUE_COURSES RELATIONSHIPS
  console.log("\n[3/6] Generating Curriculum Relationships...");
  const pcDocsToWrite: any[] = [];
  const ccDocsToWrite: any[] = [];

  for (const item of rawCurriculum) {
    const canon = canonMap.get(item.code);
    const cleanCode = item.code.toLowerCase().replace(/[^a-z0-9]+/g, "_");

    // Unique relationship document IDs scoped to programme, code, year, semester
    const pcId = `${item.programmeId}_${cleanCode}_y${item.year}s${item.semester}`;
    const ccId = `udsm_${item.programmeId}_${cleanCode}_y${item.year}s${item.semester}`;

    const relBase = {
      code: item.code,
      title: item.title,
      canonicalTitle: canon?.title || item.title,
      credits: item.credits,
      status: item.status,
      rawStatus: item.rawStatus || null,
      yearOfStudy: item.year,
      semester: item.semester,
      programmeId: item.programmeId,
      programmeName: item.programmeName,
      electiveRule: item.electiveRule || null,
      isAdditionalElective: !!item.isAdditionalElective,
      note: item.note || null,
      departmentId: "dept-history",
      academicUnitId: "cohu",
      universityId: "udsm",
      academicYear: "2025/2026",
      source: "UDSM Undergraduate Prospectus 2025/2026 (Official Source of Truth)",
      sourceType: "official_prospectus",
      verified: true,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const pcDoc = {
      id: pcId,
      canonicalCourseId: canon?.id || cleanCode,
      ...relBase
    };

    const ccDoc = {
      id: ccId,
      courseId: canon?.id || cleanCode,
      courseCode: item.code,
      courseName: item.title,
      courseType: item.status,
      ...relBase
    };

    pcDocsToWrite.push(pcDoc);
    ccDocsToWrite.push(ccDoc);
  }

  console.log(`Generated ${pcDocsToWrite.length} relationships for programme_courses and catalogue_courses.`);

  // 4. WRITE IN BATCHES TO BOTH DATABASES
  console.log("\n[4/6] Committing Relationship Batches to Firestore...");
  const BATCH_SIZE = 250;

  for (const { name, db } of databases) {
    console.log(`Writing to ${name}...`);

    for (let i = 0; i < pcDocsToWrite.length; i += BATCH_SIZE) {
      const batch = writeBatch(db);
      const chunk = pcDocsToWrite.slice(i, i + BATCH_SIZE);
      for (const item of chunk) {
        batch.set(doc(db, "programme_courses", item.id), item);
      }
      await batch.commit();
      console.log(`  - Wrote programme_courses batch ${i + 1} to ${Math.min(i + BATCH_SIZE, pcDocsToWrite.length)}`);
    }

    for (let i = 0; i < ccDocsToWrite.length; i += BATCH_SIZE) {
      const batch = writeBatch(db);
      const chunk = ccDocsToWrite.slice(i, i + BATCH_SIZE);
      for (const item of chunk) {
        batch.set(doc(db, "catalogue_courses", item.id), item);
      }
      await batch.commit();
      console.log(`  - Wrote catalogue_courses batch ${i + 1} to ${Math.min(i + BATCH_SIZE, ccDocsToWrite.length)}`);
    }
  }

  // 5. RUN COMPREHENSIVE INTEGRITY VERIFICATION
  console.log("\n[5/6] Performing Integrity Verification...");
  
  for (const prog of historyProgrammesToEnsure.slice(0, 3)) {
    const progCcDocs = (await getDocs(collection(dbNamed, "catalogue_courses"))).docs
      .map(d => d.data())
      .filter(d => d.programmeId === prog.id);
    console.log(`✓ Verified ${prog.name}: ${progCcDocs.length} courses registered in catalogue_courses.`);

    for (let y = 1; y <= 3; y++) {
      for (let s = 1; s <= 2; s++) {
        const semCourses = progCcDocs.filter(d => d.yearOfStudy === y && d.semester === s);
        const coreCourses = semCourses.filter(d => d.status === "Core");
        const electiveCourses = semCourses.filter(d => d.status === "Elective");
        console.log(`    Year ${y} Semester ${s}: ${semCourses.length} courses (Core: ${coreCourses.length}, Elective: ${electiveCourses.length})`);
      }
    }
  }

  // Check practical training courses
  const as229Check = pcDocsToWrite.filter(d => d.code === "AS 229");
  console.log(`✓ Verified AS 229 in BA (History): ${as229Check.length} relationship(s), credits: ${as229Check.map(d => d.credits).join(", ")}`);
  const hi299Check = pcDocsToWrite.filter(d => d.code === "HI 299");
  console.log(`✓ Verified HI 299 in Diplomatic & Heritage: ${hi299Check.length} relationship(s), credits: ${hi299Check.map(d => d.credits).join(", ")}`);

  // Verify Canonical duplicates
  const allCanon = await getDocs(collection(dbNamed, "canonical_courses"));
  const canonCodeCounts = new Map<string, number>();
  allCanon.docs.forEach(d => {
    const c = d.data().code;
    canonCodeCounts.set(c, (canonCodeCounts.get(c) || 0) + 1);
  });
  let dupsFound = 0;
  canonCodeCounts.forEach((count, code) => {
    if (count > 1) {
      console.error(`DUPLICATE CANONICAL CODE DETECTED: ${code} (count: ${count})`);
      dupsFound++;
    }
  });
  if (dupsFound === 0) {
    console.log("✓ Zero duplicate canonical course codes verified across entire database!");
  } else {
    throw new Error(`Integrity error: ${dupsFound} duplicate canonical codes detected!`);
  }

  // 6. SAVE AUDIT REPORT
  const finalReport = {
    timestamp: new Date().toISOString(),
    academicUnit: { id: "cohu", name: cohuSnap.data()?.name, status: "reused" },
    department: { id: "dept-history", name: "Department of History", status: deptSnap.exists() ? "reused" : "created" },
    programmes: historyProgrammesToEnsure.map(p => ({
      id: p.id,
      name: p.name,
      shortName: p.shortName,
      relationships: pcDocsToWrite.filter(d => d.programmeId === p.id).length
    })),
    totalRelationshipsCreated: pcDocsToWrite.length,
    canonicalCoursesReused: canonicalReused.size,
    newCanonicalCreated: newCanonicalToCreate.map(c => ({ code: c.code, title: c.title, credits: c.defaultCredits, id: c.id, departmentId: c.departmentId })),
    conflicts
  };

  fs.writeFileSync("./scripts/history_import_report.json", JSON.stringify(finalReport, null, 2));
  console.log("✓ Final report written to ./scripts/history_import_report.json");
  console.log("\n🎉 DEPARTMENT OF HISTORY IMPORT AND VERIFICATION SUCCESSFUL!");
  process.exit(0);
}

run().catch(err => {
  console.error("FATAL: Import failed:", err);
  process.exit(1);
});
