import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import * as fs from "fs";

async function inspect() {
  const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf8"));
  const app = initializeApp(config);
  const dbNamed = getFirestore(app, config.firestoreDatabaseId);

  const targetProgrammes = [
    "ba-philosophy",
    "ba-ed-chinese",
    "ba-archaeology",
    "ba-heritage",
    "ba-archaeology-history",
    "ba-archaeology-geography",
    "ba-philosophy-literature",
    "ba-literature"
  ];

  console.log("=== CHECKING PROGRAMMES IN FIRESTORE ===");
  for (const pid of targetProgrammes) {
    const snap = await getDoc(doc(dbNamed, "programmes", pid));
    if (snap.exists()) {
      console.log(`Programme ${pid}: EXISTS -> ${snap.data()?.name} (${snap.data()?.departmentId})`);
    } else {
      console.log(`Programme ${pid}: NOT FOUND in programmes collection`);
    }
  }

  // Check if any programme has "service" or "common" in id
  const progSnap = await getDocs(collection(dbNamed, "programmes"));
  console.log(`Total programmes in db: ${progSnap.size}`);
  const fakeProgs = progSnap.docs.filter(d => {
    const id = d.id.toLowerCase();
    const name = (d.data().name || "").toLowerCase();
    return id.includes("service") || id.includes("common") || name.includes("service course") || name.includes("common course");
  });
  if (fakeProgs.length > 0) {
    console.log("Found fake/service programmes in 'programmes':", fakeProgs.map(d => `${d.id}: ${d.data().name}`));
  } else {
    console.log("No fake/service programmes in 'programmes'.");
  }

  console.log("\n=== CHECKING CURRICULUM RELATIONSHIPS PER TARGET PROGRAMME ===");
  for (const pid of targetProgrammes) {
    const pcQ = query(collection(dbNamed, "programme_courses"), where("programmeId", "==", pid));
    const pcSnap = await getDocs(pcQ);
    
    const ccQ = query(collection(dbNamed, "catalogue_courses"), where("programmeId", "==", pid));
    const ccSnap = await getDocs(ccQ);

    console.log(`Programme ${pid}: programme_courses = ${pcSnap.size}, catalogue_courses = ${ccSnap.size}`);
    if (pcSnap.size > 0 && pcSnap.size <= 10) {
      console.log(`  Sample courses in ${pid}:`, pcSnap.docs.slice(0, 5).map(d => `${d.data().code} (${d.data().status})`));
    }
  }

  process.exit(0);
}

inspect().catch(err => {
  console.error("Inspect error:", err);
  process.exit(1);
});
