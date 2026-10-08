import { initializeApp } from "firebase/app";
import { getFirestore, collection, getCountFromServer } from "firebase/firestore";
import * as fs from "fs";

async function getCounts() {
  const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf8"));
  const app = initializeApp(config);
  const db = getFirestore(app, config.firestoreDatabaseId);

  const collections = [
    "universities",
    "academic_units",
    "departments",
    "programmes",
    "catalogue_courses",
    "canonical_courses",
    "materials",
    "academic_materials",
    "students",
    "lecturers"
  ];

  for (const c of collections) {
    try {
      const snap = await getCountFromServer(collection(db, c));
      console.log(`${c}: ${snap.data().count}`);
    } catch (e: any) {
      console.log(`${c}: error (${e.code || e.message})`);
    }
  }

  process.exit(0);
}

getCounts();
