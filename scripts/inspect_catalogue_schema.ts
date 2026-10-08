import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, limit } from "firebase/firestore";
import * as fs from "fs";

async function inspectSampleDocs() {
  const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf8"));
  const app = initializeApp(config);
  const db = getFirestore(app, config.firestoreDatabaseId);

  console.log("=== INSPECTING SAMPLE ACADEMIC UNITS ===");
  const unitsSnap = await getDocs(query(collection(db, "academic_units"), limit(2)));
  unitsSnap.forEach(d => console.log(d.id, "=>", d.data()));

  console.log("\n=== INSPECTING SAMPLE DEPARTMENTS ===");
  const deptsSnap = await getDocs(query(collection(db, "departments"), limit(2)));
  deptsSnap.forEach(d => console.log(d.id, "=>", d.data()));

  console.log("\n=== INSPECTING SAMPLE PROGRAMMES ===");
  const progsSnap = await getDocs(query(collection(db, "programmes"), limit(2)));
  progsSnap.forEach(d => console.log(d.id, "=>", d.data()));

  console.log("\n=== INSPECTING SAMPLE COURSES ===");
  const coursesSnap = await getDocs(query(collection(db, "catalogue_courses"), limit(2)));
  coursesSnap.forEach(d => console.log(d.id, "=>", d.data()));

  process.exit(0);
}

inspectSampleDocs().catch(e => {
  console.error(e);
  process.exit(1);
});
