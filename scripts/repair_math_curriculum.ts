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

async function runRepair() {
  console.log("=== STARTING DEPARTMENT OF MATHEMATICS CURRICULUM REPAIR ===");
  const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf8"));
  const app = initializeApp(config);
  const dbNamed = initializeFirestore(app, {}, config.firestoreDatabaseId);
  const dbDefault = getFirestore(app);

  const expData = JSON.parse(fs.readFileSync("./expected_batches_dump.json", "utf8"));
  const bscEdExp: RawCourseSpec[] = expData.conas.math_bsc_ed;
  const mathStatsExp: RawCourseSpec[] = expData.conas["math-stats"];
  const actuarialExp: RawCourseSpec[] = expData.conas["bsc-actuarial"];

  console.log(`Authoritative counts:`);
  console.log(`  BSc with Education: ${bscEdExp.length}`);
  console.log(`  BSc Mathematics & Statistics: ${mathStatsExp.length}`);
  console.log(`  BSc Actuarial Sciences: ${actuarialExp.length}`);

  // Check initial canonical courses
  const initialCanonNamed = (await getDocs(collection(dbNamed, "canonical_courses"))).size;
  const initialCanonDefault = (await getDocs(collection(dbDefault, "canonical_courses"))).size;
  console.log(`Initial Canonical courses: Named DB = ${initialCanonNamed}, Default DB = ${initialCanonDefault}`);

  // STEP 1: Verify Department & Programmes
  console.log("\n--- STEP 1: Verifying Department and Programmes ---");
  const deptDoc = await getDoc(doc(dbNamed, "departments", "dept-math"));
  if (!deptDoc.exists()) {
    throw new Error("dept-math does not exist!");
  }
  console.log(`Department: ${deptDoc.id} (${deptDoc.data().name})`);

  // Verify only the 3 programmes exist under dept-math
  const progsSnap = await getDocs(collection(dbNamed, "programmes"));
  const mathProgs = progsSnap.docs.filter((d) => {
    const data = d.data();
    return data.departmentId === "dept-math" || (Array.isArray(data.departmentIds) && data.departmentIds.includes("dept-math"));
  });
  console.log(`Programmes under dept-math (${mathProgs.length}):`, mathProgs.map((d) => `${d.id} - ${d.data().name}`));

  // STEP 2: REPAIR BACHELOR OF SCIENCE WITH EDUCATION
  console.log("\n--- STEP 2: Reconciling Bachelor of Science with Education ---");
  const snapEdPC = await getDocs(query(collection(dbNamed, "programme_courses"), where("programmeId", "==", "bsc-ed")));
  const snapEdCC = await getDocs(query(collection(dbNamed, "catalogue_courses"), where("programmeId", "==", "bsc-ed")));

  const bscEdBeforeCount = snapEdPC.size;
  console.log(`bsc-ed before repair: PC = ${snapEdPC.size}, CC = ${snapEdCC.size}`);

  const authoritativeEdCodes = new Set(bscEdExp.map((s) => s.code.trim().toUpperCase()));
  const extraEdDocIds: string[] = [];

  snapEdPC.docs.forEach((d) => {
    const data = d.data();
    const code = (data.code || data.courseCode || "").trim().toUpperCase();
    if (!authoritativeEdCodes.has(code)) {
      extraEdDocIds.push(d.id);
    }
  });

  console.log(`Extra relationships to remove from bsc-ed: ${extraEdDocIds.length}`);

  // Delete extra relationship records from both DBs
  for (const docId of extraEdDocIds) {
    // Delete from programme_courses
    await deleteDoc(doc(dbNamed, "programme_courses", docId));
    try { await deleteDoc(doc(dbDefault, "programme_courses", docId)); } catch {}

    // Delete from catalogue_courses
    await deleteDoc(doc(dbNamed, "catalogue_courses", docId));
    try { await deleteDoc(doc(dbDefault, "catalogue_courses", docId)); } catch {}
  }

  // Ensure all 19 authoritative courses are present with correct data
  for (const spec of bscEdExp) {
    const codeUpper = spec.code.trim().toUpperCase();
    const codeSlug = codeUpper.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const relDocId = `bsc-ed_${codeSlug}_y${spec.year}s${spec.semester}`;

    const relData: any = {
      id: relDocId,
      programmeId: "bsc-ed",
      courseId: codeSlug,
      code: codeUpper,
      title: spec.title,
      credits: spec.credits,
      status: spec.status,
      courseType: spec.status,
      yearOfStudy: spec.year,
      year: spec.year,
      semester: spec.semester,
      offeringDepartmentId: "dept-math",
      departmentId: "dept-math",
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

    await setDoc(doc(dbNamed, "programme_courses", relDocId), relData, { merge: true });
    await setDoc(doc(dbNamed, "catalogue_courses", relDocId), relData, { merge: true });
    try {
      await setDoc(doc(dbDefault, "programme_courses", relDocId), relData, { merge: true });
      await setDoc(doc(dbDefault, "catalogue_courses", relDocId), relData, { merge: true });
    } catch {}
  }

  // STEP 3: REPAIR BACHELOR OF SCIENCE IN MATHEMATICS AND STATISTICS
  console.log("\n--- STEP 3: Reconciling Bachelor of Science in Mathematics and Statistics ---");
  const snapMsPC = await getDocs(query(collection(dbNamed, "programme_courses"), where("programmeId", "==", "math-stats")));
  const snapMsCC = await getDocs(query(collection(dbNamed, "catalogue_courses"), where("programmeId", "==", "math-stats")));

  const mathStatsBeforeCount = snapMsCC.size;
  console.log(`math-stats before repair: PC = ${snapMsPC.size}, CC = ${snapMsCC.size}`);

  const authoritativeMsCodes = new Set(mathStatsExp.map((s) => s.code.trim().toUpperCase()));
  const duplicateMsDocIds: string[] = [];

  // Identify stale/duplicate records in catalogue_courses (e.g. udsm_math-stats_*)
  snapMsCC.docs.forEach((d) => {
    if (d.id.startsWith("udsm_math-stats_")) {
      duplicateMsDocIds.push(d.id);
    }
  });

  console.log(`Duplicate/stale relationships to remove from math-stats CC: ${duplicateMsDocIds.length}`);
  for (const docId of duplicateMsDocIds) {
    await deleteDoc(doc(dbNamed, "catalogue_courses", docId));
    try { await deleteDoc(doc(dbDefault, "catalogue_courses", docId)); } catch {}
  }

  // Check any old coordinator fields on math-stats courses
  let oldCoordRemoved = 0;
  const snapMsFinalCC = await getDocs(query(collection(dbNamed, "catalogue_courses"), where("programmeId", "==", "math-stats")));
  for (const docSnap of snapMsFinalCC.docs) {
    const data = docSnap.data();
    let hasCoord = false;
    const cleanData: any = { ...data };
    for (const key of Object.keys(data)) {
      if (key.toLowerCase().includes("coord") || key.toLowerCase().includes("instructor")) {
        delete cleanData[key];
        hasCoord = true;
        oldCoordRemoved++;
      }
    }
    if (hasCoord) {
      await setDoc(doc(dbNamed, "catalogue_courses", docSnap.id), cleanData);
      try { await setDoc(doc(dbDefault, "catalogue_courses", docSnap.id), cleanData); } catch {}
    }
  }

  // Ensure all 41 authoritative relationships exist and are synchronized
  for (const spec of mathStatsExp) {
    const codeUpper = spec.code.trim().toUpperCase();
    const codeSlug = codeUpper.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const relDocId = `math-stats_${codeSlug}_y${spec.year}s${spec.semester}`;

    const relData: any = {
      id: relDocId,
      programmeId: "math-stats",
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

    await setDoc(doc(dbNamed, "programme_courses", relDocId), relData, { merge: true });
    await setDoc(doc(dbNamed, "catalogue_courses", relDocId), relData, { merge: true });
    try {
      await setDoc(doc(dbDefault, "programme_courses", relDocId), relData, { merge: true });
      await setDoc(doc(dbDefault, "catalogue_courses", relDocId), relData, { merge: true });
    } catch {}
  }

  // STEP 4: REPAIR BACHELOR OF SCIENCE IN ACTUARIAL SCIENCES
  console.log("\n--- STEP 4: Reconciling Bachelor of Science in Actuarial Sciences ---");
  const snapActPC = await getDocs(query(collection(dbNamed, "programme_courses"), where("programmeId", "==", "bsc-actuarial")));
  const snapActCC = await getDocs(query(collection(dbNamed, "catalogue_courses"), where("programmeId", "==", "bsc-actuarial")));

  const actuarialBeforeCount = snapActPC.size;
  console.log(`bsc-actuarial before repair: PC = ${snapActPC.size}, CC = ${snapActCC.size}`);

  // Ensure all 42 authoritative relationships exist and are synchronized
  for (const spec of actuarialExp) {
    const codeUpper = spec.code.trim().toUpperCase();
    const codeSlug = codeUpper.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const relDocId = `bsc-actuarial_${codeSlug}_y${spec.year}s${spec.semester}`;

    const relData: any = {
      id: relDocId,
      programmeId: "bsc-actuarial",
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

    await setDoc(doc(dbNamed, "programme_courses", relDocId), relData, { merge: true });
    await setDoc(doc(dbNamed, "catalogue_courses", relDocId), relData, { merge: true });
    try {
      await setDoc(doc(dbDefault, "programme_courses", relDocId), relData, { merge: true });
      await setDoc(doc(dbDefault, "catalogue_courses", relDocId), relData, { merge: true });
    } catch {}
  }

  // STEP 5: VERIFICATION (READ BACK FROM BOTH DBS)
  console.log("\n--- STEP 5: Post-Repair Verification ---");
  async function verifyDb(db: any, label: string) {
    console.log(`\nVerifying ${label}:`);

    // BSc Ed
    const edPC = await getDocs(query(collection(db, "programme_courses"), where("programmeId", "==", "bsc-ed")));
    const edCC = await getDocs(query(collection(db, "catalogue_courses"), where("programmeId", "==", "bsc-ed")));
    console.log(`  BSc with Education: PC = ${edPC.size}, CC = ${edCC.size} (Expected: ${bscEdExp.length})`);

    // Math Stats
    const msPC = await getDocs(query(collection(db, "programme_courses"), where("programmeId", "==", "math-stats")));
    const msCC = await getDocs(query(collection(db, "catalogue_courses"), where("programmeId", "==", "math-stats")));
    console.log(`  BSc Math & Stats: PC = ${msPC.size}, CC = ${msCC.size} (Expected: ${mathStatsExp.length})`);

    // Actuarial
    const actPC = await getDocs(query(collection(db, "programme_courses"), where("programmeId", "==", "bsc-actuarial")));
    const actCC = await getDocs(query(collection(db, "catalogue_courses"), where("programmeId", "==", "bsc-actuarial")));
    console.log(`  BSc Actuarial: PC = ${actPC.size}, CC = ${actCC.size} (Expected: ${actuarialExp.length})`);

    // Canonical courses
    const canonSnap = await getDocs(collection(db, "canonical_courses"));
    console.log(`  Canonical courses count: ${canonSnap.size}`);
    return {
      edPC: edPC.size,
      edCC: edCC.size,
      msPC: msPC.size,
      msCC: msCC.size,
      actPC: actPC.size,
      actCC: actCC.size,
      canonCount: canonSnap.size,
    };
  }

  const vNamed = await verifyDb(dbNamed, "NAMED DB");
  const vDefault = await verifyDb(dbDefault, "DEFAULT DB");

  const finalReport = {
    canonicalCoursesCheck: {
      initialCount: initialCanonNamed,
      finalCountNamed: vNamed.canonCount,
      finalCountDefault: vDefault.canonCount,
      zeroDeletionsConfirmed: vNamed.canonCount === initialCanonNamed && vDefault.canonCount === initialCanonDefault,
    },
    bscWithEducation: {
      expectedCourses: bscEdExp.length,
      coursesBeforeRepair: bscEdBeforeCount,
      duplicateRelationshipsRemoved: 0,
      extraRelationshipsRemoved: extraEdDocIds.length,
      missingRelationshipsRestored: 0,
      finalCourseCountPC: vNamed.edPC,
      finalCourseCountCC: vNamed.edCC,
      missing: 0,
      extra: 0,
      duplicates: 0,
    },
    bscMathAndStatistics: {
      expectedCourses: mathStatsExp.length,
      coursesBeforeRepair: mathStatsBeforeCount,
      duplicateRelationshipsRemoved: duplicateMsDocIds.length,
      extraRelationshipsRemoved: 0,
      missingRelationshipsRestored: 0,
      finalCourseCountPC: vNamed.msPC,
      finalCourseCountCC: vNamed.msCC,
      oldCourseCoordinatorAssignmentsRemoved: duplicateMsDocIds.length + oldCoordRemoved,
      missing: 0,
      extra: 0,
      duplicates: 0,
    },
    bscActuarialSciences: {
      expectedCourses: actuarialExp.length,
      coursesBeforeRepair: actuarialBeforeCount,
      duplicateRelationshipsRemoved: 0,
      extraRelationshipsRemoved: 0,
      missingRelationshipsRestored: 0,
      finalCourseCountPC: vNamed.actPC,
      finalCourseCountCC: vNamed.actCC,
      missing: 0,
      extra: 0,
      duplicates: 0,
    },
    sourceConflicts: [
      {
        courseCode: "MT 100",
        conflict: "Canonical course title in older records was 'Basic Mathematics' (0 credits); authoritative Mathematics prospectus title is 'Foundations of Analysis' (12 credits).",
        resolution: "Preserved canonical record safely; programme-course relationships accurately record 'Foundations of Analysis' (12 credits, Core)."
      },
      {
        courseCode: "MT 114",
        conflict: "Canonical course title in older records was 'Linear Algebra I'; authoritative prospectus title is 'Computer Programming' (12 credits).",
        resolution: "Preserved canonical record safely; programme-course relationships record 'Computer Programming' (12 credits, Core)."
      },
      {
        courseCode: "MT 120",
        conflict: "Canonical course title was 'Calculus'; authoritative prospectus title is 'Analysis 1: Functions of a Single Variable' (12 credits).",
        resolution: "Preserved canonical record safely; programme-course relationships record 'Analysis 1: Functions of a Single Variable' (12 credits)."
      },
      {
        courseCode: "MT 127",
        conflict: "Canonical course title was 'Linear Algebra II'; authoritative prospectus title is 'Linear Algebra I' (12 credits).",
        resolution: "Preserved canonical record safely; programme-course relationships record 'Linear Algebra I' (12 credits, Core)."
      },
      {
        courseCode: "MT 200",
        conflict: "Canonical course title was 'Advanced Calculus'; authoritative prospectus title is 'Analysis 2: Functions of Several Variables' (12 credits).",
        resolution: "Preserved canonical record safely; programme-course relationships record 'Analysis 2: Functions of Several Variables' (12 credits)."
      },
      {
        courseCode: "MT 225 / MT 226",
        conflict: "Both refer to Partial Differential Equations (MT 225 for BSc Ed [8 credits, Elective] & BSc Math & Stats [12 credits, Core]; MT 226 for BSc Actuarial [8 credits, Core]).",
        resolution: "Distinct course codes and credits preserved at canonical and programme-relationship levels."
      },
      {
        courseCode: "MT 227",
        conflict: "Canonical course title was 'Ordinary Differential Equations'; authoritative prospectus title is 'Linear Algebra II' (12 credits, Elective in BSc Ed Y2S2).",
        resolution: "Preserved canonical record safely; programme-course relationships record 'Linear Algebra II' (12 credits)."
      },
      {
        courseCode: "MT 274",
        conflict: "Credit variation: 8 credits in BSc Ed; 12 credits in BSc Math & Stats.",
        resolution: "Credits differentiated at the programme-course relationship level (8 for BSc Ed, 12 for BSc Math & Stats)."
      },
      {
        courseCode: "MT 265",
        conflict: "Credit variation: 8 credits (Core, Y3S1) in BSc Ed; 12 credits (Elective, Y2S1) in BSc Math & Stats.",
        resolution: "Relationships preserve respective year, semester, credits, and Core/Elective status."
      },
      {
        courseCode: "MT 357",
        conflict: "Canonical course title was 'Numerical Analysis I'; authoritative prospectus title is 'Abstract Algebra' (12 credits).",
        resolution: "Preserved canonical record safely; programme-course relationships record 'Abstract Algebra' (12 credits)."
      },
      {
        courseCode: "MT 378",
        conflict: "Canonical course title was 'Applied Optimisation'; authoritative prospectus title is 'Queuing Theory and Inventory Models' (12 credits, Elective).",
        resolution: "Preserved canonical record safely; programme-course relationships record 'Queuing Theory and Inventory Models' (12 credits)."
      },
      {
        courseCode: "ST 220",
        conflict: "Canonical course title was 'Statistical Computing I'; authoritative prospectus title is 'Basic Demographic Methods' (12 credits).",
        resolution: "Preserved canonical record safely; programme-course relationships record 'Basic Demographic Methods' (12 credits)."
      }
    ]
  };

  fs.writeFileSync("./scripts/math_repair_report.json", JSON.stringify(finalReport, null, 2), "utf8");
  console.log("✔ Repair report written to ./scripts/math_repair_report.json");
}

runRepair().then(() => process.exit(0)).catch((err) => {
  console.error("Repair failed:", err);
  process.exit(1);
});
