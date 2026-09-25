import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import * as fs from "fs";

async function verify() {
  const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf8"));
  const app = initializeApp(config);
  const dbNamed = getFirestore(app, config.firestoreDatabaseId);

  const snap = await getDocs(collection(dbNamed, "catalogue_courses"));
  const allDocs = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];

  const programmes = [
    { id: "ba-archaeology", name: "B.A. (Archaeology)", expectedCount: 47 },
    { id: "ba-heritage", name: "B.A. (Heritage Management)", expectedCount: 51 },
    { id: "ba-archaeology-history", name: "B.A. (Archaeology and History)", expectedCount: 42 },
    { id: "ba-archaeology-geography", name: "B.A. (Archaeology and Geography)", expectedCount: 44 }
  ];

  console.log("=== COMPREHENSIVE ARCHAEOLOGY INTEGRITY VERIFICATION ===");
  const results: any = {};

  for (const prog of programmes) {
    const progCourses = allDocs.filter(d => d.programmeId === prog.id);
    console.log(`\nProgramme: ${prog.name} (${prog.id})`);
    console.log(`Total Courses: ${progCourses.length} (Expected: ${prog.expectedCount})`);

    const breakdown: any = {};
    for (let y = 1; y <= 3; y++) {
      for (let s = 1; s <= 2; s++) {
        const key = `Y${y}S${s}`;
        const subset = progCourses.filter(c => c.yearOfStudy === y && c.semester === s);
        const cores = subset.filter(c => c.status === "Core");
        const electives = subset.filter(c => c.status === "Elective");
        breakdown[key] = { total: subset.length, core: cores.length, elective: electives.length };
        console.log(`  ${key}: Total ${subset.length} (Core: ${cores.length}, Elective: ${electives.length})`);
      }
    }
    results[prog.id] = { count: progCourses.length, match: progCourses.length === prog.expectedCount, breakdown };
  }

  // Field Training Checks
  console.log("\n--- FIELD TRAINING CHECKS ---");
  const ay120 = allDocs.filter(d => d.code === "AY 120");
  console.log(`AY 120 count: ${ay120.length} (Expected 4) - Programmes: ${ay120.map(d => d.programmeId).join(", ")}`);
  
  const ay220 = allDocs.filter(d => d.code === "AY 220");
  console.log(`AY 220 count: ${ay220.length} (Expected 3) - Programmes: ${ay220.map(d => d.programmeId).join(", ")}`);

  const ay230 = allDocs.filter(d => d.code === "AY 230");
  console.log(`AY 230 count: ${ay230.length} (Expected 1) - Programmes: ${ay230.map(d => d.programmeId).join(", ")}`);

  // Dissertation Checks
  console.log("\n--- DISSERTATION CHECKS ---");
  const ay399 = allDocs.filter(d => d.code === "AY 399");
  console.log(`AY 399 count: ${ay399.length} (Expected 3) - All by invitation: ${ay399.every(d => d.byInvitationOnly && d.credits === 24)}`);

  const hm399 = allDocs.filter(d => d.code === "HM 399");
  console.log(`HM 399 count: ${hm399.length} (Expected 1) - By invitation: ${hm399.every(d => d.byInvitationOnly && d.credits === 24)}`);

  // Specific course checks
  console.log("\n--- SPECIFIC CONFLICT & METADATA CHECKS ---");
  const zl122 = allDocs.find(d => d.code === "ZL 122");
  console.log(`ZL 122 credits: ${zl122?.credits} (Expected: 8)`);

  const hm321 = allDocs.filter(d => d.code === "HM 321");
  console.log(`HM 321 count: ${hm321.length} (Expected: 1, preserved distinct in ba-archaeology-geography)`);

  const ay321 = allDocs.filter(d => d.code === "AY 321");
  console.log(`AY 321 count: ${ay321.length} (Expected: 3, in ba-archaeology, ba-heritage, ba-archaeology-history)`);

  const ge140 = allDocs.filter(d => d.code === "GE 140");
  console.log(`GE 140 titles across programmes:`, ge140.map(d => `${d.programmeId}: "${d.title}" (${d.status})`));

  console.log("\nVerification complete!");
  process.exit(0);
}

verify();
