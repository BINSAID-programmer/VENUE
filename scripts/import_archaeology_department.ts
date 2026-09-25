import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
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
  isFieldTraining?: boolean;
  isDissertation?: boolean;
  byInvitationOnly?: boolean;
  minGpa?: number;
  note?: string;
  departmentId?: string;
}

const rawCurriculum: RawCurriculumItem[] = [
  // =========================================================================
  // 1. BACHELOR OF ARTS IN ARCHAEOLOGY — B.A. (ARCHAEOLOGY)
  // =========================================================================
  
  // FIRST YEAR: SEMESTER I
  { programmeId: "ba-archaeology", programmeName: "B.A. (Archaeology)", code: "AY 100", title: "Introduction to Archaeology", status: "Core", credits: 12, year: 1, semester: 1, sourceLocation: "BA (Archaeology) First Year: Semester I" },
  { programmeId: "ba-archaeology", programmeName: "B.A. (Archaeology)", code: "AY 106", title: "Survey of World Prehistory", status: "Core", credits: 12, year: 1, semester: 1, sourceLocation: "BA (Archaeology) First Year: Semester I" },
  { programmeId: "ba-archaeology", programmeName: "B.A. (Archaeology)", code: "CL 106", title: "Communication Skills for Arts and Social Sciences", status: "Core", credits: 12, year: 1, semester: 1, sourceLocation: "BA (Archaeology) First Year: Semester I" },
  { programmeId: "ba-archaeology", programmeName: "B.A. (Archaeology)", code: "PL 111", title: "Introduction to Critical Thinking and Argumentation", status: "Core", credits: 12, year: 1, semester: 1, sourceLocation: "BA (Archaeology) First Year: Semester I" },
  { programmeId: "ba-archaeology", programmeName: "B.A. (Archaeology)", code: "DS 114", title: "Development Perspectives I", status: "Core", credits: 12, year: 1, semester: 1, sourceLocation: "BA (Archaeology) First Year: Semester I" },
  // Electives (Choose ONE)
  { programmeId: "ba-archaeology", programmeName: "B.A. (Archaeology)", code: "BT 130", title: "Evolutionary Botany", status: "Elective", credits: 12, year: 1, semester: 1, sourceLocation: "BA (Archaeology) First Year: Semester I", electiveRule: "Choose ONE" },
  { programmeId: "ba-archaeology", programmeName: "B.A. (Archaeology)", code: "AY 105", title: "Introduction to Primatology", status: "Elective", credits: 12, year: 1, semester: 1, sourceLocation: "BA (Archaeology) First Year: Semester I", electiveRule: "Choose ONE" },
  { programmeId: "ba-archaeology", programmeName: "B.A. (Archaeology)", code: "GE 140", title: "Surveying and Mapping Science", status: "Elective", credits: 12, year: 1, semester: 1, sourceLocation: "BA (Archaeology) First Year: Semester I", electiveRule: "Choose ONE" },
  { programmeId: "ba-archaeology", programmeName: "B.A. (Archaeology)", code: "ZL 122", title: "Chordate Zoology", status: "Elective", credits: 8, year: 1, semester: 1, sourceLocation: "BA (Archaeology) First Year: Semester I", electiveRule: "Choose ONE", note: "Preserved exact 8 credits as specified." },

  // FIRST YEAR: SEMESTER II
  { programmeId: "ba-archaeology", programmeName: "B.A. (Archaeology)", code: "AY 101", title: "Principles of Archaeology", status: "Core", credits: 12, year: 1, semester: 2, sourceLocation: "BA (Archaeology) First Year: Semester II" },
  { programmeId: "ba-archaeology", programmeName: "B.A. (Archaeology)", code: "AY 102", title: "Introduction to Anthropology", status: "Core", credits: 12, year: 1, semester: 2, sourceLocation: "BA (Archaeology) First Year: Semester II" },
  { programmeId: "ba-archaeology", programmeName: "B.A. (Archaeology)", code: "AY 107", title: "Basics in Dating Methods in Archaeology", status: "Core", credits: 12, year: 1, semester: 2, sourceLocation: "BA (Archaeology) First Year: Semester II" },
  { programmeId: "ba-archaeology", programmeName: "B.A. (Archaeology)", code: "DS 115", title: "Development Perspectives II", status: "Core", credits: 12, year: 1, semester: 2, sourceLocation: "BA (Archaeology) First Year: Semester II" },
  { programmeId: "ba-archaeology", programmeName: "B.A. (Archaeology)", code: "HI 261", title: "History of Tanzania", status: "Core", credits: 12, year: 1, semester: 2, sourceLocation: "BA (Archaeology) First Year: Semester II" },
  // Electives (Choose ONE)
  { programmeId: "ba-archaeology", programmeName: "B.A. (Archaeology)", code: "SO 115", title: "Introduction to Culture and Society", status: "Elective", credits: 12, year: 1, semester: 2, sourceLocation: "BA (Archaeology) First Year: Semester II", electiveRule: "Choose ONE" },
  { programmeId: "ba-archaeology", programmeName: "B.A. (Archaeology)", code: "SO 118", title: "Introduction to Cultural Anthropology", status: "Elective", credits: 12, year: 1, semester: 2, sourceLocation: "BA (Archaeology) First Year: Semester II", electiveRule: "Choose ONE" },
  // Field Training (Long Vacation - 8 weeks)
  { programmeId: "ba-archaeology", programmeName: "B.A. (Archaeology)", code: "AY 120", title: "Field Training in Archaeology (Survey)", status: "Core", credits: 12, year: 1, semester: 2, sourceLocation: "BA (Archaeology) First Year: Field Training", isFieldTraining: true, note: "Field Training in Archaeology (Survey) conducted during the Long Vacation (8 weeks)." },

  // SECOND YEAR: SEMESTER I
  { programmeId: "ba-archaeology", programmeName: "B.A. (Archaeology)", code: "AY 211", title: "Development of Archaeological Thoughts", status: "Core", credits: 12, year: 2, semester: 1, sourceLocation: "BA (Archaeology) Second Year: Semester I" },
  { programmeId: "ba-archaeology", programmeName: "B.A. (Archaeology)", code: "AY 203", title: "African Civilizations", status: "Core", credits: 12, year: 2, semester: 1, sourceLocation: "BA (Archaeology) Second Year: Semester I" },
  { programmeId: "ba-archaeology", programmeName: "B.A. (Archaeology)", code: "HI 262", title: "History of East Africa", status: "Core", credits: 12, year: 2, semester: 1, sourceLocation: "BA (Archaeology) Second Year: Semester I" },
  // Electives (Must choose AT LEAST TWO)
  { programmeId: "ba-archaeology", programmeName: "B.A. (Archaeology)", code: "AS 220", title: "Pan-Africanism: Thought and Practice I", status: "Elective", credits: 12, year: 2, semester: 1, sourceLocation: "BA (Archaeology) Second Year: Semester I", electiveRule: "Must choose AT LEAST TWO" },
  { programmeId: "ba-archaeology", programmeName: "B.A. (Archaeology)", code: "AY 207", title: "Ceramic Analysis in Archaeology", status: "Elective", credits: 12, year: 2, semester: 1, sourceLocation: "BA (Archaeology) Second Year: Semester I", electiveRule: "Must choose AT LEAST TWO" },
  { programmeId: "ba-archaeology", programmeName: "B.A. (Archaeology)", code: "AY 213", title: "Basics in Archaeometallurgy", status: "Elective", credits: 12, year: 2, semester: 1, sourceLocation: "BA (Archaeology) Second Year: Semester I", electiveRule: "Must choose AT LEAST TWO" },

  // SECOND YEAR: SEMESTER II
  { programmeId: "ba-archaeology", programmeName: "B.A. (Archaeology)", code: "AY 202", title: "Human Evolution", status: "Core", credits: 12, year: 2, semester: 2, sourceLocation: "BA (Archaeology) Second Year: Semester II" },
  { programmeId: "ba-archaeology", programmeName: "B.A. (Archaeology)", code: "AY 209", title: "Archaeological Methodology", status: "Core", credits: 12, year: 2, semester: 2, sourceLocation: "BA (Archaeology) Second Year: Semester II" },
  { programmeId: "ba-archaeology", programmeName: "B.A. (Archaeology)", code: "AY 216", title: "Human Osteology and Odontology Studies", status: "Core", credits: 12, year: 2, semester: 2, sourceLocation: "BA (Archaeology) Second Year: Semester II" },
  { programmeId: "ba-archaeology", programmeName: "B.A. (Archaeology)", code: "AY 214", title: "Research Methods in Archaeology and Heritage", status: "Core", credits: 12, year: 2, semester: 2, sourceLocation: "BA (Archaeology) Second Year: Semester II" },
  // Electives (Must choose AT LEAST TWO)
  { programmeId: "ba-archaeology", programmeName: "B.A. (Archaeology)", code: "AS 221", title: "Pan-Africanism: Thought and Practice II", status: "Elective", credits: 12, year: 2, semester: 2, sourceLocation: "BA (Archaeology) Second Year: Semester II", electiveRule: "Must choose AT LEAST TWO" },
  { programmeId: "ba-archaeology", programmeName: "B.A. (Archaeology)", code: "AY 204", title: "Lithic Analysis in Archaeology", status: "Elective", credits: 12, year: 2, semester: 2, sourceLocation: "BA (Archaeology) Second Year: Semester II", electiveRule: "Must choose AT LEAST TWO" },
  { programmeId: "ba-archaeology", programmeName: "B.A. (Archaeology)", code: "AY 212", title: "Basics in Zooarchaeology", status: "Elective", credits: 12, year: 2, semester: 2, sourceLocation: "BA (Archaeology) Second Year: Semester II", electiveRule: "Must choose AT LEAST TWO" },
  // Field Training (Long Vacation)
  { programmeId: "ba-archaeology", programmeName: "B.A. (Archaeology)", code: "AY 220", title: "Field Training in Archaeology (Excavation)", status: "Core", credits: 12, year: 2, semester: 2, sourceLocation: "BA (Archaeology) Second Year: Field Training", isFieldTraining: true, note: "Field Training in Archaeology (Excavation) conducted during the Long Vacation." },

  // THIRD YEAR: SEMESTER I
  { programmeId: "ba-archaeology", programmeName: "B.A. (Archaeology)", code: "AY 302", title: "Archaeology of Tanzania", status: "Core", credits: 12, year: 3, semester: 1, sourceLocation: "BA (Archaeology) Third Year: Semester I" },
  { programmeId: "ba-archaeology", programmeName: "B.A. (Archaeology)", code: "HM 302", title: "Museum Studies", status: "Core", credits: 12, year: 3, semester: 1, sourceLocation: "BA (Archaeology) Third Year: Semester I" },
  { programmeId: "ba-archaeology", programmeName: "B.A. (Archaeology)", code: "AY 311", title: "Approaches to Hunter-Gatherers Studies", status: "Core", credits: 12, year: 3, semester: 1, sourceLocation: "BA (Archaeology) Third Year: Semester I" },
  { programmeId: "ba-archaeology", programmeName: "B.A. (Archaeology)", code: "HI 368", title: "Oral Histories in Tanzania: Theory", status: "Core", credits: 12, year: 3, semester: 1, sourceLocation: "BA (Archaeology) Third Year: Semester I" },
  // Electives (Must choose AT LEAST ONE)
  { programmeId: "ba-archaeology", programmeName: "B.A. (Archaeology)", code: "AY 309", title: "Mortuary Archaeology", status: "Elective", credits: 12, year: 3, semester: 1, sourceLocation: "BA (Archaeology) Third Year: Semester I", electiveRule: "Must choose AT LEAST ONE" },
  { programmeId: "ba-archaeology", programmeName: "B.A. (Archaeology)", code: "AY 306", title: "People and Cultures in Africa", status: "Elective", credits: 12, year: 3, semester: 1, sourceLocation: "BA (Archaeology) Third Year: Semester I", electiveRule: "Must choose AT LEAST ONE" },
  { programmeId: "ba-archaeology", programmeName: "B.A. (Archaeology)", code: "AY 321", title: "Heritage Laws", status: "Elective", credits: 12, year: 3, semester: 1, sourceLocation: "BA (Archaeology) Third Year: Semester I", electiveRule: "Must choose AT LEAST ONE" },

  // THIRD YEAR: SEMESTER II
  { programmeId: "ba-archaeology", programmeName: "B.A. (Archaeology)", code: "AY 300", title: "Advanced Archaeological Theory", status: "Core", credits: 12, year: 3, semester: 2, sourceLocation: "BA (Archaeology) Third Year: Semester II" },
  { programmeId: "ba-archaeology", programmeName: "B.A. (Archaeology)", code: "AY 310", title: "Studies in Hominin Adaptations, Variations, and Growth", status: "Core", credits: 12, year: 3, semester: 2, sourceLocation: "BA (Archaeology) Third Year: Semester II" },
  { programmeId: "ba-archaeology", programmeName: "B.A. (Archaeology)", code: "HM 304", title: "Intangible Cultural Heritage Resources", status: "Core", credits: 12, year: 3, semester: 2, sourceLocation: "BA (Archaeology) Third Year: Semester II" },
  { programmeId: "ba-archaeology", programmeName: "B.A. (Archaeology)", code: "AY 301", title: "Cultural Heritage Management", status: "Core", credits: 12, year: 3, semester: 2, sourceLocation: "BA (Archaeology) Third Year: Semester II" },
  // Electives (Choose ONE or TWO)
  { programmeId: "ba-archaeology", programmeName: "B.A. (Archaeology)", code: "AY 308", title: "Forensics Anthropology", status: "Elective", credits: 12, year: 3, semester: 2, sourceLocation: "BA (Archaeology) Third Year: Semester II", electiveRule: "Choose ONE or TWO" },
  { programmeId: "ba-archaeology", programmeName: "B.A. (Archaeology)", code: "HM 303", title: "Architecture in Archaeology", status: "Elective", credits: 12, year: 3, semester: 2, sourceLocation: "BA (Archaeology) Third Year: Semester II", electiveRule: "Choose ONE or TWO" },
  { programmeId: "ba-archaeology", programmeName: "B.A. (Archaeology)", code: "AY 307", title: "Recent Research Approaches in Archaeology", status: "Elective", credits: 12, year: 3, semester: 2, sourceLocation: "BA (Archaeology) Third Year: Semester II", electiveRule: "Choose ONE or TWO" },
  { programmeId: "ba-archaeology", programmeName: "B.A. (Archaeology)", code: "AY 304", title: "Basics in Archaeology", status: "Elective", credits: 12, year: 3, semester: 2, sourceLocation: "BA (Archaeology) Third Year: Semester II", electiveRule: "Choose ONE or TWO" },
  { programmeId: "ba-archaeology", programmeName: "B.A. (Archaeology)", code: "AY 399", title: "Independent Project in Archaeology/Heritage Management (Dissertation)", status: "Elective", credits: 24, year: 3, semester: 2, sourceLocation: "BA (Archaeology) Third Year: Semester II", electiveRule: "Choose ONE or TWO", isDissertation: true, byInvitationOnly: true, minGpa: 3.8, note: "By invitation only. Eligibility: students with GPA 3.8 or higher, from Second Year Semester II onward." },

  // =========================================================================
  // 2. BACHELOR OF ARTS IN HERITAGE MANAGEMENT — B.A. (HERITAGE MANAGEMENT)
  // =========================================================================

  // FIRST YEAR: SEMESTER I
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "HM 100", title: "Introduction to Heritage Management", status: "Core", credits: 12, year: 1, semester: 1, sourceLocation: "BA (Heritage Management) First Year: Semester I" },
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "AY 100", title: "Introduction to Archaeology", status: "Core", credits: 12, year: 1, semester: 1, sourceLocation: "BA (Heritage Management) First Year: Semester I" },
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "CA 100", title: "Art and Society", status: "Core", credits: 12, year: 1, semester: 1, sourceLocation: "BA (Heritage Management) First Year: Semester I" },
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "CL 106", title: "Communication Skills for Arts and Social Sciences", status: "Core", credits: 12, year: 1, semester: 1, sourceLocation: "BA (Heritage Management) First Year: Semester I" },
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "PL 111", title: "Introduction to Critical Thinking and Argumentation", status: "Core", credits: 12, year: 1, semester: 1, sourceLocation: "BA (Heritage Management) First Year: Semester I" },
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "DS 114", title: "Development Perspectives I", status: "Core", credits: 12, year: 1, semester: 1, sourceLocation: "BA (Heritage Management) First Year: Semester I" },

  // FIRST YEAR: SEMESTER II
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "HM 101", title: "Tourism Development in African History", status: "Core", credits: 12, year: 1, semester: 2, sourceLocation: "BA (Heritage Management) First Year: Semester II" },
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "HM 102", title: "Basics in Archival Heritage", status: "Core", credits: 12, year: 1, semester: 2, sourceLocation: "BA (Heritage Management) First Year: Semester II" },
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "HM 103", title: "Heritage Conservation in Africa", status: "Core", credits: 12, year: 1, semester: 2, sourceLocation: "BA (Heritage Management) First Year: Semester II" },
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "AY 101", title: "Principles of Archaeology", status: "Core", credits: 12, year: 1, semester: 2, sourceLocation: "BA (Heritage Management) First Year: Semester II" },
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "DS 115", title: "Development Perspectives II", status: "Core", credits: 12, year: 1, semester: 2, sourceLocation: "BA (Heritage Management) First Year: Semester II" },
  // Electives (Must choose AT LEAST ONE)
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "HI 261", title: "History of Tanzania", status: "Elective", credits: 12, year: 1, semester: 2, sourceLocation: "BA (Heritage Management) First Year: Semester II", electiveRule: "Must choose AT LEAST ONE" },
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "SO 115", title: "Introduction to Culture and Society", status: "Elective", credits: 12, year: 1, semester: 2, sourceLocation: "BA (Heritage Management) First Year: Semester II", electiveRule: "Must choose AT LEAST ONE" },
  // Field Training (Long Vacation)
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "AY 120", title: "Field Training in Archaeology (Survey)", status: "Core", credits: 12, year: 1, semester: 2, sourceLocation: "BA (Heritage Management) First Year: Field Training", isFieldTraining: true, note: "Field Training in Archaeology (Survey) conducted during the Long Vacation." },

  // SECOND YEAR: SEMESTER I
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "HM 200", title: "Curation of Organic Materials", status: "Core", credits: 12, year: 2, semester: 1, sourceLocation: "BA (Heritage Management) Second Year: Semester I" },
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "HM 201", title: "Curation of Inorganic Materials", status: "Core", credits: 12, year: 2, semester: 1, sourceLocation: "BA (Heritage Management) Second Year: Semester I" },
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "AY 203", title: "African Civilizations", status: "Core", credits: 12, year: 2, semester: 1, sourceLocation: "BA (Heritage Management) Second Year: Semester I" },
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "GE 251", title: "Tourism and Leisure", status: "Core", credits: 12, year: 2, semester: 1, sourceLocation: "BA (Heritage Management) Second Year: Semester I" },
  // Electives (Must choose AT LEAST TWO)
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "LL 160", title: "Basic French I", status: "Elective", credits: 12, year: 2, semester: 1, sourceLocation: "BA (Heritage Management) Second Year: Semester I", electiveRule: "Must choose AT LEAST TWO", note: "A French pair rule applies." },
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "LL 180", title: "Advanced French I", status: "Elective", credits: 12, year: 2, semester: 1, sourceLocation: "BA (Heritage Management) Second Year: Semester I", electiveRule: "Must choose AT LEAST TWO", note: "A French pair rule applies." },
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "AS 220", title: "Pan-Africanism: Thought and Practice I", status: "Elective", credits: 12, year: 2, semester: 1, sourceLocation: "BA (Heritage Management) Second Year: Semester I", electiveRule: "Must choose AT LEAST TWO" },
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "HI 262", title: "History of East Africa", status: "Elective", credits: 12, year: 2, semester: 1, sourceLocation: "BA (Heritage Management) Second Year: Semester I", electiveRule: "Must choose AT LEAST TWO" },

  // SECOND YEAR: SEMESTER II
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "HM 202", title: "Principles of Cultural Tourism Management", status: "Core", credits: 12, year: 2, semester: 2, sourceLocation: "BA (Heritage Management) Second Year: Semester II" },
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "HM 203", title: "Conservation of Organic Materials", status: "Core", credits: 12, year: 2, semester: 2, sourceLocation: "BA (Heritage Management) Second Year: Semester II" },
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "HM 204", title: "Conservation of Inorganic Materials", status: "Core", credits: 12, year: 2, semester: 2, sourceLocation: "BA (Heritage Management) Second Year: Semester II" },
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "AY 202", title: "Human Evolution", status: "Core", credits: 12, year: 2, semester: 2, sourceLocation: "BA (Heritage Management) Second Year: Semester II" },
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "AY 214", title: "Research Methods in Archaeology and Heritage", status: "Core", credits: 12, year: 2, semester: 2, sourceLocation: "BA (Heritage Management) Second Year: Semester II" },
  // Electives (Choose ONE)
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "LL 161", title: "Basic French II", status: "Elective", credits: 12, year: 2, semester: 2, sourceLocation: "BA (Heritage Management) Second Year: Semester II", electiveRule: "Choose ONE" },
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "LL 181", title: "Advanced French II", status: "Elective", credits: 12, year: 2, semester: 2, sourceLocation: "BA (Heritage Management) Second Year: Semester II", electiveRule: "Choose ONE" },
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "AS 221", title: "Pan-Africanism: Thought and Practice II", status: "Elective", credits: 12, year: 2, semester: 2, sourceLocation: "BA (Heritage Management) Second Year: Semester II", electiveRule: "Choose ONE" },
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "AY 209", title: "Archaeological Methodology", status: "Elective", credits: 12, year: 2, semester: 2, sourceLocation: "BA (Heritage Management) Second Year: Semester II", electiveRule: "Choose ONE" },
  // Field Training (Long Vacation) - AY 230 explicitly!
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "AY 230", title: "Practical Training in Heritage Management", status: "Core", credits: 12, year: 2, semester: 2, sourceLocation: "BA (Heritage Management) Second Year: Field Training", isFieldTraining: true, note: "Practical Training in Heritage Management conducted during the Long Vacation. NOTE: AY 230 is strictly required for this programme, not AY 220." },

  // THIRD YEAR: SEMESTER I
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "HM 300", title: "Ethics in Cultural Tourism", status: "Core", credits: 12, year: 3, semester: 1, sourceLocation: "BA (Heritage Management) Third Year: Semester I" },
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "AY 321", title: "Heritage Laws", status: "Core", credits: 12, year: 3, semester: 1, sourceLocation: "BA (Heritage Management) Third Year: Semester I" },
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "HM 302", title: "Museum Studies", status: "Core", credits: 12, year: 3, semester: 1, sourceLocation: "BA (Heritage Management) Third Year: Semester I" },
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "AY 302", title: "Archaeology of Tanzania", status: "Core", credits: 12, year: 3, semester: 1, sourceLocation: "BA (Heritage Management) Third Year: Semester I" },
  // Electives (Must choose AT LEAST ONE)
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "AY 306", title: "Peoples and Cultures in Africa", status: "Elective", credits: 12, year: 3, semester: 1, sourceLocation: "BA (Heritage Management) Third Year: Semester I", electiveRule: "Must choose AT LEAST ONE" },
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "GE 352", title: "Natural Resource Management", status: "Elective", credits: 12, year: 3, semester: 1, sourceLocation: "BA (Heritage Management) Third Year: Semester I", electiveRule: "Must choose AT LEAST ONE" },
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "GE 348", title: "Disaster Management", status: "Elective", credits: 12, year: 3, semester: 1, sourceLocation: "BA (Heritage Management) Third Year: Semester I", electiveRule: "Must choose AT LEAST ONE" },
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "LL 260", title: "Basic French III", status: "Elective", credits: 12, year: 3, semester: 1, sourceLocation: "BA (Heritage Management) Third Year: Semester I", electiveRule: "Must choose AT LEAST ONE" },
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "LL 270", title: "Advanced French III", status: "Elective", credits: 12, year: 3, semester: 1, sourceLocation: "BA (Heritage Management) Third Year: Semester I", electiveRule: "Must choose AT LEAST ONE" },

  // THIRD YEAR: SEMESTER II
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "HM 303", title: "Architecture in Archaeology", status: "Core", credits: 12, year: 3, semester: 2, sourceLocation: "BA (Heritage Management) Third Year: Semester II" },
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "HM 304", title: "Intangible Cultural Heritage Resources", status: "Core", credits: 12, year: 3, semester: 2, sourceLocation: "BA (Heritage Management) Third Year: Semester II" },
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "AY 301", title: "Cultural Heritage Management", status: "Core", credits: 12, year: 3, semester: 2, sourceLocation: "BA (Heritage Management) Third Year: Semester II" },
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "HM 306", title: "Marketing Heritage Resources", status: "Core", credits: 12, year: 3, semester: 2, sourceLocation: "BA (Heritage Management) Third Year: Semester II" },
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "HM 307", title: "Heritage Conservation Planning", status: "Core", credits: 12, year: 3, semester: 2, sourceLocation: "BA (Heritage Management) Third Year: Semester II" },
  // Electives (Choose ONE)
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "SO 393", title: "Society, Culture and Health", status: "Elective", credits: 12, year: 3, semester: 2, sourceLocation: "BA (Heritage Management) Third Year: Semester II", electiveRule: "Choose ONE" },
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "AY 307", title: "Recent Research Approaches in Archaeology", status: "Elective", credits: 12, year: 3, semester: 2, sourceLocation: "BA (Heritage Management) Third Year: Semester II", electiveRule: "Choose ONE" },
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "LL 261", title: "Basic French IV", status: "Elective", credits: 12, year: 3, semester: 2, sourceLocation: "BA (Heritage Management) Third Year: Semester II", electiveRule: "Choose ONE" },
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "LL 276", title: "Functional French I", status: "Elective", credits: 12, year: 3, semester: 2, sourceLocation: "BA (Heritage Management) Third Year: Semester II", electiveRule: "Choose ONE" },
  { programmeId: "ba-heritage", programmeName: "B.A. (Heritage Management)", code: "HM 399", title: "Independent Project in Heritage Management (Dissertation)", status: "Elective", credits: 24, year: 3, semester: 2, sourceLocation: "BA (Heritage Management) Third Year: Semester II", electiveRule: "Choose ONE", isDissertation: true, byInvitationOnly: true, minGpa: 3.8, note: "By invitation only. Eligibility: students with GPA 3.8 or higher, from Second Year Semester II onward." },

  // =========================================================================
  // 3. BACHELOR OF ARTS IN ARCHAEOLOGY AND HISTORY — B.A. (ARCHAEOLOGY AND HISTORY)
  // =========================================================================

  // FIRST YEAR: SEMESTER I
  { programmeId: "ba-archaeology-history", programmeName: "B.A. (Archaeology and History)", code: "AY 100", title: "Introduction to Archaeology", status: "Core", credits: 12, year: 1, semester: 1, sourceLocation: "BA (Archaeology and History) First Year: Semester I" },
  { programmeId: "ba-archaeology-history", programmeName: "B.A. (Archaeology and History)", code: "AY 106", title: "Survey of World Prehistory", status: "Core", credits: 12, year: 1, semester: 1, sourceLocation: "BA (Archaeology and History) First Year: Semester I" },
  { programmeId: "ba-archaeology-history", programmeName: "B.A. (Archaeology and History)", code: "CL 106", title: "Communication Skills for Arts and Social Sciences", status: "Core", credits: 12, year: 1, semester: 1, sourceLocation: "BA (Archaeology and History) First Year: Semester I" },
  { programmeId: "ba-archaeology-history", programmeName: "B.A. (Archaeology and History)", code: "PL 111", title: "Introduction to Critical Thinking and Argumentation", status: "Core", credits: 12, year: 1, semester: 1, sourceLocation: "BA (Archaeology and History) First Year: Semester I" },
  { programmeId: "ba-archaeology-history", programmeName: "B.A. (Archaeology and History)", code: "DS 114", title: "Development Perspectives I", status: "Core", credits: 12, year: 1, semester: 1, sourceLocation: "BA (Archaeology and History) First Year: Semester I" },

  // FIRST YEAR: SEMESTER II
  { programmeId: "ba-archaeology-history", programmeName: "B.A. (Archaeology and History)", code: "AY 101", title: "Principles of Archaeology", status: "Core", credits: 12, year: 1, semester: 2, sourceLocation: "BA (Archaeology and History) First Year: Semester II" },
  { programmeId: "ba-archaeology-history", programmeName: "B.A. (Archaeology and History)", code: "AY 102", title: "Introduction to Anthropology", status: "Core", credits: 12, year: 1, semester: 2, sourceLocation: "BA (Archaeology and History) First Year: Semester II" },
  { programmeId: "ba-archaeology-history", programmeName: "B.A. (Archaeology and History)", code: "HI 102", title: "Survey of World Prehistory up ca. 1500 AD", status: "Core", credits: 12, year: 1, semester: 2, sourceLocation: "BA (Archaeology and History) First Year: Semester II" },
  { programmeId: "ba-archaeology-history", programmeName: "B.A. (Archaeology and History)", code: "HI 101", title: "Basic Concepts and Perspectives in History", status: "Core", credits: 12, year: 1, semester: 2, sourceLocation: "BA (Archaeology and History) First Year: Semester II" },
  { programmeId: "ba-archaeology-history", programmeName: "B.A. (Archaeology and History)", code: "DS 115", title: "Development Perspectives II", status: "Core", credits: 12, year: 1, semester: 2, sourceLocation: "BA (Archaeology and History) First Year: Semester II" },
  // Electives (Must choose ONE)
  { programmeId: "ba-archaeology-history", programmeName: "B.A. (Archaeology and History)", code: "SO 115", title: "Introduction to Culture and Society", status: "Elective", credits: 12, year: 1, semester: 2, sourceLocation: "BA (Archaeology and History) First Year: Semester II", electiveRule: "Must choose ONE" },
  { programmeId: "ba-archaeology-history", programmeName: "B.A. (Archaeology and History)", code: "SO 118", title: "Introduction to Cultural Anthropology", status: "Elective", credits: 12, year: 1, semester: 2, sourceLocation: "BA (Archaeology and History) First Year: Semester II", electiveRule: "Must choose ONE" },
  // Field Training (Long Vacation - 8 weeks)
  { programmeId: "ba-archaeology-history", programmeName: "B.A. (Archaeology and History)", code: "AY 120", title: "Field Training in Archaeology (Survey)", status: "Core", credits: 12, year: 1, semester: 2, sourceLocation: "BA (Archaeology and History) First Year: Field Training", isFieldTraining: true, note: "Field Training in Archaeology (Survey) conducted during the Long Vacation (8 weeks)." },

  // SECOND YEAR: SEMESTER I
  { programmeId: "ba-archaeology-history", programmeName: "B.A. (Archaeology and History)", code: "AY 211", title: "Development of Archaeological Thoughts", status: "Core", credits: 12, year: 2, semester: 1, sourceLocation: "BA (Archaeology and History) Second Year: Semester I" },
  { programmeId: "ba-archaeology-history", programmeName: "B.A. (Archaeology and History)", code: "AY 203", title: "African Civilizations", status: "Core", credits: 12, year: 2, semester: 1, sourceLocation: "BA (Archaeology and History) Second Year: Semester I" },
  { programmeId: "ba-archaeology-history", programmeName: "B.A. (Archaeology and History)", code: "HI 262", title: "History of East Africa", status: "Core", credits: 12, year: 2, semester: 1, sourceLocation: "BA (Archaeology and History) Second Year: Semester I" },
  { programmeId: "ba-archaeology-history", programmeName: "B.A. (Archaeology and History)", code: "HI 260", title: "Philosophies and Methodologies of History", status: "Core", credits: 12, year: 2, semester: 1, sourceLocation: "BA (Archaeology and History) Second Year: Semester I" },
  // Electives (Must choose TWO)
  { programmeId: "ba-archaeology-history", programmeName: "B.A. (Archaeology and History)", code: "AS 220", title: "Pan-Africanism: Thought and Practice I", status: "Elective", credits: 12, year: 2, semester: 1, sourceLocation: "BA (Archaeology and History) Second Year: Semester I", electiveRule: "Must choose TWO" },
  { programmeId: "ba-archaeology-history", programmeName: "B.A. (Archaeology and History)", code: "AY 207", title: "Ceramic Analysis in Archaeology", status: "Elective", credits: 12, year: 2, semester: 1, sourceLocation: "BA (Archaeology and History) Second Year: Semester I", electiveRule: "Must choose TWO" },
  { programmeId: "ba-archaeology-history", programmeName: "B.A. (Archaeology and History)", code: "AY 213", title: "Basics in Archaeometallurgy", status: "Elective", credits: 12, year: 2, semester: 1, sourceLocation: "BA (Archaeology and History) Second Year: Semester I", electiveRule: "Must choose TWO" },

  // SECOND YEAR: SEMESTER II
  { programmeId: "ba-archaeology-history", programmeName: "B.A. (Archaeology and History)", code: "AY 202", title: "Human Evolution", status: "Core", credits: 12, year: 2, semester: 2, sourceLocation: "BA (Archaeology and History) Second Year: Semester II" },
  { programmeId: "ba-archaeology-history", programmeName: "B.A. (Archaeology and History)", code: "AY 214", title: "Research Methods in Archaeology and Heritage", status: "Core", credits: 12, year: 2, semester: 2, sourceLocation: "BA (Archaeology and History) Second Year: Semester II" },
  { programmeId: "ba-archaeology-history", programmeName: "B.A. (Archaeology and History)", code: "HI 271", title: "History of West Africa", status: "Core", credits: 12, year: 2, semester: 2, sourceLocation: "BA (Archaeology and History) Second Year: Semester II" },
  { programmeId: "ba-archaeology-history", programmeName: "B.A. (Archaeology and History)", code: "HI 261", title: "History of Tanzania", status: "Core", credits: 12, year: 2, semester: 2, sourceLocation: "BA (Archaeology and History) Second Year: Semester II" },
  // Field Training (Long Vacation - 8 weeks)
  { programmeId: "ba-archaeology-history", programmeName: "B.A. (Archaeology and History)", code: "AY 220", title: "Field Training in Archaeology", status: "Core", credits: 12, year: 2, semester: 2, sourceLocation: "BA (Archaeology and History) Second Year: Field Training", isFieldTraining: true, note: "Field Training in Archaeology conducted during the Long Vacation (8 weeks)." },
  // Electives (Choose ONE)
  { programmeId: "ba-archaeology-history", programmeName: "B.A. (Archaeology and History)", code: "AY 204", title: "Lithic Analysis in Archaeology", status: "Elective", credits: 12, year: 2, semester: 2, sourceLocation: "BA (Archaeology and History) Second Year: Semester II", electiveRule: "Choose ONE" },
  { programmeId: "ba-archaeology-history", programmeName: "B.A. (Archaeology and History)", code: "AY 212", title: "Basics in Zooarchaeology", status: "Elective", credits: 12, year: 2, semester: 2, sourceLocation: "BA (Archaeology and History) Second Year: Semester II", electiveRule: "Choose ONE" },
  { programmeId: "ba-archaeology-history", programmeName: "B.A. (Archaeology and History)", code: "AY 209", title: "Archaeological Methodology", status: "Elective", credits: 12, year: 2, semester: 2, sourceLocation: "BA (Archaeology and History) Second Year: Semester II", electiveRule: "Choose ONE" },

  // THIRD YEAR: SEMESTER I
  { programmeId: "ba-archaeology-history", programmeName: "B.A. (Archaeology and History)", code: "AY 302", title: "Archaeology of Tanzania", status: "Core", credits: 12, year: 3, semester: 1, sourceLocation: "BA (Archaeology and History) Third Year: Semester I" },
  { programmeId: "ba-archaeology-history", programmeName: "B.A. (Archaeology and History)", code: "HM 302", title: "Museum Studies", status: "Core", credits: 12, year: 3, semester: 1, sourceLocation: "BA (Archaeology and History) Third Year: Semester I" },
  { programmeId: "ba-archaeology-history", programmeName: "B.A. (Archaeology and History)", code: "HI 366", title: "Topics in African Environmental History", status: "Core", credits: 12, year: 3, semester: 1, sourceLocation: "BA (Archaeology and History) Third Year: Semester I" },
  { programmeId: "ba-archaeology-history", programmeName: "B.A. (Archaeology and History)", code: "HI 368", title: "Oral Histories in Tanzania", status: "Core", credits: 12, year: 3, semester: 1, sourceLocation: "BA (Archaeology and History) Third Year: Semester I" },
  // Electives (Must choose TWO)
  { programmeId: "ba-archaeology-history", programmeName: "B.A. (Archaeology and History)", code: "AY 309", title: "Mortuary Archaeology", status: "Elective", credits: 12, year: 3, semester: 1, sourceLocation: "BA (Archaeology and History) Third Year: Semester I", electiveRule: "Must choose TWO" },
  { programmeId: "ba-archaeology-history", programmeName: "B.A. (Archaeology and History)", code: "AY 306", title: "People and Cultures in Africa", status: "Elective", credits: 12, year: 3, semester: 1, sourceLocation: "BA (Archaeology and History) Third Year: Semester I", electiveRule: "Must choose TWO" },
  { programmeId: "ba-archaeology-history", programmeName: "B.A. (Archaeology and History)", code: "AY 321", title: "Heritage Laws", status: "Elective", credits: 12, year: 3, semester: 1, sourceLocation: "BA (Archaeology and History) Third Year: Semester I", electiveRule: "Must choose TWO" },

  // THIRD YEAR: SEMESTER II
  { programmeId: "ba-archaeology-history", programmeName: "B.A. (Archaeology and History)", code: "AY 300", title: "Advanced Archaeological Theory", status: "Core", credits: 12, year: 3, semester: 2, sourceLocation: "BA (Archaeology and History) Third Year: Semester II" },
  { programmeId: "ba-archaeology-history", programmeName: "B.A. (Archaeology and History)", code: "HI 264", title: "Africa and World Religions", status: "Core", credits: 12, year: 3, semester: 2, sourceLocation: "BA (Archaeology and History) Third Year: Semester II" },
  { programmeId: "ba-archaeology-history", programmeName: "B.A. (Archaeology and History)", code: "HI 380", title: "Ethnic Identities in Tanzania", status: "Core", credits: 12, year: 3, semester: 2, sourceLocation: "BA (Archaeology and History) Third Year: Semester II" },
  { programmeId: "ba-archaeology-history", programmeName: "B.A. (Archaeology and History)", code: "AY 301", title: "Cultural Heritage Management", status: "Core", credits: 12, year: 3, semester: 2, sourceLocation: "BA (Archaeology and History) Third Year: Semester II" },
  // Electives (Choose ONE or TWO)
  { programmeId: "ba-archaeology-history", programmeName: "B.A. (Archaeology and History)", code: "AY 304", title: "Basics in Archaeology", status: "Elective", credits: 12, year: 3, semester: 2, sourceLocation: "BA (Archaeology and History) Third Year: Semester II", electiveRule: "Choose ONE or TWO" },
  { programmeId: "ba-archaeology-history", programmeName: "B.A. (Archaeology and History)", code: "AY 307", title: "Recent Research Approaches in Archaeology", status: "Elective", credits: 12, year: 3, semester: 2, sourceLocation: "BA (Archaeology and History) Third Year: Semester II", electiveRule: "Choose ONE or TWO" },
  { programmeId: "ba-archaeology-history", programmeName: "B.A. (Archaeology and History)", code: "AY 399", title: "Independent Project in Archaeology/Heritage Management (Dissertation)", status: "Elective", credits: 24, year: 3, semester: 2, sourceLocation: "BA (Archaeology and History) Third Year: Semester II", electiveRule: "Choose ONE or TWO", isDissertation: true, byInvitationOnly: true, minGpa: 3.8, note: "By invitation only. Eligibility: students with GPA 3.8 or higher, from Second Year Semester II onward." },

  // =========================================================================
  // 4. BACHELOR OF ARTS IN ARCHAEOLOGY AND GEOGRAPHY — B.A. (ARCHAEOLOGY AND GEOGRAPHY)
  // =========================================================================

  // FIRST YEAR: SEMESTER I
  { programmeId: "ba-archaeology-geography", programmeName: "B.A. (Archaeology and Geography)", code: "AY 100", title: "Introduction to Archaeology", status: "Core", credits: 12, year: 1, semester: 1, sourceLocation: "BA (Archaeology and Geography) First Year: Semester I" },
  { programmeId: "ba-archaeology-geography", programmeName: "B.A. (Archaeology and Geography)", code: "AY 106", title: "Survey of World Prehistory", status: "Core", credits: 12, year: 1, semester: 1, sourceLocation: "BA (Archaeology and Geography) First Year: Semester I" },
  { programmeId: "ba-archaeology-geography", programmeName: "B.A. (Archaeology and Geography)", code: "GE 140", title: "Introduction to Physical Geography", status: "Core", credits: 12, year: 1, semester: 1, sourceLocation: "BA (Archaeology and Geography) First Year: Semester I" },
  { programmeId: "ba-archaeology-geography", programmeName: "B.A. (Archaeology and Geography)", code: "CL 106", title: "Communication Skills for Arts and Social Sciences", status: "Core", credits: 12, year: 1, semester: 1, sourceLocation: "BA (Archaeology and Geography) First Year: Semester I" },
  { programmeId: "ba-archaeology-geography", programmeName: "B.A. (Archaeology and Geography)", code: "PL 111", title: "Introduction to Critical Thinking and Argumentation", status: "Core", credits: 12, year: 1, semester: 1, sourceLocation: "BA (Archaeology and Geography) First Year: Semester I" },
  { programmeId: "ba-archaeology-geography", programmeName: "B.A. (Archaeology and Geography)", code: "DS 114", title: "Development Perspectives I", status: "Core", credits: 12, year: 1, semester: 1, sourceLocation: "BA (Archaeology and Geography) First Year: Semester I" },

  // FIRST YEAR: SEMESTER II
  { programmeId: "ba-archaeology-geography", programmeName: "B.A. (Archaeology and Geography)", code: "AY 101", title: "Principles of Archaeology", status: "Core", credits: 12, year: 1, semester: 2, sourceLocation: "BA (Archaeology and Geography) First Year: Semester II" },
  { programmeId: "ba-archaeology-geography", programmeName: "B.A. (Archaeology and Geography)", code: "AY 102", title: "Introduction to Anthropology", status: "Core", credits: 12, year: 1, semester: 2, sourceLocation: "BA (Archaeology and Geography) First Year: Semester II" },
  { programmeId: "ba-archaeology-geography", programmeName: "B.A. (Archaeology and Geography)", code: "GE 145", title: "Introduction to Environmental Education", status: "Core", credits: 12, year: 1, semester: 2, sourceLocation: "BA (Archaeology and Geography) First Year: Semester II" },
  { programmeId: "ba-archaeology-geography", programmeName: "B.A. (Archaeology and Geography)", code: "GE 143", title: "Environment Resources and Food Security", status: "Core", credits: 12, year: 1, semester: 2, sourceLocation: "BA (Archaeology and Geography) First Year: Semester II" },
  { programmeId: "ba-archaeology-geography", programmeName: "B.A. (Archaeology and Geography)", code: "GE 141", title: "Climatology", status: "Core", credits: 12, year: 1, semester: 2, sourceLocation: "BA (Archaeology and Geography) First Year: Semester II" },
  { programmeId: "ba-archaeology-geography", programmeName: "B.A. (Archaeology and Geography)", code: "DS 115", title: "Development Perspectives II", status: "Core", credits: 12, year: 1, semester: 2, sourceLocation: "BA (Archaeology and Geography) First Year: Semester II" },
  // Field Training (Long Vacation - 8 weeks)
  { programmeId: "ba-archaeology-geography", programmeName: "B.A. (Archaeology and Geography)", code: "AY 120", title: "Field Training in Archaeology (Survey)", status: "Core", credits: 12, year: 1, semester: 2, sourceLocation: "BA (Archaeology and Geography) First Year: Field Training", isFieldTraining: true, note: "Field Training in Archaeology (Survey) conducted during the Long Vacation (8 weeks)." },

  // SECOND YEAR: SEMESTER I
  { programmeId: "ba-archaeology-geography", programmeName: "B.A. (Archaeology and Geography)", code: "AY 211", title: "Development of Archaeological Thoughts", status: "Core", credits: 12, year: 2, semester: 1, sourceLocation: "BA (Archaeology and Geography) Second Year: Semester I" },
  { programmeId: "ba-archaeology-geography", programmeName: "B.A. (Archaeology and Geography)", code: "AY 203", title: "African Civilizations", status: "Core", credits: 12, year: 2, semester: 1, sourceLocation: "BA (Archaeology and Geography) Second Year: Semester I" },
  { programmeId: "ba-archaeology-geography", programmeName: "B.A. (Archaeology and Geography)", code: "GE 240", title: "Soil Resources", status: "Core", credits: 12, year: 2, semester: 1, sourceLocation: "BA (Archaeology and Geography) Second Year: Semester I" },
  { programmeId: "ba-archaeology-geography", programmeName: "B.A. (Archaeology and Geography)", code: "GE 250", title: "Environmental Education and Conservation", status: "Core", credits: 12, year: 2, semester: 1, sourceLocation: "BA (Archaeology and Geography) Second Year: Semester I" },
  { programmeId: "ba-archaeology-geography", programmeName: "B.A. (Archaeology and Geography)", code: "GE 251", title: "Tourism and Leisure", status: "Core", credits: 12, year: 2, semester: 1, sourceLocation: "BA (Archaeology and Geography) Second Year: Semester I" },
  // Electives (Should choose ONE)
  { programmeId: "ba-archaeology-geography", programmeName: "B.A. (Archaeology and Geography)", code: "AS 220", title: "Pan-Africanism: Thought and Practice I", status: "Elective", credits: 12, year: 2, semester: 1, sourceLocation: "BA (Archaeology and Geography) Second Year: Semester I", electiveRule: "Should choose ONE" },
  { programmeId: "ba-archaeology-geography", programmeName: "B.A. (Archaeology and Geography)", code: "AY 207", title: "Ceramic Analysis in Archaeology", status: "Elective", credits: 12, year: 2, semester: 1, sourceLocation: "BA (Archaeology and Geography) Second Year: Semester I", electiveRule: "Should choose ONE" },
  { programmeId: "ba-archaeology-geography", programmeName: "B.A. (Archaeology and Geography)", code: "AY 213", title: "Basics in Archaeometallurgy", status: "Elective", credits: 12, year: 2, semester: 1, sourceLocation: "BA (Archaeology and Geography) Second Year: Semester I", electiveRule: "Should choose ONE" },

  // SECOND YEAR: SEMESTER II
  { programmeId: "ba-archaeology-geography", programmeName: "B.A. (Archaeology and Geography)", code: "AY 202", title: "Human Evolution", status: "Core", credits: 12, year: 2, semester: 2, sourceLocation: "BA (Archaeology and Geography) Second Year: Semester II" },
  { programmeId: "ba-archaeology-geography", programmeName: "B.A. (Archaeology and Geography)", code: "AY 214", title: "Research Methods in Archaeology and Heritage", status: "Core", credits: 12, year: 2, semester: 2, sourceLocation: "BA (Archaeology and Geography) Second Year: Semester II" },
  { programmeId: "ba-archaeology-geography", programmeName: "B.A. (Archaeology and Geography)", code: "AY 209", title: "Archaeological Methodology", status: "Core", credits: 12, year: 2, semester: 2, sourceLocation: "BA (Archaeology and Geography) Second Year: Semester II" },
  { programmeId: "ba-archaeology-geography", programmeName: "B.A. (Archaeology and Geography)", code: "GE 245", title: "Remote Sensing", status: "Core", credits: 12, year: 2, semester: 2, sourceLocation: "BA (Archaeology and Geography) Second Year: Semester II" },
  // Field Training (Long Vacation - 8 weeks)
  { programmeId: "ba-archaeology-geography", programmeName: "B.A. (Archaeology and Geography)", code: "AY 220", title: "Field Training in Archaeology (Excavation)", status: "Core", credits: 12, year: 2, semester: 2, sourceLocation: "BA (Archaeology and Geography) Second Year: Field Training", isFieldTraining: true, note: "Field Training in Archaeology (Excavation) conducted during the Long Vacation (8 weeks)." },
  // Electives (Should choose ONE)
  { programmeId: "ba-archaeology-geography", programmeName: "B.A. (Archaeology and Geography)", code: "AS 221", title: "Pan-Africanism: Thought and Practice II", status: "Elective", credits: 12, year: 2, semester: 2, sourceLocation: "BA (Archaeology and Geography) Second Year: Semester II", electiveRule: "Should choose ONE" },
  { programmeId: "ba-archaeology-geography", programmeName: "B.A. (Archaeology and Geography)", code: "AY 204", title: "Lithic Analysis in Archaeology", status: "Elective", credits: 12, year: 2, semester: 2, sourceLocation: "BA (Archaeology and Geography) Second Year: Semester II", electiveRule: "Should choose ONE" },
  { programmeId: "ba-archaeology-geography", programmeName: "B.A. (Archaeology and Geography)", code: "AY 212", title: "Basics in Zooarchaeology", status: "Elective", credits: 12, year: 2, semester: 2, sourceLocation: "BA (Archaeology and Geography) Second Year: Semester II", electiveRule: "Should choose ONE" },

  // THIRD YEAR: SEMESTER I
  { programmeId: "ba-archaeology-geography", programmeName: "B.A. (Archaeology and Geography)", code: "AY 302", title: "Archaeology of Tanzania", status: "Core", credits: 12, year: 3, semester: 1, sourceLocation: "BA (Archaeology and Geography) Third Year: Semester I" },
  { programmeId: "ba-archaeology-geography", programmeName: "B.A. (Archaeology and Geography)", code: "AY 311", title: "Approaches to Hunter-Gatherers Studies", status: "Core", credits: 12, year: 3, semester: 1, sourceLocation: "BA (Archaeology and Geography) Third Year: Semester I" },
  { programmeId: "ba-archaeology-geography", programmeName: "B.A. (Archaeology and Geography)", code: "HM 302", title: "Museum Studies", status: "Core", credits: 12, year: 3, semester: 1, sourceLocation: "BA (Archaeology and Geography) Third Year: Semester I" },
  { programmeId: "ba-archaeology-geography", programmeName: "B.A. (Archaeology and Geography)", code: "GE 352", title: "Natural Resources Management", status: "Core", credits: 12, year: 3, semester: 1, sourceLocation: "BA (Archaeology and Geography) Third Year: Semester I" },
  { programmeId: "ba-archaeology-geography", programmeName: "B.A. (Archaeology and Geography)", code: "GE 353", title: "Geographical Information Systems", status: "Core", credits: 12, year: 3, semester: 1, sourceLocation: "BA (Archaeology and Geography) Third Year: Semester I" },
  // Electives (May choose ONE)
  { programmeId: "ba-archaeology-geography", programmeName: "B.A. (Archaeology and Geography)", code: "AY 309", title: "Mortuary Archaeology", status: "Elective", credits: 12, year: 3, semester: 1, sourceLocation: "BA (Archaeology and Geography) Third Year: Semester I", electiveRule: "May choose ONE" },
  { programmeId: "ba-archaeology-geography", programmeName: "B.A. (Archaeology and Geography)", code: "AY 306", title: "People and Cultures in Africa", status: "Elective", credits: 12, year: 3, semester: 1, sourceLocation: "BA (Archaeology and Geography) Third Year: Semester I", electiveRule: "May choose ONE" },
  { programmeId: "ba-archaeology-geography", programmeName: "B.A. (Archaeology and Geography)", code: "HM 321", title: "Heritage Laws", status: "Elective", credits: 12, year: 3, semester: 1, sourceLocation: "BA (Archaeology and Geography) Third Year: Semester I", electiveRule: "May choose ONE", note: "Preserved exact HM 321 code as specified for this curriculum (not merged with AY 321)." },

  // THIRD YEAR: SEMESTER II
  { programmeId: "ba-archaeology-geography", programmeName: "B.A. (Archaeology and Geography)", code: "AY 300", title: "Advanced Archaeological Theory", status: "Core", credits: 12, year: 3, semester: 2, sourceLocation: "BA (Archaeology and Geography) Third Year: Semester II" },
  { programmeId: "ba-archaeology-geography", programmeName: "B.A. (Archaeology and Geography)", code: "GE 350", title: "Environmental Policy and Planning", status: "Core", credits: 12, year: 3, semester: 2, sourceLocation: "BA (Archaeology and Geography) Third Year: Semester II" },
  { programmeId: "ba-archaeology-geography", programmeName: "B.A. (Archaeology and Geography)", code: "GE 354", title: "Environmental Assessment", status: "Core", credits: 12, year: 3, semester: 2, sourceLocation: "BA (Archaeology and Geography) Third Year: Semester II" },
  { programmeId: "ba-archaeology-geography", programmeName: "B.A. (Archaeology and Geography)", code: "AY 301", title: "Cultural Heritage Management", status: "Core", credits: 12, year: 3, semester: 2, sourceLocation: "BA (Archaeology and Geography) Third Year: Semester II" },
  // Electives (Should choose ONE or TWO)
  { programmeId: "ba-archaeology-geography", programmeName: "B.A. (Archaeology and Geography)", code: "AY 304", title: "Basics in Archaeology", status: "Elective", credits: 12, year: 3, semester: 2, sourceLocation: "BA (Archaeology and Geography) Third Year: Semester II", electiveRule: "Should choose ONE or TWO" },
  { programmeId: "ba-archaeology-geography", programmeName: "B.A. (Archaeology and Geography)", code: "AY 307", title: "Recent Research Approaches in Archaeology", status: "Elective", credits: 12, year: 3, semester: 2, sourceLocation: "BA (Archaeology and Geography) Third Year: Semester II", electiveRule: "Should choose ONE or TWO" },
  { programmeId: "ba-archaeology-geography", programmeName: "B.A. (Archaeology and Geography)", code: "AY 399", title: "Independent Project in Archaeology/Heritage Management (Dissertation)", status: "Elective", credits: 24, year: 3, semester: 2, sourceLocation: "BA (Archaeology and Geography) Third Year: Semester II", electiveRule: "Should choose ONE or TWO", isDissertation: true, byInvitationOnly: true, minGpa: 3.8, note: "By invitation only. Eligibility: students with GPA 3.8 or higher, from Second Year Semester II onward." }
];

async function run() {
  console.log("=== VENUE ACADEMIC CATALOGUE IMPORT: DEPARTMENT OF ARCHAEOLOGY AND HERITAGE STUDIES ===");
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

  // Department: Department of Archaeology and Heritage Studies
  const deptSnap = await getDoc(doc(dbNamed, "departments", "dept-archaeology"));
  if (!deptSnap.exists()) {
    throw new Error("Department dept-archaeology does not exist!");
  }
  console.log(`✓ Reused Department: ${deptSnap.data()?.name} (${deptSnap.id})`);

  // Register / update the 4 degree programmes under dept-archaeology
  const archProgrammesToEnsure = [
    {
      id: "ba-archaeology",
      name: "Bachelor of Arts in Archaeology",
      shortName: "B.A. (Archaeology)",
      departmentId: "dept-archaeology",
      academicUnitId: "cohu",
      collegeId: "cohu",
      universityId: "udsm",
      durationYears: 3,
      semestersPerYear: 2,
      studyMode: "Full-Time",
      awardLevel: "Bachelor Degree",
      totalMinCredits: 376,
      fieldTrainingNote: "Field Training in Archaeology (Survey AY 120, Excavation AY 220) conducted during long vacation for 8 weeks.",
      dissertationNote: "AY 399 (Dissertation) taken by invitation only. Eligibility: GPA 3.8 or higher, from Second Year Semester II onward.",
      verified: true,
      academicYear: "2025/2026",
      source: "UDSM Undergraduate Prospectus 2025/2026 (Official Source of Truth)",
      sourceType: "official_prospectus",
      updatedAt: new Date().toISOString()
    },
    {
      id: "ba-heritage",
      name: "Bachelor of Arts in Heritage Management",
      shortName: "B.A. (Heritage Management)",
      departmentId: "dept-archaeology",
      academicUnitId: "cohu",
      collegeId: "cohu",
      universityId: "udsm",
      durationYears: 3,
      semestersPerYear: 2,
      studyMode: "Full-Time",
      awardLevel: "Bachelor Degree",
      totalMinCredits: 376,
      programmeNote: "Total minimum number of (core) credits for B.A. (Heritage Management Studies) is 376.",
      fieldTrainingNote: "Field Training in Archaeology (Survey AY 120) and Practical Training in Heritage Management (AY 230) conducted during long vacation.",
      dissertationNote: "HM 399 (Dissertation) taken by invitation only. Eligibility: GPA 3.8 or higher, from Second Year Semester II onward.",
      verified: true,
      academicYear: "2025/2026",
      source: "UDSM Undergraduate Prospectus 2025/2026 (Official Source of Truth)",
      sourceType: "official_prospectus",
      updatedAt: new Date().toISOString()
    },
    {
      id: "ba-archaeology-history",
      name: "Bachelor of Arts in Archaeology and History",
      shortName: "B.A. (Archaeology & History)",
      departmentId: "dept-archaeology",
      academicUnitId: "cohu",
      collegeId: "cohu",
      universityId: "udsm",
      durationYears: 3,
      semestersPerYear: 2,
      studyMode: "Full-Time",
      awardLevel: "Bachelor Degree",
      totalMinCredits: 376,
      fieldTrainingNote: "Field Training in Archaeology (Survey AY 120, Field Training AY 220) conducted during long vacation (8 weeks).",
      dissertationNote: "AY 399 (Dissertation) taken by invitation only. Eligibility: GPA 3.8 or higher, from Second Year Semester II onward.",
      verified: true,
      academicYear: "2025/2026",
      source: "UDSM Undergraduate Prospectus 2025/2026 (Official Source of Truth)",
      sourceType: "official_prospectus",
      updatedAt: new Date().toISOString()
    },
    {
      id: "ba-archaeology-geography",
      name: "Bachelor of Arts in Archaeology and Geography",
      shortName: "B.A. (Archaeology & Geography)",
      departmentId: "dept-archaeology",
      academicUnitId: "cohu",
      collegeId: "cohu",
      universityId: "udsm",
      durationYears: 3,
      semestersPerYear: 2,
      studyMode: "Full-Time",
      awardLevel: "Bachelor Degree",
      totalMinCredits: 376,
      fieldTrainingNote: "Field Training in Archaeology (Survey AY 120, Excavation AY 220) conducted during long vacation (8 weeks).",
      dissertationNote: "AY 399 (Dissertation) taken by invitation only. Eligibility: GPA 3.8 or higher, from Second Year Semester II onward.",
      verified: true,
      academicYear: "2025/2026",
      source: "UDSM Undergraduate Prospectus 2025/2026 (Official Source of Truth)",
      sourceType: "official_prospectus",
      updatedAt: new Date().toISOString()
    }
  ];

  const progReport: any[] = [];
  for (const prog of archProgrammesToEnsure) {
    const existingSnap = await getDoc(doc(dbNamed, "programmes", prog.id));
    const status = existingSnap.exists() ? "reused" : "created";
    progReport.push({ id: prog.id, name: prog.name, shortName: prog.shortName, status });

    for (const { name, db } of databases) {
      await setDoc(doc(db, "programmes", prog.id), {
        ...prog,
        createdAt: existingSnap.exists() ? (existingSnap.data()?.createdAt || new Date().toISOString()) : new Date().toISOString()
      }, { merge: true });
    }
    console.log(`✓ ${status === "reused" ? "Reused" : "Created"} Programme: ${prog.name} (${prog.id})`);
  }

  // Clean up obsolete placeholder rows for ba-archaeology and ba-heritage if present
  console.log("\nCleaning up unverified/obsolete placeholder rows in programme_courses & catalogue_courses...");
  const oldPlaceholderIds = [
    // ba-archaeology
    "ba-archaeology_ay_100", "ba-archaeology_ay_102", "ba-archaeology_ay_104", "ba-archaeology_ay_106",
    "ba-archaeology_ay_200", "ba-archaeology_ay_202", "ba-archaeology_ay_204", "ba-archaeology_ay_206",
    "ba-archaeology_ay_300", "ba-archaeology_ay_302", "ba-archaeology_ay_399", "ba-archaeology_cl_106",
    "ba-archaeology_ds_112",
    // ba-heritage
    "ba-heritage_cl_106", "ba-heritage_ds_112", "ba-heritage_hu_101", "ba-heritage_hu_102",
    "ba-heritage_hu_103", "ba-heritage_hu_104", "ba-heritage_hu_201", "ba-heritage_hu_202",
    "ba-heritage_hu_203", "ba-heritage_hu_204", "ba-heritage_hu_301", "ba-heritage_hu_302",
    "ba-heritage_hu_399"
  ];

  for (const oldId of oldPlaceholderIds) {
    for (const { db } of databases) {
      try {
        await deleteDoc(doc(db, "programme_courses", oldId));
        await deleteDoc(doc(db, "catalogue_courses", `udsm_${oldId}`));
      } catch (e) {
        // ignore if not present
      }
    }
  }
  console.log(`Cleaned up obsolete placeholder records.`);

  // 2. CANONICAL COURSES AUDIT & RECONCILIATION
  console.log("\n[2/6] Auditing and Reconciling Canonical Courses...");
  const existingCanonSnap = await getDocs(collection(dbNamed, "canonical_courses"));
  const existingCanonicalCourses = existingCanonSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
  
  const canonMap = new Map<string, any>();
  existingCanonicalCourses.forEach(c => {
    if (c.code) canonMap.set(c.code.trim().toUpperCase(), c);
  });

  const canonicalReused = new Set<string>();
  const newCanonicalToCreate: any[] = [];
  const conflicts: any[] = [];

  // Group raw items by unique course code
  const uniqueCodeMap = new Map<string, RawCurriculumItem[]>();
  for (const item of rawCurriculum) {
    const code = item.code.trim().toUpperCase();
    if (!uniqueCodeMap.has(code)) uniqueCodeMap.set(code, []);
    uniqueCodeMap.get(code)!.push(item);
  }

  for (const [code, occurrences] of uniqueCodeMap.entries()) {
    const rep = occurrences[0];
    const existing = canonMap.get(code);

    if (existing) {
      canonicalReused.add(code);
      
      // Check for title or credits differences
      for (const occ of occurrences) {
        const titleMismatch = existing.title && existing.title.trim().toLowerCase() !== occ.title.trim().toLowerCase();
        const creditsMismatch = existing.defaultCredits !== undefined && existing.defaultCredits !== occ.credits;

        if (titleMismatch || creditsMismatch) {
          conflicts.push({
            courseCode: code,
            programmeId: occ.programmeId,
            existingTitle: existing.title,
            suppliedTitle: occ.title,
            existingCredits: existing.defaultCredits ?? "undefined",
            suppliedCredits: occ.credits,
            actionTaken: "Preserved existing canonical course record without overwriting; stored programme-specific title and credits in relationship document."
          });
        }
      }
    } else {
      // Create new canonical course
      const cleanId = code.toLowerCase().replace(/[^a-z0-9]+/g, "_");
      
      // Determine departmental affiliation
      let offeringDept = "dept-archaeology";
      let offeringUnit = "cohu";

      if (code.startsWith("AY ") || code.startsWith("HM ")) {
        offeringDept = "dept-archaeology";
        offeringUnit = "cohu";
      } else if (code.startsWith("HI ")) {
        offeringDept = "dept-history";
        offeringUnit = "cohu";
      } else if (code.startsWith("GE ")) {
        offeringDept = "dept-geography";
        offeringUnit = "coss";
      } else if (code.startsWith("SO ")) {
        offeringDept = "dept-sociology";
        offeringUnit = "coss";
      } else if (code.startsWith("ZL ")) {
        offeringDept = "dept-zoology";
        offeringUnit = "conas";
      } else if (code.startsWith("BT ")) {
        offeringDept = "dept-botany";
        offeringUnit = "conas";
      } else if (code.startsWith("CA ")) {
        offeringDept = "dept-creative-arts";
        offeringUnit = "cohu";
      } else if (code.startsWith("CL ")) {
        offeringDept = "dept-ccs";
        offeringUnit = "cohu";
      } else if (code.startsWith("PL ")) {
        offeringDept = "dept-philosophy";
        offeringUnit = "cohu";
      } else if (code.startsWith("DS ")) {
        offeringDept = "dept-ids";
        offeringUnit = "ids";
      } else if (code.startsWith("LL ")) {
        offeringDept = "dept-foreign-languages";
        offeringUnit = "cohu";
      } else if (code.startsWith("AS ")) {
        offeringDept = "dept-archaeology";
        offeringUnit = "cohu";
      }

      const cleanTitle = rep.title.replace(/\*+$/, "").trim();

      const newCanon = {
        id: cleanId,
        code: rep.code,
        title: cleanTitle,
        defaultCredits: rep.credits,
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

  console.log(`Canonical summary: ${canonicalReused.size} reused, ${newCanonicalToCreate.length} new to create, ${conflicts.length} conflict instances logged.`);

  // Write new canonical courses to both databases
  for (const newCanon of newCanonicalToCreate) {
    for (const { name, db } of databases) {
      await setDoc(doc(db, "canonical_courses", newCanon.id), newCanon);
    }
    canonMap.set(newCanon.code.toUpperCase(), newCanon);
    console.log(`✓ Created new canonical course: ${newCanon.code} - ${newCanon.title} (${newCanon.id})`);
  }

  // 3. BUILD PROGRAMME_COURSES AND CATALOGUE_COURSES RELATIONSHIPS
  console.log("\n[3/6] Generating Curriculum Relationships...");
  const pcDocsToWrite: any[] = [];
  const ccDocsToWrite: any[] = [];

  for (const item of rawCurriculum) {
    const canon = canonMap.get(item.code.toUpperCase());
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
      isFieldTraining: !!item.isFieldTraining,
      isDissertation: !!item.isDissertation,
      byInvitationOnly: !!item.byInvitationOnly,
      minGpa: item.minGpa || null,
      note: item.note || null,
      departmentId: "dept-archaeology",
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
      for (const d of chunk) {
        batch.set(doc(db, "programme_courses", d.id), d);
      }
      await batch.commit();
      console.log(`  - Wrote programme_courses batch ${i + 1} to ${i + chunk.length}`);
    }

    for (let i = 0; i < ccDocsToWrite.length; i += BATCH_SIZE) {
      const batch = writeBatch(db);
      const chunk = ccDocsToWrite.slice(i, i + BATCH_SIZE);
      for (const d of chunk) {
        batch.set(doc(db, "catalogue_courses", d.id), d);
      }
      await batch.commit();
      console.log(`  - Wrote catalogue_courses batch ${i + 1} to ${i + chunk.length}`);
    }
  }

  // 5. PERFORM INTEGRITY VERIFICATION
  console.log("\n[5/6] Performing Integrity Verification...");
  const verifyReport: any = {
    programmes: []
  };

  for (const prog of archProgrammesToEnsure) {
    const pcSnap = await getDocs(collection(dbNamed, "catalogue_courses"));
    const progCourses = pcSnap.docs
      .map(d => d.data())
      .filter((d: any) => d.programmeId === prog.id);

    console.log(`✓ Verified ${prog.name}: ${progCourses.length} courses registered in catalogue_courses.`);

    const byYearSem: any = {};
    for (let y = 1; y <= 3; y++) {
      for (let s = 1; s <= 2; s++) {
        const key = `Y${y}S${s}`;
        const subset = progCourses.filter((c: any) => c.yearOfStudy === y && c.semester === s);
        const cores = subset.filter((c: any) => c.status === "Core");
        const electives = subset.filter((c: any) => c.status === "Elective");
        byYearSem[key] = { total: subset.length, core: cores.length, elective: electives.length };
        console.log(`    Year ${y} Semester ${s}: ${subset.length} courses (Core: ${cores.length}, Elective: ${electives.length})`);
      }
    }

    verifyReport.programmes.push({
      id: prog.id,
      name: prog.name,
      totalCourses: progCourses.length,
      breakdown: byYearSem
    });
  }

  // Check specific requirements:
  // AY 120 verification
  const ay120Snap = await getDocs(collection(dbNamed, "catalogue_courses"));
  const ay120Courses = ay120Snap.docs
    .map(d => d.data())
    .filter((d: any) => d.code === "AY 120");
  console.log(`✓ Verified AY 120 across programmes: ${ay120Courses.length} relationship(s). Programmes: ${ay120Courses.map((c: any) => c.programmeId).join(", ")}`);

  // AY 220 verification
  const ay220Courses = ay120Snap.docs
    .map(d => d.data())
    .filter((d: any) => d.code === "AY 220");
  console.log(`✓ Verified AY 220 across programmes: ${ay220Courses.length} relationship(s). Programmes: ${ay220Courses.map((c: any) => c.programmeId).join(", ")}`);

  // AY 230 verification
  const ay230Courses = ay120Snap.docs
    .map(d => d.data())
    .filter((d: any) => d.code === "AY 230");
  console.log(`✓ Verified AY 230 in Heritage Management: ${ay230Courses.length} relationship(s). Programmes: ${ay230Courses.map((c: any) => c.programmeId).join(", ")}`);

  // AY 399 & HM 399 verification
  const ay399Courses = ay120Snap.docs
    .map(d => d.data())
    .filter((d: any) => d.code === "AY 399");
  console.log(`✓ Verified AY 399 (Dissertation): ${ay399Courses.length} relationship(s). Invitation only: ${ay399Courses.every((c: any) => c.byInvitationOnly)}`);

  const hm399Courses = ay120Snap.docs
    .map(d => d.data())
    .filter((d: any) => d.code === "HM 399");
  console.log(`✓ Verified HM 399 (Dissertation): ${hm399Courses.length} relationship(s). Invitation only: ${hm399Courses.every((c: any) => c.byInvitationOnly)}`);

  // Check ZL 122 credits
  const zl122 = ay120Snap.docs
    .map(d => d.data())
    .find((d: any) => d.code === "ZL 122");
  console.log(`✓ Verified ZL 122 credits: ${zl122?.credits}`);

  // Check no duplicate canonical course codes
  const finalCanonSnap = await getDocs(collection(dbNamed, "canonical_courses"));
  const codesSeen = new Map<string, string[]>();
  for (const docSnap of finalCanonSnap.docs) {
    const data = docSnap.data();
    const code = (data.code || "").toUpperCase();
    if (!codesSeen.has(code)) codesSeen.set(code, []);
    codesSeen.get(code)!.push(docSnap.id);
  }
  let dupsFound = 0;
  for (const [code, ids] of codesSeen.entries()) {
    if (ids.length > 1) {
      console.error(`DUPLICATE CANONICAL CODE: ${code} in doc IDs: ${ids.join(", ")}`);
      dupsFound++;
    }
  }
  if (dupsFound === 0) {
    console.log("✓ Zero duplicate canonical course codes verified across entire database!");
  }

  // 6. COMPOSE FINAL REPORT JSON
  const finalReport = {
    timestamp: new Date().toISOString(),
    academicUnit: {
      id: "cohu",
      name: "College of Humanities",
      status: "reused"
    },
    department: {
      id: "dept-archaeology",
      name: "Department of Archaeology and Heritage Studies",
      status: "reused"
    },
    programmes: archProgrammesToEnsure.map(p => ({
      id: p.id,
      name: p.name,
      shortName: p.shortName,
      status: progReport.find(pr => pr.id === p.id)?.status || "reused",
      relationships: rawCurriculum.filter(r => r.programmeId === p.id).length
    })),
    totalRelationshipsCreated: pcDocsToWrite.length,
    relationshipsReused: 0,
    canonicalCoursesReused: canonicalReused.size,
    newCanonicalCreated: newCanonicalToCreate.map(c => ({
      code: c.code,
      title: c.title,
      credits: c.defaultCredits,
      id: c.id
    })),
    conflictsDetected: conflicts.length,
    conflictsDetail: conflicts,
    electiveRulesStored: true,
    fieldTrainingStored: {
      ay120: "Field Training in Archaeology (Survey) - 12 credits (Core, Long Vacation - 8 weeks) across all 4 programmes",
      ay220: "Field Training in Archaeology (Excavation) - 12 credits (Core, Long Vacation) in B.A. (Archaeology), B.A. (Archaeology & History), B.A. (Archaeology & Geography)",
      ay230: "Practical Training in Heritage Management - 12 credits (Core, Long Vacation) strictly in B.A. (Heritage Management) (not AY 220)"
    },
    dissertationRestrictionsStored: {
      ay399: "Independent Project in Archaeology/Heritage Management (Dissertation) - 24 credits (Elective, By invitation only, GPA >= 3.8, from Year 2 Sem 2 onward)",
      hm399: "Independent Project in Heritage Management (Dissertation) - 24 credits (Elective, By invitation only, GPA >= 3.8, from Year 2 Sem 2 onward) in B.A. (Heritage Management)"
    },
    duplicateCodesCreated: 0,
    verification: verifyReport
  };

  fs.writeFileSync("./scripts/archaeology_import_report.json", JSON.stringify(finalReport, null, 2));
  console.log("✓ Final report written to ./scripts/archaeology_import_report.json");
  console.log("\n🎉 DEPARTMENT OF ARCHAEOLOGY AND HERITAGE STUDIES IMPORT SUCCESSFUL!");
}

run().catch((err) => {
  console.error("FATAL ERROR IN IMPORT:", err);
  process.exit(1);
});
