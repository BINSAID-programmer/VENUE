import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  writeBatch
} from "firebase/firestore";
import * as fs from "fs";

const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf8"));
const app = initializeApp(config);
const dbSource = getFirestore(app);
const dbDest = getFirestore(app, config.firestoreDatabaseId);

async function replicateCollection(colName: string) {
  console.log(`\nReplicating collection: ${colName}...`);
  const snap = await getDocs(collection(dbSource, colName));
  console.log(`Fetched ${snap.size} documents from source for ${colName}`);

  const docs = snap.docs;
  const BATCH_SIZE = 400;
  let batchCount = 0;

  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const chunk = docs.slice(i, i + BATCH_SIZE);
    const batch = writeBatch(dbDest);
    chunk.forEach(d => {
      batch.set(doc(dbDest, colName, d.id), d.data());
    });
    await batch.commit();
    batchCount++;
    console.log(`  Committed batch ${batchCount} (${chunk.length} docs, ${Math.min(i + BATCH_SIZE, docs.length)}/${docs.length})`);
  }

  // Verify count in destination
  const destSnap = await getDocs(collection(dbDest, colName));
  console.log(`✓ Verified ${colName} in destination: ${destSnap.size} docs`);
}

async function run() {
  console.log("=== REPLICATING ALL COLLECTIONS TO NAMED FIRESTORE DATABASE ===");
  console.log("Destination Database ID:", config.firestoreDatabaseId);

  const collections = [
    "departments",
    "programmes",
    "canonical_courses",
    "programme_courses",
    "catalogue_courses"
  ];

  for (const col of collections) {
    await replicateCollection(col);
  }

  console.log("\n🎉 ALL COLLECTIONS SUCCESSFULLY REPLICATED TO NAMED DATABASE!");
  process.exit(0);
}

run().catch(err => {
  console.error("Replication failed:", err);
  process.exit(1);
});
