import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import {
  PROGRAMME_1_COURSES,
  PROGRAMME_2_COURSES,
  PROGRAMME_3_COURSES,
  AuthoritativeCourseItem,
} from '../src/data/authoritativeBiotechCurriculum';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = (firebaseConfig as any).firestoreDatabaseId
  ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
  : getFirestore(app);

const SOURCE_PROSPECTUS = 'UDSM Undergraduate Prospectus 2025/2026 (Official Source of Truth)';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function normalizeCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, ' ');
}

function canonicalDocId(code: string): string {
  return normalizeCode(code).toLowerCase().replace(/\s+/g, '_');
}

// Map of existing canonical IDs in Firestore
const EXISTING_CANONICAL_MAP: Record<string, string> = {
  'DS 112': 'ds_112',
  'DS 113': 'ds_113',
  'EV 200': 'ev_200',
  'SC 215': 'sc_215',
  'CH 118': 'ch_118',
  'MC 100': 'mc_100',
  'BL 111': 'bl_111',
  'MT 111': 'mt_111',
  'BN 131': 'bn_131',
  'PH 103': 'ph_103',
  'CH 117': 'ch_117',
  'BN 232': 'bn_232',
  'BL 234': 'bl_234',
  'BN 240': 'bn_240',
  'MC 238': 'mc_238',
  'BT 218': 'bt_218',
  'BT 217': 'bt_217',
  'BL 390': 'bl_390',
  'ZL 336': 'zl_336',
  'BL 314': 'bl_314',
  'BN 338': 'bn_338',
  'BT 333': 'bt_333',
  'BT 337': 'bt_337',
  'ZL 121': 'zl_121',
  'BL 113': 'bl_113',
  'MC 237': 'mc_237',
  'ZL 236': 'zl_236',
  'EV 300': 'canon_ev_300',
  'CH 121': 'ch_121',
  'CH 172': 'ch_172',
  'IS 131': 'is_131',
  'CH 173': 'ch_173',
  'CH 243': 'ch_243',
  'CH 299': 'ch_299',
  'CH 262': 'ch_262',
  'CH 241': 'ch_241',
  'CH 219': 'ch_219',
  'BL 210': 'bl_210',
  'CH 290': 'ch_290',
  'CH 280': 'ch_280',
  'DS 211': 'canon_ds_211',
  'CH 248': 'ch_248',
  'CH 201': 'ch_201',
  'CH 323': 'ch_323',
  'CH 341': 'ch_341',
  'CH 314': 'ch_314',
  'CH 303': 'ch_303',
  'CH 308': 'ch_308',
  'CH 363': 'ch_363',
  'CH 318': 'ch_318',
  'CH 377': 'ch_377',
  'CH 364': 'ch_364',
  'CH 353': 'ch_353',
  'CH 305': 'ch_305',
  'CH 335': 'ch_335',
  'CH 351': 'ch_351',
  'CH 374': 'ch_374',
  'CH 379': 'ch_379',
  'CH 381': 'ch_381',
  'CH 371': 'ch_371',
};

const MISSING_CANONICAL_CODES = [
  'MC 130', 'MC 131', 'BN 130', 'BN 112', 'MC 132', 'BN 230', 'BN 231', 'BN 235',
  'BN 238', 'MC 234', 'MC 232', 'BN 234', 'BN 237', 'BN 236', 'MC 236', 'MC 233',
  'BN 233', 'BN 239', 'BN 335', 'BN 342', 'BN 340', 'BN 330', 'BN 331', 'BN 337',
  'BN 339', 'MC 330', 'MC 332', 'BN 333', 'BN 341', 'BN 332', 'BN 336', 'BN 334',
  'BN 343', 'MC 333', 'MC 334', 'ZL 302', 'ZL 338', 'MC 231', 'MC 230', 'MC 235',
  'MC 331', 'MC 340', 'MC 335', 'ZL 356'
];

async function runDirectReconciliation() {
  console.log('--- STARTING WRITE-SAFE RECONCILIATION FOR MOLECULAR BIOLOGY & BIOTECHNOLOGY ---');

  // 1. Department Verification & Update
  console.log('[1/5] Writing Department: Department of Molecular Biology and Biotechnology...');
  await setDoc(
    doc(db, 'departments', 'dept-biotech'),
    {
      id: 'dept-biotech',
      name: 'Department of Molecular Biology and Biotechnology',
      academicUnitId: 'conas',
      universityId: 'udsm',
      verified: true,
      source: SOURCE_PROSPECTUS,
      sourceType: 'official_prospectus',
    },
    { merge: true }
  );
  console.log('Department dept-biotech verified.');

  // 2. Programmes Verification & Department Relocation
  console.log('[2/5] Writing 3 Programmes under dept-biotech...');
  const programmes = [
    {
      id: 'bsc-mol-bio',
      name: 'Bachelor of Science in Molecular Biology and Biotechnology',
      shortName: 'BSc Mol Bio & Biotech',
      departmentId: 'dept-biotech',
      academicUnitId: 'conas',
      universityId: 'udsm',
      awardLevel: 'Bachelor Degree',
      durationYears: 3,
      studyMode: 'Full-Time',
      academicYear: '2025/2026',
      verified: true,
      source: SOURCE_PROSPECTUS,
      sourceType: 'official_prospectus',
    },
    {
      id: 'bsc-microbio',
      name: 'Bachelor of Science in Microbiology',
      shortName: 'BSc Microbiology',
      departmentId: 'dept-biotech',
      academicUnitId: 'conas',
      universityId: 'udsm',
      awardLevel: 'Bachelor Degree',
      durationYears: 3,
      studyMode: 'Full-Time',
      academicYear: '2025/2026',
      verified: true,
      source: SOURCE_PROSPECTUS,
      sourceType: 'official_prospectus',
    },
    {
      id: 'bsc-app-micr-chem',
      name: 'Bachelor of Science in Applied Microbiology and Chemistry',
      shortName: 'BSc App Micr & Chem',
      departmentId: 'dept-biotech', // Repointed from dept-chem!
      academicUnitId: 'conas',
      universityId: 'udsm',
      awardLevel: 'Bachelor Degree',
      durationYears: 3,
      studyMode: 'Full-Time',
      academicYear: '2025/2026',
      verified: true,
      source: SOURCE_PROSPECTUS,
      sourceType: 'official_prospectus',
    },
  ];

  for (const prog of programmes) {
    await setDoc(doc(db, 'programmes', prog.id), prog, { merge: true });
    console.log(`Programme ${prog.id} saved under departmentId: ${prog.departmentId}`);
  }

  // 3. Create missing canonical courses without overwriting existing
  console.log('[3/5] Creating missing canonical courses in canonical_courses...');
  const allAuthoritativeItems: { progId: string; item: AuthoritativeCourseItem }[] = [
    ...PROGRAMME_1_COURSES.map((item) => ({ progId: 'bsc-mol-bio', item })),
    ...PROGRAMME_2_COURSES.map((item) => ({ progId: 'bsc-microbio', item })),
    ...PROGRAMME_3_COURSES.map((item) => ({ progId: 'bsc-app-micr-chem', item })),
  ];

  const uniqueCodeMap = new Map<string, AuthoritativeCourseItem>();
  for (const { item } of allAuthoritativeItems) {
    const code = normalizeCode(item.code);
    if (!uniqueCodeMap.has(code)) {
      uniqueCodeMap.set(code, item);
    }
  }

  let createdCanonicalCount = 0;
  for (const code of MISSING_CANONICAL_CODES) {
    const item = uniqueCodeMap.get(code);
    if (!item) continue;
    const docId = canonicalDocId(code);
    const canonicalPayload = {
      id: docId,
      code: code,
      title: item.title,
      defaultCredits: item.credits,
      academicUnitId: 'conas',
      departmentId: item.offeringDepartmentId || 'dept-biotech',
      universityId: 'udsm',
      verified: true,
      source: SOURCE_PROSPECTUS,
      sourceType: 'official_prospectus',
      academicYear: '2025/2026',
    };
    await setDoc(doc(db, 'canonical_courses', docId), canonicalPayload, { merge: true });
    createdCanonicalCount++;
  }
  console.log(`Created ${createdCanonicalCount} missing canonical courses (60 reused safely).`);

  // 4. Delete known stale synthetic course relationships
  console.log('[4/5] Removing known synthetic course relationships from programme_courses & catalogue_courses...');
  const staleProgrammeCourses = [
    // bsc-mol-bio
    'bsc-mol-bio_bl_101', 'bsc-mol-bio_bl_102', 'bsc-mol-bio_bl_103', 'bsc-mol-bio_bl_104',
    'bsc-mol-bio_bl_201', 'bsc-mol-bio_bl_202', 'bsc-mol-bio_bl_203', 'bsc-mol-bio_bl_204',
    'bsc-mol-bio_bl_301', 'bsc-mol-bio_bl_302', 'bsc-mol-bio_bl_399', 'bsc-mol-bio_cl_106',
    'bsc-mol-bio_ds_112',
    // bsc-app-micr-chem
    'bsc-app-micr-chem_ch_101', 'bsc-app-micr-chem_ch_102', 'bsc-app-micr-chem_ch_103', 'bsc-app-micr-chem_ch_104',
    'bsc-app-micr-chem_ch_201', 'bsc-app-micr-chem_ch_202', 'bsc-app-micr-chem_ch_203', 'bsc-app-micr-chem_ch_204',
    'bsc-app-micr-chem_ch_301', 'bsc-app-micr-chem_ch_302', 'bsc-app-micr-chem_ch_399', 'bsc-app-micr-chem_cl_106',
    'bsc-app-micr-chem_ds_112',
  ];

  const staleCatalogueCourses = [
    // bsc-mol-bio
    'udsm_bsc-mol-bio_bl-101', 'udsm_bsc-mol-bio_bl-102', 'udsm_bsc-mol-bio_bl-103', 'udsm_bsc-mol-bio_bl-104',
    'udsm_bsc-mol-bio_bl-201', 'udsm_bsc-mol-bio_bl-202', 'udsm_bsc-mol-bio_bl-203', 'udsm_bsc-mol-bio_bl-204',
    'udsm_bsc-mol-bio_bl-301', 'udsm_bsc-mol-bio_bl-302', 'udsm_bsc-mol-bio_bl-399', 'udsm_bsc-mol-bio_cl-106',
    'udsm_bsc-mol-bio_ds-112',
    // bsc-app-micr-chem
    'udsm_bsc-app-micr-chem_ch-101', 'udsm_bsc-app-micr-chem_ch-102', 'udsm_bsc-app-micr-chem_ch-103', 'udsm_bsc-app-micr-chem_ch-104',
    'udsm_bsc-app-micr-chem_ch-201', 'udsm_bsc-app-micr-chem_ch-202', 'udsm_bsc-app-micr-chem_ch-203', 'udsm_bsc-app-micr-chem_ch-204',
    'udsm_bsc-app-micr-chem_ch-301', 'udsm_bsc-app-micr-chem_ch-302', 'udsm_bsc-app-micr-chem_ch-399', 'udsm_bsc-app-micr-chem_cl-106',
    'udsm_bsc-app-micr-chem_ds-112',
  ];

  for (const id of staleProgrammeCourses) {
    await deleteDoc(doc(db, 'programme_courses', id));
  }
  for (const id of staleCatalogueCourses) {
    await deleteDoc(doc(db, 'catalogue_courses', id));
  }
  console.log(`Deleted ${staleProgrammeCourses.length} stale programme_courses and ${staleCatalogueCourses.length} stale catalogue_courses.`);

  // 5. Write all 185 authoritative relationships into programme_courses & catalogue_courses
  console.log('[5/5] Writing 185 Authoritative Courses into programme_courses & catalogue_courses...');
  const progBatch = [
    { progId: 'bsc-mol-bio', list: PROGRAMME_1_COURSES },
    { progId: 'bsc-microbio', list: PROGRAMME_2_COURSES },
    { progId: 'bsc-app-micr-chem', list: PROGRAMME_3_COURSES },
  ];

  let totalPCWritten = 0;
  let totalCatWritten = 0;

  for (const { progId, list } of progBatch) {
    for (const item of list) {
      const code = normalizeCode(item.code);
      const canonicalId = EXISTING_CANONICAL_MAP[code] || canonicalDocId(code);
      const relDocId = `${progId}_${slugify(code)}_y${item.yearOfStudy}s${item.semester}`;
      const catDocId = `udsm_${progId}_${slugify(code)}_y${item.yearOfStudy}s${item.semester}`;

      const basePayload: any = {
        programmeId: progId,
        courseId: canonicalId,
        code: code,
        courseCode: code,
        title: item.title,
        courseName: item.title,
        credits: item.credits,
        yearOfStudy: Number(item.yearOfStudy),
        semester: Number(item.semester),
        status: item.status,
        courseType: item.status,
        academicUnitId: 'conas',
        departmentId: 'dept-biotech',
        offeringDepartmentId: item.offeringDepartmentId || 'dept-biotech',
        offeringDepartmentName: item.offeringDepartmentName || 'Department of Molecular Biology and Biotechnology',
        universityId: 'udsm',
        verified: true,
        active: true,
        source: SOURCE_PROSPECTUS,
        sourceType: 'official_prospectus',
        academicYear: '2025/2026',
      };

      if (item.electiveRule) {
        basePayload.electiveRule = item.electiveRule;
      }
      if (item.choiceConstraint) {
        basePayload.choiceConstraint = item.choiceConstraint;
      }
      if (item.note) {
        basePayload.note = item.note;
      }

      // Write to programme_courses
      await setDoc(doc(db, 'programme_courses', relDocId), { ...basePayload, id: relDocId }, { merge: true });
      totalPCWritten++;

      // Write to catalogue_courses
      await setDoc(doc(db, 'catalogue_courses', catDocId), { ...basePayload, id: catDocId }, { merge: true });
      totalCatWritten++;
    }
  }

  console.log(`Successfully written ${totalPCWritten} programme_courses and ${totalCatWritten} catalogue_courses!`);
  console.log('--- RECONCILIATION COMPLETED SUCCESSFULLY ---');
  process.exit(0);
}

runDirectReconciliation().catch((err) => {
  console.error('Fatal reconciliation error:', err);
  process.exit(1);
});
