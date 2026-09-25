import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
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

interface CourseInput {
  code: string;
  title: string;
  credits: number;
  year: number;
  semester: number;
  status: 'Core' | 'Elective';
  deptId: string;
  unitId: string;
}

// PROGRAMME: Bachelor of Science in Geomatics (4 Years, dept-tge, coet)
const GEOMATICS_COURSES: CourseInput[] = [
  // YEAR 1 — SEMESTER 1
  { code: 'CL 111', title: 'Communication Skills for Engineers', credits: 12, year: 1, semester: 1, status: 'Core', deptId: 'dept-foreign-languages', unitId: 'cohu' },
  { code: 'DS 112', title: 'Development Perspectives I', credits: 12, year: 1, semester: 1, status: 'Core', deptId: 'dept-dev-studies', unitId: 'ids' },
  { code: 'MT 161', title: 'Matrices and Basic Calculus for Non-Majors', credits: 12, year: 1, semester: 1, status: 'Core', deptId: 'dept-math', unitId: 'conas' },
  { code: 'EE 171', title: 'Introduction to Computers and Programming for Engineers', credits: 8, year: 1, semester: 1, status: 'Core', deptId: 'dept-cse', unitId: 'coet' },
  { code: 'GT 111', title: 'Introduction to Surveying', credits: 12, year: 1, semester: 1, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'GT 115', title: 'Principles of Cartography', credits: 12, year: 1, semester: 1, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'GT 173', title: 'Physics for Geomaticians', credits: 8, year: 1, semester: 1, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },

  // YEAR 1 — SEMESTER 2
  { code: 'DS 113', title: 'Development Perspectives II', credits: 12, year: 1, semester: 2, status: 'Core', deptId: 'dept-dev-studies', unitId: 'ids' },
  { code: 'GT 112', title: 'Topographic Surveying', credits: 8, year: 1, semester: 2, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'EE 131', title: 'Fundamentals of Electronics for Engineers', credits: 12, year: 1, semester: 2, status: 'Core', deptId: 'dept-ee', unitId: 'coet' },
  { code: 'GT 156', title: 'Introduction to Photogrammetry', credits: 12, year: 1, semester: 2, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'EE 172', title: 'Computer Programming for Engineers', credits: 8, year: 1, semester: 2, status: 'Core', deptId: 'dept-cse', unitId: 'coet' },
  { code: 'GT 163', title: 'Computer Programming for Geomatics', credits: 12, year: 1, semester: 2, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'MT 171', title: 'One Variable Calculus and Differential Equations for Non-Majors', credits: 12, year: 1, semester: 2, status: 'Core', deptId: 'dept-math', unitId: 'conas' },

  // YEAR 2 — SEMESTER 1
  { code: 'MT 261', title: 'Several Variable Calculus for Non Majors', credits: 12, year: 2, semester: 1, status: 'Core', deptId: 'dept-math', unitId: 'conas' },
  { code: 'GT 213', title: 'Electronic Surveying', credits: 12, year: 2, semester: 1, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'GT 221', title: 'Introduction to Engineering Surveying', credits: 12, year: 2, semester: 1, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'GT 241', title: 'Spherical and Ellipsoidal Geometry', credits: 8, year: 2, semester: 1, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'GT 257', title: 'Remote Sensing Principles and Applications', credits: 8, year: 2, semester: 1, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'LW 202', title: 'Land Law I', credits: 12, year: 2, semester: 1, status: 'Core', deptId: 'dept-public-law', unitId: 'udsol' },

  // YEAR 2 — SEMESTER 2
  { code: 'MT 271', title: 'Statistics for Non Majors', credits: 12, year: 2, semester: 2, status: 'Core', deptId: 'dept-math', unitId: 'conas' },
  { code: 'GT 214', title: 'Cadastral Surveying', credits: 12, year: 2, semester: 2, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'GT 231', title: 'Adjustment Theory', credits: 12, year: 2, semester: 2, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'GT 272', title: 'Urban Planning and Design Theory', credits: 12, year: 2, semester: 2, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'GT 281', title: 'Project I: Cadastral Surveying', credits: 12, year: 2, semester: 2, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'LW 207', title: 'Land Law II', credits: 12, year: 2, semester: 2, status: 'Core', deptId: 'dept-public-law', unitId: 'udsol' },
  { code: 'GT 100', title: 'Practical Training I', credits: 8, year: 2, semester: 2, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },

  // YEAR 3 — SEMESTER 1
  { code: 'GT 353', title: 'Geographical Information Systems (GIS)', credits: 12, year: 3, semester: 1, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'GT 342', title: 'Geometrical Geodesy', credits: 8, year: 3, semester: 1, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'GT 251', title: 'Space Geodetic Techniques', credits: 8, year: 3, semester: 1, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'GT 155', title: 'Satellite Surveying', credits: 12, year: 3, semester: 1, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'GT 362', title: 'Numerical Methods', credits: 8, year: 3, semester: 1, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },

  // YEAR 3 — SEMESTER 2
  { code: 'GT 333', title: 'Applied Adjustment Theory', credits: 12, year: 3, semester: 2, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'GT 312', title: 'Control Surveys', credits: 8, year: 3, semester: 2, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'GT 324', title: 'Mine Surveying', credits: 12, year: 3, semester: 2, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'GT 343', title: 'Map Projections', credits: 8, year: 3, semester: 2, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'GT 352', title: 'Physical Geodesy', credits: 8, year: 3, semester: 2, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'GT 361', title: 'Differential Geometry', credits: 8, year: 3, semester: 2, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'GT 258', title: 'Database Management Systems', credits: 8, year: 3, semester: 2, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'GT 382', title: 'Project II: Control Surveying', credits: 12, year: 3, semester: 2, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'GT 200', title: 'Practical Training II', credits: 8, year: 3, semester: 2, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'TR 311', title: 'GIS Applications in Civil Engineering', credits: 8, year: 3, semester: 2, status: 'Elective', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'TR 321', title: 'Highway Route and Geometric Design', credits: 12, year: 3, semester: 2, status: 'Elective', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'SC 312', title: 'Research Methodology for Civil Engineers', credits: 8, year: 3, semester: 2, status: 'Elective', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'WR 322', title: 'Rivers and Reservoirs Engineering', credits: 8, year: 3, semester: 2, status: 'Elective', deptId: 'dept-wre', unitId: 'coet' },

  // YEAR 4 — SEMESTER 1
  { code: 'GT 422', title: 'Engineering Surveying for Geomaticians', credits: 12, year: 4, semester: 1, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'GT 453', title: 'Geophysics for Geomaticians', credits: 8, year: 4, semester: 1, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'GT 454', title: 'Earth Gravity Field and its Applications', credits: 8, year: 4, semester: 1, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'QS 452', title: 'Architectural Project Management', credits: 8, year: 4, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'IE 354', title: 'Engineering Project Management', credits: 8, year: 4, semester: 1, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { code: 'GT 483', title: 'Project III: Engineering Surveying', credits: 12, year: 4, semester: 1, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'GT 498', title: 'Final Year Project I', credits: 8, year: 4, semester: 1, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'IE 441', title: 'Human Resource Management for Engineers', credits: 8, year: 4, semester: 1, status: 'Elective', deptId: 'dept-mie', unitId: 'coet' },
  { code: 'SC 401', title: 'Construction Techniques and Site Organisation', credits: 8, year: 4, semester: 1, status: 'Elective', deptId: 'dept-sce', unitId: 'coet' },

  // YEAR 4 — SEMESTER 2
  { code: 'IE 445', title: 'Entrepreneurship for Engineers', credits: 12, year: 4, semester: 2, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { code: 'GT 423', title: 'Hydrographic Surveying', credits: 12, year: 4, semester: 2, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'GT 471', title: 'Industrial Metrology', credits: 12, year: 4, semester: 2, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'GT 300', title: 'Practical Training III', credits: 8, year: 4, semester: 2, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'GT 499', title: 'Final Year Project II', credits: 16, year: 4, semester: 2, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'SC 432', title: 'Civil Engineering Procedures and Ethics', credits: 8, year: 4, semester: 2, status: 'Elective', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'WR 470', title: 'Environmental Impact Assessment', credits: 8, year: 4, semester: 2, status: 'Elective', deptId: 'dept-wre', unitId: 'coet' },
];

async function run() {
  console.log('=== STARTING COET BATCH 3: TRANSPORTATION AND GEOTECHNICAL ENGINEERING (TGE) IMPORT ===\n');

  // STEP 1: Verify Academic Unit (DO NOT modify)
  const coetDoc = await getDoc(doc(db, 'academic_units', 'coet'));
  if (!coetDoc.exists()) {
    throw new Error('Academic Unit "coet" not found!');
  }
  console.log(`[PASS] Confirmed Academic Unit: "${coetDoc.data()?.name}" (ID: coet)`);

  // STEP 2: Verify Department (DO NOT modify)
  const tgeDeptDoc = await getDoc(doc(db, 'departments', 'dept-tge'));
  if (!tgeDeptDoc.exists()) {
    throw new Error('Department "dept-tge" not found!');
  }
  console.log(`[PASS] Confirmed Department: "${tgeDeptDoc.data()?.name}" (ID: dept-tge, Unit: ${tgeDeptDoc.data()?.academicUnitId})`);

  // STEP 3: Confirm Programme Bachelor of Science in Geomatics under dept-tge
  const progId = 'bsc-geom';
  const progDoc = await getDoc(doc(db, 'programmes', progId));
  const progData = {
    ...(progDoc.exists() ? progDoc.data() : {}),
    id: progId,
    name: 'Bachelor of Science in Geomatics',
    shortName: 'BSc Geom',
    departmentId: 'dept-tge',
    academicUnitId: 'coet',
    durationYears: 4,
    studyMode: 'Full-Time',
    awardLevel: 'Bachelor Degree',
    universityId: 'udsm',
    academicYear: '2025/2026',
    verified: true,
    source: OFFICIAL_SOURCE,
  };
  await setDoc(doc(db, 'programmes', progId), progData, { merge: true });
  console.log(`[PASS] Confirmed Programme: "${progData.name}" (${progId}) [4 Years] under Department "dept-tge"`);

  // STEP 4: Inspect Existing Canonical Courses
  console.log('\n--- Fetching existing canonical courses ---');
  const existingCanonicalSnap = await getDocs(collection(db, 'canonical_courses'));
  const canonicalMapByCode = new Map<string, any[]>();
  existingCanonicalSnap.docs.forEach((d) => {
    const data = d.data();
    const code = (data.code || '').toUpperCase().trim();
    if (code) {
      if (!canonicalMapByCode.has(code)) canonicalMapByCode.set(code, []);
      canonicalMapByCode.get(code)!.push({ canonicalId: d.id, id: d.id, ...data });
    }
  });

  const coursesCreated: string[] = [];
  const coursesReused: string[] = [];
  const relationshipsCreated: { progId: string; code: string; title: string; cr: number; canonicalId: string; term: string; status: string }[] = [];
  const detectedConflicts: {
    code: string;
    suppliedTitle: string;
    suppliedCredits: number;
    existingTitle: string;
    existingCredits: number;
    existingDept: string;
    resolution: string;
  }[] = [];
  const relationshipsSkipped: { code: string; title: string; reason: string }[] = [];

  let currentBatch = writeBatch(db);
  let batchCount = 0;

  async function flushBatch() {
    if (batchCount > 0) {
      await currentBatch.commit();
      currentBatch = writeBatch(db);
      batchCount = 0;
    }
  }

  // STEP 5: Clean up stale relationships for bsc-geom before creating clean Prospectus records
  console.log(`\n--- Cleaning up prior relationship records for ${progId} ---`);
  const oldCcSnap = await getDocs(query(collection(db, 'catalogue_courses'), where('programmeId', '==', progId)));
  const oldPcSnap = await getDocs(query(collection(db, 'programme_courses'), where('programmeId', '==', progId)));
  for (const d of oldCcSnap.docs) {
    currentBatch.delete(d.ref);
    batchCount++;
    if (batchCount >= 400) await flushBatch();
  }
  for (const d of oldPcSnap.docs) {
    currentBatch.delete(d.ref);
    batchCount++;
    if (batchCount >= 400) await flushBatch();
  }
  await flushBatch();
  console.log(`[PASS] Cleared ${oldCcSnap.size} stale catalogue_courses and ${oldPcSnap.size} stale programme_courses records.`);

  // STEP 6: Process Geomatics Courses
  console.log(`\n--- Processing ${GEOMATICS_COURSES.length} Courses for Bachelor of Science in Geomatics ---`);

  for (const c of GEOMATICS_COURSES) {
    const codeUpper = c.code.toUpperCase().trim();
    const existingList = canonicalMapByCode.get(codeUpper);

    if (existingList && existingList.length > 0) {
      // Course code already exists in canonical_courses!
      const exactMatch = existingList.find(
        (e) =>
          e.title?.toLowerCase().trim() === c.title.toLowerCase().trim() &&
          (e.defaultCredits === c.credits || e.credits === c.credits)
      );

      if (exactMatch) {
        // Exact match of code, title, and credits
        const canonicalId = exactMatch.canonicalId || exactMatch.id;
        coursesReused.push(`[${c.code}] "${c.title}" (${c.credits} cr) -> Canonical: ${canonicalId}`);

        const codeSlug = c.code.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        const pcId = `${progId}_${canonicalId}`;
        const ccId = `udsm_${progId}_${codeSlug}`;

        const pcData = {
          id: pcId,
          programmeId: progId,
          courseId: canonicalId,
          code: c.code,
          title: c.title,
          credits: c.credits,
          yearOfStudy: c.year,
          semester: c.semester,
          status: c.status,
          universityId: 'udsm',
          academicUnitId: 'coet',
          departmentId: 'dept-tge',
          verified: true,
          source: OFFICIAL_SOURCE,
          academicYear: '2025/2026',
          sourceType: 'official_prospectus',
        };

        const ccData = {
          id: ccId,
          programmeId: progId,
          canonicalCourseId: canonicalId,
          code: c.code,
          title: c.title,
          credits: c.credits,
          yearOfStudy: c.year,
          semester: c.semester,
          courseType: c.status,
          status: c.status,
          academicUnitId: 'coet',
          departmentId: 'dept-tge',
          universityId: 'udsm',
          active: true,
          verified: true,
          source: OFFICIAL_SOURCE,
          academicYear: '2025/2026',
          sourceType: 'official_prospectus',
        };

        currentBatch.set(doc(db, 'programme_courses', pcId), pcData, { merge: true });
        currentBatch.set(doc(db, 'catalogue_courses', ccId), ccData, { merge: true });
        batchCount += 2;
        if (batchCount >= 400) await flushBatch();

        relationshipsCreated.push({
          progId,
          code: c.code,
          title: c.title,
          cr: c.credits,
          canonicalId,
          term: `Y${c.year}S${c.semester}`,
          status: c.status,
        });
      } else {
        // Course code matches but title and/or credits differ!
        const primaryExisting = existingList[0];
        const canonicalId = primaryExisting.canonicalId || primaryExisting.id;

        // DO NOT overwrite canonical Course. Preserve existing canonical course untouched.
        // Record conflict:
        const conflictRecord = {
          code: c.code,
          suppliedTitle: c.title,
          suppliedCredits: c.credits,
          existingTitle: primaryExisting.title,
          existingCredits: primaryExisting.defaultCredits ?? primaryExisting.credits,
          existingDept: primaryExisting.departmentId,
          resolution: `Preserved existing canonical course "${primaryExisting.title}" (${primaryExisting.defaultCredits ?? primaryExisting.credits} cr) untouched without overwriting. Created Programme-Course relationship with programme-specific metadata: "${c.title}" (${c.credits} cr, ${c.status}).`,
        };
        detectedConflicts.push(conflictRecord);

        coursesReused.push(
          `[${c.code}] "${c.title}" (${c.credits} cr) -> Linked to Canonical ${canonicalId} ("${primaryExisting.title}", ${primaryExisting.defaultCredits ?? primaryExisting.credits} cr) [Variation preserved]`
        );

        const codeSlug = c.code.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        const pcId = `${progId}_${canonicalId}`;
        const ccId = `udsm_${progId}_${codeSlug}`;

        const pcData = {
          id: pcId,
          programmeId: progId,
          courseId: canonicalId,
          code: c.code,
          title: c.title,
          credits: c.credits,
          yearOfStudy: c.year,
          semester: c.semester,
          status: c.status,
          universityId: 'udsm',
          academicUnitId: 'coet',
          departmentId: 'dept-tge',
          verified: true,
          source: OFFICIAL_SOURCE,
          academicYear: '2025/2026',
          sourceType: 'official_prospectus',
        };

        const ccData = {
          id: ccId,
          programmeId: progId,
          canonicalCourseId: canonicalId,
          code: c.code,
          title: c.title,
          credits: c.credits,
          yearOfStudy: c.year,
          semester: c.semester,
          courseType: c.status,
          status: c.status,
          academicUnitId: 'coet',
          departmentId: 'dept-tge',
          universityId: 'udsm',
          active: true,
          verified: true,
          source: OFFICIAL_SOURCE,
          academicYear: '2025/2026',
          sourceType: 'official_prospectus',
        };

        currentBatch.set(doc(db, 'programme_courses', pcId), pcData, { merge: true });
        currentBatch.set(doc(db, 'catalogue_courses', ccId), ccData, { merge: true });
        batchCount += 2;
        if (batchCount >= 400) await flushBatch();

        relationshipsCreated.push({
          progId,
          code: c.code,
          title: c.title,
          cr: c.credits,
          canonicalId,
          term: `Y${c.year}S${c.semester}`,
          status: c.status,
        });
      }
    } else {
      // Course code does not exist in canonical_courses -> Create new canonical Course record
      const generatedId = c.code.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
      const canonicalRecord = {
        id: generatedId,
        canonicalId: generatedId,
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

      currentBatch.set(doc(db, 'canonical_courses', generatedId), canonicalRecord, { merge: true });
      batchCount++;
      if (batchCount >= 400) await flushBatch();

      canonicalMapByCode.set(codeUpper, [canonicalRecord]);
      coursesCreated.push(`[${c.code}] "${c.title}" (${c.credits} cr) -> Created: ${generatedId}`);

      const codeSlug = c.code.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const pcId = `${progId}_${generatedId}`;
      const ccId = `udsm_${progId}_${codeSlug}`;

      const pcData = {
        id: pcId,
        programmeId: progId,
        courseId: generatedId,
        code: c.code,
        title: c.title,
        credits: c.credits,
        yearOfStudy: c.year,
        semester: c.semester,
        status: c.status,
        universityId: 'udsm',
        academicUnitId: 'coet',
        departmentId: 'dept-tge',
        verified: true,
        source: OFFICIAL_SOURCE,
        academicYear: '2025/2026',
        sourceType: 'official_prospectus',
      };

      const ccData = {
        id: ccId,
        programmeId: progId,
        canonicalCourseId: generatedId,
        code: c.code,
        title: c.title,
        credits: c.credits,
        yearOfStudy: c.year,
        semester: c.semester,
        courseType: c.status,
        status: c.status,
        academicUnitId: 'coet',
        departmentId: 'dept-tge',
        universityId: 'udsm',
        active: true,
        verified: true,
        source: OFFICIAL_SOURCE,
        academicYear: '2025/2026',
        sourceType: 'official_prospectus',
      };

      currentBatch.set(doc(db, 'programme_courses', pcId), pcData, { merge: true });
      currentBatch.set(doc(db, 'catalogue_courses', ccId), ccData, { merge: true });
      batchCount += 2;
      if (batchCount >= 400) await flushBatch();

      relationshipsCreated.push({
        progId,
        code: c.code,
        title: c.title,
        cr: c.credits,
        canonicalId: generatedId,
        term: `Y${c.year}S${c.semester}`,
        status: c.status,
      });
    }
  }

  await flushBatch();

  console.log('\n================ TGE IMPORT SUMMARY ================');
  console.log(`Programme Configured: Bachelor of Science in Geomatics (${progId}) [4 Years, 8 Semesters]`);
  console.log(`New Canonical Courses Created: ${coursesCreated.length}`);
  console.log(`Existing Canonical Courses Reused / Linked: ${coursesReused.length}`);
  console.log(`Programme-Course Relationships Created: ${relationshipsCreated.length}`);
  console.log(`Conflicts Detected & Handled Safely: ${detectedConflicts.length}`);
  console.log(`Relationships Skipped: ${relationshipsSkipped.length}`);

  console.log('\n--- DETAILED CONFLICTS DETECTED & RESOLUTION ---');
  detectedConflicts.forEach((c) => {
    console.log(`[CONFLICT] Code: ${c.code}`);
    console.log(`   Supplied: "${c.suppliedTitle}" (${c.suppliedCredits} cr)`);
    console.log(`   Existing Canonical: "${c.existingTitle}" (${c.existingCredits} cr, Dept: ${c.existingDept})`);
    console.log(`   Resolution: ${c.resolution}`);
  });

  process.exit(0);
}

run().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});
