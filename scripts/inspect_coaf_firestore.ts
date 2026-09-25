import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import * as fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app);

async function inspectFirestore() {
  console.log('--- 1. Academic Unit: CoAF ---');
  const unitSnap = await getDocs(collection(db, 'academic_units'));
  unitSnap.docs.forEach(d => {
    const data = d.data();
    if (d.id.toLowerCase().includes('coaf') || data.name?.toLowerCase().includes('agricultural') || data.code?.toLowerCase().includes('coaf')) {
      console.log(`Unit found: ID="${d.id}" | Name="${data.name}" | Code="${data.code}"`);
    }
  });

  console.log('\n--- 2. Departments in CoAF ---');
  const deptsSnap = await getDocs(collection(db, 'departments'));
  deptsSnap.docs.forEach(d => {
    const data = d.data();
    if (
      data.academicUnitId === 'coaf' ||
      d.id.toLowerCase().includes('agric') ||
      data.name?.toLowerCase().includes('agricultural') ||
      data.name?.toLowerCase().includes('economics')
    ) {
      console.log(`Dept found: ID="${d.id}" | Name="${data.name}" | Unit="${data.academicUnitId}" | Code="${data.code}"`);
    }
  });

  console.log('\n--- 3. Programmes in CoAF or matching ANEB ---');
  const progsSnap = await getDocs(collection(db, 'programmes'));
  progsSnap.docs.forEach(d => {
    const data = d.data();
    if (
      data.academicUnitId === 'coaf' ||
      d.id.toLowerCase().includes('aneb') ||
      d.id.toLowerCase().includes('agric') ||
      data.name?.toLowerCase().includes('agricultural') ||
      data.name?.toLowerCase().includes('natural resource')
    ) {
      console.log(`Prog found: ID="${d.id}" | Name="${data.name}" | Dept="${data.departmentId}" | Unit="${data.academicUnitId}"`);
    }
  });

  console.log('\n--- 4. Check existing canonical courses matching codes from page 87 ---');
  const targetCodes = [
    'EC 116', 'EC 117', 'AC 100', 'EB 100', 'DS 112', 'EB 101',
    'EC 126', 'EC 127', 'AC 101', 'EB 103', 'DS 113', 'EB 102',
    'EC 216', 'EC 217', 'EB 201', 'EC 218', 'EC 219', 'EB 200',
    'EC 220', 'EC 228', 'EC 229', 'EB 202', 'EB 204', 'EB 203', 'EB 310',
    'EB 303', 'EB 304', 'EB 300', 'EB 301', 'EB 302', 'EC 372',
    'EB 308', 'EB 306', 'EB 305', 'EC 377', 'EB 309', 'EC 382'
  ];

  const coursesSnap = await getDocs(collection(db, 'courses'));
  console.log(`Total courses in 'courses' collection: ${coursesSnap.size}`);
  const existingCourses = new Map<string, any>();
  coursesSnap.docs.forEach(d => {
    const data = d.data();
    const code = (data.code || data.courseCode || '').toUpperCase().trim();
    if (code) {
      existingCourses.set(code, { id: d.id, ...data });
    }
  });

  for (const c of targetCodes) {
    if (existingCourses.has(c)) {
      const ec = existingCourses.get(c);
      console.log(`  Existing course [${c}]: ID="${ec.id}" | Title="${ec.title || ec.courseName}"`);
    } else {
      console.log(`  NEW course needed [${c}]`);
    }
  }
}

inspectFirestore().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
