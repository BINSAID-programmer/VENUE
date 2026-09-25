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

async function main() {
  console.log("=== INSPECTING CURRENT STATE FOR FRENCH SPECIALISATION IMPORT ===");

  // 1. Check programme
  const progDoc = await getDoc(doc(db, "programmes", "ba-language-studies"));
  console.log("Programme ba-language-studies exists:", progDoc.exists());
  if (progDoc.exists()) {
    console.log("Existing specialisations:", JSON.stringify(progDoc.data()?.specialisations, null, 2));
  }

  // 2. Check existing programme_courses
  const pcSnap = await getDocs(
    query(collection(db, "programme_courses"), where("programmeId", "==", "ba-language-studies"))
  );
  console.log("Existing programme_courses count:", pcSnap.size);

  const existingBySubStream: Record<string, number> = {};
  pcSnap.forEach(d => {
    const data = d.data();
    const stream = data.subStream || "None";
    existingBySubStream[stream] = (existingBySubStream[stream] || 0) + 1;
  });
  console.log("Existing by subStream:", existingBySubStream);

  process.exit(0);
}

main().catch(console.error);
