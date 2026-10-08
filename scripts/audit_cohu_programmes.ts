import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import * as fs from "fs";

async function verifyAll() {
  const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf8"));
  const app = initializeApp(config);
  const db = getFirestore(app, config.firestoreDatabaseId);

  const programmes = [
    { id: "ba-philosophy", name: "B.A. (Philosophy and Ethics)", expected: 38 },
    { id: "ba-ed-chinese", name: "B.A. Education (Chinese and English Language)", expected: 45 },
    { id: "ba-archaeology", name: "B.A. (Archaeology)", expected: 47 },
    { id: "ba-heritage", name: "B.A. (Heritage Management)", expected: 51 },
    { id: "ba-archaeology-history", name: "B.A. (Archaeology and History)", expected: 42 },
    { id: "ba-archaeology-geography", name: "B.A. (Archaeology and Geography)", expected: 44 }
  ];

  console.log("=== COMPREHENSIVE CURRICULUM AUDIT ===");
  let allPass = true;

  for (const p of programmes) {
    const q = query(collection(db, "programme_courses"), where("programmeId", "==", p.id));
    const snap = await getDocs(q);
    const docs = snap.docs.map(d => d.data());

    console.log(`\nProgramme: ${p.name} (${p.id})`);
    console.log(`Total courses: ${docs.length} / Expected: ${p.expected}`);

    if (docs.length !== p.expected) {
      allPass = false;
      console.log(`❌ Count mismatch!`);
    } else {
      console.log(`✓ Count matches exactly.`);
    }

    // Check year and semester distribution
    for (let y = 1; y <= 3; y++) {
      for (let s = 1; s <= 2; s++) {
        const subset = docs.filter(d => d.yearOfStudy === y && d.semester === s);
        const cores = subset.filter(d => d.status === "Core");
        const electives = subset.filter(d => d.status === "Elective");
        console.log(`  Year ${y} Sem ${s}: ${subset.length} courses (${cores.length} Core, ${electives.length} Elective)`);
      }
    }
  }

  // Check Philosophy Service Courses in service_courses collection
  const scSnap = await getDocs(collection(db, "service_courses"));
  console.log(`\nService Courses collection count: ${scSnap.size}`);

  console.log(`\nOverall Integrity Pass: ${allPass}`);
  process.exit(allPass ? 0 : 1);
}

verifyAll().catch(e => {
  console.error(e);
  process.exit(1);
});
