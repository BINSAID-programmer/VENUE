import { initializeApp } from "firebase/app";
import {
  getFirestore,
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

const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf8"));
const app = initializeApp(config);
const db = getFirestore(app);

interface SuppliedCourse {
  code: string;
  title: string;
  status: "Core" | "Elective";
  rawStatus?: string;
  credits: number;
  year: number;
  semester: number;
  subStream: "English Sub-Stream" | "Linguistics Sub-Stream" | "Kiswahili Language Option/Sub-Stream";
  subStreamSlug: "english" | "linguistics" | "kiswahili";
  electiveRule?: "Choose ONE" | "Choose ONE or TWO";
  sourceLocation: string;
  note?: string;
  isAdditionalElective?: boolean;
}

const SUPPLIED_DATA: SuppliedCourse[] = [
  // ================= FIRST YEAR — SEMESTER I =================
  // ENGLISH SUB-STREAM
  { code: "LL 180", title: "French Communicative Competencies I", status: "Core", credits: 12, year: 1, semester: 1, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "First Year — Semester I, English Sub-Stream" },
  { code: "LL 182", title: "Oral Proficiency and Phonetics", status: "Core", credits: 12, year: 1, semester: 1, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "First Year — Semester I, English Sub-Stream" },
  { code: "LL 101", title: "Introduction to Linguistic Structure", status: "Core", credits: 12, year: 1, semester: 1, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "First Year — Semester I, English Sub-Stream" },
  { code: "DS 112", title: "Development Perspectives I", status: "Core", credits: 12, year: 1, semester: 1, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "First Year — Semester I, English Sub-Stream" },
  { code: "LL 115", title: "English Listening Skills", status: "Core", credits: 12, year: 1, semester: 1, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "First Year — Semester I, English Sub-Stream" },
  { code: "LL 117", title: "English Reading Skills", status: "Core", credits: 12, year: 1, semester: 1, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "First Year — Semester I, English Sub-Stream" },

  // LINGUISTICS SUB-STREAM
  { code: "LL 180", title: "French Communicative Competencies I", status: "Core", credits: 12, year: 1, semester: 1, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", sourceLocation: "First Year — Semester I, Linguistics Sub-Stream" },
  { code: "LL 182", title: "Oral Proficiency and Phonetics", status: "Core", credits: 12, year: 1, semester: 1, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", sourceLocation: "First Year — Semester I, Linguistics Sub-Stream" },
  { code: "LL 101", title: "Introduction to Linguistic Structure", status: "Core", credits: 12, year: 1, semester: 1, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", sourceLocation: "First Year — Semester I, Linguistics Sub-Stream" },
  { code: "DS 112", title: "Development Perspectives I", status: "Core", credits: 12, year: 1, semester: 1, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", sourceLocation: "First Year — Semester I, Linguistics Sub-Stream" },
  { code: "LL 104", title: "Introduction to Sign Language", status: "Core", rawStatus: "Core*", credits: 12, year: 1, semester: 1, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", sourceLocation: "First Year — Semester I, Linguistics Sub-Stream" },
  { code: "LL 105", title: "Introduction to Contact Linguistics", status: "Core", rawStatus: "Core*", credits: 12, year: 1, semester: 1, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", sourceLocation: "First Year — Semester I, Linguistics Sub-Stream" },

  // KISWAHILI LANGUAGE OPTION
  { code: "LL 180", title: "French Communicative Competencies I", status: "Core", credits: 12, year: 1, semester: 1, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "First Year — Semester I, Kiswahili Language Option" },
  { code: "LL 182", title: "Oral Proficiency and Phonetics", status: "Core", credits: 12, year: 1, semester: 1, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "First Year — Semester I, Kiswahili Language Option" },
  { code: "LL 101", title: "Introduction to Linguistic Structure", status: "Core", credits: 12, year: 1, semester: 1, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "First Year — Semester I, Kiswahili Language Option" },
  { code: "DS 112", title: "Development Perspectives I", status: "Core", credits: 12, year: 1, semester: 1, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "First Year — Semester I, Kiswahili Language Option" },
  { code: "KF 102", title: "Utangulizi wa Fasihi ya Kiswahili (Simulizi na Andishi)", status: "Core", credits: 12, year: 1, semester: 1, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "First Year — Semester I, Kiswahili Language Option" },
  { code: "KI 107", title: "Misingi ya Isimu ya Kiswahili", status: "Core", credits: 12, year: 1, semester: 1, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "First Year — Semester I, Kiswahili Language Option" },

  // ================= FIRST YEAR — SEMESTER II =================
  // ENGLISH SUB-STREAM
  { code: "LL 181", title: "French Communicative Competencies II", status: "Core", credits: 12, year: 1, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "First Year — Semester II, English Sub-Stream" },
  { code: "LL 183", title: "Reading and Writing Proficiency I", status: "Core", credits: 12, year: 1, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "First Year — Semester II, English Sub-Stream" },
  { code: "DS 113", title: "Development Perspectives II", status: "Core", credits: 12, year: 1, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "First Year — Semester II, English Sub-Stream" },
  { code: "PL 111", title: "Introduction to Critical Thinking and Argumentation", status: "Core", credits: 12, year: 1, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "First Year — Semester II, English Sub-Stream" },
  { code: "LL 116", title: "English Speaking Skills", status: "Core", credits: 12, year: 1, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "First Year — Semester II, English Sub-Stream" },
  { code: "LL 118", title: "English Writing Skills", status: "Core", credits: 12, year: 1, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "First Year — Semester II, English Sub-Stream" },

  // LINGUISTICS SUB-STREAM
  { code: "LL 181", title: "French Communicative Competencies II", status: "Core", credits: 12, year: 1, semester: 2, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", sourceLocation: "First Year — Semester II, Linguistics Sub-Stream" },
  { code: "LL 183", title: "Reading and Writing Proficiency I", status: "Core", credits: 12, year: 1, semester: 2, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", sourceLocation: "First Year — Semester II, Linguistics Sub-Stream" },
  { code: "DS 113", title: "Development Perspectives II", status: "Core", credits: 12, year: 1, semester: 2, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", sourceLocation: "First Year — Semester II, Linguistics Sub-Stream" },
  { code: "PL 111", title: "Introduction to Critical Thinking and Argumentation", status: "Core", credits: 12, year: 1, semester: 2, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", sourceLocation: "First Year — Semester II, Linguistics Sub-Stream" },
  { code: "LL 103", title: "General Phonetics", status: "Core", credits: 12, year: 1, semester: 2, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", sourceLocation: "First Year — Semester II, Linguistics Sub-Stream" },
  { code: "LL 106", title: "Language Change", status: "Core", rawStatus: "Core*", credits: 12, year: 1, semester: 2, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", sourceLocation: "First Year — Semester II, Linguistics Sub-Stream" },

  // KISWAHILI LANGUAGE OPTION
  { code: "LL 181", title: "French Communicative Competencies II", status: "Core", credits: 12, year: 1, semester: 2, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "First Year — Semester II, Kiswahili Language Option" },
  { code: "LL 183", title: "Reading and Writing Proficiency I", status: "Core", credits: 12, year: 1, semester: 2, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "First Year — Semester II, Kiswahili Language Option" },
  { code: "DS 113", title: "Development Perspectives II", status: "Core", credits: 12, year: 1, semester: 2, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "First Year — Semester II, Kiswahili Language Option" },
  { code: "PL 111", title: "Introduction to Critical Thinking and Argumentation", status: "Core", credits: 12, year: 1, semester: 2, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "First Year — Semester II, Kiswahili Language Option" },
  { code: "KF 103", title: "Nadharia na Uhakiki wa Fasihi ya Kiswahili", status: "Core", credits: 12, year: 1, semester: 2, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "First Year — Semester II, Kiswahili Language Option" },
  { code: "KI 108", title: "Utangulizi wa Misingi ya Uandishi wa Kiswahili", status: "Core", credits: 12, year: 1, semester: 2, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "First Year — Semester II, Kiswahili Language Option" },

  // ================= SECOND YEAR — SEMESTER I =================
  // ENGLISH SUB-STREAM
  { code: "LL 203", title: "Introduction to Semantics", status: "Core", credits: 12, year: 2, semester: 1, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Second Year — Semester I, English Sub-Stream" },
  { code: "LL 280", title: "French Communicative Competencies III", status: "Core", credits: 12, year: 2, semester: 1, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Second Year — Semester I, English Sub-Stream" },
  { code: "LL 274", title: "Introduction to Translation", status: "Core", credits: 12, year: 2, semester: 1, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Second Year — Semester I, English Sub-Stream" },
  { code: "LL 219", title: "Introductory English Phonetics & Phonology", status: "Core", credits: 12, year: 2, semester: 1, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Second Year — Semester I, English Sub-Stream" },
  { code: "LL 221", title: "Varieties of English", status: "Core", credits: 12, year: 2, semester: 1, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Second Year — Semester I, English Sub-Stream" },
  // ELECTIVES — CHOOSE ONE
  { code: "AS 220", title: "Pan-Africanism: Thought and Practice I", status: "Elective", credits: 12, year: 2, semester: 1, subStream: "English Sub-Stream", subStreamSlug: "english", electiveRule: "Choose ONE", sourceLocation: "Second Year — Semester I, English Sub-Stream Electives" },
  { code: "AS 217", title: "Introduction to Computers", status: "Elective", credits: 12, year: 2, semester: 1, subStream: "English Sub-Stream", subStreamSlug: "english", electiveRule: "Choose ONE", sourceLocation: "Second Year — Semester I, English Sub-Stream Electives" },
  { code: "LL 282", title: "French Communicative Competencies III", status: "Elective", credits: 12, year: 2, semester: 1, subStream: "English Sub-Stream", subStreamSlug: "english", electiveRule: "Choose ONE", sourceLocation: "Second Year — Semester I, English Sub-Stream Electives" },

  // LINGUISTICS SUB-STREAM
  { code: "LL 203", title: "Introduction to Semantics", status: "Core", credits: 12, year: 2, semester: 1, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", sourceLocation: "Second Year — Semester I, Linguistics Sub-Stream" },
  { code: "LL 280", title: "French Communicative Competencies III", status: "Core", credits: 12, year: 2, semester: 1, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", sourceLocation: "Second Year — Semester I, Linguistics Sub-Stream" },
  { code: "LL 274", title: "Introduction to Translation", status: "Core", credits: 12, year: 2, semester: 1, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", sourceLocation: "Second Year — Semester I, Linguistics Sub-Stream" },
  { code: "LL 201", title: "Linguistic Theory", status: "Core", credits: 12, year: 2, semester: 1, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", sourceLocation: "Second Year — Semester I, Linguistics Sub-Stream" },
  { code: "LL 208", title: "Introduction to Dictionary Compilation", status: "Core", rawStatus: "Core*", credits: 12, year: 2, semester: 1, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", sourceLocation: "Second Year — Semester I, Linguistics Sub-Stream" },
  // ELECTIVES — CHOOSE ONE
  { code: "AS 220", title: "Pan-Africanism: Thought and Practice I", status: "Elective", credits: 12, year: 2, semester: 1, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", electiveRule: "Choose ONE", sourceLocation: "Second Year — Semester I, Linguistics Sub-Stream Electives" },
  { code: "AS 217", title: "Introduction to Computers", status: "Elective", credits: 12, year: 2, semester: 1, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", electiveRule: "Choose ONE", sourceLocation: "Second Year — Semester I, Linguistics Sub-Stream Electives" },
  { code: "LL 282", title: "Oral Interactions", status: "Elective", credits: 12, year: 2, semester: 1, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", electiveRule: "Choose ONE", sourceLocation: "Second Year — Semester I, Linguistics Sub-Stream Electives" },

  // KISWAHILI LANGUAGE OPTION
  { code: "LL 203", title: "Introduction to Semantics", status: "Core", credits: 12, year: 2, semester: 1, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Second Year — Semester I, Kiswahili Language Option" },
  { code: "LL 280", title: "French Communicative Competencies III", status: "Core", credits: 12, year: 2, semester: 1, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Second Year — Semester I, Kiswahili Language Option" },
  { code: "LL 274", title: "Introduction to Translation", status: "Core", credits: 12, year: 2, semester: 1, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Second Year — Semester I, Kiswahili Language Option" },
  { code: "KI 208", title: "Fonolojia ya Kiswahili", status: "Core", credits: 12, year: 2, semester: 1, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Second Year — Semester I, Kiswahili Language Option" },
  { code: "KS 223", title: "Ushairi wa Kiswahili", status: "Core", credits: 12, year: 2, semester: 1, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Second Year — Semester I, Kiswahili Language Option" },
  // ELECTIVES — CHOOSE ONE
  { code: "AS 220", title: "Pan-Africanism: Thought and Practice I", status: "Elective", credits: 12, year: 2, semester: 1, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", electiveRule: "Choose ONE", sourceLocation: "Second Year — Semester I, Kiswahili Language Option Electives" },
  { code: "AS 217", title: "Introduction to Computers", status: "Elective", credits: 12, year: 2, semester: 1, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", electiveRule: "Choose ONE", sourceLocation: "Second Year — Semester I, Kiswahili Language Option Electives" },
  { code: "LL 282", title: "Oral Interactions", status: "Elective", credits: 12, year: 2, semester: 1, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", electiveRule: "Choose ONE", sourceLocation: "Second Year — Semester I, Kiswahili Language Option Electives" },

  // ================= SECOND YEAR — SEMESTER II =================
  // ENGLISH SUB-STREAM
  { code: "LL 222", title: "Introduction to Research Methods in Language Studies", status: "Core", rawStatus: "Core*", credits: 12, year: 2, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Second Year — Semester II, English Sub-Stream" },
  { code: "LL 281", title: "French Communicative Competencies II", status: "Core", credits: 12, year: 2, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Second Year — Semester II, English Sub-Stream" },
  { code: "LL 283", title: "French Morphology and Syntax", status: "Core", credits: 12, year: 2, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Second Year — Semester II, English Sub-Stream" },
  { code: "LL 218", title: "English Rhetoric", status: "Core", credits: 12, year: 2, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Second Year — Semester II, English Sub-Stream" },
  { code: "LL 220", title: "English Grammar", status: "Core", credits: 12, year: 2, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Second Year — Semester II, English Sub-Stream" },
  // ELECTIVES — CHOOSE ONE
  { code: "AS 221", title: "Pan-Africanism: Thought and Practice II", status: "Elective", credits: 12, year: 2, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", electiveRule: "Choose ONE", sourceLocation: "Second Year — Semester II, English Sub-Stream Electives" },
  { code: "LL 217", title: "English for Business Communication", status: "Elective", credits: 12, year: 2, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", electiveRule: "Choose ONE", sourceLocation: "Second Year — Semester II, English Sub-Stream Electives" },
  { code: "LL 276", title: "Functional French", status: "Elective", credits: 12, year: 2, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", electiveRule: "Choose ONE", sourceLocation: "Second Year — Semester II, English Sub-Stream Electives" },
  { code: "LL 204", title: "Introduction to Tanzanian Sign Language", status: "Elective", rawStatus: "Elective*", credits: 12, year: 2, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", electiveRule: "Choose ONE", sourceLocation: "Second Year — Semester II, English Sub-Stream Electives" },

  // LINGUISTICS SUB-STREAM
  { code: "LL 222", title: "Introduction to Research Methods in Language Studies", status: "Core", rawStatus: "Core*", credits: 12, year: 2, semester: 2, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", sourceLocation: "Second Year — Semester II, Linguistics Sub-Stream" },
  { code: "LL 281", title: "French Communicative Competencies II", status: "Core", credits: 12, year: 2, semester: 2, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", sourceLocation: "Second Year — Semester II, Linguistics Sub-Stream" },
  { code: "LL 283", title: "French Morphology and Syntax", status: "Core", credits: 12, year: 2, semester: 2, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", sourceLocation: "Second Year — Semester II, Linguistics Sub-Stream" },
  { code: "LL 202", title: "Morphology", status: "Core", credits: 12, year: 2, semester: 2, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", sourceLocation: "Second Year — Semester II, Linguistics Sub-Stream" },
  { code: "LL 205", title: "Structure of a Non-Bantu Language", status: "Core", credits: 12, year: 2, semester: 2, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", sourceLocation: "Second Year — Semester II, Linguistics Sub-Stream" },
  // ELECTIVES — CHOOSE ONE
  { code: "AS 221", title: "Pan-Africanism: Thought and Practice II", status: "Elective", credits: 12, year: 2, semester: 2, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", electiveRule: "Choose ONE", sourceLocation: "Second Year — Semester II, Linguistics Sub-Stream Electives" },
  { code: "LL 217", title: "English for Business Communication", status: "Elective", credits: 12, year: 2, semester: 2, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", electiveRule: "Choose ONE", sourceLocation: "Second Year — Semester II, Linguistics Sub-Stream Electives" },
  { code: "LL 276", title: "Functional French", status: "Elective", credits: 12, year: 2, semester: 2, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", electiveRule: "Choose ONE", sourceLocation: "Second Year — Semester II, Linguistics Sub-Stream Electives" },
  { code: "LL 204", title: "Introduction to Tanzanian Sign Language", status: "Elective", rawStatus: "Elective*", credits: 12, year: 2, semester: 2, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", electiveRule: "Choose ONE", sourceLocation: "Second Year — Semester II, Linguistics Sub-Stream Electives" },

  // KISWAHILI LANGUAGE OPTION
  { code: "LL 222", title: "Introduction to Research Methods in Language Studies", status: "Core", rawStatus: "Core*", credits: 12, year: 2, semester: 2, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Second Year — Semester II, Kiswahili Language Option" },
  { code: "LL 281", title: "French Communicative Competencies II", status: "Core", credits: 12, year: 2, semester: 2, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Second Year — Semester II, Kiswahili Language Option" },
  { code: "LL 283", title: "French Morphology and Syntax", status: "Core", credits: 12, year: 2, semester: 2, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Second Year — Semester II, Kiswahili Language Option" },
  { code: "KI 209", title: "Mofolojia ya Kiswahili", status: "Core", credits: 12, year: 2, semester: 2, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Second Year — Semester II, Kiswahili Language Option" },
  { code: "KF 221", title: "Fasihi ya Watoto na Vijana", status: "Elective", credits: 12, year: 2, semester: 2, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Second Year — Semester II, Kiswahili Language Option (Pre-elective list)" },
  // ELECTIVES — CHOOSE ONE
  { code: "AS 221", title: "Pan-Africanism: Thought and Practice II", status: "Elective", credits: 12, year: 2, semester: 2, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", electiveRule: "Choose ONE", sourceLocation: "Second Year — Semester II, Kiswahili Language Option Electives" },
  { code: "LL 217", title: "English for Business Communication", status: "Elective", credits: 12, year: 2, semester: 2, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", electiveRule: "Choose ONE", sourceLocation: "Second Year — Semester II, Kiswahili Language Option Electives" },
  { code: "LL 276", title: "Functional French", status: "Elective", credits: 12, year: 2, semester: 2, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", electiveRule: "Choose ONE", sourceLocation: "Second Year — Semester II, Kiswahili Language Option Electives" },
  { code: "LL 204", title: "Introduction to Tanzanian Sign Language", status: "Elective", rawStatus: "Elective*", credits: 12, year: 2, semester: 2, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", electiveRule: "Choose ONE", sourceLocation: "Second Year — Semester II, Kiswahili Language Option Electives" },

  // ================= MANDATORY PRACTICAL TRAINING =================
  { code: "AS 299", title: "Practical Training", status: "Core", credits: 12, year: 2, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", note: "Inafanyika wakati wa likizo ndefu / done during the long vacation", sourceLocation: "Mandatory Practical Training, English Sub-Stream" },
  { code: "AS 299", title: "Practical Training", status: "Core", credits: 12, year: 2, semester: 2, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", note: "Inafanyika wakati wa likizo ndefu / done during the long vacation", sourceLocation: "Mandatory Practical Training, Linguistics Sub-Stream" },
  { code: "AS 299", title: "Practical Training", status: "Core", credits: 12, year: 2, semester: 2, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", note: "Inafanyika wakati wa likizo ndefu / done during the long vacation", sourceLocation: "Mandatory Practical Training, Kiswahili Language Option" },

  // ================= THIRD YEAR — SEMESTER I =================
  // ENGLISH SUB-STREAM
  { code: "LL 380", title: "Reading and Writing Proficiency II", status: "Core", credits: 12, year: 3, semester: 1, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Third Year — Semester I, English Sub-Stream" },
  { code: "LL 374", title: "Translation I", status: "Core", credits: 12, year: 3, semester: 1, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Third Year — Semester I, English Sub-Stream" },
  { code: "LL 332", title: "Introduction to Editing and Proofreading", status: "Core", rawStatus: "Core*", credits: 12, year: 3, semester: 1, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Third Year — Semester I, English Sub-Stream" },
  { code: "LL 317", title: "Introduction English Pragmatics", status: "Core", credits: 12, year: 3, semester: 1, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Third Year — Semester I, English Sub-Stream" },
  { code: "LL 330", title: "Introduction to Translation Theory", status: "Core", credits: 12, year: 3, semester: 1, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Third Year — Semester I, English Sub-Stream" },
  // ELECTIVES — CHOOSE ONE
  { code: "LL 316", title: "English in the World", status: "Elective", credits: 12, year: 3, semester: 1, subStream: "English Sub-Stream", subStreamSlug: "english", electiveRule: "Choose ONE", sourceLocation: "Third Year — Semester I, English Sub-Stream Electives" },
  { code: "LT 311", title: "Theory and Practice of Publishing", status: "Elective", credits: 12, year: 3, semester: 1, subStream: "English Sub-Stream", subStreamSlug: "english", electiveRule: "Choose ONE", sourceLocation: "Third Year — Semester I, English Sub-Stream Electives" },
  { code: "LL 376", title: "Functional French II", status: "Elective", credits: 12, year: 3, semester: 1, subStream: "English Sub-Stream", subStreamSlug: "english", electiveRule: "Choose ONE", sourceLocation: "Third Year — Semester I, English Sub-Stream Electives" },

  // LINGUISTICS SUB-STREAM
  { code: "LL 380", title: "Reading and Writing Proficiency II", status: "Core", credits: 12, year: 3, semester: 1, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", sourceLocation: "Third Year — Semester I, Linguistics Sub-Stream" },
  { code: "LL 374", title: "Translation I", status: "Core", credits: 12, year: 3, semester: 1, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", sourceLocation: "Third Year — Semester I, Linguistics Sub-Stream" },
  { code: "LL 332", title: "Introduction to Editing and Proofreading", status: "Core", rawStatus: "Core*", credits: 12, year: 3, semester: 1, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", sourceLocation: "Third Year — Semester I, Linguistics Sub-Stream" },
  { code: "LL 303", title: "Historical and Comparative Linguistics", status: "Core", credits: 12, year: 3, semester: 1, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", sourceLocation: "Third Year — Semester I, Linguistics Sub-Stream" },
  // ELECTIVES — CHOOSE ONE
  { code: "LL 316", title: "English in the World", status: "Elective", credits: 12, year: 3, semester: 1, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", electiveRule: "Choose ONE", sourceLocation: "Third Year — Semester I, Linguistics Sub-Stream Electives" },
  { code: "LT 311", title: "Theory and Practice of Publishing", status: "Elective", credits: 12, year: 3, semester: 1, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", electiveRule: "Choose ONE", sourceLocation: "Third Year — Semester I, Linguistics Sub-Stream Electives" },
  { code: "LL 376", title: "Functional French II", status: "Elective", credits: 12, year: 3, semester: 1, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", electiveRule: "Choose ONE", sourceLocation: "Third Year — Semester I, Linguistics Sub-Stream Electives" },

  // KISWAHILI LANGUAGE SUB-STREAM
  { code: "LL 380", title: "Reading and Writing Proficiency II", status: "Core", credits: 12, year: 3, semester: 1, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Third Year — Semester I, Kiswahili Language Option" },
  { code: "LL 374", title: "Translation I", status: "Core", credits: 12, year: 3, semester: 1, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Third Year — Semester I, Kiswahili Language Option" },
  { code: "LL 332", title: "Introduction to Editing and Proofreading", status: "Core", rawStatus: "Core*", credits: 12, year: 3, semester: 1, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Third Year — Semester I, Kiswahili Language Option" },
  { code: "KF 302", title: "Fasihi Simulizi ya Kiswahili na Kiafrika", status: "Core", credits: 12, year: 3, semester: 1, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Third Year — Semester I, Kiswahili Language Option" },
  { code: "KI 310", title: "Sintaksia ya Kiswahili", status: "Core", credits: 12, year: 3, semester: 1, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Third Year — Semester I, Kiswahili Language Option" },
  // ELECTIVES — CHOOSE ONE
  { code: "LL 316", title: "English in the World", status: "Elective", credits: 12, year: 3, semester: 1, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", electiveRule: "Choose ONE", sourceLocation: "Third Year — Semester I, Kiswahili Language Option Electives" },
  { code: "LT 311", title: "Theory and Practice of Publishing", status: "Elective", credits: 12, year: 3, semester: 1, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", electiveRule: "Choose ONE", sourceLocation: "Third Year — Semester I, Kiswahili Language Option Electives" },
  { code: "LL 376", title: "Functional French II", status: "Elective", credits: 12, year: 3, semester: 1, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", electiveRule: "Choose ONE", sourceLocation: "Third Year — Semester I, Kiswahili Language Option Electives" },

  // ================= THIRD YEAR — SEMESTER II =================
  // ENGLISH SUB-STREAM
  { code: "LL 314", title: "Second Language Acquisition", status: "Core", rawStatus: "Core*", credits: 12, year: 3, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Third Year — Semester II, English Sub-Stream" },
  { code: "LL 381", title: "French Oral Proficiency", status: "Core", credits: 12, year: 3, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Third Year — Semester II, English Sub-Stream" },
  { code: "LL 382", title: "Literature in French", status: "Core", credits: 12, year: 3, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Third Year — Semester II, English Sub-Stream" },
  { code: "LL 331", title: "Translation Methods and Practice", status: "Core", credits: 12, year: 3, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Third Year — Semester II, English Sub-Stream" },
  { code: "LL 318", title: "The Study of Discourse", status: "Core", credits: 12, year: 3, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Third Year — Semester II, English Sub-Stream" },
  { code: "LL 375", title: "Translation II", status: "Core", credits: 12, year: 3, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Third Year — Semester II, English Sub-Stream" },
  { code: "LL 384", title: "Introduction to Consecutive Interpretation", status: "Core", credits: 12, year: 3, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", sourceLocation: "Third Year — Semester II, English Sub-Stream" },
  // ELECTIVES — CHOOSE ONE
  { code: "LT 312", title: "Language and Literature", status: "Elective", credits: 12, year: 3, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", electiveRule: "Choose ONE", sourceLocation: "Third Year — Semester II, English Sub-Stream Electives" },
  { code: "CA 208", title: "Screenplay Writing", status: "Elective", credits: 12, year: 3, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", electiveRule: "Choose ONE", sourceLocation: "Third Year — Semester II, English Sub-Stream Electives" },
  { code: "LL 313", title: "Linguistics and Language Teaching", status: "Elective", credits: 12, year: 3, semester: 2, subStream: "English Sub-Stream", subStreamSlug: "english", electiveRule: "Choose ONE", sourceLocation: "Third Year — Semester II, English Sub-Stream Electives" },

  // LINGUISTICS SUB-STREAM
  { code: "LL 314", title: "Second Language Acquisition", status: "Core", rawStatus: "Core*", credits: 12, year: 3, semester: 2, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", sourceLocation: "Third Year — Semester II, Linguistics Sub-Stream" },
  { code: "LL 381", title: "French Oral Proficiency", status: "Core", credits: 12, year: 3, semester: 2, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", sourceLocation: "Third Year — Semester II, Linguistics Sub-Stream" },
  { code: "LL 382", title: "Literature in French", status: "Core", credits: 12, year: 3, semester: 2, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", sourceLocation: "Third Year — Semester II, Linguistics Sub-Stream" },
  { code: "LL 305", title: "Bantu Language Structure", status: "Core", credits: 12, year: 3, semester: 2, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", sourceLocation: "Third Year — Semester II, Linguistics Sub-Stream" },
  { code: "LL 302", title: "Sociolinguistics", status: "Core", credits: 12, year: 3, semester: 2, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", sourceLocation: "Third Year — Semester II, Linguistics Sub-Stream" },
  // ELECTIVES — CHOOSE ONE OR TWO
  { code: "LT 312", title: "Language and Literature", status: "Elective", credits: 12, year: 3, semester: 2, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", electiveRule: "Choose ONE or TWO", sourceLocation: "Third Year — Semester II, Linguistics Sub-Stream Electives" },
  { code: "CA 208", title: "Screenplay Writing", status: "Elective", credits: 12, year: 3, semester: 2, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", electiveRule: "Choose ONE or TWO", sourceLocation: "Third Year — Semester II, Linguistics Sub-Stream Electives" },
  { code: "LL 313", title: "Linguistics and Language Teaching", status: "Elective", credits: 12, year: 3, semester: 2, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", electiveRule: "Choose ONE or TWO", sourceLocation: "Third Year — Semester II, Linguistics Sub-Stream Electives" },
  { code: "LL 375", title: "Translation II", status: "Elective", credits: 12, year: 3, semester: 2, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", electiveRule: "Choose ONE or TWO", sourceLocation: "Third Year — Semester II, Linguistics Sub-Stream Electives" },
  { code: "LL 384", title: "Introduction to Consecutive Interpretation", status: "Elective", credits: 12, year: 3, semester: 2, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", electiveRule: "Choose ONE or TWO", sourceLocation: "Third Year — Semester II, Linguistics Sub-Stream Electives" },

  // KISWAHILI LANGUAGE OPTION
  { code: "LL 314", title: "Second Language Acquisition", status: "Core", rawStatus: "Core*", credits: 12, year: 3, semester: 2, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Third Year — Semester II, Kiswahili Language Option" },
  { code: "LL 381", title: "French Oral Proficiency", status: "Core", credits: 12, year: 3, semester: 2, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Third Year — Semester II, Kiswahili Language Option" },
  { code: "LL 382", title: "Literature in French", status: "Core", credits: 12, year: 3, semester: 2, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Third Year — Semester II, Kiswahili Language Option" },
  { code: "KF 318", title: "Riwaya ya Kiswahili", status: "Core", credits: 12, year: 3, semester: 2, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Third Year — Semester II, Kiswahili Language Option" },
  { code: "KF 319", title: "Tamthiliya ya Kiswahili", status: "Core", credits: 12, year: 3, semester: 2, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Third Year — Semester II, Kiswahili Language Option" },
  { code: "KI 311", title: "Semantiki na Pragmatiki ya Kiswahili", status: "Core", credits: 12, year: 3, semester: 2, subStream: "Kiswahili Language Option/Sub-Stream", subStreamSlug: "kiswahili", sourceLocation: "Third Year — Semester II, Kiswahili Language Option" },

  // ================= ADDITIONAL ELECTIVES FOR STUDENTS TAKING LINGUISTICS =================
  { code: "LL 304", title: "Tanzanian Sign Language Structure", status: "Elective", rawStatus: "Elective*", credits: 12, year: 3, semester: 2, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", electiveRule: "Choose ONE or TWO", isAdditionalElective: true, sourceLocation: "Additional Electives for Students Taking Linguistics" },
  { code: "LL 375", title: "Translation II", status: "Elective", credits: 12, year: 3, semester: 2, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", electiveRule: "Choose ONE or TWO", isAdditionalElective: true, sourceLocation: "Additional Electives for Students Taking Linguistics" },
  { code: "LL 390", title: "Project (By invitation only)", status: "Elective", credits: 12, year: 3, semester: 2, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", electiveRule: "Choose ONE or TWO", isAdditionalElective: true, sourceLocation: "Additional Electives for Students Taking Linguistics" },
  { code: "LL 384", title: "Introduction to Consecutive Interpretation", status: "Elective", credits: 12, year: 3, semester: 2, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", electiveRule: "Choose ONE or TWO", isAdditionalElective: true, sourceLocation: "Additional Electives for Students Taking Linguistics" },
  { code: "LT 312", title: "Language and Literature", status: "Elective", credits: 12, year: 3, semester: 2, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", electiveRule: "Choose ONE or TWO", isAdditionalElective: true, sourceLocation: "Additional Electives for Students Taking Linguistics" },
  // CA 208 = 31 credits anomaly:
  { code: "CA 208", title: "Screenplay Writing", status: "Elective", credits: 31, year: 3, semester: 2, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", electiveRule: "Choose ONE or TWO", isAdditionalElective: true, sourceLocation: "Additional Electives for Students Taking Linguistics" },
  { code: "LL 313", title: "Linguistics and Language Teaching", status: "Elective", credits: 12, year: 3, semester: 2, subStream: "Linguistics Sub-Stream", subStreamSlug: "linguistics", electiveRule: "Choose ONE or TWO", isAdditionalElective: true, sourceLocation: "Additional Electives for Students Taking Linguistics" },
];

async function runImport() {
  console.log("=== STARTING IMPORT FOR SPECIALISATION II: FRENCH ===");

  // Step 1: Verify College of Humanities (CoHU)
  const cohuDoc = await getDoc(doc(db, "academic_units", "cohu"));
  if (!cohuDoc.exists()) {
    throw new Error("Academic Unit 'cohu' does not exist in Firestore!");
  }
  console.log("✓ Verified Academic Unit:", cohuDoc.id, cohuDoc.data()?.name);

  // Step 2: Verify Department of Foreign Languages and Linguistics
  const deptDoc = await getDoc(doc(db, "departments", "dept-foreign-languages"));
  if (!deptDoc.exists()) {
    throw new Error("Department 'dept-foreign-languages' does not exist in Firestore!");
  }
  console.log("✓ Verified Department:", deptDoc.id, deptDoc.data()?.name);

  // Step 3: Verify B.A. (Language Studies)
  const progRef = doc(db, "programmes", "ba-language-studies");
  const progSnap = await getDoc(progRef);
  if (!progSnap.exists()) {
    throw new Error("Programme 'ba-language-studies' does not exist!");
  }
  console.log("✓ Verified Programme:", progSnap.id, progSnap.data()?.name);

  // Step 4: Verify and update Specialisation II: French
  const existingProgData = progSnap.data() || {};
  const updatedSpecialisations = [
    {
      id: "english",
      name: "Specialisation I: English",
      description: "Specialisation I: English (Curriculum not supplied in this batch)"
    },
    {
      id: "french",
      name: "Specialisation II: French",
      code: "FRENCH",
      description: "Specialisation II: French under Bachelor of Arts in Language Studies",
      subStreams: [
        {
          id: "english",
          name: "English Sub-Stream",
          slug: "english",
          description: "French Specialisation with English Sub-Stream"
        },
        {
          id: "linguistics",
          name: "Linguistics Sub-Stream",
          slug: "linguistics",
          description: "French Specialisation with Linguistics Sub-Stream"
        },
        {
          id: "kiswahili",
          name: "Kiswahili Language Option/Sub-Stream",
          slug: "kiswahili",
          description: "French Specialisation with Kiswahili Language Option"
        }
      ]
    },
    {
      id: "linguistics",
      name: "Specialisation III: Linguistics",
      subStream: "Linguistics Sub-Stream"
    },
    {
      id: "kiswahili",
      name: "Kiswahili Language Option / Sub-Stream",
      subStream: "Kiswahili Language Option"
    }
  ];

  await setDoc(progRef, {
    ...existingProgData,
    specialisations: updatedSpecialisations,
    updatedAt: new Date().toISOString()
  }, { merge: true });
  console.log("✓ Updated Programme ba-language-studies with Specialisation II: French and its sub-streams.");

  // Step 5: Check existing canonical courses
  const canonSnap = await getDocs(collection(db, "canonical_courses"));
  const canonicalMap = new Map<string, any>();
  canonSnap.forEach(d => {
    const data = d.data();
    if (data.code) {
      canonicalMap.set(data.code.toUpperCase().trim(), { id: d.id, ...data });
    }
  });
  console.log(`✓ Loaded ${canonicalMap.size} canonical courses.`);

  // Step 6: Identify new canonical courses to create
  const newCanonicalToCreate: any[] = [];
  const canonicalReusedSet = new Set<string>();
  const conflicts: any[] = [];

  // Track unique codes from supplied
  const suppliedUniqueCodes = new Map<string, SuppliedCourse>();
  for (const item of SUPPLIED_DATA) {
    if (!suppliedUniqueCodes.has(item.code)) {
      suppliedUniqueCodes.set(item.code, item);
    }
  }

  // Codes to explicitly check:
  // LL 222: new canonical course
  // KS 223: new canonical course
  // KF 221: new canonical course
  // LL 390: new canonical course
  for (const [code, item] of suppliedUniqueCodes.entries()) {
    const existing = canonicalMap.get(code);
    if (!existing) {
      // Create new canonical course
      const canonId = code.toLowerCase().replace(/[^a-z0-9]+/g, "_");
      let offeringDept = "dept-foreign-languages";
      let offeringUnit = "cohu";
      if (code.startsWith("KF ") || code.startsWith("KI ") || code.startsWith("KS ")) {
        offeringDept = "dept-iks-literature";
        offeringUnit = "iks";
      } else if (code.startsWith("AS ")) {
        offeringDept = "dept-creative-arts";
        offeringUnit = "cohu";
      }

      newCanonicalToCreate.push({
        id: canonId,
        code: item.code,
        title: item.title,
        defaultCredits: item.credits === 31 ? 12 : item.credits,
        departmentId: offeringDept,
        academicUnitId: offeringUnit,
        universityId: "udsm",
        academicYear: "2025/2026",
        source: "UDSM Undergraduate Prospectus 2025/2026 (Official Source of Truth)",
        sourceType: "official_prospectus",
        verified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } else {
      canonicalReusedSet.add(code);
    }
  }

  // Create new canonical courses
  if (newCanonicalToCreate.length > 0) {
    const batch = writeBatch(db);
    for (const c of newCanonicalToCreate) {
      batch.set(doc(db, "canonical_courses", c.id), c);
      canonicalMap.set(c.code, c);
    }
    await batch.commit();
    console.log(`✓ Created ${newCanonicalToCreate.length} new canonical courses:`, newCanonicalToCreate.map(c => c.code).join(", "));
  }

  // Step 7: Load existing programme_courses and catalogue_courses for ba-language-studies
  const existingPcSnap = await getDocs(
    query(collection(db, "programme_courses"), where("programmeId", "==", "ba-language-studies"))
  );
  const existingPcMap = new Map<string, any>();
  existingPcSnap.forEach(d => {
    const data = d.data();
    // Key by code, year, semester, and normalized stream
    const streamKey = (data.subStream || "").toLowerCase();
    const key = `${data.code}_Y${data.yearOfStudy}S${data.semester}_${streamKey}`;
    existingPcMap.set(key, { id: d.id, ...data });
  });

  console.log(`✓ Found ${existingPcSnap.size} existing programme_courses.`);

  // Step 8: Build relationship writes (reused/updated vs created)
  let relationshipsCreated = 0;
  let relationshipsUpdated = 0;
  const pcDocsToWrite: any[] = [];
  const ccDocsToWrite: any[] = [];

  // Track conflict items
  // CA 208 credit anomaly
  // LL 282 title discrepancy
  // LL 281 title verification
  // LL 222 title verification
  // LL 317 title discrepancy
  // KF 221 status verification
  // DS 112 credit discrepancy
  // KF 102 title discrepancy

  for (const item of SUPPLIED_DATA) {
    const canon = canonicalMap.get(item.code);

    // 1. Conflict: DS 112 credits
    if (item.code === "DS 112" && canon && canon.defaultCredits !== item.credits) {
      conflicts.push({
        code: item.code,
        suppliedTitle: item.title,
        existingTitle: canon.title,
        suppliedCredits: item.credits,
        existingCredits: canon.defaultCredits,
        sourceLocation: item.sourceLocation,
        actionTaken: "Canonical DS 112 preserved (8 credits); conflicting relationship skipped per data policy; logged for manual review."
      });
      continue;
    }

    // 2. Conflict: KF 102 title
    if (item.code === "KF 102" && canon && canon.title !== item.title) {
      conflicts.push({
        code: item.code,
        suppliedTitle: item.title,
        existingTitle: canon.title,
        suppliedCredits: item.credits,
        existingCredits: canon.defaultCredits,
        sourceLocation: item.sourceLocation,
        actionTaken: "Canonical KF 102 preserved ('Fasihi Simulizi ya Kiswahili'); conflicting title skipped per data policy; logged for manual review."
      });
      continue;
    }

    // 3. Conflict / Anomaly: CA 208 = 31 credits in Additional Electives
    if (item.code === "CA 208" && item.credits === 31) {
      conflicts.push({
        code: item.code,
        suppliedTitle: item.title,
        existingTitle: canon ? canon.title : "Screenplay Writing",
        suppliedCredits: 31,
        existingCredits: canon ? canon.defaultCredits : 12,
        sourceLocation: item.sourceLocation,
        actionTaken: "Preserved existing canonical CA 208 (12 credits); recorded 31-credit anomaly; skipped 31-credit relationship to prevent curriculum corruption; logged for manual review."
      });
      continue;
    }

    // Check specific reporting discrepancies (LL 282, LL 281, LL 317)
    if (item.code === "LL 282" && canon && canon.title !== item.title) {
      // Check if already logged for this location
      if (!conflicts.some(c => c.code === "LL 282" && c.sourceLocation === item.sourceLocation)) {
        conflicts.push({
          code: item.code,
          suppliedTitle: item.title,
          existingTitle: canon.title,
          suppliedCredits: item.credits,
          existingCredits: canon.defaultCredits,
          sourceLocation: item.sourceLocation,
          actionTaken: `Preserved existing canonical LL 282 title ('${canon.title}'); relationship imported using canonical course and flagged.`
        });
      }
    }

    if (item.code === "LL 281" && canon && canon.title !== item.title) {
      if (!conflicts.some(c => c.code === "LL 281" && c.sourceLocation === item.sourceLocation)) {
        conflicts.push({
          code: item.code,
          suppliedTitle: item.title,
          existingTitle: canon.title,
          suppliedCredits: item.credits,
          existingCredits: canon.defaultCredits,
          sourceLocation: item.sourceLocation,
          actionTaken: `Preserved existing canonical LL 281 title ('${canon.title}'); relationship imported using canonical course; title variation noted.`
        });
      }
    }

    if (item.code === "LL 317" && canon && canon.title !== item.title) {
      if (!conflicts.some(c => c.code === "LL 317" && c.sourceLocation === item.sourceLocation)) {
        conflicts.push({
          code: item.code,
          suppliedTitle: item.title,
          existingTitle: canon.title,
          suppliedCredits: item.credits,
          existingCredits: canon.defaultCredits,
          sourceLocation: item.sourceLocation,
          actionTaken: `Preserved existing canonical LL 317 title ('${canon.title}'); relationship imported using canonical course; slight wording variation noted.`
        });
      }
    }

    // Determine matching existing relationship
    // Previous stream strings: 'french sub-stream', 'linguistics sub-stream', 'kiswahili language option'
    // Map English Sub-Stream to previous 'french sub-stream' or 'english sub-stream'
    const targetStreamSlug = item.subStreamSlug;
    const cleanCode = item.code.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    const docId = `ba-language-studies_french_${targetStreamSlug}_${cleanCode}_y${item.year}s${item.semester}`;

    // Check if matching previous record exists
    let previousMatch = existingPcMap.get(`${item.code}_Y${item.year}S${item.semester}_${item.subStream.toLowerCase()}`);
    if (!previousMatch && item.subStreamSlug === "english") {
      previousMatch = existingPcMap.get(`${item.code}_Y${item.year}S${item.semester}_french sub-stream`);
    }
    if (!previousMatch && item.subStreamSlug === "kiswahili") {
      previousMatch = existingPcMap.get(`${item.code}_Y${item.year}S${item.semester}_kiswahili language option`);
    }

    const relDocId = previousMatch ? previousMatch.id : docId;

    const relData = {
      id: relDocId,
      code: item.code,
      title: canon ? canon.title : item.title,
      credits: item.code === "AS 299" ? 12 : (canon ? canon.defaultCredits : item.credits),
      status: item.status,
      rawStatus: item.rawStatus || null,
      yearOfStudy: item.year,
      semester: item.semester,
      programmeId: "ba-language-studies",
      specialisation: "Specialisation II: French",
      specialisationId: "french",
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
      canonicalCourseId: canon ? canon.id : cleanCode,
      courseId: canon ? canon.id : cleanCode,
      offeringDepartmentId: canon ? canon.departmentId : "dept-foreign-languages",
      offeringAcademicUnitId: canon ? canon.academicUnitId : "cohu",
      verified: true,
      updatedAt: new Date().toISOString(),
      createdAt: previousMatch ? previousMatch.createdAt || new Date().toISOString() : new Date().toISOString()
    };

    if (previousMatch) {
      relationshipsUpdated++;
    } else {
      relationshipsCreated++;
    }

    pcDocsToWrite.push(relData);
    ccDocsToWrite.push(relData);
  }

  console.log(`Relationships to write: ${pcDocsToWrite.length} (Updated/reused: ${relationshipsUpdated}, Created: ${relationshipsCreated})`);

  // Write to programme_courses and catalogue_courses in batches
  async function writeInBatches(collectionName: string, items: any[]) {
    console.log(`Writing ${items.length} documents to ${collectionName}...`);
    const chunkSize = 400;
    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      for (const item of chunk) {
        batch.set(doc(db, collectionName, item.id), item);
      }
      await batch.commit();
    }
    console.log(`✓ Completed writing to ${collectionName}.`);
  }

  await writeInBatches("programme_courses", pcDocsToWrite);
  await writeInBatches("catalogue_courses", ccDocsToWrite);

  // Save audit log
  const auditResults = {
    timestamp: new Date().toISOString(),
    programmeId: "ba-language-studies",
    specialisationId: "french",
    relationshipsCreated,
    relationshipsUpdated,
    totalWritten: pcDocsToWrite.length,
    newCanonicalCreated: newCanonicalToCreate.map(c => ({ code: c.code, title: c.title, credits: c.defaultCredits })),
    canonicalReusedCount: canonicalReusedSet.size,
    conflicts
  };

  fs.writeFileSync("./scripts/import_audit_results.json", JSON.stringify(auditResults, null, 2));
  console.log("✓ Audit log saved to ./scripts/import_audit_results.json");
  console.log("=== IMPORT EXECUTION COMPLETE ===");
}

runImport().catch(err => {
  console.error("Import failed:", err);
  process.exit(1);
});
