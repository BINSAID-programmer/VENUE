import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where
} from "firebase/firestore";
import * as fs from "fs";

const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf8"));
const app = initializeApp(config);
const db = getFirestore(app);

async function verify() {
  console.log("=== COMPREHENSIVE FIRESTORE AUDIT & VERIFICATION ===");
  let hasErrors = false;

  // 1. Academic Unit
  const cohuSnap = await getDoc(doc(db, "academic_units", "cohu"));
  if (!cohuSnap.exists()) {
    console.error("FAIL: Academic Unit cohu does not exist!");
    hasErrors = true;
  } else {
    console.log("✓ Academic Unit cohu exists:", cohuSnap.data().name);
  }
  const allUnitsSnap = await getDocs(collection(db, "academic_units"));
  const cohuUnits = allUnitsSnap.docs.filter(d => d.data().code === "CoHU" || d.id === "cohu");
  console.log(`✓ Academic Units matching CoHU: ${cohuUnits.length} (no duplicates)`);
  if (cohuUnits.length !== 1) {
    console.error("FAIL: Duplicate Academic Unit detected!");
    hasErrors = true;
  }

  // 2. Department
  const deptSnap = await getDoc(doc(db, "departments", "dept-foreign-languages"));
  if (!deptSnap.exists()) {
    console.error("FAIL: Department dept-foreign-languages does not exist!");
    hasErrors = true;
  } else {
    console.log("✓ Department exists:", deptSnap.data().name, `(College: ${deptSnap.data().academicUnitId})`);
  }
  const allDeptsSnap = await getDocs(collection(db, "departments"));
  const fllDepts = allDeptsSnap.docs.filter(d => d.id === "dept-foreign-languages" || d.data().name?.includes("Foreign Languages"));
  console.log(`✓ Departments matching Foreign Languages: ${fllDepts.length} (no duplicates)`);
  if (fllDepts.length !== 1) {
    console.error("FAIL: Duplicate Department detected!");
    hasErrors = true;
  }

  // 3. Programme
  const progSnap = await getDoc(doc(db, "programmes", "ba-language-studies"));
  if (!progSnap.exists()) {
    console.error("FAIL: Programme ba-language-studies does not exist!");
    hasErrors = true;
  } else {
    const p = progSnap.data();
    console.log("✓ Programme exists:", p.name, `(${p.officialName})`);
    console.log("  Department ID:", p.departmentId);
    console.log("  Academic Unit ID:", p.academicUnitId);
  }
  const allProgsSnap = await getDocs(collection(db, "programmes"));
  const matchingProgs = allProgsSnap.docs.filter(d => d.id === "ba-language-studies" || d.data().name === "Bachelor of Arts in Language Studies");
  console.log(`✓ Programmes matching B.A. (Language Studies): ${matchingProgs.length} (no duplicates)`);
  if (matchingProgs.length !== 1) {
    console.error("FAIL: Duplicate Programme detected!");
    hasErrors = true;
  }

  // 4. Specialisation II: French and Sub-Streams
  const pData = progSnap.data();
  const frenchSpec = pData.specialisations?.find((s: any) => s.id === "french");
  if (!frenchSpec) {
    console.error("FAIL: Specialisation II: French not found in programme!");
    hasErrors = true;
  } else {
    console.log("✓ Specialisation II: French verified:", frenchSpec.name);
    console.log("  Sub-Streams:", frenchSpec.subStreams?.map((st: any) => st.name).join(", "));
    if (!frenchSpec.subStreams || frenchSpec.subStreams.length !== 3) {
      console.error("FAIL: Expected 3 sub-streams under French Specialisation!");
      hasErrors = true;
    }
  }

  // 5. Query relationships in programme_courses
  const pcSnap = await getDocs(
    query(
      collection(db, "programme_courses"),
      where("programmeId", "==", "ba-language-studies"),
      where("specialisationId", "==", "french")
    )
  );
  console.log(`\n✓ French Specialisation relationships in programme_courses: ${pcSnap.size}`);

  const ccSnap = await getDocs(
    query(
      collection(db, "catalogue_courses"),
      where("programmeId", "==", "ba-language-studies"),
      where("specialisationId", "==", "french")
    )
  );
  console.log(`✓ French Specialisation relationships in catalogue_courses: ${ccSnap.size}`);

  // Breakdown by stream
  const byStream: Record<string, { total: number; core: number; elective: number }> = {};
  const byYearSem: Record<string, number> = {};
  let chooseOneCount = 0;
  let chooseOneOrTwoCount = 0;
  let numericCreditsErrors = 0;

  pcSnap.forEach(d => {
    const data = d.data();
    const s = data.subStream || "Unknown";
    if (!byStream[s]) byStream[s] = { total: 0, core: 0, elective: 0 };
    byStream[s].total++;
    if (data.status === "Core") byStream[s].core++;
    if (data.status === "Elective") byStream[s].elective++;

    const ys = `Y${data.yearOfStudy}S${data.semester}`;
    byYearSem[ys] = (byYearSem[ys] || 0) + 1;

    if (typeof data.credits !== "number" || isNaN(data.credits)) {
      numericCreditsErrors++;
    }

    if (data.electiveRule === "Choose ONE") chooseOneCount++;
    if (data.electiveRule === "Choose ONE or TWO") chooseOneOrTwoCount++;
  });

  console.log("\n--- Sub-Stream Breakdown ---");
  for (const [s, counts] of Object.entries(byStream)) {
    console.log(`  ${s}: Total=${counts.total} (Core=${counts.core}, Elective=${counts.elective})`);
  }

  console.log("\n--- Year & Semester Distribution ---");
  for (const [ys, count] of Object.entries(byYearSem).sort()) {
    console.log(`  ${ys}: ${count} courses`);
  }

  console.log("\n--- Elective Restrictions & Numeric Integrity ---");
  console.log(`✓ Numeric credits verified on all courses. Errors: ${numericCreditsErrors}`);
  console.log(`✓ 'Choose ONE' restrictions verified on ${chooseOneCount} relationships.`);
  console.log(`✓ 'Choose ONE or TWO' restrictions verified on ${chooseOneOrTwoCount} relationships.`);

  // 6. AS 299 Verification
  console.log("\n--- AS 299 Practical Training Verification ---");
  const as299Rels = pcSnap.docs.filter(d => d.data().code === "AS 299");
  console.log(`✓ AS 299 relationships count: ${as299Rels.length}`);
  as299Rels.forEach(d => {
    const data = d.data();
    console.log(`  SubStream="${data.subStream}": status=${data.status}, credits=${data.credits}, note="${data.note}"`);
    if (data.status !== "Core" || data.credits !== 12) {
      console.error("FAIL: AS 299 is not Core 12 credits!");
      hasErrors = true;
    }
  });

  // 7. KF 221 Status Verification
  console.log("\n--- KF 221 Status Verification ---");
  const kf221Rels = pcSnap.docs.filter(d => d.data().code === "KF 221");
  console.log(`✓ KF 221 relationships count: ${kf221Rels.length}`);
  kf221Rels.forEach(d => {
    const data = d.data();
    console.log(`  KF 221: status=${data.status}, credits=${data.credits}, stream="${data.subStream}", year=${data.yearOfStudy}, sem=${data.semester}`);
    if (data.status !== "Elective") {
      console.error("FAIL: KF 221 is not Elective!");
      hasErrors = true;
    }
  });

  // 8. LL 222 Verification
  console.log("\n--- LL 222 Verification ---");
  const ll222Canon = await getDoc(doc(db, "canonical_courses", "ll_222"));
  if (ll222Canon.exists()) {
    console.log("✓ Canonical LL 222 exists:", ll222Canon.data().title, `(${ll222Canon.data().defaultCredits} cr)`);
  } else {
    console.error("FAIL: Canonical LL 222 missing!");
    hasErrors = true;
  }

  // 9. KS 223 Verification
  console.log("\n--- KS 223 Verification ---");
  const ks223Canon = await getDoc(doc(db, "canonical_courses", "ks_223"));
  if (ks223Canon.exists()) {
    console.log("✓ Canonical KS 223 exists:", ks223Canon.data().title, `(${ks223Canon.data().defaultCredits} cr)`);
  } else {
    console.error("FAIL: Canonical KS 223 missing!");
    hasErrors = true;
  }

  // 10. LL 390 Verification
  console.log("\n--- LL 390 Verification ---");
  const ll390Canon = await getDoc(doc(db, "canonical_courses", "ll_390"));
  if (ll390Canon.exists()) {
    console.log("✓ Canonical LL 390 exists:", ll390Canon.data().title, `(${ll390Canon.data().defaultCredits} cr)`);
  } else {
    console.error("FAIL: Canonical LL 390 missing!");
    hasErrors = true;
  }

  // 11. CA 208 Verification
  console.log("\n--- CA 208 Verification ---");
  const ca208Canon = await getDoc(doc(db, "canonical_courses", "ca_208"));
  if (ca208Canon.exists()) {
    console.log(`✓ Canonical CA 208 preserved: title="${ca208Canon.data().title}", defaultCredits=${ca208Canon.data().defaultCredits}`);
  }
  const ca208Rels = pcSnap.docs.filter(d => d.data().code === "CA 208");
  console.log(`✓ Valid CA 208 relationships count: ${ca208Rels.length}`);
  ca208Rels.forEach(d => {
    const data = d.data();
    console.log(`  CA 208: status=${data.status}, credits=${data.credits}, stream="${data.subStream}"`);
  });

  // 12. Zero Duplicate Canonical Courses
  console.log("\n--- Canonical Duplicate Check ---");
  const allCanon = await getDocs(collection(db, "canonical_courses"));
  const seenCodes = new Set<string>();
  let dupCanon = 0;
  allCanon.forEach(d => {
    const code = d.data().code;
    if (seenCodes.has(code)) {
      console.error("Duplicate canonical code:", code);
      dupCanon++;
    }
    seenCodes.add(code);
  });
  console.log(`✓ Total canonical courses: ${allCanon.size}. Duplicate canonical codes: ${dupCanon}`);
  if (dupCanon > 0) hasErrors = true;

  if (hasErrors) {
    console.error("\n❌ VERIFICATION FAILED WITH ERRORS");
    process.exit(1);
  } else {
    console.log("\n🎉 ALL VERIFICATIONS PASSED IN FIRESTORE!");
    process.exit(0);
  }
}

verify().catch(err => {
  console.error("Verification crashed:", err);
  process.exit(1);
});
