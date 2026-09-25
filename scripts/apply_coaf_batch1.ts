import { initializeApp } from 'firebase/app';
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
  writeBatch,
} from 'firebase/firestore';
import * as fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app);

const OFFICIAL_SOURCE = 'UDSM Undergraduate Prospectus 2025/2026 (Official Source of Truth)';

interface CourseDef {
  code: string;
  title: string;
  credits: number;
  year: number;
  semester: number;
  status: 'Core' | 'Elective';
  canonicalId: string;
  deptId: string;
  unitId: string;
}

const COURSES_PAGE_87: CourseDef[] = [
  // First Year - Semester 1
  { code: 'EC 116', title: 'Introductory Microeconomics I', credits: 12, year: 1, semester: 1, status: 'Core', canonicalId: 'ec_116', deptId: 'dept-economics', unitId: 'udse' },
  { code: 'EC 117', title: 'Introductory Macroeconomics I', credits: 12, year: 1, semester: 1, status: 'Core', canonicalId: 'ec_117', deptId: 'dept-economics', unitId: 'udse' },
  { code: 'AC 100', title: 'Principles of Accounting I', credits: 12, year: 1, semester: 1, status: 'Core', canonicalId: 'ac_100', deptId: 'dept-accounting', unitId: 'udbs' },
  { code: 'EB 100', title: 'Agricultural Economics', credits: 12, year: 1, semester: 1, status: 'Core', canonicalId: 'eb_100', deptId: 'dept-coaf-aeb', unitId: 'coaf' },
  { code: 'DS 112', title: 'Development Perspectives I', credits: 12, year: 1, semester: 1, status: 'Core', canonicalId: 'ds_112', deptId: 'ids', unitId: 'ids' },
  { code: 'EB 101', title: 'Natural Resources Economics I', credits: 12, year: 1, semester: 1, status: 'Core', canonicalId: 'eb_101', deptId: 'dept-coaf-aeb', unitId: 'coaf' },

  // First Year - Semester 2
  { code: 'EC 126', title: 'Introductory Microeconomics II', credits: 12, year: 1, semester: 2, status: 'Core', canonicalId: 'ec_126', deptId: 'dept-economics', unitId: 'udse' },
  { code: 'EC 127', title: 'Introductory Macroeconomics II', credits: 12, year: 1, semester: 2, status: 'Core', canonicalId: 'ec_127', deptId: 'dept-economics', unitId: 'udse' },
  { code: 'AC 101', title: 'Principles of Accounting II', credits: 12, year: 1, semester: 2, status: 'Core', canonicalId: 'ac_101', deptId: 'dept-accounting', unitId: 'udbs' },
  { code: 'EB 103', title: 'Entrepreneurship and Innovation I', credits: 12, year: 1, semester: 2, status: 'Core', canonicalId: 'eb_103', deptId: 'dept-coaf-aeb', unitId: 'coaf' },
  { code: 'DS 113', title: 'Development Perspectives II', credits: 12, year: 1, semester: 2, status: 'Core', canonicalId: 'ds_113', deptId: 'ids', unitId: 'ids' },
  { code: 'EB 102', title: 'Natural Resources Economics II', credits: 12, year: 1, semester: 2, status: 'Core', canonicalId: 'eb_102', deptId: 'dept-coaf-aeb', unitId: 'coaf' },

  // Second Year - Semester 1
  { code: 'EC 216', title: 'Intermediate Microeconomics I', credits: 12, year: 2, semester: 1, status: 'Core', canonicalId: 'ec_216', deptId: 'dept-economics', unitId: 'udse' },
  { code: 'EC 217', title: 'Intermediate Macroeconomics I', credits: 12, year: 2, semester: 1, status: 'Core', canonicalId: 'ec_217', deptId: 'dept-economics', unitId: 'udse' },
  { code: 'EB 201', title: 'Agricultural Products Marketing I', credits: 12, year: 2, semester: 1, status: 'Core', canonicalId: 'eb_201', deptId: 'dept-coaf-aeb', unitId: 'coaf' },
  { code: 'EC 218', title: 'Quantitative Methods I', credits: 12, year: 2, semester: 1, status: 'Core', canonicalId: 'ec_218', deptId: 'dept-economics', unitId: 'udse' },
  { code: 'EC 219', title: 'Econometrics I', credits: 12, year: 2, semester: 1, status: 'Core', canonicalId: 'ec_219', deptId: 'dept-economics', unitId: 'udse' },
  { code: 'EB 200', title: 'Agribusiness Management', credits: 12, year: 2, semester: 1, status: 'Core', canonicalId: 'eb_200', deptId: 'dept-coaf-aeb', unitId: 'coaf' },

  // Second Year - Semester 2
  { code: 'EC 220', title: 'Development Economics', credits: 12, year: 2, semester: 2, status: 'Core', canonicalId: 'ec_220', deptId: 'dept-economics', unitId: 'udse' },
  { code: 'EC 228', title: 'Quantitative Methods II', credits: 12, year: 2, semester: 2, status: 'Core', canonicalId: 'ec_228', deptId: 'dept-economics', unitId: 'udse' },
  { code: 'EC 229', title: 'Econometrics II', credits: 12, year: 2, semester: 2, status: 'Core', canonicalId: 'ec_229', deptId: 'dept-economics', unitId: 'udse' },
  { code: 'EB 202', title: 'Agricultural Products Marketing II', credits: 12, year: 2, semester: 2, status: 'Core', canonicalId: 'eb_202', deptId: 'dept-coaf-aeb', unitId: 'coaf' },
  { code: 'EB 204', title: 'Business Planning', credits: 12, year: 2, semester: 2, status: 'Core', canonicalId: 'eb_204', deptId: 'dept-coaf-aeb', unitId: 'coaf' },
  { code: 'EB 203', title: 'Fishery Economics and Management', credits: 12, year: 2, semester: 2, status: 'Core', canonicalId: 'eb_203', deptId: 'dept-coaf-aeb', unitId: 'coaf' },
  { code: 'EB 310', title: 'Practical Training', credits: 12, year: 2, semester: 2, status: 'Core', canonicalId: 'eb_310', deptId: 'dept-coaf-aeb', unitId: 'coaf' },

  // Third Year - Semester 1
  { code: 'EB 303', title: 'Entrepreneurship and Innovation II', credits: 12, year: 3, semester: 1, status: 'Core', canonicalId: 'eb_303', deptId: 'dept-coaf-aeb', unitId: 'coaf' },
  { code: 'EB 304', title: 'Economics of Agricultural Marketing I', credits: 12, year: 3, semester: 1, status: 'Core', canonicalId: 'eb_304', deptId: 'dept-coaf-aeb', unitId: 'coaf' },
  { code: 'EB 300', title: 'Economic Management and Policy Analysis', credits: 12, year: 3, semester: 1, status: 'Core', canonicalId: 'eb_300', deptId: 'dept-coaf-aeb', unitId: 'coaf' },
  { code: 'EB 301', title: 'Natural Resource Accounting', credits: 12, year: 3, semester: 1, status: 'Core', canonicalId: 'eb_301', deptId: 'dept-coaf-aeb', unitId: 'coaf' },
  { code: 'EB 302', title: 'Applied Econometrics', credits: 12, year: 3, semester: 1, status: 'Core', canonicalId: 'eb_302', deptId: 'dept-coaf-aeb', unitId: 'coaf' },
  { code: 'EC 372', title: 'Public Sector Economics I', credits: 12, year: 3, semester: 1, status: 'Core', canonicalId: 'ec_372', deptId: 'dept-economics', unitId: 'udse' },

  // Third Year - Semester 2
  { code: 'EB 308', title: 'Management Information Systems', credits: 12, year: 3, semester: 2, status: 'Core', canonicalId: 'eb_308', deptId: 'dept-coaf-aeb', unitId: 'coaf' },
  { code: 'EB 306', title: 'Project Appraisal and Techniques', credits: 12, year: 3, semester: 2, status: 'Core', canonicalId: 'eb_306', deptId: 'dept-coaf-aeb', unitId: 'coaf' },
  { code: 'EB 305', title: 'Economics of Agricultural Marketing II', credits: 12, year: 3, semester: 2, status: 'Core', canonicalId: 'eb_305', deptId: 'dept-coaf-aeb', unitId: 'coaf' },
  { code: 'EC 377', title: 'Industrial Economics', credits: 12, year: 3, semester: 2, status: 'Core', canonicalId: 'ec_377', deptId: 'dept-economics', unitId: 'udse' },
  { code: 'EB 309', title: 'Environmental Economics', credits: 12, year: 3, semester: 2, status: 'Core', canonicalId: 'eb_309', deptId: 'dept-coaf-aeb', unitId: 'coaf' },
  { code: 'EC 382', title: 'Public Sector Economics II', credits: 12, year: 3, semester: 2, status: 'Core', canonicalId: 'ec_382', deptId: 'dept-economics', unitId: 'udse' },
];

async function importCoafBatch1() {
  console.log('=== BATCH 1: CoAF -> Dept of Agricultural Economics and Business -> BSc ANEB ===');

  // STEP 1: Verify Existing Academic Unit (CoAF)
  const coafDoc = await getDoc(doc(db, 'academic_units', 'coaf'));
  if (!coafDoc.exists()) {
    throw new Error('Academic unit "coaf" not found in Firestore!');
  }
  console.log(`[PASS] Reused Academic Unit: "${coafDoc.data()?.name}" (ID: coaf)`);

  // STEP 2: Verify Existing Department (dept-coaf-aeb)
  const deptDoc = await getDoc(doc(db, 'departments', 'dept-coaf-aeb'));
  if (!deptDoc.exists()) {
    throw new Error('Department "dept-coaf-aeb" not found in Firestore!');
  }
  console.log(`[PASS] Reused Department: "${deptDoc.data()?.name}" (ID: dept-coaf-aeb) under unit "${deptDoc.data()?.academicUnitId}"`);

  // STEP 3: Reuse / Update Programme (bsc-aneb)
  const progRef = doc(db, 'programmes', 'bsc-aneb');
  const progSnap = await getDoc(progRef);
  const programmeExists = progSnap.exists();
  const programmeData = {
    id: 'bsc-aneb',
    name: 'Bachelor of Science in Agricultural and Natural Resources Economics and Business',
    shortName: 'BSc ANEB',
    awardLevel: 'Bachelor Degree',
    academicUnitId: 'coaf',
    departmentId: 'dept-coaf-aeb',
    durationYears: 3,
    studyMode: 'Full-Time',
    universityId: 'udsm',
    academicYear: '2025/2026',
    verified: true,
    source: OFFICIAL_SOURCE,
  };
  await setDoc(progRef, programmeData, { merge: true });
  console.log(`[PASS] Programme: Reused and updated bsc-aneb ("${programmeData.name}", Short: "${programmeData.shortName}")`);

  // STEP 4: Canonical Courses handling (Deduplication check)
  const canonicalSnap = await getDocs(collection(db, 'canonical_courses'));
  const existingCanonicalIds = new Set(canonicalSnap.docs.map(d => d.id));

  let canonicalAdded = 0;
  let canonicalReused = 0;

  for (const c of COURSES_PAGE_87) {
    if (existingCanonicalIds.has(c.canonicalId)) {
      canonicalReused++;
    } else {
      const canonicalRecord = {
        id: c.canonicalId,
        code: c.code,
        title: c.title,
        defaultCredits: c.credits,
        departmentId: c.deptId,
        academicUnitId: c.unitId,
        universityId: 'udsm',
        verified: true,
        source: OFFICIAL_SOURCE,
        academicYear: '2025/2026',
        sourceType: 'official_prospectus',
      };
      await setDoc(doc(db, 'canonical_courses', c.canonicalId), canonicalRecord);
      existingCanonicalIds.add(c.canonicalId);
      canonicalAdded++;
    }
  }
  console.log(`[PASS] Canonical Courses: ${canonicalAdded} new added, ${canonicalReused} existing reused.`);

  // STEP 5: Clean up old synthetic placeholder courses specifically for bsc-aneb
  const currentCCSnap = await getDocs(query(collection(db, 'catalogue_courses'), where('programmeId', '==', 'bsc-aneb')));
  const currentPCSnap = await getDocs(query(collection(db, 'programme_courses'), where('programmeId', '==', 'bsc-aneb')));

  const validTargetCodes = new Set(COURSES_PAGE_87.map(c => c.code.toUpperCase()));
  let duplicatesOrObsoletePrevented = 0;

  for (const d of currentCCSnap.docs) {
    const data = d.data();
    if (!validTargetCodes.has((data.code || '').toUpperCase())) {
      console.log(`  Removing obsolete catalogue_course: ${d.id} (${data.code})`);
      await deleteDoc(d.ref);
      duplicatesOrObsoletePrevented++;
    }
  }

  for (const d of currentPCSnap.docs) {
    const data = d.data();
    if (!validTargetCodes.has((data.code || '').toUpperCase())) {
      console.log(`  Removing obsolete programme_course: ${d.id} (${data.code})`);
      await deleteDoc(d.ref);
      duplicatesOrObsoletePrevented++;
    }
  }

  // STEP 6: Insert / Update Programme Courses (programme_courses) & Catalogue Courses (catalogue_courses)
  let pcRelationshipsAddedOrCorrected = 0;
  for (const c of COURSES_PAGE_87) {
    const pcId = `bsc-aneb_${c.canonicalId}`;
    const codeLowerDash = c.code.toLowerCase().replace(/\s+/g, '-');
    const ccId = `udsm_bsc-aneb_${codeLowerDash}`;

    const pcData = {
      id: pcId,
      programmeId: 'bsc-aneb',
      courseId: c.canonicalId,
      code: c.code,
      title: c.title,
      credits: c.credits,
      yearOfStudy: c.year,
      semester: c.semester,
      status: c.status,
      universityId: 'udsm',
      academicUnitId: 'coaf',
      departmentId: 'dept-coaf-aeb',
      verified: true,
      source: OFFICIAL_SOURCE,
      academicYear: '2025/2026',
      sourceType: 'official_prospectus',
    };

    const ccData = {
      id: ccId,
      universityId: 'udsm',
      academicUnitId: 'coaf',
      departmentId: 'dept-coaf-aeb',
      programmeId: 'bsc-aneb',
      canonicalCourseId: c.canonicalId,
      code: c.code,
      title: c.title,
      credits: c.credits,
      yearOfStudy: c.year,
      semester: c.semester,
      status: c.status,
      verified: true,
      source: OFFICIAL_SOURCE,
      academicYear: '2025/2026',
      sourceType: 'official_prospectus',
    };

    await setDoc(doc(db, 'programme_courses', pcId), pcData, { merge: true });
    await setDoc(doc(db, 'catalogue_courses', ccId), ccData, { merge: true });
    pcRelationshipsAddedOrCorrected++;
  }

  console.log(`[PASS] Programme-Course relationships added/corrected: ${pcRelationshipsAddedOrCorrected}`);

  // STEP 7: Verify Complete Hierarchy Chain
  console.log('\n--- VERIFYING COMPLETE HIERARCHY CHAIN ---');
  const verifyPCSnap = await getDocs(query(collection(db, 'programme_courses'), where('programmeId', '==', 'bsc-aneb')));
  const y1s1 = verifyPCSnap.docs.filter(d => d.data().yearOfStudy === 1 && d.data().semester === 1);
  const y1s2 = verifyPCSnap.docs.filter(d => d.data().yearOfStudy === 1 && d.data().semester === 2);
  const y2s1 = verifyPCSnap.docs.filter(d => d.data().yearOfStudy === 2 && d.data().semester === 1);
  const y2s2 = verifyPCSnap.docs.filter(d => d.data().yearOfStudy === 2 && d.data().semester === 2);
  const y3s1 = verifyPCSnap.docs.filter(d => d.data().yearOfStudy === 3 && d.data().semester === 1);
  const y3s2 = verifyPCSnap.docs.filter(d => d.data().yearOfStudy === 3 && d.data().semester === 2);

  console.log(`Year 1 Semester 1: ${y1s1.length} courses (Expected: 6)`);
  console.log(`Year 1 Semester 2: ${y1s2.length} courses (Expected: 6)`);
  console.log(`Year 2 Semester 1: ${y2s1.length} courses (Expected: 6)`);
  console.log(`Year 2 Semester 2: ${y2s2.length} courses (Expected: 7)`);
  console.log(`Year 3 Semester 1: ${y3s1.length} courses (Expected: 6)`);
  console.log(`Year 3 Semester 2: ${y3s2.length} courses (Expected: 6)`);
  console.log(`Total verified courses for BSc ANEB: ${verifyPCSnap.size} (Expected: 37)`);

  if (verifyPCSnap.size !== 37) {
    throw new Error(`Hierarchy check failed: expected 37 courses, found ${verifyPCSnap.size}`);
  }

  console.log('\nAll checks passed successfully!');
  return {
    programmesExisting: programmeExists ? 1 : 0,
    programmesAdded: programmeExists ? 0 : 1,
    canonicalAdded,
    canonicalReused,
    pcRelationshipsAddedOrCorrected,
    duplicatesOrObsoletePrevented,
  };
}

importCoafBatch1()
  .then(res => {
    console.log('\nBATCH EXECUTION COMPLETED:');
    console.log(JSON.stringify(res, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error('Batch execution error:', err);
    process.exit(1);
  });
