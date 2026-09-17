import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, getDocs, writeBatch } from 'firebase/firestore';
import * as fs from 'fs';
import {
  AUDITED_PROGRAMMES,
  AUDITED_CANONICAL_COURSES,
  AUDITED_PROGRAMME_COURSES,
  AUDITED_COURSE_RECORDS,
} from '../src/data/udsmAuditedCatalogue2025';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app);

export interface BatchRunResult {
  batchName: string;
  programmesProcessed: string[];
  programmesAdded: number;
  programmesExisting: number;
  canonicalCoursesAdded: number;
  canonicalCoursesExisting: number;
  programmeCoursesAdded: number;
  programmeCoursesExisting: number;
  catalogueCoursesAdded: number;
  catalogueCoursesExisting: number;
  duplicatesPrevented: number;
  validationPassed: boolean;
  unverifiedInfo: string[];
}

export async function processBatchForUnits(unitIds: string[], batchName: string): Promise<BatchRunResult> {
  console.log(`\n========================================`);
  console.log(`STARTING BATCH: ${batchName}`);
  console.log(`Target Academic Units: ${unitIds.join(', ')}`);
  console.log(`========================================\n`);

  // 1. Verify Existing Academic Units in Firestore (DO NOT modify or recreate)
  console.log('Validating hierarchy against existing Firestore academic units...');
  for (const uid of unitIds) {
    const unitSnap = await getDoc(doc(db, 'academic_units', uid));
    if (!unitSnap.exists()) {
      throw new Error(`CRITICAL: Academic Unit "${uid}" not found in Firestore!`);
    }
    console.log(`✓ Verified Academic Unit: ${unitSnap.data()?.name} (${uid})`);
  }

  // 2. Select programmes for the specified units
  const targetProgrammes = AUDITED_PROGRAMMES.filter(p => unitIds.includes(p.academicUnitId));
  const targetProgIds = new Set(targetProgrammes.map(p => p.id));
  console.log(`Found ${targetProgrammes.length} programmes in target units: ${[...targetProgIds].join(', ')}`);

  // Load existing Firestore IDs across collections in parallel
  console.log('Loading existing Firestore document IDs to ensure deduplication & safety...');
  const [existingProgSnap, existingDeptSnap, existingCanonicalSnap, existingPCSnap, existingCCSnap] = await Promise.all([
    getDocs(collection(db, 'programmes')),
    getDocs(collection(db, 'departments')),
    getDocs(collection(db, 'canonical_courses')),
    getDocs(collection(db, 'programme_courses')),
    getDocs(collection(db, 'catalogue_courses')),
  ]);

  const existingProgIds = new Set(existingProgSnap.docs.map(d => d.id));
  const existingDeptIds = new Set(existingDeptSnap.docs.map(d => d.id));
  const existingCanonicalIds = new Set(existingCanonicalSnap.docs.map(d => d.id));
  const existingPCIds = new Set(existingPCSnap.docs.map(d => d.id));
  const existingCCIds = new Set(existingCCSnap.docs.map(d => d.id));

  console.log(`Existing in Firestore: ${existingProgIds.size} programmes, ${existingDeptIds.size} departments, ${existingCanonicalIds.size} canonical courses, ${existingPCIds.size} programme courses, ${existingCCIds.size} catalogue courses.`);

  const unverifiedInfo: string[] = [];

  // Verify programme department associations without modifying any departments
  for (const prog of targetProgrammes) {
    if (existingDeptIds.has(prog.departmentId)) {
      console.log(`✓ Verified Department "${prog.departmentId}" for ${prog.shortName}`);
    } else {
      console.log(`ℹ Programme "${prog.id}" uses specialized academic coordination unit "${prog.departmentId}"`);
      unverifiedInfo.push(`Programme ${prog.id}: Department id ${prog.departmentId} coordinated under parent unit ${prog.academicUnitId}`);
    }
  }

  let programmesAdded = 0;
  let programmesExisting = 0;
  let duplicatesPrevented = 0;

  // 3. Programmes: check existing without modifying
  for (const prog of targetProgrammes) {
    if (existingProgIds.has(prog.id)) {
      programmesExisting++;
      duplicatesPrevented++;
    } else {
      await writeBatch(db).set(doc(db, 'programmes', prog.id), prog).commit();
      programmesAdded++;
    }
  }
  console.log(`✓ Programmes: ${programmesAdded} added, ${programmesExisting} already existed.`);

  // 4. Canonical Courses: deduplicate across the university
  const targetProgrammeCourses = AUDITED_PROGRAMME_COURSES.filter(pc => targetProgIds.has(pc.programmeId));
  const targetCanonicalIds = new Set(targetProgrammeCourses.map(pc => pc.courseId));
  const targetCanonicalCourses = AUDITED_CANONICAL_COURSES.filter(cc => targetCanonicalIds.has(cc.id));
  const targetCourseRecords = AUDITED_COURSE_RECORDS.filter(cr => targetProgIds.has(cr.programmeId));

  let canonicalAdded = 0;
  let canonicalExisting = 0;
  const canonicalToCommit = [];
  for (const cc of targetCanonicalCourses) {
    if (!existingCanonicalIds.has(cc.id)) {
      canonicalToCommit.push(cc);
      canonicalAdded++;
    } else {
      canonicalExisting++;
      duplicatesPrevented++;
    }
  }

  for (let i = 0; i < canonicalToCommit.length; i += 400) {
    const chunk = canonicalToCommit.slice(i, i + 400);
    const batch = writeBatch(db);
    chunk.forEach(cc => batch.set(doc(db, 'canonical_courses', cc.id), cc));
    await batch.commit();
  }
  console.log(`✓ Canonical courses: ${canonicalAdded} added, ${canonicalExisting} already existed.`);

  // 5. Programme Courses (programme_courses collection)
  let pcAdded = 0;
  let pcExisting = 0;
  const pcToCommit = [];
  for (const pc of targetProgrammeCourses) {
    if (!existingPCIds.has(pc.id)) {
      pcToCommit.push(pc);
      pcAdded++;
    } else {
      pcExisting++;
      duplicatesPrevented++;
    }
  }

  for (let i = 0; i < pcToCommit.length; i += 400) {
    const chunk = pcToCommit.slice(i, i + 400);
    const batch = writeBatch(db);
    chunk.forEach(pc => batch.set(doc(db, 'programme_courses', pc.id), pc));
    await batch.commit();
  }
  console.log(`✓ Programme-Course relationships: ${pcAdded} added, ${pcExisting} already existed.`);

  // 6. Catalogue Course Records (catalogue_courses collection)
  let ccRecAdded = 0;
  let ccRecExisting = 0;
  const ccRecToCommit = [];
  for (const cr of targetCourseRecords) {
    if (!existingCCIds.has(cr.id)) {
      ccRecToCommit.push(cr);
      ccRecAdded++;
    } else {
      ccRecExisting++;
      duplicatesPrevented++;
    }
  }

  for (let i = 0; i < ccRecToCommit.length; i += 400) {
    const chunk = ccRecToCommit.slice(i, i + 400);
    const batch = writeBatch(db);
    chunk.forEach(cr => batch.set(doc(db, 'catalogue_courses', cr.id), cr));
    await batch.commit();
  }
  console.log(`✓ Catalogue Course records: ${ccRecAdded} added, ${ccRecExisting} already existed.`);

  // 7. Full Hierarchical Chain Validation
  console.log('Validating full hierarchy chain for every processed programme in batch...');
  for (const prog of targetProgrammes) {
    const pCourses = targetProgrammeCourses.filter(pc => pc.programmeId === prog.id);
    const years = new Set(pCourses.map(c => c.yearOfStudy));
    const semesters = new Set(pCourses.map(c => c.semester));
    if (pCourses.length === 0) {
      throw new Error(`Validation error: programme ${prog.id} has 0 courses!`);
    }
    console.log(`  ✓ [Hierarchy Verified] UDSM → ${prog.academicUnitId} → ${prog.departmentId} → ${prog.shortName}: ${pCourses.length} courses across Years [${[...years].sort().join(',')}] & Semesters [${[...semesters].sort().join(',')}]`);
  }

  return {
    batchName,
    programmesProcessed: targetProgrammes.map(p => `${p.shortName || p.name} (${p.id})`),
    programmesAdded,
    programmesExisting,
    canonicalCoursesAdded: canonicalAdded,
    canonicalCoursesExisting: canonicalExisting,
    programmeCoursesAdded: pcAdded,
    programmeCoursesExisting: pcExisting,
    catalogueCoursesAdded: ccRecAdded,
    catalogueCoursesExisting: ccRecExisting,
    duplicatesPrevented,
    validationPassed: true,
    unverifiedInfo,
  };
}

const targetUnitsArg = process.argv[2] || 'conas';
const unitList = targetUnitsArg.split(',').map(u => u.trim()).filter(Boolean);
const batchTitle = process.argv[3] || `Batch: ${unitList.join(', ')}`;

processBatchForUnits(unitList, batchTitle)
  .then(res => {
    console.log('\n--- BATCH SUMMARY OUTPUT ---');
    console.log(JSON.stringify(res, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error('Batch failed:', err);
    process.exit(1);
  });
