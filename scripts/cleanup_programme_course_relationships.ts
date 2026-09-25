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

async function runCleanup() {
  console.log("================================================================================");
  console.log("VENUE — PROGRAMME COURSE RELATIONSHIP CLEANUP SCRIPT");
  console.log("================================================================================");

  const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf8"));
  const app = initializeApp(config);
  const dbNamed = getFirestore(app, config.firestoreDatabaseId);
  const dbDefault = getFirestore(app);

  const databases = [
    { name: `Named (${config.firestoreDatabaseId})`, db: dbNamed },
    { name: "Default ((default))", db: dbDefault }
  ];

  // 1. Audit Canonical Courses count prior to any deletions
  const canonPreSnap = await getDocs(collection(dbNamed, "canonical_courses"));
  const initialCanonCount = canonPreSnap.size;
  console.log(`\n[PRE-CHECK] Canonical Courses count before cleanup: ${initialCanonCount}`);

  // ============================================================================
  // STEP 1: REMOVE EXTRA RELATIONSHIPS FROM BA IN HISTORY (ba-history)
  // ============================================================================
  console.log("\n[STEP 1] Cleaning extra relationships in BA (History)...");

  // The 13 extra relationships identified in ba-history
  const baHistoryExtraIds = [
    "ba-history_hu_101",
    "ba-history_hu_102",
    "ba-history_hu_103",
    "ba-history_hu_104",
    "ba-history_hu_201",
    "ba-history_hu_202",
    "ba-history_hu_203",
    "ba-history_hu_204",
    "ba-history_hu_301",
    "ba-history_hu_302",
    "ba-history_hu_399",
    "ba-history_cl_106",
    "ba-history_ds_112"
  ];

  const baHistoryCatalogueExtraIds = [
    "udsm_ba-history_hu_101",
    "udsm_ba-history_hu_102",
    "udsm_ba-history_hu_103",
    "udsm_ba-history_hu_104",
    "udsm_ba-history_hu_201",
    "udsm_ba-history_hu_202",
    "udsm_ba-history_hu_203",
    "udsm_ba-history_hu_204",
    "udsm_ba-history_hu_301",
    "udsm_ba-history_hu_302",
    "udsm_ba-history_hu_399",
    "udsm_ba-history_cl_106",
    "udsm_ba-history_ds_112"
  ];

  for (const { name, db } of databases) {
    console.log(`Cleaning ba-history in ${name}...`);
    const batch = writeBatch(db);

    for (const pcId of baHistoryExtraIds) {
      batch.delete(doc(db, "programme_courses", pcId));
    }
    for (const ccId of baHistoryCatalogueExtraIds) {
      batch.delete(doc(db, "catalogue_courses", ccId));
    }

    await batch.commit();
    console.log(`  ✓ Removed ${baHistoryExtraIds.length} extra programme_courses & ${baHistoryCatalogueExtraIds.length} catalogue_courses from ba-history in ${name}`);
  }

  // ============================================================================
  // STEP 2: REMOVE UNSPECIALISED / EXTRA RELATIONSHIPS FROM BA IN LANGUAGE STUDIES
  // ============================================================================
  console.log("\n[STEP 2] Cleaning extra unspecialised relationships in BA (Language Studies)...");

  // Fetch all current ba-language-studies programme_courses that have NO specialisationId
  const pcLangSnap = await getDocs(
    query(
      collection(dbNamed, "programme_courses"),
      where("programmeId", "==", "ba-language-studies")
    )
  );

  const pcLangExtraDocs: string[] = [];
  pcLangSnap.forEach(d => {
    const data = d.data();
    if (!data.specialisationId) {
      pcLangExtraDocs.push(d.id);
    }
  });

  console.log(`Identified ${pcLangExtraDocs.length} unspecialised extra relationships in programme_courses for ba-language-studies.`);

  // Fetch all current ba-language-studies catalogue_courses that have NO specialisationId or are old format
  const ccLangSnap = await getDocs(
    query(
      collection(dbNamed, "catalogue_courses"),
      where("programmeId", "==", "ba-language-studies")
    )
  );

  const ccLangExtraDocs: string[] = [];
  ccLangSnap.forEach(d => {
    const data = d.data();
    if (!data.specialisationId) {
      ccLangExtraDocs.push(d.id);
    }
  });

  console.log(`Identified ${ccLangExtraDocs.length} unspecialised extra documents in catalogue_courses for ba-language-studies.`);

  for (const { name, db } of databases) {
    console.log(`Cleaning ba-language-studies unspecialised records in ${name}...`);
    
    // Batch delete pcLangExtraDocs
    const BATCH_SIZE = 400;
    for (let i = 0; i < pcLangExtraDocs.length; i += BATCH_SIZE) {
      const batch = writeBatch(db);
      const chunk = pcLangExtraDocs.slice(i, i + BATCH_SIZE);
      for (const id of chunk) {
        batch.delete(doc(db, "programme_courses", id));
      }
      await batch.commit();
    }

    // Batch delete ccLangExtraDocs
    for (let i = 0; i < ccLangExtraDocs.length; i += BATCH_SIZE) {
      const batch = writeBatch(db);
      const chunk = ccLangExtraDocs.slice(i, i + BATCH_SIZE);
      for (const id of chunk) {
        batch.delete(doc(db, "catalogue_courses", id));
      }
      await batch.commit();
    }

    console.log(`  ✓ Removed ${pcLangExtraDocs.length} programme_courses & ${ccLangExtraDocs.length} catalogue_courses unspecialised records in ${name}`);
  }

  // ============================================================================
  // STEP 3: RESTORE MISSING AUTHORITATIVE COURSES IN FRENCH SPECIALISATION
  // ============================================================================
  console.log("\n[STEP 3] Restoring missing authoritative courses in French Specialisation...");

  // The 4 missing French specialisation courses:
  // 1. DS 112 English Sub-Stream (Y1S1)
  // 2. DS 112 Linguistics Sub-Stream (Y1S1)
  // 3. DS 112 Kiswahili Sub-Stream (Y1S1)
  // 4. KF 102 Kiswahili Sub-Stream (Y1S1)
  const coursesToRestore = [
    {
      code: "DS 112",
      title: "Development Perspectives I",
      canonicalTitle: "Development Perspectives I",
      credits: 12, // Supplied credits (with conflict note: canonical has 8)
      status: "Core" as const,
      rawStatus: "Core",
      yearOfStudy: 1,
      semester: 1,
      programmeId: "ba-language-studies",
      specialisation: "Specialisation II: French",
      specialisationId: "french",
      subStream: "English Sub-Stream",
      subStreamSlug: "english",
      option: "English Sub-Stream",
      canonicalCourseId: "canon_ds_112",
      courseId: "canon_ds_112",
      offeringDepartmentId: "dept-dev-studies",
      offeringAcademicUnitId: "ids",
      sourceConflict: "Credits conflict: Supplied catalogue specifies 12 credits; canonical DS 112 is 8 credits. Preserved with relationship credits=12 and conflict logged."
    },
    {
      code: "DS 112",
      title: "Development Perspectives I",
      canonicalTitle: "Development Perspectives I",
      credits: 12,
      status: "Core" as const,
      rawStatus: "Core",
      yearOfStudy: 1,
      semester: 1,
      programmeId: "ba-language-studies",
      specialisation: "Specialisation II: French",
      specialisationId: "french",
      subStream: "Linguistics Sub-Stream",
      subStreamSlug: "linguistics",
      option: "Linguistics Sub-Stream",
      canonicalCourseId: "canon_ds_112",
      courseId: "canon_ds_112",
      offeringDepartmentId: "dept-dev-studies",
      offeringAcademicUnitId: "ids",
      sourceConflict: "Credits conflict: Supplied catalogue specifies 12 credits; canonical DS 112 is 8 credits. Preserved with relationship credits=12 and conflict logged."
    },
    {
      code: "DS 112",
      title: "Development Perspectives I",
      canonicalTitle: "Development Perspectives I",
      credits: 12,
      status: "Core" as const,
      rawStatus: "Core",
      yearOfStudy: 1,
      semester: 1,
      programmeId: "ba-language-studies",
      specialisation: "Specialisation II: French",
      specialisationId: "french",
      subStream: "Kiswahili Language Option/Sub-Stream",
      subStreamSlug: "kiswahili",
      option: "Kiswahili Language Option/Sub-Stream",
      canonicalCourseId: "canon_ds_112",
      courseId: "canon_ds_112",
      offeringDepartmentId: "dept-dev-studies",
      offeringAcademicUnitId: "ids",
      sourceConflict: "Credits conflict: Supplied catalogue specifies 12 credits; canonical DS 112 is 8 credits. Preserved with relationship credits=12 and conflict logged."
    },
    {
      code: "KF 102",
      title: "Utangulizi wa Fasihi ya Kiswahili (Simulizi na Andishi)",
      canonicalTitle: "Fasihi Simulizi ya Kiswahili",
      credits: 12,
      status: "Core" as const,
      rawStatus: "Core",
      yearOfStudy: 1,
      semester: 1,
      programmeId: "ba-language-studies",
      specialisation: "Specialisation II: French",
      specialisationId: "french",
      subStream: "Kiswahili Language Option/Sub-Stream",
      subStreamSlug: "kiswahili",
      option: "Kiswahili Language Option/Sub-Stream",
      canonicalCourseId: "canon_kf_102",
      courseId: "canon_kf_102",
      offeringDepartmentId: "dept-kiswahili",
      offeringAcademicUnitId: "tataki",
      sourceConflict: "Title variant: Supplied catalogue specifies 'Utangulizi wa Fasihi ya Kiswahili (Simulizi na Andishi)'; canonical is 'Fasihi Simulizi ya Kiswahili'. Preserved with supplied title and conflict logged."
    }
  ];

  for (const item of coursesToRestore) {
    const cleanCode = item.code.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    const targetStreamSlug = item.subStreamSlug;
    const pcId = `ba-language-studies_french_${targetStreamSlug}_${cleanCode}_y${item.yearOfStudy}s${item.semester}`;
    const ccId = `udsm_ba-language-studies_french_${targetStreamSlug}_${cleanCode}_y${item.yearOfStudy}s${item.semester}`;

    const docData = {
      id: pcId,
      code: item.code,
      title: item.title,
      canonicalTitle: item.canonicalTitle,
      credits: item.credits,
      status: item.status,
      rawStatus: item.rawStatus,
      yearOfStudy: item.yearOfStudy,
      semester: item.semester,
      programmeId: item.programmeId,
      programmeName: "Bachelor of Arts in Language Studies",
      specialisation: item.specialisation,
      specialisationId: item.specialisationId,
      subStream: item.subStream,
      subStreamSlug: item.subStreamSlug,
      option: item.option,
      departmentId: "dept-foreign-languages",
      academicUnitId: "cohu",
      universityId: "udsm",
      academicYear: "2025/2026",
      source: "UDSM Undergraduate Prospectus 2025/2026 (Official Source of Truth)",
      sourceType: "official_prospectus",
      canonicalCourseId: item.canonicalCourseId,
      courseId: item.courseId,
      courseCode: item.code,
      courseName: item.title,
      courseType: item.status,
      offeringDepartmentId: item.offeringDepartmentId,
      offeringAcademicUnitId: item.offeringAcademicUnitId,
      sourceConflict: item.sourceConflict,
      verified: true,
      active: true,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    for (const { name, db } of databases) {
      await setDoc(doc(db, "programme_courses", pcId), docData);
      await setDoc(doc(db, "catalogue_courses", ccId), { ...docData, id: ccId });
    }
    console.log(`  ✓ Restored relationship: ${item.code} (${item.title}) [${item.subStreamSlug}]`);
  }

  // ============================================================================
  // STEP 4: VERIFY CANONICAL COURSES WERE NEVER DELETED
  // ============================================================================
  console.log("\n[STEP 4] Verifying Canonical Courses preservation...");
  const canonPostSnap = await getDocs(collection(dbNamed, "canonical_courses"));
  const finalCanonCount = canonPostSnap.size;
  console.log(`[POST-CHECK] Canonical Courses count after cleanup: ${finalCanonCount}`);

  if (finalCanonCount < initialCanonCount) {
    throw new Error(`CRITICAL VIOLATION: Canonical courses count dropped from ${initialCanonCount} to ${finalCanonCount}!`);
  }
  console.log("✓ ZERO canonical courses were deleted. All canonical courses strictly preserved.");

  console.log("\n================================================================================");
  console.log("🎉 RELATIONSHIP CLEANUP COMPLETED SUCCESSFULLY");
  console.log("================================================================================");
  process.exit(0);
}

runCleanup().catch(err => {
  console.error("Cleanup failed:", err);
  process.exit(1);
});
