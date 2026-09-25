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
  code: string;
  title: string;
  status: "Core" | "Elective";
  rawStatus?: string;
  credits: number;
  year: 1 | 2 | 3;
  semester: 1 | 2;
  subStream: string;
  subStreamSlug: "french" | "english" | "kiswahili";
  sourceLocation: string;
  electiveRule?: string;
  isAdditionalElective?: boolean;
  note?: string;
  departmentId?: string;
}

const rawCurriculum: RawCurriculumItem[] = [
  // ================= FIRST YEAR — SEMESTER I =================
  // French Sub-Stream
  { code: "LL 101", title: "Introduction to Linguistic Structure", status: "Core", credits: 12, year: 1, semester: 1, subStream: "French Sub-Stream", subStreamSlug: "french", sourceLocation: "First Year — Semester I, French Sub-Stream" },
  { code: "LL 104", title: "Introduction to Sign Language", status: "Core", credits: 12, year: 1, semester: 1, subStream: "French Sub-Stream", subStreamSlug: "french", sourceLocation: "First Year — Semester I, French Sub-Stream" },
  { code: "LL 105", title: "Introduction to Contact Linguistics", status: "Core", credits: 12, year: 1, semester: 1, subStream: "French Sub-Stream", subStreamSlug: "french", sourceLocation: "First Year — Semester I, French Sub-Stream" },
  { code: "DS 112", title: "Development Perspectives I", status: "Core", credits: 12, year: 1, semester: 1, subStream: "French Sub-Stream", subStreamSlug: "french", sourceLocation: "First Year — Semester I, French Sub-Stream" },
  { code: "LL 180", title: "French Communicative Competencies I", status: "Core", credits: 12, year: 1, semester: 1, subStream: "French Sub-Stream", subStreamSlug: "french", sourceLocation: "First Year — Semester I, French Sub-Stream" },
  { code: "LL 182", title: "Oral Proficiency Phonetics", status: "Core", credits: 12, year: 1, semester: 1, subStream: "French Sub-Stream", subStreamSlug: "french", sourceLocation: "First Year — Semester I, French Sub-Stream" },

  // English Sub-Stream
  { code: "LL 101", title: "Introduction to Linguistic Structure", status: "Core", credits: 12, year: 1, semester: 1, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "First Year — Semester I, English Sub-Stream" },
  { code: "LL 104", title: "Introduction to Sign Language", status: "Core", credits: 12, year: 1, semester: 1, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "First Year — Semester I, English Sub-Stream" },
  { code: "LL 105", title: "Introduction to Contact Linguistics", status: "Core", credits: 12, year: 1, semester: 1, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "First Year — Semester I, English Sub-Stream" },
  { code: "DS 112", title: "Development Perspectives I", status: "Core", credits: 12, year: 1, semester: 1, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "First Year — Semester I, English Sub-Stream" },
  { code: "LL 115", title: "English Listening Skills", status: "Core", credits: 12, year: 1, semester: 1, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "First Year — Semester I, English Sub-Stream" },
  { code: "LL 117", title: "English Reading Skills", status: "Core", credits: 12, year: 1, semester: 1, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "First Year — Semester I, English Sub-Stream" },

  // Kiswahili Language Option
  { code: "LL 101", title: "Introduction to Linguistic Structure", status: "Core", credits: 12, year: 1, semester: 1, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "First Year — Semester I, Kiswahili Language Option" },
  { code: "LL 104", title: "Introduction to Sign Language", status: "Core", credits: 12, year: 1, semester: 1, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "First Year — Semester I, Kiswahili Language Option" },
  { code: "LL 105", title: "Introduction to Contact Linguistics", status: "Core", credits: 12, year: 1, semester: 1, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "First Year — Semester I, Kiswahili Language Option" },
  { code: "DS 112", title: "Development Perspectives I", status: "Core", credits: 12, year: 1, semester: 1, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "First Year — Semester I, Kiswahili Language Option" },
  { code: "KF 102", title: "Utangulizi wa Fasihi ya Kiswahili (Simulizi na Andishi)", status: "Core", credits: 12, year: 1, semester: 1, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "First Year — Semester I, Kiswahili Language Option" },
  { code: "KI 107", title: "Misingi ya Isimu ya Kiswahili", status: "Core", credits: 12, year: 1, semester: 1, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "First Year — Semester I, Kiswahili Language Option" },

  // ================= FIRST YEAR — SEMESTER II =================
  // French Sub-Stream
  { code: "DS 113", title: "Development Perspectives II", status: "Core", credits: 12, year: 1, semester: 2, subStream: "French Sub-Stream", subStreamSlug: "french", sourceLocation: "First Year — Semester II, French Sub-Stream" },
  { code: "LL 103", title: "General Phonetics", status: "Core", credits: 12, year: 1, semester: 2, subStream: "French Sub-Stream", subStreamSlug: "french", sourceLocation: "First Year — Semester II, French Sub-Stream" },
  { code: "LL 106", title: "Language Change", status: "Core", credits: 12, year: 1, semester: 2, subStream: "French Sub-Stream", subStreamSlug: "french", sourceLocation: "First Year — Semester II, French Sub-Stream" },
  { code: "PL 111", title: "Introduction to Critical Thinking and Argumentation", status: "Core", credits: 12, year: 1, semester: 2, subStream: "French Sub-Stream", subStreamSlug: "french", sourceLocation: "First Year — Semester II, French Sub-Stream" },
  { code: "LL 181", title: "French Communicative Competencies II", status: "Core", credits: 12, year: 1, semester: 2, subStream: "French Sub-Stream", subStreamSlug: "french", sourceLocation: "First Year — Semester II, French Sub-Stream" },
  { code: "LL 183", title: "Reading and Writing Proficiency I", status: "Core", credits: 12, year: 1, semester: 2, subStream: "French Sub-Stream", subStreamSlug: "french", sourceLocation: "First Year — Semester II, French Sub-Stream" },

  // English Sub-Stream
  { code: "DS 113", title: "Development Perspectives II", status: "Core", credits: 12, year: 1, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "First Year — Semester II, English Sub-Stream" },
  { code: "LL 103", title: "General Phonetics", status: "Core", credits: 12, year: 1, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "First Year — Semester II, English Sub-Stream" },
  { code: "LL 106", title: "Language Change", status: "Core", credits: 12, year: 1, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "First Year — Semester II, English Sub-Stream" },
  { code: "PL 111", title: "Introduction to Critical Thinking and Argumentation", status: "Core", credits: 12, year: 1, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "First Year — Semester II, English Sub-Stream" },
  { code: "LL 116", title: "English Speaking Skills", status: "Core", credits: 12, year: 1, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "First Year — Semester II, English Sub-Stream" },
  { code: "LL 118", title: "English Writing Skills", status: "Core", credits: 12, year: 1, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "First Year — Semester II, English Sub-Stream" },

  // Kiswahili Language Option
  { code: "DS 113", title: "Development Perspectives II", status: "Core", credits: 12, year: 1, semester: 2, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "First Year — Semester II, Kiswahili Language Option" },
  { code: "LL 103", title: "General Phonetics", status: "Core", credits: 12, year: 1, semester: 2, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "First Year — Semester II, Kiswahili Language Option" },
  { code: "LL 106", title: "Language Change", status: "Core", credits: 12, year: 1, semester: 2, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "First Year — Semester II, Kiswahili Language Option" },
  { code: "PL 111", title: "Introduction to Critical Thinking and Argumentation", status: "Core", credits: 12, year: 1, semester: 2, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "First Year — Semester II, Kiswahili Language Option" },
  { code: "KF 103", title: "Nadharia na Uhakiki wa Fasihi ya Kiswahili", status: "Core", credits: 12, year: 1, semester: 2, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "First Year — Semester II, Kiswahili Language Option" },
  { code: "KI 117", title: "Utangulizi wa Misingi ya Uandishi wa Kiswahili", status: "Core", credits: 12, year: 1, semester: 2, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "First Year — Semester II, Kiswahili Language Option" },

  // ================= SECOND YEAR — SEMESTER I =================
  // French Sub-Stream
  { code: "LL 201", title: "Linguistic Theory", status: "Core", credits: 12, year: 2, semester: 1, subStream: "French Sub-Stream", subStreamSlug: "french", sourceLocation: "Second Year — Semester I, French Sub-Stream" },
  { code: "LL 203", title: "Introduction to Semantics", status: "Core", credits: 12, year: 2, semester: 1, subStream: "French Sub-Stream", subStreamSlug: "french", sourceLocation: "Second Year — Semester I, French Sub-Stream" },
  { code: "LL 208", title: "Introduction to Dictionary Compilation", status: "Core", credits: 12, year: 2, semester: 1, subStream: "French Sub-Stream", subStreamSlug: "french", sourceLocation: "Second Year — Semester I, French Sub-Stream" },
  { code: "LL 280", title: "French Communicative Competencies III", status: "Core", credits: 12, year: 2, semester: 1, subStream: "French Sub-Stream", subStreamSlug: "french", sourceLocation: "Second Year — Semester I, French Sub-Stream" },
  { code: "LL 274", title: "Introduction to Translation", status: "Core", credits: 12, year: 2, semester: 1, subStream: "French Sub-Stream", subStreamSlug: "french", sourceLocation: "Second Year — Semester I, French Sub-Stream" },
  { code: "LL 282", title: "Oral Interactions", status: "Elective", credits: 12, year: 2, semester: 1, subStream: "French Sub-Stream", subStreamSlug: "french", sourceLocation: "Second Year — Semester I, French Sub-Stream", electiveRule: "Choose ONE" },
  { code: "AS 217", title: "Introduction to Computers", status: "Elective", credits: 12, year: 2, semester: 1, subStream: "French Sub-Stream", subStreamSlug: "french", sourceLocation: "Second Year — Semester I, French Sub-Stream", electiveRule: "Choose ONE" },
  { code: "AS 220", title: "Pan-Africanism: Thought and Practice I", status: "Elective", credits: 12, year: 2, semester: 1, subStream: "French Sub-Stream", subStreamSlug: "french", sourceLocation: "Second Year — Semester I, French Sub-Stream", electiveRule: "Choose ONE" },

  // English Sub-Stream
  { code: "LL 201", title: "Linguistic Theory", status: "Core", credits: 12, year: 2, semester: 1, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Second Year — Semester I, English Sub-Stream" },
  { code: "LL 203", title: "Introduction to Semantics", status: "Core", credits: 12, year: 2, semester: 1, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Second Year — Semester I, English Sub-Stream" },
  { code: "LL 208", title: "Introduction to Dictionary Compilation", status: "Core", credits: 12, year: 2, semester: 1, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Second Year — Semester I, English Sub-Stream" },
  { code: "LL 219", title: "Introductory English Phonetics & Phonology", status: "Core", credits: 12, year: 2, semester: 1, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Second Year — Semester I, English Sub-Stream" },
  { code: "LL 221", title: "Varieties of English", status: "Core", credits: 12, year: 2, semester: 1, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Second Year — Semester I, English Sub-Stream" },
  { code: "LL 282", title: "Oral Interactions", status: "Elective", credits: 12, year: 2, semester: 1, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Second Year — Semester I, English Sub-Stream", electiveRule: "Choose ONE" },
  { code: "AS 217", title: "Introduction to Computers", status: "Elective", credits: 12, year: 2, semester: 1, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Second Year — Semester I, English Sub-Stream", electiveRule: "Choose ONE" },
  { code: "AS 220", title: "Pan-Africanism: Thought and Practice I", status: "Elective", credits: 12, year: 2, semester: 1, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Second Year — Semester I, English Sub-Stream", electiveRule: "Choose ONE" },

  // Kiswahili Language Option
  { code: "LL 201", title: "Linguistic Theory", status: "Core", credits: 12, year: 2, semester: 1, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Second Year — Semester I, Kiswahili Language Option" },
  { code: "LL 203", title: "Introduction to Semantics", status: "Core", credits: 12, year: 2, semester: 1, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Second Year — Semester I, Kiswahili Language Option" },
  { code: "LL 208", title: "Introduction to Dictionary Compilation", status: "Core", credits: 12, year: 2, semester: 1, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Second Year — Semester I, Kiswahili Language Option" },
  { code: "KI 208", title: "Fonolojia ya Kiswahili", status: "Core", credits: 12, year: 2, semester: 1, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Second Year — Semester I, Kiswahili Language Option" },
  { code: "KF 223", title: "Ushairi wa Kiswahili", status: "Core", credits: 12, year: 2, semester: 1, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Second Year — Semester I, Kiswahili Language Option" },
  { code: "LL 282", title: "Oral Interactions", status: "Elective", credits: 12, year: 2, semester: 1, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Second Year — Semester I, Kiswahili Language Option", electiveRule: "Choose ONE" },
  { code: "AS 217", title: "Introduction to Computers", status: "Elective", credits: 12, year: 2, semester: 1, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Second Year — Semester I, Kiswahili Language Option", electiveRule: "Choose ONE" },
  { code: "AS 220", title: "Pan-Africanism: Thought and Practice I", status: "Elective", credits: 12, year: 2, semester: 1, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Second Year — Semester I, Kiswahili Language Option", electiveRule: "Choose ONE" },

  // ================= SECOND YEAR — SEMESTER II =================
  // French Sub-Stream
  { code: "LL 202", title: "Morphology", status: "Core", credits: 12, year: 2, semester: 2, subStream: "French Sub-Stream", subStreamSlug: "french", sourceLocation: "Second Year — Semester II, French Sub-Stream" },
  { code: "LL 205", title: "Structure of a Non-Bantu Language", status: "Core", credits: 12, year: 2, semester: 2, subStream: "French Sub-Stream", subStreamSlug: "french", sourceLocation: "Second Year — Semester II, French Sub-Stream" },
  { code: "LL 222", title: "Introduction to Research Methods in Language Studies", status: "Core", credits: 12, year: 2, semester: 2, subStream: "French Sub-Stream", subStreamSlug: "french", sourceLocation: "Second Year — Semester II, French Sub-Stream" },
  { code: "LL 281", title: "French Communicative Competency II", status: "Core", credits: 12, year: 2, semester: 2, subStream: "French Sub-Stream", subStreamSlug: "french", sourceLocation: "Second Year — Semester II, French Sub-Stream" },
  { code: "LL 283", title: "French Morphology and Syntax", status: "Core", credits: 12, year: 2, semester: 2, subStream: "French Sub-Stream", subStreamSlug: "french", sourceLocation: "Second Year — Semester II, French Sub-Stream" },
  { code: "LL 276", title: "Functional French I", status: "Elective", credits: 12, year: 2, semester: 2, subStream: "French Sub-Stream", subStreamSlug: "french", sourceLocation: "Second Year — Semester II, French Sub-Stream", electiveRule: "Choose ONE" },
  { code: "AS 221", title: "Pan-Africanism: Thought and Practice II", status: "Elective", credits: 12, year: 2, semester: 2, subStream: "French Sub-Stream", subStreamSlug: "french", sourceLocation: "Second Year — Semester II, French Sub-Stream", electiveRule: "Choose ONE" },
  { code: "LL 204", title: "Introduction to Tanzanian Sign Language", status: "Elective", credits: 12, year: 2, semester: 2, subStream: "French Sub-Stream", subStreamSlug: "french", sourceLocation: "Second Year — Semester II, French Sub-Stream", electiveRule: "Choose ONE" },

  // English Sub-Stream
  { code: "LL 202", title: "Morphology", status: "Core", credits: 12, year: 2, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Second Year — Semester II, English Sub-Stream" },
  { code: "LL 205", title: "Structure of a Non-Bantu Language", status: "Core", credits: 12, year: 2, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Second Year — Semester II, English Sub-Stream" },
  { code: "LL 222", title: "Introduction to Research Methods in Language Studies", status: "Core", credits: 12, year: 2, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Second Year — Semester II, English Sub-Stream" },
  { code: "LL 218", title: "English Rhetoric", status: "Core", credits: 12, year: 2, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Second Year — Semester II, English Sub-Stream" },
  { code: "LL 220", title: "English Grammar", status: "Core", credits: 12, year: 2, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Second Year — Semester II, English Sub-Stream" },
  { code: "LL 276", title: "Functional French I", status: "Elective", credits: 12, year: 2, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Second Year — Semester II, English Sub-Stream", electiveRule: "Choose ONE" },
  { code: "AS 221", title: "Pan-Africanism: Thought and Practice II", status: "Elective", credits: 12, year: 2, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Second Year — Semester II, English Sub-Stream", electiveRule: "Choose ONE" },
  { code: "LL 204", title: "Introduction to Tanzanian Sign Language", status: "Elective", credits: 12, year: 2, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Second Year — Semester II, English Sub-Stream", electiveRule: "Choose ONE" },

  // Kiswahili Language Option
  { code: "LL 202", title: "Morphology", status: "Core", credits: 12, year: 2, semester: 2, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Second Year — Semester II, Kiswahili Language Option" },
  { code: "LL 205", title: "Structure of a Non-Bantu Language", status: "Core", credits: 12, year: 2, semester: 2, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Second Year — Semester II, Kiswahili Language Option" },
  { code: "LL 222", title: "Introduction to Research Methods in Language Studies", status: "Core", credits: 12, year: 2, semester: 2, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Second Year — Semester II, Kiswahili Language Option" },
  { code: "KI 209", title: "Mofolojia ya Kiswahili", status: "Core", credits: 12, year: 2, semester: 2, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Second Year — Semester II, Kiswahili Language Option" },
  { code: "KF 221", title: "Fasihi ya Watoto na Vijana", status: "Elective", credits: 12, year: 2, semester: 2, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Second Year — Semester II, Kiswahili Language Option", note: "Explicitly supplied as Elective alongside core courses" },
  { code: "LL 276", title: "Functional French I", status: "Elective", credits: 12, year: 2, semester: 2, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Second Year — Semester II, Kiswahili Language Option", electiveRule: "Choose ONE", isAdditionalElective: true },
  { code: "AS 221", title: "Pan-Africanism: Thought and Practice II", status: "Elective", credits: 12, year: 2, semester: 2, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Second Year — Semester II, Kiswahili Language Option", electiveRule: "Choose ONE", isAdditionalElective: true },
  { code: "LL 204", title: "Introduction to Tanzanian Sign Language", status: "Elective", credits: 12, year: 2, semester: 2, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Second Year — Semester II, Kiswahili Language Option", electiveRule: "Choose ONE", isAdditionalElective: true },

  // ================= MANDATORY PRACTICAL TRAINING =================
  // AS 299 for all 3 sub-streams in Year 2 Semester 2
  { code: "AS 299", title: "Practical Training", status: "Core", credits: 12, year: 2, semester: 2, subStream: "French Sub-Stream", subStreamSlug: "french", sourceLocation: "Mandatory Practical Training, French Sub-Stream", note: "Done during the long vacation" },
  { code: "AS 299", title: "Practical Training", status: "Core", credits: 12, year: 2, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Mandatory Practical Training, English Sub-Stream", note: "Done during the long vacation" },
  { code: "AS 299", title: "Practical Training", status: "Core", credits: 12, year: 2, semester: 2, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Mandatory Practical Training, Kiswahili Language Option", note: "Done during the long vacation" },

  // ================= THIRD YEAR — SEMESTER I =================
  // French Sub-Stream
  { code: "LL 303", title: "Historical and Comparative Linguistics", status: "Core", credits: 12, year: 3, semester: 1, subStream: "French Sub-Stream", subStreamSlug: "french", sourceLocation: "Third Year — Semester I, French Sub-Stream" },
  { code: "LL 332", title: "Introduction to Editing and Proofreading", status: "Core", credits: 12, year: 3, semester: 1, subStream: "French Sub-Stream", subStreamSlug: "french", sourceLocation: "Third Year — Semester I, French Sub-Stream" },
  { code: "LL 380", title: "Reading and Writing Proficiency II", status: "Core", credits: 12, year: 3, semester: 1, subStream: "French Sub-Stream", subStreamSlug: "french", sourceLocation: "Third Year — Semester I, French Sub-Stream" },
  { code: "LL 374", title: "Translation I", status: "Core", credits: 12, year: 3, semester: 1, subStream: "French Sub-Stream", subStreamSlug: "french", sourceLocation: "Third Year — Semester I, French Sub-Stream" },
  { code: "LL 316", title: "English in the World", status: "Elective", credits: 12, year: 3, semester: 1, subStream: "French Sub-Stream", subStreamSlug: "french", sourceLocation: "Third Year — Semester I, French Sub-Stream", electiveRule: "Choose ONE" },
  { code: "LT 311", title: "Theory and Practice of Publishing", status: "Elective", credits: 12, year: 3, semester: 1, subStream: "French Sub-Stream", subStreamSlug: "french", sourceLocation: "Third Year — Semester I, French Sub-Stream", electiveRule: "Choose ONE" },
  { code: "LL 376", title: "Functional French II", status: "Elective", credits: 12, year: 3, semester: 1, subStream: "French Sub-Stream", subStreamSlug: "french", sourceLocation: "Third Year — Semester I, French Sub-Stream", electiveRule: "Choose ONE" },

  // English Sub-Stream
  { code: "LL 303", title: "Historical and Comparative Linguistics", status: "Core", credits: 12, year: 3, semester: 1, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Third Year — Semester I, English Sub-Stream" },
  { code: "LL 332", title: "Introduction to Editing and Proofreading", status: "Core", credits: 12, year: 3, semester: 1, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Third Year — Semester I, English Sub-Stream" },
  { code: "LL 317", title: "Introduction English Pragmatics", status: "Core", credits: 12, year: 3, semester: 1, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Third Year — Semester I, English Sub-Stream" },
  { code: "LL 330", title: "Introduction to Translation Theory", status: "Core", credits: 12, year: 3, semester: 1, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Third Year — Semester I, English Sub-Stream" },
  { code: "LL 316", title: "English in the World", status: "Elective", credits: 12, year: 3, semester: 1, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Third Year — Semester I, English Sub-Stream", electiveRule: "Choose ONE" },
  { code: "LT 311", title: "Theory and Practice of Publishing", status: "Elective", credits: 12, year: 3, semester: 1, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Third Year — Semester I, English Sub-Stream", electiveRule: "Choose ONE" },
  { code: "LL 376", title: "Functional French II", status: "Elective", credits: 12, year: 3, semester: 1, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Third Year — Semester I, English Sub-Stream", electiveRule: "Choose ONE" },

  // Kiswahili Language Sub-Stream
  { code: "LL 303", title: "Historical and Comparative Linguistics", status: "Core", credits: 12, year: 3, semester: 1, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Third Year — Semester I, Kiswahili Language Option" },
  { code: "LL 332", title: "Introduction to Editing and Proofreading", status: "Core", credits: 12, year: 3, semester: 1, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Third Year — Semester I, Kiswahili Language Option" },
  { code: "KF 302", title: "Fasihi Simulizi ya Kiswahili na Kiafrika", status: "Core", credits: 12, year: 3, semester: 1, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Third Year — Semester I, Kiswahili Language Option" },
  { code: "KI 310", title: "Sintaksia ya Kiswahili", status: "Core", credits: 12, year: 3, semester: 1, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Third Year — Semester I, Kiswahili Language Option" },
  { code: "LL 316", title: "English in the World", status: "Elective", credits: 12, year: 3, semester: 1, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Third Year — Semester I, Kiswahili Language Option", electiveRule: "Choose ONE" },
  { code: "LT 311", title: "Theory and Practice of Publishing", status: "Elective", credits: 12, year: 3, semester: 1, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Third Year — Semester I, Kiswahili Language Option", electiveRule: "Choose ONE" },
  { code: "LL 376", title: "Functional French II", status: "Elective", credits: 12, year: 3, semester: 1, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Third Year — Semester I, Kiswahili Language Option", electiveRule: "Choose ONE" },

  // ================= THIRD YEAR — SEMESTER II =================
  // French Sub-Stream
  { code: "LL 302", title: "Sociolinguistics", status: "Core", credits: 12, year: 3, semester: 2, subStream: "French Sub-Stream", subStreamSlug: "french", sourceLocation: "Third Year — Semester II, French Sub-Stream" },
  { code: "LL 305", title: "Bantu Language Structure", status: "Core", credits: 12, year: 3, semester: 2, subStream: "French Sub-Stream", subStreamSlug: "french", sourceLocation: "Third Year — Semester II, French Sub-Stream" },
  { code: "LL 331", title: "Translation Methods and Practice", status: "Core", credits: 12, year: 3, semester: 2, subStream: "French Sub-Stream", subStreamSlug: "french", sourceLocation: "Third Year — Semester II, French Sub-Stream" },
  { code: "LL 314", title: "Second Language Acquisition", status: "Core", credits: 12, year: 3, semester: 2, subStream: "French Sub-Stream", subStreamSlug: "french", sourceLocation: "Third Year — Semester II, French Sub-Stream" },
  { code: "LL 381", title: "French Oral Proficiency", status: "Core", credits: 12, year: 3, semester: 2, subStream: "French Sub-Stream", subStreamSlug: "french", sourceLocation: "Third Year — Semester II, French Sub-Stream" },
  { code: "LL 382", title: "Literature in French", status: "Core", credits: 12, year: 3, semester: 2, subStream: "French Sub-Stream", subStreamSlug: "french", sourceLocation: "Third Year — Semester II, French Sub-Stream" },
  { code: "LT 312", title: "Language and Literature", status: "Elective", credits: 12, year: 3, semester: 2, subStream: "French Sub-Stream", subStreamSlug: "french", sourceLocation: "Third Year — Semester II, French Sub-Stream", electiveRule: "Choose ONE" },
  { code: "CA 208", title: "Screenplay Writing", status: "Elective", credits: 12, year: 3, semester: 2, subStream: "French Sub-Stream", subStreamSlug: "french", sourceLocation: "Third Year — Semester II, French Sub-Stream", electiveRule: "Choose ONE" },
  { code: "LL 313", title: "Linguistics and Language Teaching", status: "Elective", credits: 12, year: 3, semester: 2, subStream: "French Sub-Stream", subStreamSlug: "french", sourceLocation: "Third Year — Semester II, French Sub-Stream", electiveRule: "Choose ONE" },

  // English Sub-Stream
  { code: "LL 302", title: "Sociolinguistics", status: "Core", credits: 12, year: 3, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Third Year — Semester II, English Sub-Stream" },
  { code: "LL 305", title: "Bantu Language Structure", status: "Core", credits: 12, year: 3, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Third Year — Semester II, English Sub-Stream" },
  { code: "LL 331", title: "Translation Methods and Practice", status: "Core", credits: 12, year: 3, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Third Year — Semester II, English Sub-Stream" },
  { code: "LL 314", title: "Second Language Acquisition", status: "Core", credits: 12, year: 3, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Third Year — Semester II, English Sub-Stream" },
  { code: "LL 318", title: "The Study of Discourse", status: "Core", credits: 12, year: 3, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Third Year — Semester II, English Sub-Stream" },
  // Electives for English Sub-stream (Section 9 lists 7 electives specifically for students taking English Sub-stream)
  { code: "LL 375", title: "Translation II", status: "Elective", credits: 12, year: 3, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Third Year — Semester II, Electives for English Sub-stream" },
  { code: "LL 384", title: "Introduction to Consecutive Interpretation", status: "Elective", credits: 12, year: 3, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Third Year — Semester II, Electives for English Sub-stream" },
  { code: "LL 304", title: "Tanzanian Sign Language Structure", status: "Elective", credits: 12, year: 3, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Third Year — Semester II, Electives for English Sub-stream" },
  { code: "LT 312", title: "Language and Literature", status: "Elective", credits: 12, year: 3, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Third Year — Semester II, Electives for English Sub-stream" },
  { code: "CA 208", title: "Screenplay Writing", status: "Elective", credits: 12, year: 3, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Third Year — Semester II, Electives for English Sub-stream" },
  { code: "LL 313", title: "Linguistics and Language Teaching", status: "Elective", credits: 12, year: 3, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Third Year — Semester II, Electives for English Sub-stream" },
  { code: "LL 390", title: "Project (by invitation only)", status: "Elective", credits: 12, year: 3, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Third Year — Semester II, Electives for English Sub-stream", note: "By invitation only" },

  // Kiswahili Language Option
  { code: "LL 302", title: "Sociolinguistics", status: "Core", credits: 12, year: 3, semester: 2, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Third Year — Semester II, Kiswahili Language Option" },
  { code: "LL 305", title: "Bantu Language Structure", status: "Core", credits: 12, year: 3, semester: 2, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Third Year — Semester II, Kiswahili Language Option" },
  { code: "LL 331", title: "Translation Methods and Practice", status: "Core", credits: 12, year: 3, semester: 2, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Third Year — Semester II, Kiswahili Language Option" },
  { code: "LL 314", title: "Second Language Acquisition", status: "Core", credits: 12, year: 3, semester: 2, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Third Year — Semester II, Kiswahili Language Option" },
  { code: "KF 318", title: "Riwaya ya Kiswahili", status: "Core", credits: 12, year: 3, semester: 2, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Third Year — Semester II, Kiswahili Language Option" },
  { code: "KF 319", title: "Tamthiliya ya Kiswahili", status: "Core", credits: 12, year: 3, semester: 2, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Third Year — Semester II, Kiswahili Language Option" },
  { code: "KI 311", title: "Semantiki na Pragmatiki ya Kiswahili", status: "Core", credits: 12, year: 3, semester: 2, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Third Year — Semester II, Kiswahili Language Option" }
];

async function run() {
  console.log("=== VENUE ACADEMIC CATALOGUE IMPORT: SPECIALISATION III: LINGUISTICS ===");
  const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf8"));
  const app = initializeApp(config);
  const dbNamed = getFirestore(app, config.firestoreDatabaseId);
  const dbDefault = getFirestore(app);

  const databases = [
    { name: "Named (" + config.firestoreDatabaseId + ")", db: dbNamed },
    { name: "Default ((default))", db: dbDefault }
  ];

  // 1. VERIFY / REUSE ACADEMIC HIERARCHY ENTITIES
  console.log("\n[1/6] Verifying Academic Hierarchy...");
  const cohuSnap = await getDoc(doc(dbNamed, "academic_units", "cohu"));
  if (!cohuSnap.exists()) throw new Error("Academic Unit cohu does not exist!");
  console.log(`✓ Reused Academic Unit: ${cohuSnap.data()?.name} (${cohuSnap.id})`);

  const deptSnap = await getDoc(doc(dbNamed, "departments", "dept-foreign-languages"));
  if (!deptSnap.exists()) throw new Error("Department dept-foreign-languages does not exist!");
  console.log(`✓ Reused Department: ${deptSnap.data()?.name} (${deptSnap.id})`);

  const progSnap = await getDoc(doc(dbNamed, "programmes", "ba-language-studies"));
  if (!progSnap.exists()) throw new Error("Programme ba-language-studies does not exist!");
  const progData = progSnap.data();
  console.log(`✓ Reused Programme: ${progData?.name} (${progSnap.id})`);

  // Update ba-language-studies specialisations array to include sub-streams for Specialisation III: Linguistics
  const currentSpecs = progData?.specialisations || [];
  const updatedSpecs = currentSpecs.map((spec: any) => {
    if (spec.id === "linguistics") {
      return {
        id: "linguistics",
        code: "LINGUISTICS",
        name: "Specialisation III: Linguistics",
        description: "Specialisation III: Linguistics under Bachelor of Arts in Language Studies",
        subStreams: [
          {
            id: "french",
            slug: "french",
            name: "French Sub-Stream",
            description: "Linguistics Specialisation with French Sub-Stream"
          },
          {
            id: "english",
            slug: "english",
            name: "English Sub-Stream",
            description: "Linguistics Specialisation with English Sub-Stream"
          },
          {
            id: "kiswahili",
            slug: "kiswahili",
            name: "Kiswahili Language Option/Sub-Stream",
            description: "Linguistics Specialisation with Kiswahili Language Option/Sub-Stream"
          }
        ]
      };
    }
    return spec;
  });

  // If "linguistics" specialisation was not present, append it
  if (!updatedSpecs.some((s: any) => s.id === "linguistics")) {
    updatedSpecs.push({
      id: "linguistics",
      code: "LINGUISTICS",
      name: "Specialisation III: Linguistics",
      description: "Specialisation III: Linguistics under Bachelor of Arts in Language Studies",
      subStreams: [
        {
          id: "french",
          slug: "french",
          name: "French Sub-Stream",
          description: "Linguistics Specialisation with French Sub-Stream"
        },
        {
          id: "english",
          slug: "english",
          name: "English Sub-Stream",
          description: "Linguistics Specialisation with English Sub-Stream"
        },
        {
          id: "kiswahili",
          slug: "kiswahili",
          name: "Kiswahili Language Option/Sub-Stream",
          description: "Linguistics Specialisation with Kiswahili Language Option/Sub-Stream"
        }
      ]
    });
  }

  // Update programme document in both DBs
  for (const { name, db } of databases) {
    await setDoc(doc(db, "programmes", "ba-language-studies"), {
      ...progData,
      specialisations: updatedSpecs,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log(`✓ Updated ba-language-studies specialisation hierarchy in ${name}`);
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
      const titleDiff = existing.title.trim() !== item.title.trim();
      const creditsDiff = existing.defaultCredits !== item.credits;

      if (titleDiff || creditsDiff) {
        let actionTaken = "";
        let discrepancyType: "title" | "credits" | "title_and_credits" = "title";

        if (titleDiff && creditsDiff) {
          discrepancyType = "title_and_credits";
          actionTaken = `Preserved existing canonical title ('${existing.title}') and canonical credits (${existing.defaultCredits}); relationship imported with curriculum credits (${item.credits}) and supplied title preserved in relationship metadata.`;
        } else if (titleDiff) {
          discrepancyType = "title";
          actionTaken = `Preserved existing canonical title ('${existing.title}'); relationship imported using canonical course reference while logging supplied variation ('${item.title}').`;
        } else {
          discrepancyType = "credits";
          actionTaken = `Preserved existing canonical credits (${existing.defaultCredits}); relationship configured with ${item.credits} credits as specifically prescribed for this curriculum.`;
        }

        conflicts.push({
          code,
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
      let offeringDept = "dept-foreign-languages";
      let offeringUnit = "cohu";
      if (code.startsWith("KI ")) {
        offeringDept = "dept-iks-linguistics";
        offeringUnit = "iks";
      } else if (code.startsWith("KF ")) {
        offeringDept = "dept-iks-literature";
        offeringUnit = "iks";
      }

      const newCanon = {
        id: cleanId,
        code: item.code,
        title: item.title,
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

      // Note check for KI 117 and KF 223
      if (code === "KI 117") {
        conflicts.push({
          code: "KI 117",
          existingTitle: "None (KI 108 exists with identical title 'Utangulizi wa Misingi ya Uandishi wa Kiswahili')",
          suppliedTitle: item.title,
          existingCredits: 0,
          suppliedCredits: item.credits,
          discrepancyType: "title",
          actionTaken: "Created new canonical course 'KI 117' as specified in curriculum; cross-referenced against KI 108."
        });
      }
      if (code === "KF 223") {
        conflicts.push({
          code: "KF 223",
          existingTitle: "None (KF 200 & KS 223 exist with identical title 'Ushairi wa Kiswahili')",
          suppliedTitle: item.title,
          existingCredits: 0,
          suppliedCredits: item.credits,
          discrepancyType: "title",
          actionTaken: "Created new canonical course 'KF 223' as specified in curriculum; cross-referenced against KF 200 and KS 223."
        });
      }
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
    const subStreamSlug = item.subStreamSlug;

    // Unique relationship document IDs scoped to linguistics specialisation
    const pcId = `ba-language-studies_ling_${subStreamSlug}_${cleanCode}_y${item.year}s${item.semester}`;
    const ccId = `udsm_ba-language-studies_ling_${subStreamSlug}_${cleanCode}_y${item.year}s${item.semester}`;

    const relBase = {
      code: item.code,
      title: item.title,
      canonicalTitle: canon?.title || item.title,
      credits: item.credits,
      status: item.status,
      rawStatus: item.rawStatus || null,
      yearOfStudy: item.year,
      semester: item.semester,
      programmeId: "ba-language-studies",
      specialisation: "Specialisation III: Linguistics",
      specialisationId: "linguistics",
      subStream: item.subStream,
      subStreamSlug: item.subStreamSlug,
      option: item.subStream,
      electiveRule: item.electiveRule || null,
      isAdditionalElective: !!item.isAdditionalElective,
      note: item.note || null,
      departmentId: "dept-foreign-languages",
      academicUnitId: "cohu",
      universityId: "udsm",
      academicYear: "2025/2026",
      source: "UDSM Undergraduate Prospectus 2025/2026 (Official Source of Truth)",
      sourceType: "official_prospectus",
      canonicalCourseId: canon?.id || cleanCode,
      courseId: canon?.id || cleanCode,
      offeringDepartmentId: canon?.departmentId || "dept-foreign-languages",
      offeringAcademicUnitId: canon?.academicUnitId || "cohu",
      verified: true,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    pcDocsToWrite.push({
      id: pcId,
      ...relBase
    });

    ccDocsToWrite.push({
      id: ccId,
      ...relBase,
      active: true,
      courseType: item.status
    });
  }

  console.log(`Total relationships generated: ${pcDocsToWrite.length}`);

  // 4. WRITE IN BATCHES TO BOTH DATABASES
  console.log("\n[4/6] Writing relationships to Firestore...");
  async function writeBatchToDb(collectionName: string, items: any[], db: any, dbName: string) {
    const CHUNK_SIZE = 400;
    for (let i = 0; i < items.length; i += CHUNK_SIZE) {
      const chunk = items.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      for (const item of chunk) {
        batch.set(doc(db, collectionName, item.id), item);
      }
      await batch.commit();
    }
    console.log(`✓ Wrote ${items.length} docs to ${collectionName} in ${dbName}`);
  }

  for (const { name, db } of databases) {
    await writeBatchToDb("programme_courses", pcDocsToWrite, db, name);
    await writeBatchToDb("catalogue_courses", ccDocsToWrite, db, name);
  }

  // 5. FIRESTORE VERIFICATION
  console.log("\n[5/6] Verifying Firestore Database Integrity...");
  // Verify Academic Unit
  const vCoHu = await getDoc(doc(dbNamed, "academic_units", "cohu"));
  if (!vCoHu.exists()) throw new Error("Verification failed for cohu");

  // Verify Department
  const vDept = await getDoc(doc(dbNamed, "departments", "dept-foreign-languages"));
  if (!vDept.exists()) throw new Error("Verification failed for dept-foreign-languages");

  // Verify Programme and Specialisation
  const vProg = await getDoc(doc(dbNamed, "programmes", "ba-language-studies"));
  const vProgSpecs = vProg.data()?.specialisations;
  const lingSpec = vProgSpecs.find((s: any) => s.id === "linguistics");
  if (!lingSpec || !lingSpec.subStreams || lingSpec.subStreams.length !== 3) {
    throw new Error("Verification failed for Specialisation III: Linguistics sub-streams");
  }

  // Verify Programme Courses by Sub-stream
  const allLingPc = await getDocs(collection(dbNamed, "programme_courses"));
  const lingPcDocs = allLingPc.docs.filter(d => d.data().specialisationId === "linguistics");
  console.log(`✓ Verified ${lingPcDocs.length} programme_courses for Specialisation III: Linguistics`);

  const frenchStreamDocs = lingPcDocs.filter(d => d.data().subStreamSlug === "french");
  const englishStreamDocs = lingPcDocs.filter(d => d.data().subStreamSlug === "english");
  const kiswahiliStreamDocs = lingPcDocs.filter(d => d.data().subStreamSlug === "kiswahili");
  console.log(`  - French Sub-Stream: ${frenchStreamDocs.length} relationships`);
  console.log(`  - English Sub-Stream: ${englishStreamDocs.length} relationships`);
  console.log(`  - Kiswahili Language Option: ${kiswahiliStreamDocs.length} relationships`);

  // Verify AS 299 in all streams
  const as299Ling = lingPcDocs.filter(d => d.data().code === "AS 299");
  console.log(`✓ Verified AS 299 in Linguistics: ${as299Ling.length} relationships, credits: ${as299Ling.map(d => d.data().credits).join(", ")}`);

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
    academicUnit: { id: "cohu", name: vCoHu.data()?.name, status: "reused" },
    department: { id: "dept-foreign-languages", name: vDept.data()?.name, status: "reused" },
    programme: { id: "ba-language-studies", name: vProg.data()?.name, status: "reused" },
    specialisation: {
      id: "linguistics",
      name: "Specialisation III: Linguistics",
      status: "reused and augmented with sub-streams",
      subStreams: [
        { id: "french", name: "French Sub-Stream", relationships: frenchStreamDocs.length },
        { id: "english", name: "English Sub-Stream", relationships: englishStreamDocs.length },
        { id: "kiswahili", name: "Kiswahili Language Option/Sub-Stream", relationships: kiswahiliStreamDocs.length }
      ]
    },
    relationshipsCreated: pcDocsToWrite.length,
    canonicalCoursesReused: canonicalReused.size,
    newCanonicalCreated: newCanonicalToCreate.map(c => ({ code: c.code, title: c.title, credits: c.defaultCredits, id: c.id })),
    conflicts
  };

  fs.writeFileSync("./scripts/linguistics_import_report.json", JSON.stringify(finalReport, null, 2));
  console.log("✓ Final report written to ./scripts/linguistics_import_report.json");
  console.log("\n🎉 IMPORT AND VERIFICATION SUCCESSFUL!");
  process.exit(0);
}

run().catch(err => {
  console.error("FATAL: Import failed:", err);
  process.exit(1);
});
