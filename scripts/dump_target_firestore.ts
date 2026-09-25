import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import * as fs from "fs";

async function dumpFirestore() {
  const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf8"));
  const app = initializeApp(config);
  const dbNamed = getFirestore(app, config.firestoreDatabaseId);

  const collections = [
    "academic_units",
    "departments",
    "programmes",
    "canonical_courses",
    "programme_courses",
    "catalogue_courses"
  ];

  const dump: Record<string, any[]> = {};

  for (const collName of collections) {
    const snap = await getDocs(collection(dbNamed, collName));
    dump[collName] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    console.log(`Fetched ${dump[collName].length} docs from ${collName}`);
  }

  fs.writeFileSync("./firestore_dump_audit.json", JSON.stringify(dump, null, 2));
  console.log("✓ Updated firestore_dump_audit.json successfully!");
  process.exit(0);
}

dumpFirestore().catch(err => {
  console.error(err);
  process.exit(1);
});
