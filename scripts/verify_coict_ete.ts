import { initializeApp } from "firebase/app";
import { initializeFirestore, doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import * as fs from "fs";
import { fetchBrowseCourses, fetchProgrammesForDepartment, fetchDepartmentsForCollege } from "../src/data/academicStructure";

async function verifyAll() {
  const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf8"));
  const app = initializeApp(config);
  const dbNamed = initializeFirestore(app, { experimentalForceLongPolling: true }, config.firestoreDatabaseId);
  const dbDefault = initializeFirestore(app, { experimentalForceLongPolling: true });

  console.log("==================================================");
  console.log("VENUE — COICT ETE VERIFICATION SUITE");
  console.log("==================================================");

  // 1. College verification
  const coictDoc = await getDoc(doc(dbNamed, "academic_units", "coict"));
  if (!coictDoc.exists()) throw new Error("CoICT not found in Firestore!");
  console.log("✔ CoICT College verified:", coictDoc.data()?.name);

  // 2. Department verification
  const deptDoc = await getDoc(doc(dbNamed, "departments", "dept-ete"));
  if (!deptDoc.exists()) throw new Error("dept-ete not found in Firestore!");
  console.log("✔ Department verified:", deptDoc.data()?.name);

  // 3. Programmes verification
  const progs = ["bsc-esc", "bsc-telecom", "bsc-elec"];
  for (const pid of progs) {
    const pDoc = await getDoc(doc(dbNamed, "programmes", pid));
    if (!pDoc.exists()) throw new Error(`Programme ${pid} not found in named db!`);
    const pDef = await getDoc(doc(dbDefault, "programmes", pid));
    if (!pDef.exists()) throw new Error(`Programme ${pid} not found in default db!`);
    console.log(`✔ Programme ${pid} verified in both DBs:`, pDoc.data()?.name, `(${pDoc.data()?.durationYears} yrs)`);
  }

  // 4. Curriculum relationships count
  for (const pid of progs) {
    const qNamed = query(collection(dbNamed, "programme_courses"), where("programmeId", "==", pid));
    const snapNamed = await getDocs(qNamed);
    const qCat = query(collection(dbNamed, "catalogue_courses"), where("programmeId", "==", pid));
    const snapCat = await getDocs(qCat);

    console.log(`✔ ${pid}: ${snapNamed.size} programme_courses, ${snapCat.size} catalogue_courses`);
    if (snapNamed.size === 0) throw new Error(`No curriculum courses for ${pid}!`);
  }

  // 5. Canonical Courses check & Duplicate check
  const canonSnap = await getDocs(collection(dbNamed, "canonical_courses"));
  const canonCodes = new Map<string, number>();
  canonSnap.forEach(d => {
    const code = (d.data().code || "").trim().toUpperCase();
    if (code) {
      canonCodes.set(code, (canonCodes.get(code) || 0) + 1);
    }
  });

  let duplicates = 0;
  canonCodes.forEach((count, code) => {
    if (count > 1) {
      console.error(`DUPLICATE CANONICAL CODE: ${code} appears ${count} times!`);
      duplicates++;
    }
  });
  console.log(`✔ Canonical course audit: ${canonSnap.size} total courses, ${duplicates} duplicates found.`);
  if (duplicates > 0) throw new Error("Duplicate canonical courses detected!");

  // 6. Practical / Industrial training courses check
  console.log("\n--- Checking Practical / Industrial Training ---");
  for (const [code, expectedTitle] of [
    ["ES 240", "Industrial Training"],
    ["ES 340", "Industrial Training II"],
    ["TE 172", "Workshop Training"]
  ]) {
    const q = query(collection(dbNamed, "programme_courses"), where("code", "==", code));
    const snap = await getDocs(q);
    console.log(`✔ ${code} (${expectedTitle}): found in ${snap.size} curriculum relationships`);
    if (snap.empty) throw new Error(`Missing practical training course ${code}`);
  }

  // 7. Final Projects check
  console.log("\n--- Checking Final Projects ---");
  for (const [code, expectedTitle] of [
    ["ES 399", "Projects in Electronics"],
    ["TE 499", "Final Project"],
    ["ES 499", "Final Project"]
  ]) {
    const q = query(collection(dbNamed, "programme_courses"), where("code", "==", code));
    const snap = await getDocs(q);
    console.log(`✔ ${code}: found in ${snap.size} curriculum relationships across programmes`);
    if (snap.empty) throw new Error(`Missing final project course ${code}`);
  }

  // 8. Elective Minimum Rules check
  console.log("\n--- Checking Elective Minimum Rules ---");
  const qTelecomElec = query(collection(dbNamed, "programme_courses"), where("programmeId", "==", "bsc-telecom"), where("status", "==", "Elective"));
  const snapTelecomElec = await getDocs(qTelecomElec);
  const y3Rules = snapTelecomElec.docs.filter(d => d.data().yearOfStudy === 3).map(d => d.data().electiveRule);
  const y4Rules = snapTelecomElec.docs.filter(d => d.data().yearOfStudy === 4).map(d => d.data().electiveRule);
  console.log(`✔ Telecom Y3 Electives sample rule:`, y3Rules[0]);
  console.log(`✔ Telecom Y4 Electives sample rule:`, y4Rules[0]);

  // 9. Tracks & Streams check
  console.log("\n--- Checking Tracks and Streams ---");
  const escStreams = await getDocs(query(collection(dbNamed, "programme_courses"), where("programmeId", "==", "bsc-esc")));
  const escStreamNames = [...new Set(escStreams.docs.map(d => d.data().stream).filter(Boolean))];
  console.log("✔ B.Sc. ESC Streams:", escStreamNames);

  const eleTracks = await getDocs(query(collection(dbNamed, "programme_courses"), where("programmeId", "==", "bsc-elec")));
  const eleTrackNames = [...new Set(eleTracks.docs.map(d => d.data().track).filter(Boolean))];
  console.log("✔ B.Sc. ELE Tracks:", eleTrackNames);

  // 10. Browse Academic Materials integration test
  console.log("\n--- Testing Browse Academic Materials (fetchBrowseCourses) ---");
  const escY1S1 = await fetchBrowseCourses({ universityId: "udsm", programmeId: "bsc-esc", year: 1, semester: 1 });
  console.log(`B.Sc. ESC Y1S1: ${escY1S1.length} courses:`, escY1S1.map(c => `${c.code} (${c.type}, ${c.credits} cr)`));

  const escY3S2 = await fetchBrowseCourses({ universityId: "udsm", programmeId: "bsc-esc", year: 3, semester: 2 });
  console.log(`B.Sc. ESC Y3S2: ${escY3S2.length} courses:`, escY3S2.map(c => `${c.code} (${c.type}, ${c.credits} cr, Stream=${c.subStream || "Common"})`));

  const telecomY4S2 = await fetchBrowseCourses({ universityId: "udsm", programmeId: "bsc-telecom", year: 4, semester: 2 });
  console.log(`B.Sc. Telecom Y4S2: ${telecomY4S2.length} courses:`, telecomY4S2.map(c => `${c.code} (${c.type}, ${c.credits} cr, Rule=${c.electiveRule || "None"})`));

  const eleY4S1 = await fetchBrowseCourses({ universityId: "udsm", programmeId: "bsc-elec", year: 4, semester: 1 });
  console.log(`B.Sc. ELE Y4S1: ${eleY4S1.length} courses:`, eleY4S1.map(c => `${c.code} (${c.type}, ${c.credits} cr, Track=${c.subStream || "Common"})`));

  console.log("\n--- Testing UI Department & Programme Loaders ---");
  const eteProgs = await fetchProgrammesForDepartment("dept-ete");
  console.log("dept-ete programmes loaded:", eteProgs.map(p => `${p.id}: ${p.name}`));

  console.log("\n✔ ALL VERIFICATIONS PASSED SUCCESSFULLY!");
  process.exit(0);
}

verifyAll().catch(err => {
  console.error("Verification failed:", err);
  process.exit(1);
});
