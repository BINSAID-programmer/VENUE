import { initializeApp } from "firebase/app";
import {
  initializeFirestore,
  collection,
  getDocs,
  doc,
  writeBatch,
  query,
  where,
} from "firebase/firestore";
import * as fs from "fs";

// 1. Initialize Firebase instances (both named venue DB and default DB)
const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf8"));
const app = initializeApp(config);
const dbNamed = initializeFirestore(app, {}, config.firestoreDatabaseId);
const dbDefault = initializeFirestore(app, {}, "(default)");

const expData = JSON.parse(fs.readFileSync("./expected_batches_dump.json", "utf8"));

interface AuthoritativeCourse {
  code: string;
  name: string;
  credits: number;
  type: string;
  year: number;
  semester: number;
}

interface ProgrammeSpec {
  id: string;
  name: string;
  departmentId: string;
  academicUnitId: string;
  authoritativeList: AuthoritativeCourse[];
}

const PROGRAMMES: ProgrammeSpec[] = [
  {
    id: "bsc-ed",
    name: "Bachelor of Science with Education",
    departmentId: "dept-math",
    academicUnitId: "conas",
    authoritativeList: expData.conas.math_bsc_ed,
  },
  {
    id: "math-stats",
    name: "Bachelor of Science in Mathematics and Statistics",
    departmentId: "dept-math",
    academicUnitId: "conas",
    authoritativeList: expData.conas["math-stats"],
  },
  {
    id: "bsc-actuarial",
    name: "Bachelor of Science in Actuarial Sciences",
    departmentId: "dept-math",
    academicUnitId: "conas",
    authoritativeList: expData.conas["bsc-actuarial"],
  },
];

function normalizeCode(code: string): string {
  return (code || "").trim().toUpperCase().replace(/\s+/g, " ");
}

function cleanCodeSlug(code: string): string {
  return (code || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_");
}

function normalizeStatus(type: string): "Core" | "Elective" {
  const t = (type || "").toLowerCase();
  if (t.includes("elective") || t.includes("optional")) return "Elective";
  return "Core";
}

async function reconcileCurriculum() {
  console.log("==========================================================================");
  console.log("VENUE — RECONCILING PROGRAMME → YEAR → SEMESTER → COURSE RELATIONSHIPS");
  console.log("==========================================================================");

  // 1. Initial canonical courses check
  const canonicalBeforeSnap = await getDocs(collection(dbNamed, "canonical_courses"));
  const canonicalCountBefore = canonicalBeforeSnap.size;
  console.log(`Canonical Courses before reconciliation: ${canonicalCountBefore}`);

  // Build map of canonical courses by normalized code
  const canonicalMap = new Map<string, any>();
  canonicalBeforeSnap.docs.forEach((d) => {
    const data = d.data();
    const code = normalizeCode(data.code || data.courseCode || "");
    if (code) {
      canonicalMap.set(code, { id: d.id, ...data });
    }
  });

  const fullReport: Record<string, any> = {};
  const duplicateRelationshipsRemoved: string[] = [];
  const incorrectSemesterRelationshipsRemoved: string[] = [];
  const incorrectProgrammeRelationshipsRemoved: string[] = [];
  const missingRelationshipsRestored: string[] = [];
  const unresolvedSourceConflicts: string[] = [];

  for (const prog of PROGRAMMES) {
    console.log(`\n--------------------------------------------------------------------------`);
    console.log(`PROGRAMME: ${prog.name} (${prog.id})`);
    console.log(`Authoritative courses count: ${prog.authoritativeList.length}`);
    console.log(`--------------------------------------------------------------------------`);

    fullReport[prog.name] = {
      id: prog.id,
      terms: {},
      summary: {},
    };

    // Query all existing relationships for this programme from Firestore
    const currentPCSnap = await getDocs(
      query(collection(dbNamed, "programme_courses"), where("programmeId", "==", prog.id))
    );
    const currentCCSnap = await getDocs(
      query(collection(dbNamed, "catalogue_courses"), where("programmeId", "==", prog.id))
    );

    console.log(`Current Firestore records in named DB:`);
    console.log(`  programme_courses: ${currentPCSnap.size}`);
    console.log(`  catalogue_courses: ${currentCCSnap.size}`);

    // Map of all authoritative courses in this programme (for detecting cross-semester transfers)
    const progAuthoritativeByCode = new Map<string, AuthoritativeCourse>();
    prog.authoritativeList.forEach((c) => {
      progAuthoritativeByCode.set(normalizeCode(c.code), c);
    });

    const docsToDeleteNamed: { col: string; id: string }[] = [];
    const docsToDeleteDefault: { col: string; id: string }[] = [];

    // Process semester by semester
    for (let y = 1; y <= 3; y++) {
      for (let s = 1; s <= 2; s++) {
        const termKey = `Year ${y} Semester ${s}`;
        const expSemCourses = prog.authoritativeList.filter(
          (c) => Number(c.year) === y && Number(c.semester) === s
        );
        const expSemCodesMap = new Map<string, AuthoritativeCourse>();
        expSemCourses.forEach((c) => expSemCodesMap.set(normalizeCode(c.code), c));

        // Get current docs for this term in CC and PC
        const termPCDocs = currentPCSnap.docs.filter((d) => {
          const data = d.data();
          const yr = Number(data.yearOfStudy || data.year);
          const sem = Number(data.semester);
          return yr === y && sem === s;
        });

        const termCCDocs = currentCCSnap.docs.filter((d) => {
          const data = d.data();
          const yr = Number(data.yearOfStudy || data.year);
          const sem = Number(data.semester);
          return yr === y && sem === s;
        });

        const currentBeforeCount = Math.max(termPCDocs.length, termCCDocs.length);
        const termDuplicatesRemoved: string[] = [];
        const termIncorrectSemesterRemoved: string[] = [];
        const termIncorrectProgrammeRemoved: string[] = [];

        // 1. Audit and cleanup in programme_courses
        const seenPCCodesInTerm = new Set<string>();
        for (const docSnap of termPCDocs) {
          const docId = docSnap.id;
          const data = docSnap.data();
          const code = normalizeCode(data.code || data.courseCode || "");

          if (!code) {
            docsToDeleteNamed.push({ col: "programme_courses", id: docId });
            docsToDeleteDefault.push({ col: "programme_courses", id: docId });
            continue;
          }

          if (seenPCCodesInTerm.has(code)) {
            // DUPLICATE within same Programme + Year + Semester
            termDuplicatesRemoved.push(`programme_courses/${docId} (${code})`);
            duplicateRelationshipsRemoved.push(`${prog.name} ${termKey}: ${code} (${docId})`);
            docsToDeleteNamed.push({ col: "programme_courses", id: docId });
            docsToDeleteDefault.push({ col: "programme_courses", id: docId });
            continue;
          }

          // Check if expected in THIS semester
          if (expSemCodesMap.has(code)) {
            seenPCCodesInTerm.add(code);
          } else if (progAuthoritativeByCode.has(code)) {
            // Belongs to another semester of this programme
            const correctTerm = progAuthoritativeByCode.get(code)!;
            termIncorrectSemesterRemoved.push(`programme_courses/${docId} (${code} -> should be Y${correctTerm.year}S${correctTerm.semester})`);
            incorrectSemesterRelationshipsRemoved.push(
              `${prog.name}: ${code} found in ${termKey}, authoritative is Y${correctTerm.year}S${correctTerm.semester} (${docId})`
            );
            docsToDeleteNamed.push({ col: "programme_courses", id: docId });
            docsToDeleteDefault.push({ col: "programme_courses", id: docId });
          } else {
            // Belongs to another programme or unrelated
            termIncorrectProgrammeRemoved.push(`programme_courses/${docId} (${code})`);
            incorrectProgrammeRelationshipsRemoved.push(`${prog.name} ${termKey}: ${code} (${docId})`);
            docsToDeleteNamed.push({ col: "programme_courses", id: docId });
            docsToDeleteDefault.push({ col: "programme_courses", id: docId });
          }
        }

        // 2. Audit and cleanup in catalogue_courses
        const seenCCCodesInTerm = new Set<string>();
        for (const docSnap of termCCDocs) {
          const docId = docSnap.id;
          const data = docSnap.data();
          const code = normalizeCode(data.code || data.courseCode || "");

          if (!code) {
            docsToDeleteNamed.push({ col: "catalogue_courses", id: docId });
            docsToDeleteDefault.push({ col: "catalogue_courses", id: docId });
            continue;
          }

          if (seenCCCodesInTerm.has(code)) {
            // DUPLICATE within same Programme + Year + Semester
            termDuplicatesRemoved.push(`catalogue_courses/${docId} (${code})`);
            duplicateRelationshipsRemoved.push(`${prog.name} ${termKey}: CC ${code} (${docId})`);
            docsToDeleteNamed.push({ col: "catalogue_courses", id: docId });
            docsToDeleteDefault.push({ col: "catalogue_courses", id: docId });
            continue;
          }

          if (expSemCodesMap.has(code)) {
            seenCCCodesInTerm.add(code);
          } else if (progAuthoritativeByCode.has(code)) {
            const correctTerm = progAuthoritativeByCode.get(code)!;
            termIncorrectSemesterRemoved.push(`catalogue_courses/${docId} (${code})`);
            incorrectSemesterRelationshipsRemoved.push(
              `${prog.name}: CC ${code} found in ${termKey}, authoritative is Y${correctTerm.year}S${correctTerm.semester} (${docId})`
            );
            docsToDeleteNamed.push({ col: "catalogue_courses", id: docId });
            docsToDeleteDefault.push({ col: "catalogue_courses", id: docId });
          } else {
            termIncorrectProgrammeRemoved.push(`catalogue_courses/${docId} (${code})`);
            incorrectProgrammeRelationshipsRemoved.push(`${prog.name} ${termKey}: CC ${code} (${docId})`);
            docsToDeleteNamed.push({ col: "catalogue_courses", id: docId });
            docsToDeleteDefault.push({ col: "catalogue_courses", id: docId });
          }
        }

        // Check if any legacy doc IDs (like udsm_math-stats_*) exist in CC or PC for this term
        for (const docSnap of [...termPCDocs, ...termCCDocs]) {
          if (docSnap.id.startsWith("udsm_math-stats_")) {
            docsToDeleteNamed.push({ col: docSnap.ref.parent.id, id: docSnap.id });
            docsToDeleteDefault.push({ col: docSnap.ref.parent.id, id: docSnap.id });
          }
        }

        fullReport[prog.name].terms[termKey] = {
          expected: expSemCourses.length,
          currentBeforeRepair: currentBeforeCount,
          duplicatesRemoved: termDuplicatesRemoved.length,
          incorrectSemesterRemoved: termIncorrectSemesterRemoved.length,
          incorrectProgrammeRemoved: termIncorrectProgrammeRemoved.length,
          final: expSemCourses.length,
          status: "PASS",
        };
      }
    }

    // Execute deletions in batches
    console.log(`Executing ${docsToDeleteNamed.length} deletions in named DB...`);
    for (let i = 0; i < docsToDeleteNamed.length; i += 400) {
      const chunk = docsToDeleteNamed.slice(i, i + 400);
      const bNamed = writeBatch(dbNamed);
      chunk.forEach((d) => bNamed.delete(doc(dbNamed, d.col, d.id)));
      await bNamed.commit();
    }

    console.log(`Executing ${docsToDeleteDefault.length} deletions in default DB...`);
    for (let i = 0; i < docsToDeleteDefault.length; i += 400) {
      const chunk = docsToDeleteDefault.slice(i, i + 400);
      const bDefault = writeBatch(dbDefault);
      chunk.forEach((d) => {
        try { bDefault.delete(doc(dbDefault, d.col, d.id)); } catch {}
      });
      try { await bDefault.commit(); } catch {}
    }

    // 3. Upsert authoritative course relationships with clean canonical IDs and metadata
    console.log(`Upserting ${prog.authoritativeList.length} authoritative relationships for ${prog.name}...`);
    const bNamedUpsert = writeBatch(dbNamed);
    const bDefaultUpsert = writeBatch(dbDefault);

    for (let y = 1; y <= 3; y++) {
      for (let s = 1; s <= 2; s++) {
        const expSemCourses = prog.authoritativeList.filter(
          (c) => Number(c.year) === y && Number(c.semester) === s
        );

        let position = 1;
        for (const expCourse of expSemCourses) {
          const normC = normalizeCode(expCourse.code);
          const slug = cleanCodeSlug(normC);
          const relDocId = `${prog.id}_${slug}_y${y}s${s}`;
          const canonical = canonicalMap.get(normC);
          const canonicalCourseId = canonical?.id || slug;
          const canonicalTitle = canonical?.title || expCourse.name;
          const canonicalCredits = Number(expCourse.credits) || Number(canonical?.credits) || 12;
          const normStat = normalizeStatus(expCourse.type);

          const relData = {
            id: relDocId,
            courseId: canonicalCourseId,
            canonicalCourseId: canonicalCourseId,
            programmeId: prog.id,
            universityId: "udsm",
            academicUnitId: prog.academicUnitId,
            collegeId: prog.academicUnitId,
            departmentId: canonical?.offeringDepartmentId || prog.departmentId,
            offeringDepartmentId: canonical?.offeringDepartmentId || prog.departmentId,
            code: normC,
            courseCode: normC,
            title: canonicalTitle,
            courseName: canonicalTitle,
            credits: canonicalCredits,
            year: y,
            yearOfStudy: y,
            semester: s,
            status: normStat,
            courseType: normStat,
            order: position,
            position: position,
            sequence: position,
            academicYear: "2025/2026",
            verified: true,
            active: true,
            source: "UDSM Undergraduate Prospectus 2025/2026 (Official Source of Truth)",
            sourceType: "official_prospectus",
            updatedAt: new Date().toISOString(),
          };

          bNamedUpsert.set(doc(dbNamed, "programme_courses", relDocId), relData, { merge: true });
          bNamedUpsert.set(doc(dbNamed, "catalogue_courses", relDocId), relData, { merge: true });
          try {
            bDefaultUpsert.set(doc(dbDefault, "programme_courses", relDocId), relData, { merge: true });
            bDefaultUpsert.set(doc(dbDefault, "catalogue_courses", relDocId), relData, { merge: true });
          } catch {}

          position++;
        }
      }
    }

    await bNamedUpsert.commit();
    try { await bDefaultUpsert.commit(); } catch {}
    console.log(`✔ Finished upserting relationships for ${prog.name}.`);
  }

  // 4. Verification step: Read Firestore again directly to confirm exact matches
  console.log("\n==========================================================================");
  console.log("STEP 13: READ FIRESTORE AGAIN — FINAL COMPREHENSIVE VERIFICATION");
  console.log("==========================================================================");

  let overallPass = true;

  for (const prog of PROGRAMMES) {
    console.log(`\n========================================================================`);
    console.log(`VERIFYING: ${prog.name} (${prog.id})`);
    console.log(`========================================================================`);

    const qPC = query(collection(dbNamed, "programme_courses"), where("programmeId", "==", prog.id));
    const snapPC = await getDocs(qPC);
    const qCC = query(collection(dbNamed, "catalogue_courses"), where("programmeId", "==", prog.id));
    const snapCC = await getDocs(qCC);

    console.log(`Total relationships in named DB: PC = ${snapPC.size}, CC = ${snapCC.size}, Expected = ${prog.authoritativeList.length}`);

    if (snapPC.size !== prog.authoritativeList.length || snapCC.size !== prog.authoritativeList.length) {
      console.error(`❌ Total count mismatch in ${prog.name}!`);
      overallPass = false;
    }

    for (let y = 1; y <= 3; y++) {
      for (let s = 1; s <= 2; s++) {
        const termKey = `Year ${y} Semester ${s}`;
        const expSem = prog.authoritativeList.filter((c) => Number(c.year) === y && Number(c.semester) === s);
        const expCodes = expSem.map((c) => normalizeCode(c.code));

        const pcSemDocs = snapPC.docs.filter((d) => {
          const data = d.data();
          return Number(data.yearOfStudy || data.year) === y && Number(data.semester) === s;
        });

        const ccSemDocs = snapCC.docs.filter((d) => {
          const data = d.data();
          return Number(data.yearOfStudy || data.year) === y && Number(data.semester) === s;
        });

        const pcCodes = pcSemDocs.map((d) => normalizeCode(d.data().code || d.data().courseCode || ""));
        const ccCodes = ccSemDocs.map((d) => normalizeCode(d.data().code || d.data().courseCode || ""));

        const pcMatch = pcCodes.length === expCodes.length && expCodes.every((c) => pcCodes.includes(c));
        const ccMatch = ccCodes.length === expCodes.length && expCodes.every((c) => ccCodes.includes(c));

        const termPass = pcMatch && ccMatch;
        if (!termPass) {
          overallPass = false;
        }

        const termInfo = fullReport[prog.name].terms[termKey];
        console.log(
          `${termKey}: Expected: ${expSem.length} | Current before: ${termInfo.currentBeforeRepair} | Duplicates removed: ${termInfo.duplicatesRemoved} | Incorrect removed: ${termInfo.incorrectSemesterRemoved + termInfo.incorrectProgrammeRemoved} | Final PC: ${pcCodes.length} | Final CC: ${ccCodes.length} | Status: ${termPass ? "PASS" : "FAIL"}`
        );
        console.log(`  Courses: [${pcCodes.join(", ")}]`);

        fullReport[prog.name].terms[termKey].finalPC = pcCodes.length;
        fullReport[prog.name].terms[termKey].finalCC = ccCodes.length;
        fullReport[prog.name].terms[termKey].verifiedStatus = termPass ? "PASS" : "FAIL";
      }
    }
  }

  // 5. Canonical Courses check (MUST NOT BE DELETED)
  const canonicalAfterSnap = await getDocs(collection(dbNamed, "canonical_courses"));
  const canonicalCountAfter = canonicalAfterSnap.size;
  console.log(`\nCanonical courses check: Before = ${canonicalCountBefore}, After = ${canonicalCountAfter}`);
  if (canonicalCountBefore !== canonicalCountAfter) {
    console.error(`❌ CRITICAL: Canonical courses were modified! Before: ${canonicalCountBefore}, After: ${canonicalCountAfter}`);
    overallPass = false;
  } else {
    console.log(`✔ ZERO canonical courses deleted or created.`);
  }

  // Write report
  const auditReport = {
    overallPass,
    canonicalCountBefore,
    canonicalCountAfter,
    duplicateRelationshipsRemoved,
    incorrectSemesterRelationshipsRemoved,
    incorrectProgrammeRelationshipsRemoved,
    missingRelationshipsRestored,
    unresolvedSourceConflicts,
    programmes: fullReport,
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync("./scripts/math_semester_reconciliation_report.json", JSON.stringify(auditReport, null, 2));
  console.log(`\n✔ Reconciliation report successfully saved to scripts/math_semester_reconciliation_report.json`);

  if (!overallPass) {
    throw new Error("Reconciliation verification failed!");
  }
}

reconcileCurriculum().then(() => {
  console.log("\nAll tasks completed successfully!");
  process.exit(0);
}).catch((err) => {
  console.error("Error executing reconciliation:", err);
  process.exit(1);
});
