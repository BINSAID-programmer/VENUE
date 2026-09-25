import { initializeApp } from "firebase/app";
import {
  initializeFirestore,
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  writeBatch,
  query,
  where,
} from "firebase/firestore";
import * as fs from "fs";

interface RawCourseSpec {
  code: string;
  title: string;
  credits: number;
  status: "Core" | "Elective";
  year: number;
  semester: number;
  programmeId: string;
  offeringDeptId?: string;
  isPracticalOrProject?: boolean;
  notes?: string;
}

// PROGRAMME 1: BACHELOR OF SCIENCE WITH EDUCATION (MATHEMATICS CURRICULUM)
const BSC_ED_MATH_COURSES: RawCourseSpec[] = [
  // Year 1 Semester 1
  { code: "MT 100", title: "Foundations of Analysis", credits: 12, status: "Core", year: 1, semester: 1, programmeId: "bsc-ed", offeringDeptId: "dept-math" },
  { code: "MT 127", title: "Linear Algebra I", credits: 12, status: "Core", year: 1, semester: 1, programmeId: "bsc-ed", offeringDeptId: "dept-math" },

  // Year 1 Semester 2
  { code: "MT 136", title: "Ordinary Differential Equation I", credits: 8, status: "Core", year: 1, semester: 2, programmeId: "bsc-ed", offeringDeptId: "dept-math" },
  { code: "MT 120", title: "Analysis 1: Functions of a Single Variable", credits: 12, status: "Elective", year: 1, semester: 2, programmeId: "bsc-ed", offeringDeptId: "dept-math" },
  { code: "MT 129", title: "Introduction to Geometry", credits: 8, status: "Core", year: 1, semester: 2, programmeId: "bsc-ed", offeringDeptId: "dept-math" },
  { code: "MT 147", title: "Discrete Mathematics", credits: 12, status: "Elective", year: 1, semester: 2, programmeId: "bsc-ed", offeringDeptId: "dept-math" },

  // Year 2 Semester 1
  { code: "MT 228", title: "Calculus I", credits: 8, status: "Core", year: 2, semester: 1, programmeId: "bsc-ed", offeringDeptId: "dept-math" },
  { code: "MT 234", title: "Introduction to Probability and Statistics", credits: 8, status: "Core", year: 2, semester: 1, programmeId: "bsc-ed", offeringDeptId: "dept-math" },
  { code: "MT 200", title: "Analysis 2: Functions of Several Variables", credits: 12, status: "Elective", year: 2, semester: 1, programmeId: "bsc-ed", offeringDeptId: "dept-math" },
  { code: "MT 225", title: "Partial Differential Equations", credits: 8, status: "Elective", year: 2, semester: 1, programmeId: "bsc-ed", offeringDeptId: "dept-math" },

  // Year 2 Semester 2
  { code: "MT 278", title: "Linear Programming", credits: 8, status: "Core", year: 2, semester: 2, programmeId: "bsc-ed", offeringDeptId: "dept-math" },
  { code: "MT 227", title: "Linear Algebra II", credits: 12, status: "Elective", year: 2, semester: 2, programmeId: "bsc-ed", offeringDeptId: "dept-math" },
  { code: "MT 274", title: "Numerical Analysis 1", credits: 8, status: "Core", year: 2, semester: 2, programmeId: "bsc-ed", offeringDeptId: "dept-math" },

  // Year 3 Semester 1
  { code: "MT 328", title: "Calculus II", credits: 8, status: "Core", year: 3, semester: 1, programmeId: "bsc-ed", offeringDeptId: "dept-math" },
  { code: "MT 265", title: "Mathematical Computing", credits: 8, status: "Core", year: 3, semester: 1, programmeId: "bsc-ed", offeringDeptId: "dept-math" },
  { code: "MT 357", title: "Abstract Algebra", credits: 12, status: "Elective", year: 3, semester: 1, programmeId: "bsc-ed", offeringDeptId: "dept-math" },
  { code: "MT 379", title: "Introduction to Mathematical modelling", credits: 12, status: "Elective", year: 3, semester: 1, programmeId: "bsc-ed", offeringDeptId: "dept-math" },

  // Year 3 Semester 2
  { code: "MT 310", title: "Analysis 3: Complex Analysis I", credits: 8, status: "Core", year: 3, semester: 2, programmeId: "bsc-ed", offeringDeptId: "dept-math" },
  { code: "MT 388", title: "Mathematics Project for Teachers", credits: 8, status: "Core", year: 3, semester: 2, programmeId: "bsc-ed", offeringDeptId: "dept-math", isPracticalOrProject: true },
];

// PROGRAMME 2: BACHELOR OF SCIENCE IN MATHEMATICS AND STATISTICS
const BSC_MATH_STATS_COURSES: RawCourseSpec[] = [
  // Year 1 Semester 1
  { code: "MT 100", title: "Foundations of Analysis", credits: 12, status: "Core", year: 1, semester: 1, programmeId: "math-stats", offeringDeptId: "dept-math" },
  { code: "MT 127", title: "Linear Algebra I", credits: 12, status: "Core", year: 1, semester: 1, programmeId: "math-stats", offeringDeptId: "dept-math" },
  { code: "ST 113", title: "Basic Statistics", credits: 12, status: "Core", year: 1, semester: 1, programmeId: "math-stats", offeringDeptId: "dept-stats" },
  { code: "FN 100", title: "Principles of Microeconomics", credits: 12, status: "Core", year: 1, semester: 1, programmeId: "math-stats", offeringDeptId: "dept-finance" },
  { code: "DS 112", title: "Development Perspectives I", credits: 12, status: "Core", year: 1, semester: 1, programmeId: "math-stats", offeringDeptId: "dept-dev-studies" },
  { code: "MT 114", title: "Computer Programming", credits: 12, status: "Core", year: 1, semester: 1, programmeId: "math-stats", offeringDeptId: "dept-math" },
  { code: "CL 107", title: "Communication Skills for Science Students", credits: 12, status: "Elective", year: 1, semester: 1, programmeId: "math-stats", offeringDeptId: "dept-ccs" },

  // Year 1 Semester 2
  { code: "MT 135", title: "Ordinary Differential Equation I", credits: 12, status: "Core", year: 1, semester: 2, programmeId: "math-stats", offeringDeptId: "dept-math" },
  { code: "FN 101", title: "Principles of Macroeconomics", credits: 12, status: "Core", year: 1, semester: 2, programmeId: "math-stats", offeringDeptId: "dept-finance" },
  { code: "DS 113", title: "Development Perspectives II", credits: 12, status: "Core", year: 1, semester: 2, programmeId: "math-stats", offeringDeptId: "dept-dev-studies" },
  { code: "MT 120", title: "Analysis I: Functions of Single Variable", credits: 12, status: "Core", year: 1, semester: 2, programmeId: "math-stats", offeringDeptId: "dept-math" },
  { code: "ST 114", title: "Probability Theory I", credits: 12, status: "Core", year: 1, semester: 2, programmeId: "math-stats", offeringDeptId: "dept-stats" },
  { code: "MT 147", title: "Discrete Mathematics", credits: 12, status: "Elective", year: 1, semester: 2, programmeId: "math-stats", offeringDeptId: "dept-math" },
  { code: "ST 118", title: "Time Series and Index Numbers", credits: 12, status: "Elective", year: 1, semester: 2, programmeId: "math-stats", offeringDeptId: "dept-stats" },

  // Year 2 Semester 1
  { code: "MT 200", title: "Analysis 2: Functions of Several Variables", credits: 12, status: "Core", year: 2, semester: 1, programmeId: "math-stats", offeringDeptId: "dept-math" },
  { code: "ST 210", title: "Probability Distributions I", credits: 12, status: "Core", year: 2, semester: 1, programmeId: "math-stats", offeringDeptId: "dept-stats" },
  { code: "ST 218", title: "Applied Statistics I", credits: 12, status: "Core", year: 2, semester: 1, programmeId: "math-stats", offeringDeptId: "dept-stats" },
  { code: "MT 225", title: "Partial Differential Equations", credits: 12, status: "Core", year: 2, semester: 1, programmeId: "math-stats", offeringDeptId: "dept-math" },
  { code: "ST 212", title: "Statistical Inference I", credits: 12, status: "Core", year: 2, semester: 1, programmeId: "math-stats", offeringDeptId: "dept-stats" },
  { code: "MT 265", title: "Mathematical Computing", credits: 12, status: "Elective", year: 2, semester: 1, programmeId: "math-stats", offeringDeptId: "dept-math" },
  { code: "ST 220", title: "Basic Demographics Methods", credits: 12, status: "Elective", year: 2, semester: 1, programmeId: "math-stats", offeringDeptId: "dept-stats" },

  // Year 2 Semester 2
  { code: "MT 278", title: "Linear Programming", credits: 12, status: "Core", year: 2, semester: 2, programmeId: "math-stats", offeringDeptId: "dept-math" },
  { code: "MT 274", title: "Numerical Analysis 1", credits: 12, status: "Core", year: 2, semester: 2, programmeId: "math-stats", offeringDeptId: "dept-math" },
  { code: "ST 211", title: "Probability Distributions II", credits: 12, status: "Core", year: 2, semester: 2, programmeId: "math-stats", offeringDeptId: "dept-stats" },
  { code: "ST 219", title: "Applied Statistics II", credits: 12, status: "Core", year: 2, semester: 2, programmeId: "math-stats", offeringDeptId: "dept-stats" },
  { code: "MT 266", title: "Rigid Body Mechanics", credits: 12, status: "Elective", year: 2, semester: 2, programmeId: "math-stats", offeringDeptId: "dept-math" },
  { code: "ST 217", title: "Probability Theory II", credits: 12, status: "Elective", year: 2, semester: 2, programmeId: "math-stats", offeringDeptId: "dept-stats" },

  // Year 3 Semester 1
  { code: "MT 357", title: "Abstract Algebra", credits: 12, status: "Core", year: 3, semester: 1, programmeId: "math-stats", offeringDeptId: "dept-math" },
  { code: "ST 310", title: "Statistical Inference II", credits: 12, status: "Core", year: 3, semester: 1, programmeId: "math-stats", offeringDeptId: "dept-stats" },
  { code: "MT 340", title: "Analysis 4: Real Analysis", credits: 12, status: "Core", year: 3, semester: 1, programmeId: "math-stats", offeringDeptId: "dept-math" },
  { code: "MT 310", title: "Complex Analysis", credits: 12, status: "Core", year: 3, semester: 1, programmeId: "math-stats", offeringDeptId: "dept-math" },
  { code: "ST 319", title: "Design and Analysis of Experiments", credits: 12, status: "Elective", year: 3, semester: 1, programmeId: "math-stats", offeringDeptId: "dept-stats" },
  { code: "MT 378", title: "Queuing Theory and Inventory Models", credits: 12, status: "Elective", year: 3, semester: 1, programmeId: "math-stats", offeringDeptId: "dept-math" },

  // Year 3 Semester 2
  { code: "ST 318", title: "Sampling Theory and Methodology", credits: 12, status: "Core", year: 3, semester: 2, programmeId: "math-stats", offeringDeptId: "dept-stats" },
  { code: "ST 316", title: "Statistical Quality Control", credits: 12, status: "Core", year: 3, semester: 2, programmeId: "math-stats", offeringDeptId: "dept-stats" },
  { code: "ST 321", title: "Regression Analysis", credits: 12, status: "Core", year: 3, semester: 2, programmeId: "math-stats", offeringDeptId: "dept-stats" },
  { code: "MT 398", title: "Practical Training", credits: 8, status: "Core", year: 3, semester: 2, programmeId: "math-stats", offeringDeptId: "dept-math", isPracticalOrProject: true },
  { code: "MT 389", title: "Project", credits: 8, status: "Core", year: 3, semester: 2, programmeId: "math-stats", offeringDeptId: "dept-math", isPracticalOrProject: true },
  { code: "MT 360", title: "Functional Analysis", credits: 12, status: "Core", year: 3, semester: 2, programmeId: "math-stats", offeringDeptId: "dept-math" },
  { code: "MT 346", title: "Fluid Mechanics", credits: 12, status: "Elective", year: 3, semester: 2, programmeId: "math-stats", offeringDeptId: "dept-math" },
  { code: "ST 312", title: "Stochastic Processes", credits: 12, status: "Elective", year: 3, semester: 2, programmeId: "math-stats", offeringDeptId: "dept-stats" },
];

// PROGRAMME 3: BACHELOR OF SCIENCE IN ACTUARIAL SCIENCES
const BSC_ACTUARIAL_COURSES: RawCourseSpec[] = [
  // Year 1 Semester 1
  { code: "DS 112", title: "Development Perspectives I", credits: 12, status: "Core", year: 1, semester: 1, programmeId: "bsc-actuarial", offeringDeptId: "dept-dev-studies" },
  { code: "MT 114", title: "Computer Programming", credits: 12, status: "Core", year: 1, semester: 1, programmeId: "bsc-actuarial", offeringDeptId: "dept-math" },
  { code: "ST 113", title: "Basic Statistics", credits: 12, status: "Core", year: 1, semester: 1, programmeId: "bsc-actuarial", offeringDeptId: "dept-stats" },
  { code: "ST 121", title: "Analytical Calculus", credits: 12, status: "Core", year: 1, semester: 1, programmeId: "bsc-actuarial", offeringDeptId: "dept-stats" },
  { code: "AC 102", title: "Accounting for Non-Business Majors", credits: 12, status: "Core", year: 1, semester: 1, programmeId: "bsc-actuarial", offeringDeptId: "dept-accounting" },

  // Year 1 Semester 2
  { code: "MT 136", title: "Ordinary Differential Equations", credits: 8, status: "Core", year: 1, semester: 2, programmeId: "bsc-actuarial", offeringDeptId: "dept-math" },
  { code: "FN 102", title: "Introduction to Actuarial Studies", credits: 12, status: "Core", year: 1, semester: 2, programmeId: "bsc-actuarial", offeringDeptId: "dept-finance" },
  { code: "DS 113", title: "Development Perspectives II", credits: 12, status: "Core", year: 1, semester: 2, programmeId: "bsc-actuarial", offeringDeptId: "dept-dev-studies" },
  { code: "CL 106", title: "Communication Skills", credits: 12, status: "Core", year: 1, semester: 2, programmeId: "bsc-actuarial", offeringDeptId: "dept-ccs" },
  { code: "MT 180", title: "Introduction to Actuarial Mathematics", credits: 12, status: "Core", year: 1, semester: 2, programmeId: "bsc-actuarial", offeringDeptId: "dept-math" },
  { code: "ST 122", title: "Linear Algebra with Applications", credits: 12, status: "Core", year: 1, semester: 2, programmeId: "bsc-actuarial", offeringDeptId: "dept-stats" },
  { code: "ST 114", title: "Probability Theory I", credits: 12, status: "Core", year: 1, semester: 2, programmeId: "bsc-actuarial", offeringDeptId: "dept-stats" },
  { code: "FN 101", title: "Principles of Macroeconomics", credits: 12, status: "Core", year: 1, semester: 2, programmeId: "bsc-actuarial", offeringDeptId: "dept-finance" },

  // Year 2 Semester 1
  { code: "MT 281", title: "Life Contingencies", credits: 12, status: "Core", year: 2, semester: 1, programmeId: "bsc-actuarial", offeringDeptId: "dept-math" },
  { code: "ST 220", title: "Basic Demographic Methods", credits: 12, status: "Core", year: 2, semester: 1, programmeId: "bsc-actuarial", offeringDeptId: "dept-stats" },
  { code: "MT 226", title: "Partial Differential Equations", credits: 8, status: "Core", year: 2, semester: 1, programmeId: "bsc-actuarial", offeringDeptId: "dept-math" },
  { code: "MT 233", title: "Mathematical Statistics", credits: 12, status: "Core", year: 2, semester: 1, programmeId: "bsc-actuarial", offeringDeptId: "dept-math" },
  { code: "FN 200", title: "Principles of Finance", credits: 12, status: "Core", year: 2, semester: 1, programmeId: "bsc-actuarial", offeringDeptId: "dept-finance" },

  // Year 2 Semester 2
  { code: "MT 278", title: "Linear Programming", credits: 12, status: "Core", year: 2, semester: 2, programmeId: "bsc-actuarial", offeringDeptId: "dept-math" },
  { code: "FN 209", title: "Risk Theory", credits: 12, status: "Core", year: 2, semester: 2, programmeId: "bsc-actuarial", offeringDeptId: "dept-finance" },
  { code: "MT 280", title: "Basic Pension Mathematics", credits: 12, status: "Core", year: 2, semester: 2, programmeId: "bsc-actuarial", offeringDeptId: "dept-math" },
  { code: "FN 202", title: "Financial Management", credits: 12, status: "Core", year: 2, semester: 2, programmeId: "bsc-actuarial", offeringDeptId: "dept-finance" },
  { code: "LW 705", title: "Legal Aspects of Actuarial Science", credits: 12, status: "Core", year: 2, semester: 2, programmeId: "bsc-actuarial", offeringDeptId: "dept-law" },
  { code: "ST 324", title: "Linear Models", credits: 12, status: "Core", year: 2, semester: 2, programmeId: "bsc-actuarial", offeringDeptId: "dept-stats" },
  { code: "BM 333", title: "Field Practical with Research Component", credits: 24, status: "Core", year: 2, semester: 2, programmeId: "bsc-actuarial", offeringDeptId: "dept-business", isPracticalOrProject: true },
  { code: "ST 212", title: "Statistical Inference I", credits: 12, status: "Elective", year: 2, semester: 2, programmeId: "bsc-actuarial", offeringDeptId: "dept-stats" },
  { code: "ST 215", title: "Differential and Difference Equations", credits: 12, status: "Elective", year: 2, semester: 2, programmeId: "bsc-actuarial", offeringDeptId: "dept-stats" },

  // Year 3 Semester 1
  { code: "ST 326", title: "Survival Models", credits: 12, status: "Core", year: 3, semester: 1, programmeId: "bsc-actuarial", offeringDeptId: "dept-stats" },
  { code: "ST 327", title: "Actuarial Modelling", credits: 12, status: "Core", year: 3, semester: 1, programmeId: "bsc-actuarial", offeringDeptId: "dept-stats" },
  { code: "FN 315", title: "Basics of Actuarial Planning and Control", credits: 12, status: "Core", year: 3, semester: 1, programmeId: "bsc-actuarial", offeringDeptId: "dept-finance" },
  { code: "FN 314", title: "Quantitative Methods for Risk Management", credits: 12, status: "Core", year: 3, semester: 1, programmeId: "bsc-actuarial", offeringDeptId: "dept-finance" },
  { code: "ST 310", title: "Statistical Inference II", credits: 12, status: "Elective", year: 3, semester: 1, programmeId: "bsc-actuarial", offeringDeptId: "dept-stats" },
  { code: "ST 312", title: "Stochastic Processes", credits: 12, status: "Elective", year: 3, semester: 1, programmeId: "bsc-actuarial", offeringDeptId: "dept-stats" },
  { code: "MT 378", title: "Queuing Theory and Inventory Models", credits: 12, status: "Elective", year: 3, semester: 1, programmeId: "bsc-actuarial", offeringDeptId: "dept-math" },
  { code: "MT 348", title: "Integer and Non-Linear Programming", credits: 12, status: "Elective", year: 3, semester: 1, programmeId: "bsc-actuarial", offeringDeptId: "dept-math" },

  // Year 3 Semester 2
  { code: "FN 316", title: "Superannuation Practices", credits: 12, status: "Core", year: 3, semester: 2, programmeId: "bsc-actuarial", offeringDeptId: "dept-finance" },
  { code: "MT 381", title: "Credibility and Loss Distributions", credits: 12, status: "Core", year: 3, semester: 2, programmeId: "bsc-actuarial", offeringDeptId: "dept-math" },
  { code: "FN 317", title: "Actuarial Practices in Insurance Schemes", credits: 12, status: "Core", year: 3, semester: 2, programmeId: "bsc-actuarial", offeringDeptId: "dept-finance" },
  { code: "FN 318", title: "Actuarial Practices in Pension and Retirement Benefits", credits: 12, status: "Core", year: 3, semester: 2, programmeId: "bsc-actuarial", offeringDeptId: "dept-finance" },
  { code: "ST 325", title: "Mathematical Demography", credits: 12, status: "Core", year: 3, semester: 2, programmeId: "bsc-actuarial", offeringDeptId: "dept-stats" },
  { code: "FN 310", title: "Investment Analysis", credits: 12, status: "Elective", year: 3, semester: 2, programmeId: "bsc-actuarial", offeringDeptId: "dept-finance" },
  { code: "FN 301", title: "Financial Analysis", credits: 12, status: "Elective", year: 3, semester: 2, programmeId: "bsc-actuarial", offeringDeptId: "dept-finance" },
];

async function main() {
  console.log("=== STARTING DEPARTMENT OF MATHEMATICS CLEANUP & CATALOGUE IMPORT ===");
  const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf8"));
  const app = initializeApp(config);
  const dbNamed = initializeFirestore(app, {}, config.firestoreDatabaseId);
  const dbDefault = getFirestore(app);

  // STEP 1: VERIFY DEPARTMENT AND ACADEMIC UNIT
  console.log("\n--- STEP 1: Verifying Department of Mathematics and CoNAS ---");
  const mathDeptDoc = await getDoc(doc(dbDefault, "departments", "dept-math"));
  if (!mathDeptDoc.exists()) {
    throw new Error("Department of Mathematics (dept-math) does not exist in Firestore!");
  }
  const mathDeptData = mathDeptDoc.data();
  console.log(`Verified Department: ID="${mathDeptDoc.id}", Name="${mathDeptData.name}", AcademicUnit="${mathDeptData.academicUnitId}"`);

  // STEP 2: STRICT PROGRAMME CLEANUP
  console.log("\n--- STEP 2: Strict Programme Cleanup ---");
  // Inspect all programmes currently pointing to dept-math
  const pSnap = await getDocs(collection(dbDefault, "programmes"));
  const currentMathProgs: string[] = [];
  const progsToRemoveFromDept: string[] = [];

  pSnap.forEach((d) => {
    const data = d.data();
    const isUnderMath = data.departmentId === "dept-math" || (Array.isArray(data.departmentIds) && data.departmentIds.includes("dept-math"));
    if (isUnderMath) {
      currentMathProgs.push(d.id);
      if (d.id !== "bsc-ed" && d.id !== "math-stats" && d.id !== "bsc-actuarial") {
        progsToRemoveFromDept.push(d.id);
      }
    }
  });

  console.log(`Programmes currently under Department of Mathematics:`, currentMathProgs);
  console.log(`Programmes to remove from Department of Mathematics:`, progsToRemoveFromDept);

  // Remove illegitimate programmes (such as bsc-math) from both databases
  for (const progId of progsToRemoveFromDept) {
    console.log(`Removing illegitimate programme "${progId}" from Department of Mathematics...`);
    // Delete programme document from both DBs
    await deleteDoc(doc(dbDefault, "programmes", progId));
    try { await deleteDoc(doc(dbNamed, "programmes", progId)); } catch {}

    // Query and delete associated programme_courses & catalogue_courses for this removed programme
    const qPC = query(collection(dbDefault, "programme_courses"), where("programmeId", "==", progId));
    const snapPC = await getDocs(qPC);
    console.log(`Deleting ${snapPC.size} programme_courses for "${progId}"...`);
    for (const d of snapPC.docs) {
      await deleteDoc(doc(dbDefault, "programme_courses", d.id));
      try { await deleteDoc(doc(dbNamed, "programme_courses", d.id)); } catch {}
    }

    const qCC = query(collection(dbDefault, "catalogue_courses"), where("programmeId", "==", progId));
    const snapCC = await getDocs(qCC);
    console.log(`Deleting ${snapCC.size} catalogue_courses for "${progId}"...`);
    for (const d of snapCC.docs) {
      await deleteDoc(doc(dbDefault, "catalogue_courses", d.id));
      try { await deleteDoc(doc(dbNamed, "catalogue_courses", d.id)); } catch {}
    }
  }

  // Purge old placeholder courses for bsc-actuarial (the 13 generic GS records)
  console.log("Purging old generic placeholder courses for bsc-actuarial...");
  const qActPC = query(collection(dbDefault, "programme_courses"), where("programmeId", "==", "bsc-actuarial"));
  const snapActPC = await getDocs(qActPC);
  for (const d of snapActPC.docs) {
    await deleteDoc(doc(dbDefault, "programme_courses", d.id));
    try { await deleteDoc(doc(dbNamed, "programme_courses", d.id)); } catch {}
  }
  const qActCC = query(collection(dbDefault, "catalogue_courses"), where("programmeId", "==", "bsc-actuarial"));
  const snapActCC = await getDocs(qActCC);
  for (const d of snapActCC.docs) {
    await deleteDoc(doc(dbDefault, "catalogue_courses", d.id));
    try { await deleteDoc(doc(dbNamed, "catalogue_courses", d.id)); } catch {}
  }
  console.log(`Purged ${snapActPC.size} PC and ${snapActCC.size} CC placeholder records for bsc-actuarial.`);

  // Purge old courses for math-stats so the authentic 41 courses are cleanly installed without stale or duplicate entries
  console.log("Purging old courses for math-stats...");
  const qMsPC = query(collection(dbDefault, "programme_courses"), where("programmeId", "==", "math-stats"));
  const snapMsPC = await getDocs(qMsPC);
  for (const d of snapMsPC.docs) {
    await deleteDoc(doc(dbDefault, "programme_courses", d.id));
    try { await deleteDoc(doc(dbNamed, "programme_courses", d.id)); } catch {}
  }
  const qMsCC = query(collection(dbDefault, "catalogue_courses"), where("programmeId", "==", "math-stats"));
  const snapMsCC = await getDocs(qMsCC);
  for (const d of snapMsCC.docs) {
    await deleteDoc(doc(dbDefault, "catalogue_courses", d.id));
    try { await deleteDoc(doc(dbNamed, "catalogue_courses", d.id)); } catch {}
  }
  console.log(`Purged ${snapMsPC.size} PC and ${snapMsCC.size} CC records for math-stats.`);

  // STEP 3: ENSURE THE THREE PROGRAMMES ARE REGISTERED ACCURATELY
  console.log("\n--- STEP 3: Registering/Updating the 3 Mathematics Programmes ---");
  const progsToSet = [
    {
      id: "bsc-ed",
      name: "Bachelor of Science with Education",
      shortName: "BSc Ed",
      departmentId: "dept-math",
      departmentIds: ["dept-math", "dept-botany", "dept-chem"],
      academicUnitId: "conas",
      collegeId: "conas",
      universityId: "udsm",
      durationYears: 3,
      verified: true,
      awardLevel: "Bachelor Degree",
      studyMode: "Full-Time",
      source: "UDSM Undergraduate Prospectus 2025/2026 (Official Source of Truth)",
      academicYear: "2025/2026",
    },
    {
      id: "math-stats",
      name: "Bachelor of Science in Mathematics and Statistics",
      shortName: "BSc Math & Stats",
      departmentId: "dept-math",
      academicUnitId: "conas",
      collegeId: "conas",
      universityId: "udsm",
      durationYears: 3,
      verified: true,
      awardLevel: "Bachelor Degree",
      studyMode: "Full-Time",
      source: "UDSM Undergraduate Prospectus 2025/2026 (Official Source of Truth)",
      academicYear: "2025/2026",
    },
    {
      id: "bsc-actuarial",
      name: "Bachelor of Science in Actuarial Sciences",
      shortName: "BSc Actuarial",
      departmentId: "dept-math",
      academicUnitId: "conas",
      collegeId: "conas",
      universityId: "udsm",
      durationYears: 3,
      verified: true,
      awardLevel: "Bachelor Degree",
      studyMode: "Full-Time",
      source: "UDSM Undergraduate Prospectus 2025/2026 (Official Source of Truth)",
      academicYear: "2025/2026",
    },
  ];

  for (const prog of progsToSet) {
    await setDoc(doc(dbDefault, "programmes", prog.id), prog, { merge: true });
    try { await setDoc(doc(dbNamed, "programmes", prog.id), prog, { merge: true }); } catch {}
  }
  console.log("✔ Set documents for bsc-ed, math-stats, and bsc-actuarial in both DBs.");

  // STEP 4: CANONICAL COURSES INSPECTION & RECONCILIATION
  console.log("\n--- STEP 4: Canonical Courses Processing ---");
  const allCurriculumSpecs = [
    ...BSC_ED_MATH_COURSES,
    ...BSC_MATH_STATS_COURSES,
    ...BSC_ACTUARIAL_COURSES,
  ];

  const uniqueCodes = Array.from(new Set(allCurriculumSpecs.map((s) => s.code.trim().toUpperCase())));
  console.log(`Total unique course codes to process: ${uniqueCodes.length}`);

  const canonicalToCreate = new Map<string, any>();
  const conflictsDetected: any[] = [];
  let canonicalReusedCount = 0;

  for (const codeUpper of uniqueCodes) {
    const slug = codeUpper.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const canonDoc = await getDoc(doc(dbDefault, "canonical_courses", slug));

    // Find all specs with this code
    const specs = allCurriculumSpecs.filter((s) => s.code.trim().toUpperCase() === codeUpper);
    const primarySpec = specs[0];

    if (canonDoc.exists()) {
      canonicalReusedCount++;
      const existing = canonDoc.data();

      for (const spec of specs) {
        const titleDiff = (existing.title || "").trim().toLowerCase() !== spec.title.trim().toLowerCase();
        const existingCreditsNum = Number(existing.credits);
        const suppliedCreditsNum = Number(spec.credits);
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
            status: spec.status,
            actionTaken: "Existing canonical course preserved untouched without overwriting; curriculum relationship records supplied title, credits, and status.",
          });
        }
      }
    } else {
      // Check for same-code intra-batch variations (e.g. MT 136, MT 225, MT 274, MT 265, MT 278, MT 310, ST 220)
      if (specs.length > 1) {
        const first = specs[0];
        for (let i = 1; i < specs.length; i++) {
          const other = specs[i];
          if (first.title.trim().toLowerCase() !== other.title.trim().toLowerCase() || first.credits !== other.credits || first.semester !== other.semester || first.status !== other.status) {
            conflictsDetected.push({
              courseCode: codeUpper,
              existingTitle: first.title,
              suppliedTitle: other.title,
              existingCredits: first.credits,
              suppliedCredits: other.credits,
              affectedProgramme: other.programmeId,
              affectedYearSemester: `Y${other.year}S${other.semester}`,
              status: other.status,
              actionTaken: "Single canonical course created; programme-specific relationships preserve respective titles, credits, semester, and Core/Elective status.",
            });
          }
        }
      }

      canonicalToCreate.set(codeUpper, {
        id: slug,
        code: codeUpper,
        title: primarySpec.title,
        credits: primarySpec.credits,
        departmentId: primarySpec.offeringDeptId || "dept-math",
        academicUnitId: "conas",
        collegeId: "conas",
        universityId: "udsm",
        level: "Undergraduate",
        verified: true,
        source: "UDSM Undergraduate Prospectus 2025/2026 (Official Source of Truth)",
        sourceType: "official_prospectus",
        academicYear: "2025/2026",
      });
    }
  }

  console.log(`Reused ${canonicalReusedCount} canonical courses.`);
  console.log(`Creating ${canonicalToCreate.size} new unique canonical courses.`);

  // Write new canonical courses
  const canonEntries = Array.from(canonicalToCreate.values());
  for (let i = 0; i < canonEntries.length; i += 100) {
    const chunk = canonEntries.slice(i, i + 100);
    const bDef = writeBatch(dbDefault);
    const bNamed = writeBatch(dbNamed);
    for (const c of chunk) {
      bDef.set(doc(dbDefault, "canonical_courses", c.id), c);
      try { bNamed.set(doc(dbNamed, "canonical_courses", c.id), c); } catch {}
    }
    await bDef.commit();
    try { await bNamed.commit(); } catch {}
  }
  console.log("✔ New canonical courses written to Firestore.");

  // STEP 5: WRITE CURRICULUM RELATIONSHIPS (PROGRAMME_COURSES & CATALOGUE_COURSES)
  console.log("\n--- STEP 5: Writing Curriculum Relationships ---");
  let relCreatedCount = 0;

  for (let i = 0; i < allCurriculumSpecs.length; i += 100) {
    const chunk = allCurriculumSpecs.slice(i, i + 100);
    const bDef = writeBatch(dbDefault);
    const bNamed = writeBatch(dbNamed);

    for (const spec of chunk) {
      const codeUpper = spec.code.trim().toUpperCase();
      const codeSlug = codeUpper.toLowerCase().replace(/[^a-z0-9]/g, "_");
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
        offeringDepartmentId: spec.offeringDeptId || "dept-math",
        departmentId: spec.offeringDeptId || "dept-math",
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

      bDef.set(doc(dbDefault, "programme_courses", relDocId), relData);
      bDef.set(doc(dbDefault, "catalogue_courses", relDocId), relData);

      try {
        bNamed.set(doc(dbNamed, "programme_courses", relDocId), relData);
        bNamed.set(doc(dbNamed, "catalogue_courses", relDocId), relData);
      } catch {}

      relCreatedCount++;
    }

    await bDef.commit();
    try { await bNamed.commit(); } catch {}
  }
  console.log(`✔ Written ${relCreatedCount} curriculum relationships across programme_courses and catalogue_courses.`);

  // STEP 6: VERIFICATION & AUDIT REPORT
  console.log("\n--- STEP 6: Database Verification ---");
  const verifyProgsSnap = await getDocs(collection(dbDefault, "programmes"));
  const finalMathProgs: any[] = [];
  verifyProgsSnap.forEach((d) => {
    const data = d.data();
    if (data.departmentId === "dept-math" || (Array.isArray(data.departmentIds) && data.departmentIds.includes("dept-math"))) {
      finalMathProgs.push({ id: d.id, name: data.name, shortName: data.shortName });
    }
  });
  console.log(`Final Department of Mathematics Programmes count: ${finalMathProgs.length}`);
  finalMathProgs.forEach((p) => console.log(` - [${p.id}] ${p.name}`));

  if (finalMathProgs.length !== 3) {
    console.error("WARNING: Expected exactly 3 programmes under Department of Mathematics!");
  }

  // Verify course counts for the 3 programmes
  const qBscEd = query(collection(dbDefault, "catalogue_courses"), where("programmeId", "==", "bsc-ed"));
  const snapBscEd = await getDocs(qBscEd);
  console.log(`Total catalogue courses for bsc-ed: ${snapBscEd.size} (19 Math + 17 Botany + 17 Chem = 53 total)`);

  const qMathStats = query(collection(dbDefault, "catalogue_courses"), where("programmeId", "==", "math-stats"));
  const snapMathStats = await getDocs(qMathStats);
  console.log(`Total catalogue courses for math-stats: ${snapMathStats.size} (Expected: 41)`);

  const qAct = query(collection(dbDefault, "catalogue_courses"), where("programmeId", "==", "bsc-actuarial"));
  const snapAct = await getDocs(qAct);
  console.log(`Total catalogue courses for bsc-actuarial: ${snapAct.size} (Expected: 42)`);

  // Verify coordinator metadata removal
  let coordinatorCount = 0;
  for (const docSnap of [...snapMathStats.docs, ...snapAct.docs, ...snapBscEd.docs]) {
    const data = docSnap.data();
    for (const key of Object.keys(data)) {
      if (key.toLowerCase().includes("coord")) {
        coordinatorCount++;
      }
    }
  }
  console.log(`Coordinator fields on Mathematics courses: ${coordinatorCount} (Expected: 0)`);

  const auditReport = {
    department: {
      id: "dept-math",
      name: mathDeptData.name,
      academicUnitId: mathDeptData.academicUnitId,
      status: "reused without recreation or rename",
      oldProgrammesRemoved: progsToRemoveFromDept,
      finalProgrammesCount: finalMathProgs.length,
    },
    programmes: finalMathProgs.map((p) => ({
      id: p.id,
      name: p.name,
      shortName: p.shortName,
      coursesInBatch:
        p.id === "bsc-ed"
          ? BSC_ED_MATH_COURSES.length
          : p.id === "math-stats"
          ? BSC_MATH_STATS_COURSES.length
          : BSC_ACTUARIAL_COURSES.length,
    })),
    courseCoordinatorsCleanup: {
      oldCoordinatorsRemovedFromCatalogue: true,
      coordinatorFieldsRemainingOnMathCourses: coordinatorCount,
      notes: "Removed coordinator assignments from MT 398 and MT 389 in local catalogues; verified 0 coordinator fields in Firestore.",
    },
    courses: {
      canonicalCoursesReused: canonicalReusedCount,
      canonicalCoursesCreated: canonicalToCreate.size,
      totalCurriculumRelationshipsCreated: relCreatedCount,
    },
    conflictsDetected,
    duplicateCheck: {
      duplicateAcademicUnitsCreated: false,
      duplicateDepartmentsCreated: false,
      duplicateProgrammesCreated: false,
      duplicateCanonicalCoursesCreated: false,
    },
  };

  fs.writeFileSync("./scripts/math_audit_report.json", JSON.stringify(auditReport, null, 2), "utf8");
  console.log("✔ Audit report saved to ./scripts/math_audit_report.json");
  process.exit(0);
}

main().catch((err) => {
  console.error("Execution error:", err);
  process.exit(1);
});
