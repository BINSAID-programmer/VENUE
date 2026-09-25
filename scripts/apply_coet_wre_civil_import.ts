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

const SUPPLIED_COURSES: CourseInput[] = [
  // YEAR 1 — SEMESTER 1
  { code: 'CL 111', title: 'Communication Skills for Engineers', credits: 12, year: 1, semester: 1, status: 'Core', deptId: 'dept-foreign-languages', unitId: 'cohu' },
  { code: 'EE 171', title: 'Computer Programming for Engineers', credits: 8, year: 1, semester: 1, status: 'Core', deptId: 'dept-cse', unitId: 'coict' },
  { code: 'DS 114', title: 'Development Perspectives I', credits: 12, year: 1, semester: 1, status: 'Core', deptId: 'dept-dev-studies', unitId: 'ids' },
  { code: 'SC 101', title: 'Civil Engineering Drawing I', credits: 10, year: 1, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'SC 121', title: 'Statics', credits: 12, year: 1, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'TR 111', title: 'Engineering Surveying I', credits: 8, year: 1, semester: 1, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'MT 161', title: 'Matrices and Basic Calculus for Non-Majors', credits: 12, year: 1, semester: 1, status: 'Core', deptId: 'dept-math', unitId: 'conas' },
  { code: 'TW 107 / TW 108', title: 'Building, Setting out, Formwork & Brick Work Skills', credits: 6, year: 1, semester: 1, status: 'Core', deptId: 'dept-wre', unitId: 'coet' },
  { code: 'TW 113 / TW 114', title: 'Carpentry and Joinery', credits: 6, year: 1, semester: 1, status: 'Core', deptId: 'dept-wre', unitId: 'coet' },

  // YEAR 1 — SEMESTER 2
  { code: 'FN 250', title: 'Financial Literacy', credits: 0, year: 1, semester: 2, status: 'Core', deptId: 'dept-finance', unitId: 'udbs' },
  { code: 'SC 102', title: 'Civil Engineering Drawing II', credits: 10, year: 1, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'SC 112', title: 'Construction Materials I', credits: 12, year: 1, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'SC 122', title: 'Dynamics of Solids', credits: 8, year: 1, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'DS 115', title: 'Development Perspectives II', credits: 8, year: 1, semester: 2, status: 'Core', deptId: 'dept-dev-studies', unitId: 'ids' },
  { code: 'TR 112', title: 'Engineering Surveying II', credits: 8, year: 1, semester: 2, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'MT 171', title: 'One Variable Calculus and Differential Equations for Non-Majors', credits: 12, year: 1, semester: 2, status: 'Core', deptId: 'dept-math', unitId: 'conas' },
  { code: 'SC 104', title: 'Fundamentals of Building Design', credits: 8, year: 1, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'TW 133 / TW 134', title: 'Electrical Machines and Installation Practice', credits: 6, year: 1, semester: 2, status: 'Core', deptId: 'dept-wre', unitId: 'coet' },
  { code: 'TW 151 / TW 152', title: 'Welding and Fabrication', credits: 6, year: 1, semester: 2, status: 'Core', deptId: 'dept-wre', unitId: 'coet' },

  // YEAR 2 — SEMESTER 1
  { code: 'SC 211', title: 'Civil Engineering Materials II', credits: 12, year: 2, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'SC 201', title: 'Mechanics of Materials', credits: 8, year: 2, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'MT 261', title: 'Several Variable Calculus for Non-Majors', credits: 12, year: 2, semester: 1, status: 'Core', deptId: 'dept-math', unitId: 'conas' },
  { code: 'TR 231', title: 'Geology for Civil Engineers', credits: 8, year: 2, semester: 1, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'WR 211', title: 'Fluid Mechanics for Civil Engineers', credits: 12, year: 2, semester: 1, status: 'Core', deptId: 'dept-wre', unitId: 'coet' },
  { code: 'SC 221', title: 'Analysis of Statically Determinate Structures', credits: 12, year: 2, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },

  // YEAR 2 — SEMESTER 2
  { code: 'MT 271', title: 'Statistics for Non-Majors', credits: 12, year: 2, semester: 2, status: 'Core', deptId: 'dept-math', unitId: 'conas' },
  { code: 'TR 221', title: 'Transportation System and Planning', credits: 12, year: 2, semester: 2, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'TR 232', title: 'Soil Mechanics', credits: 12, year: 2, semester: 2, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'WR 212', title: 'Open Channel Hydraulics', credits: 8, year: 2, semester: 2, status: 'Core', deptId: 'dept-wre', unitId: 'coet' },
  { code: 'WR 213', title: 'Hydraulic Practicals', credits: 4, year: 2, semester: 2, status: 'Core', deptId: 'dept-wre', unitId: 'coet' },
  { code: 'WR 231', title: 'Water Supply and Treatment', credits: 12, year: 2, semester: 2, status: 'Core', deptId: 'dept-wre', unitId: 'coet' },
  { code: 'SC 222', title: 'Analysis of Statically Indeterminate Structures', credits: 12, year: 2, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'CE 100', title: 'Practical Training I', credits: 8, year: 2, semester: 2, status: 'Core', deptId: 'dept-wre', unitId: 'coet' },

  // YEAR 3 — SEMESTER 1
  { code: 'SC 361', title: 'Design of Reinforced Concrete Structures I', credits: 8, year: 3, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'TR 334', title: 'Foundation Engineering I', credits: 8, year: 3, semester: 1, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'TR 311', title: 'Highway Materials', credits: 12, year: 3, semester: 1, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'WR 321', title: 'Engineering Hydrology', credits: 12, year: 3, semester: 1, status: 'Core', deptId: 'dept-wre', unitId: 'coet' },
  { code: 'TR 321', title: 'Highway Route and Geometric Design', credits: 12, year: 3, semester: 1, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'SC 321', title: 'Dynamics of Structures', credits: 8, year: 3, semester: 1, status: 'Elective', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'TR 311', title: 'GIS Applications in Civil Engineering', credits: 8, year: 3, semester: 1, status: 'Elective', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'TR 325', title: 'Airport, Harbour and Railway Engineering', credits: 12, year: 3, semester: 1, status: 'Elective', deptId: 'dept-tge', unitId: 'coet' },

  // YEAR 3 — SEMESTER 2
  { code: 'TR 335', title: 'Foundation Engineering II', credits: 8, year: 3, semester: 2, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'SC 342', title: 'Design of Reinforced Concrete Structures II', credits: 8, year: 3, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'SC 312', title: 'Research Methodology for Civil Engineers', credits: 8, year: 3, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'TR 323', title: 'Traffic Engineering and Management', credits: 12, year: 3, semester: 2, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'TR 324', title: 'Pavement Design and Maintenance', credits: 12, year: 3, semester: 2, status: 'Core', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'SC 411', title: 'Design of Steel Structures', credits: 8, year: 3, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'SC 441', title: 'Design of Masonry and Timber Structures', credits: 8, year: 3, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'CE 200', title: 'Practical Training II', credits: 8, year: 3, semester: 2, status: 'Core', deptId: 'dept-wre', unitId: 'coet' },
  { code: 'TR 326', title: 'Labour Based Road Engineering', credits: 12, year: 3, semester: 2, status: 'Elective', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'WR 312', title: 'Rivers and Reservoirs Engineering', credits: 8, year: 3, semester: 2, status: 'Elective', deptId: 'dept-wre', unitId: 'coet' },
  { code: 'WR 325', title: 'Irrigation and Drainage Engineering', credits: 12, year: 3, semester: 2, status: 'Elective', deptId: 'dept-wre', unitId: 'coet' },

  // YEAR 4 — SEMESTER 1
  { code: 'SC 401', title: 'Construction Techniques and Site Organisation', credits: 8, year: 4, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'WR 410', title: 'Design of Hydraulic Structures and Machinery', credits: 8, year: 4, semester: 1, status: 'Core', deptId: 'dept-wre', unitId: 'coet' },
  { code: 'SC 431', title: 'Engineering Economics and Planning Techniques', credits: 12, year: 4, semester: 1, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'CE 498', title: 'Final Project I', credits: 8, year: 4, semester: 1, status: 'Core', deptId: 'dept-wre', unitId: 'coet' },
  { code: 'SC 402', title: 'Maintenance and Rehabilitation of Constructed Facilities', credits: 8, year: 4, semester: 1, status: 'Elective', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'SC 422', title: 'Numerical Methods in Structural Engineering', credits: 8, year: 4, semester: 1, status: 'Elective', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'SC 429', title: 'Management of Construction Projects', credits: 12, year: 4, semester: 1, status: 'Elective', deptId: 'dept-sce', unitId: 'coet' },

  // YEAR 4 — SEMESTER 2
  { code: 'SC 432', title: 'Civil Engineering Procedures & Ethics', credits: 8, year: 4, semester: 2, status: 'Core', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'WR 432', title: 'Wastewater Treatment', credits: 12, year: 4, semester: 2, status: 'Core', deptId: 'dept-wre', unitId: 'coet' },
  { code: 'IE 445', title: 'Entrepreneurship for Engineers', credits: 12, year: 4, semester: 2, status: 'Core', deptId: 'dept-mie', unitId: 'coet' },
  { code: 'CE 499', title: 'Final Project II', credits: 12, year: 4, semester: 2, status: 'Core', deptId: 'dept-wre', unitId: 'coet' },
  { code: 'CE 300', title: 'Practical Training III', credits: 4, year: 4, semester: 2, status: 'Core', deptId: 'dept-wre', unitId: 'coet' },
  { code: 'SC 442', title: 'Fundamentals of Pre-stressed Concrete', credits: 8, year: 4, semester: 2, status: 'Elective', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'SC 472', title: 'Design of Bridges', credits: 8, year: 4, semester: 2, status: 'Elective', deptId: 'dept-sce', unitId: 'coet' },
  { code: 'TR 431', title: 'Machine Foundations', credits: 8, year: 4, semester: 2, status: 'Elective', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'TR 421', title: 'Transportation Economics', credits: 8, year: 4, semester: 2, status: 'Elective', deptId: 'dept-tge', unitId: 'coet' },
  { code: 'WR 423', title: 'Applied Hydrogeology', credits: 8, year: 4, semester: 2, status: 'Elective', deptId: 'dept-wre', unitId: 'coet' },
  { code: 'WR 460', title: 'Management of Solid and Hazardous Waste', credits: 12, year: 4, semester: 2, status: 'Elective', deptId: 'dept-wre', unitId: 'coet' },
  { code: 'WR 470', title: 'Environmental Impact Assessment', credits: 8, year: 4, semester: 2, status: 'Elective', deptId: 'dept-wre', unitId: 'coet' },
];

async function run() {
  console.log('=== STARTING COET BATCH 1: WRE (CIVIL ENGINEERING) IMPORT ===');

  // STEP 1: Verify Academic Unit (DO NOT modify)
  const coetDoc = await getDoc(doc(db, 'academic_units', 'coet'));
  if (!coetDoc.exists()) {
    throw new Error('Academic Unit "coet" not found!');
  }
  console.log(`[PASS] Confirmed Academic Unit: "${coetDoc.data()?.name}" (ID: coet)`);

  // STEP 2: Verify Department (DO NOT modify)
  const wreDeptDoc = await getDoc(doc(db, 'departments', 'dept-wre'));
  if (!wreDeptDoc.exists()) {
    throw new Error('Department "dept-wre" not found!');
  }
  console.log(`[PASS] Confirmed Department: "${wreDeptDoc.data()?.name}" (ID: dept-wre, Unit: ${wreDeptDoc.data()?.academicUnitId})`);

  // STEP 3: Confirm Programme: Bachelor of Science in Civil Engineering (dept-wre)
  const progId = 'bsc-civil';
  const progDoc = await getDoc(doc(db, 'programmes', progId));
  const progData = {
    ...(progDoc.exists() ? progDoc.data() : {}),
    id: progId,
    name: 'Bachelor of Science in Civil Engineering',
    shortName: 'BSc Civil',
    departmentId: 'dept-wre',
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
  console.log(`[PASS] Confirmed Programme: "${progData.name}" (${progId}) linked to Department "dept-wre"`);

  // STEP 4: Inspect Existing Canonical Courses & Conflict Detection
  console.log('\n--- Fetching existing canonical courses ---');
  const existingCanonicalSnap = await getDocs(collection(db, 'canonical_courses'));
  const canonicalMapByCode = new Map<string, any[]>();
  existingCanonicalSnap.docs.forEach((d) => {
    const data = d.data();
    const code = (data.code || '').toUpperCase().trim();
    if (code) {
      if (!canonicalMapByCode.has(code)) canonicalMapByCode.set(code, []);
      canonicalMapByCode.get(code)!.push({ canonicalId: d.id, ...data });
    }
  });

  const coursesCreated: string[] = [];
  const coursesReused: string[] = [];
  const codeTitleConflicts: {
    code: string;
    suppliedTitle: string;
    suppliedCredits: number;
    existingTitle: string;
    existingCredits: number;
    reason: string;
  }[] = [];
  const skippedRecords: {
    code: string;
    title: string;
    credits: number;
    year: number;
    semester: number;
    status: string;
    reason: string;
  }[] = [];
  const validCoursesToImport: {
    course: CourseInput;
    canonicalId: string;
  }[] = [];

  let currentBatch = writeBatch(db);
  let batchCount = 0;

  async function flushBatch() {
    if (batchCount > 0) {
      await currentBatch.commit();
      currentBatch = writeBatch(db);
      batchCount = 0;
    }
  }

  // Check for intra-batch duplicate codes (e.g. TR 311 appearing twice in supplied input)
  const suppliedCodeCounts = new Map<string, number>();
  for (const c of SUPPLIED_COURSES) {
    const codeUpper = c.code.toUpperCase().trim();
    suppliedCodeCounts.set(codeUpper, (suppliedCodeCounts.get(codeUpper) || 0) + 1);
  }

  for (const c of SUPPLIED_COURSES) {
    const codeUpper = c.code.toUpperCase().trim();
    const existingList = canonicalMapByCode.get(codeUpper);

    // Intra-batch duplicate check (e.g. TR 311)
    const isIntraDuplicate = (suppliedCodeCounts.get(codeUpper) || 0) > 1;

    if (existingList && existingList.length > 0) {
      const match = existingList.find(
        (e) =>
          e.title?.toLowerCase().trim() === c.title.toLowerCase().trim() &&
          (e.defaultCredits === c.credits || e.credits === c.credits)
      );

      if (match && !isIntraDuplicate) {
        // Exact match found and no intra-batch conflict -> Reuse
        coursesReused.push(`[${c.code}] ${c.title} (${c.credits} cr) -> Reused: ${match.canonicalId}`);
        validCoursesToImport.push({
          course: c,
          canonicalId: match.canonicalId,
        });
      } else {
        // Conflict!
        const primaryExisting = existingList[0];
        let reason = '';
        if (isIntraDuplicate) {
          reason = `Supplied code appears ${suppliedCodeCounts.get(codeUpper)} times in batch with different titles/credits AND conflicts with existing canonical "${primaryExisting.title}" (${primaryExisting.defaultCredits ?? primaryExisting.credits} cr)`;
        } else if (primaryExisting.title?.toLowerCase().trim() !== c.title.toLowerCase().trim()) {
          reason = `Title mismatch: Supplied "${c.title}" vs Existing "${primaryExisting.title}"`;
        } else {
          reason = `Credits mismatch: Supplied ${c.credits} credits vs Existing ${primaryExisting.defaultCredits ?? primaryExisting.credits} credits`;
        }

        codeTitleConflicts.push({
          code: c.code,
          suppliedTitle: c.title,
          suppliedCredits: c.credits,
          existingTitle: primaryExisting.title,
          existingCredits: primaryExisting.defaultCredits ?? primaryExisting.credits,
          reason,
        });

        skippedRecords.push({
          code: c.code,
          title: c.title,
          credits: c.credits,
          year: c.year,
          semester: c.semester,
          status: c.status,
          reason: `STOPPED import: Existing canonical course preserved untouched without overwriting. (${reason})`,
        });
      }
    } else {
      // Not in canonical courses -> Create new
      const generatedId = c.code.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
      const canonicalRecord = {
        id: generatedId,
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
      coursesCreated.push(`[${c.code}] ${c.title} (${c.credits} cr) -> Created: ${generatedId}`);
      validCoursesToImport.push({
        course: c,
        canonicalId: generatedId,
      });
    }
  }

  await flushBatch();
  console.log(`[PASS] Canonical courses processed: ${coursesCreated.length} created, ${coursesReused.length} reused.`);
  console.log(`[PASS] Conflicts flagged and stopped: ${codeTitleConflicts.length}, skipped records: ${skippedRecords.length}`);

  // STEP 5: Clean up old synthetic placeholder records for bsc-civil
  console.log('\n--- Cleaning up obsolete bsc-civil records ---');
  const oldCcSnap = await getDocs(query(collection(db, 'catalogue_courses'), where('programmeId', '==', progId)));
  const oldPcSnap = await getDocs(query(collection(db, 'programme_courses'), where('programmeId', '==', progId)));

  let obsoleteRemoved = 0;
  for (const d of oldCcSnap.docs) {
    currentBatch.delete(d.ref);
    batchCount++;
    if (batchCount >= 400) await flushBatch();
    obsoleteRemoved++;
  }
  for (const d of oldPcSnap.docs) {
    currentBatch.delete(d.ref);
    batchCount++;
    if (batchCount >= 400) await flushBatch();
  }
  await flushBatch();
  console.log(`[PASS] Obsolete legacy placeholder links removed: ${obsoleteRemoved}`);

  // STEP 6: Programme-Course & Catalogue-Courses Writes for all valid courses
  console.log('\n--- Writing Programme-Course and Catalogue-Course links ---');
  let relationshipsCreated = 0;

  for (const item of validCoursesToImport) {
    const c = item.course;
    const canonicalId = item.canonicalId;
    const pcId = `${progId}_${canonicalId}`;
    const codeSlug = c.code.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
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
      departmentId: 'dept-wre',
      verified: true,
      source: OFFICIAL_SOURCE,
      academicYear: '2025/2026',
      sourceType: 'official_prospectus',
    };

    const ccData = {
      id: ccId,
      universityId: 'udsm',
      academicUnitId: 'coet',
      departmentId: 'dept-wre',
      programmeId: progId,
      canonicalCourseId: canonicalId,
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

    currentBatch.set(doc(db, 'programme_courses', pcId), pcData, { merge: true });
    batchCount++;
    if (batchCount >= 400) await flushBatch();

    currentBatch.set(doc(db, 'catalogue_courses', ccId), ccData, { merge: true });
    batchCount++;
    if (batchCount >= 400) await flushBatch();

    relationshipsCreated++;
  }

  await flushBatch();
  console.log(`[PASS] Total programme-course relationships created: ${relationshipsCreated}`);

  // STEP 7: Validation & Verification Read-back
  console.log('\n--- VERIFICATION AUDIT ---');
  const verifyCcSnap = await getDocs(query(collection(db, 'catalogue_courses'), where('programmeId', '==', progId)));
  const verifyPcSnap = await getDocs(query(collection(db, 'programme_courses'), where('programmeId', '==', progId)));

  console.log(`Verified bsc-civil catalogue_courses: ${verifyCcSnap.size}`);
  console.log(`Verified bsc-civil programme_courses: ${verifyPcSnap.size}`);

  const semesterBreakdown: Record<string, { total: number; core: number; elective: number; courses: string[] }> = {};
  for (let y = 1; y <= 4; y++) {
    for (let s = 1; s <= 2; s++) {
      const key = `Year ${y} Semester ${s}`;
      const semCourses = verifyCcSnap.docs
        .map((d) => d.data())
        .filter((c) => c.yearOfStudy === y && c.semester === s);
      const core = semCourses.filter((c) => c.status === 'Core').length;
      const elective = semCourses.filter((c) => c.status === 'Elective').length;
      semesterBreakdown[key] = {
        total: semCourses.length,
        core,
        elective,
        courses: semCourses.map((c) => `${c.code} (${c.status}, ${c.credits} cr)`),
      };
    }
  }

  const resultSummary = {
    programme: {
      id: progId,
      name: progData.name,
      academicUnit: 'College of Engineering and Technology (CoET)',
      department: 'Department of Water Resources Engineering (WRE)',
      durationYears: 4,
    },
    metrics: {
      coursesCreated: coursesCreated.length,
      coursesReused: coursesReused.length,
      relationshipsCreated,
      duplicatesPrevented: suppliedCodeCounts.size < SUPPLIED_COURSES.length ? SUPPLIED_COURSES.length - suppliedCodeCounts.size : 0,
      codeTitleConflicts: codeTitleConflicts.length,
      skippedRecords: skippedRecords.length,
    },
    coursesCreatedList: coursesCreated,
    coursesReusedList: coursesReused,
    codeTitleConflictsList: codeTitleConflicts,
    skippedRecordsList: skippedRecords,
    semesterBreakdown,
  };

  return resultSummary;
}

run()
  .then((res) => {
    console.log('\n=== JSON SUMMARY RESULT ===');
    console.log(JSON.stringify(res, null, 2));
    process.exit(0);
  })
  .catch((err) => {
    console.error('Import failed:', err);
    process.exit(1);
  });
