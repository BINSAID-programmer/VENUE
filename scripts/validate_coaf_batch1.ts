import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import * as fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app);

async function validateCoafBatch1() {
  console.log('=== RUNNING RIGOROUS COAF BATCH 1 VALIDATION ===\n');

  // 1. Academic Unit Check
  const unitDoc = await getDoc(doc(db, 'academic_units', 'coaf'));
  if (!unitDoc.exists()) {
    throw new Error('FAILED: academic_unit "coaf" does not exist!');
  }
  const unitData = unitDoc.data();
  console.log(`[PASS] Academic Unit verified: "${unitData.name}" (${unitDoc.id})`);

  // 2. Department Check
  const deptDoc = await getDoc(doc(db, 'departments', 'dept-coaf-aeb'));
  if (!deptDoc.exists()) {
    throw new Error('FAILED: department "dept-coaf-aeb" does not exist!');
  }
  const deptData = deptDoc.data();
  console.log(`[PASS] Department verified: "${deptData.name}" (${deptDoc.id}) -> parent unit: "${deptData.academicUnitId}"`);
  if (deptData.academicUnitId !== 'coaf') {
    throw new Error(`FAILED: Department academicUnitId is ${deptData.academicUnitId}, expected "coaf"`);
  }

  // 3. Programme Check
  const progDoc = await getDoc(doc(db, 'programmes', 'bsc-aneb'));
  if (!progDoc.exists()) {
    throw new Error('FAILED: programme "bsc-aneb" does not exist!');
  }
  const progData = progDoc.data();
  console.log(`[PASS] Programme verified: "${progData.name}" (Short: "${progData.shortName}", ID: ${progDoc.id})`);
  if (progData.departmentId !== 'dept-coaf-aeb') {
    throw new Error(`FAILED: Programme departmentId is ${progData.departmentId}, expected "dept-coaf-aeb"`);
  }
  if (progData.academicUnitId !== 'coaf') {
    throw new Error(`FAILED: Programme academicUnitId is ${progData.academicUnitId}, expected "coaf"`);
  }

  // 4. Programme Courses Count & Breakdown Check
  const pcSnap = await getDocs(query(collection(db, 'programme_courses'), where('programmeId', '==', 'bsc-aneb')));
  const ccSnap = await getDocs(query(collection(db, 'catalogue_courses'), where('programmeId', '==', 'bsc-aneb')));

  console.log(`[PASS] programme_courses count: ${pcSnap.size} (Expected: 37)`);
  console.log(`[PASS] catalogue_courses count: ${ccSnap.size} (Expected: 37)`);

  if (pcSnap.size !== 37) {
    throw new Error(`FAILED: programme_courses count is ${pcSnap.size}, expected 37`);
  }
  if (ccSnap.size !== 37) {
    throw new Error(`FAILED: catalogue_courses count is ${ccSnap.size}, expected 37`);
  }

  // 5. Structure Breakdown Check
  const breakdown: Record<string, any[]> = {
    'Year 1 Sem 1': [],
    'Year 1 Sem 2': [],
    'Year 2 Sem 1': [],
    'Year 2 Sem 2': [],
    'Year 3 Sem 1': [],
    'Year 3 Sem 2': [],
  };

  const expectedCounts: Record<string, number> = {
    'Year 1 Sem 1': 6,
    'Year 1 Sem 2': 6,
    'Year 2 Sem 1': 6,
    'Year 2 Sem 2': 7,
    'Year 3 Sem 1': 6,
    'Year 3 Sem 2': 6,
  };

  const canonicalSnap = await getDocs(collection(db, 'canonical_courses'));
  const canonicalMap = new Map<string, any>();
  canonicalSnap.docs.forEach(d => canonicalMap.set(d.id, d.data()));

  pcSnap.docs.forEach(docSnap => {
    const data = docSnap.data();
    const key = `Year ${data.yearOfStudy} Sem ${data.semester}`;
    if (!breakdown[key]) {
      throw new Error(`Unexpected year/semester key: ${key}`);
    }
    breakdown[key].push(data);

    // Verify canonical reference
    if (!canonicalMap.has(data.courseId)) {
      throw new Error(`Canonical course ${data.courseId} referenced by ${docSnap.id} not found in canonical_courses!`);
    }

    // Verify credits and status
    if (data.credits !== 12) {
      throw new Error(`Course ${data.code} has credits=${data.credits}, expected 12`);
    }
    if (data.status !== 'Core') {
      throw new Error(`Course ${data.code} has status=${data.status}, expected Core`);
    }
  });

  for (const [key, expected] of Object.entries(expectedCounts)) {
    const actual = breakdown[key].length;
    console.log(`  ✓ ${key}: ${actual} courses (Expected: ${expected})`);
    if (actual !== expected) {
      throw new Error(`FAILED: ${key} count mismatch: ${actual} vs ${expected}`);
    }
    breakdown[key].forEach(c => {
      console.log(`     - [${c.code}] ${c.title} (${c.credits} credits, ${c.status})`);
    });
  }

  // 6. Check that other programmes were not modified or corrupted
  const allProgsSnap = await getDocs(collection(db, 'programmes'));
  console.log(`\n[PASS] Total programmes in Firestore: ${allProgsSnap.size}`);

  console.log('\n========================================');
  console.log('ALL COAF BATCH 1 VALIDATION CHECKS PASSED!');
  console.log('========================================');
}

validateCoafBatch1().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
