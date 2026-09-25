import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  writeBatch
} from "firebase/firestore";
import * as fs from "fs";

const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf8"));
const app = initializeApp(config);
const db = getFirestore(app);

async function alignCatalogue() {
  console.log("=== ALIGNING CATALOGUE_COURSES TO STANDARD udsm_ FORMAT ===");

  // 1. Fetch all French Specialisation relationships from programme_courses
  const pcSnap = await getDocs(
    query(
      collection(db, "programme_courses"),
      where("programmeId", "==", "ba-language-studies"),
      where("specialisationId", "==", "french")
    )
  );
  console.log(`Found ${pcSnap.size} French Specialisation relationships in programme_courses.`);

  // 2. Fetch all catalogue_courses for ba-language-studies
  const ccSnap = await getDocs(
    query(
      collection(db, "catalogue_courses"),
      where("programmeId", "==", "ba-language-studies")
    )
  );
  console.log(`Found ${ccSnap.size} existing catalogue_courses for ba-language-studies.`);

  // Remove the redundant non-udsm documents in catalogue_courses
  const nonUdsmDocs = ccSnap.docs.filter(d => !d.id.startsWith("udsm_"));
  console.log(`Non-udsm docs to clean up in catalogue_courses: ${nonUdsmDocs.length}`);
  
  if (nonUdsmDocs.length > 0) {
    const batch = writeBatch(db);
    for (const d of nonUdsmDocs) {
      batch.delete(doc(db, "catalogue_courses", d.id));
    }
    await batch.commit();
    console.log(`✓ Removed ${nonUdsmDocs.length} redundant duplicate non-udsm documents from catalogue_courses.`);
  }

  // 3. Write/update each French Specialisation course into catalogue_courses using standard udsm_ ID
  const batch = writeBatch(db);
  let writeCount = 0;

  pcSnap.forEach(d => {
    const data = d.data();
    const cleanCode = data.code.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const streamSlug = data.subStreamSlug || (data.subStream?.toLowerCase().includes("english") ? "english" : data.subStream?.toLowerCase().includes("ling") ? "linguistics" : "kiswahili");
    const standardId = `udsm_ba-language-studies_${cleanCode}_${streamSlug}_y${data.yearOfStudy}s${data.semester}`;

    const ccDoc = {
      ...data,
      id: standardId,
      courseType: data.status,
      active: true,
      updatedAt: new Date().toISOString()
    };

    batch.set(doc(db, "catalogue_courses", standardId), ccDoc);
    writeCount++;
  });

  await batch.commit();
  console.log(`✓ Synchronized ${writeCount} French Specialisation relationships into catalogue_courses with standard udsm_ IDs.`);

  // Verify final count in catalogue_courses
  const ccVerifySnap = await getDocs(
    query(
      collection(db, "catalogue_courses"),
      where("programmeId", "==", "ba-language-studies")
    )
  );
  console.log(`Final catalogue_courses count for ba-language-studies: ${ccVerifySnap.size}`);

  process.exit(0);
}

alignCatalogue().catch(err => {
  console.error(err);
  process.exit(1);
});
