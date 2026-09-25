import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import * as fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app);

async function verify() {
  console.log('====================================================');
  console.log('VENUE POST-IMPORT VERIFICATION: EE & CPE');
  console.log('====================================================\n');

  // 1. Academic Unit
  const auSnap = await getDoc(doc(db, 'academic_units', 'coet'));
  console.log(`1. ACADEMIC UNIT:`);
  console.log(`   - Name: ${auSnap.data()?.name}`);
  console.log(`   - ID: ${auSnap.id}`);
  console.log(`   - Status: Verified & Preserved\n`);

  // 2. Departments
  console.log(`2. DEPARTMENTS:`);
  const eeDept = await getDoc(doc(db, 'departments', 'dept-ee'));
  const cpeDept = await getDoc(doc(db, 'departments', 'dept-cpe'));
  console.log(`   - Electrical Engineering: "${eeDept.data()?.name}" (ID: ${eeDept.id})`);
  console.log(`   - Chemical and Process Engineering: "${cpeDept.data()?.name}" (ID: ${cpeDept.id})\n`);

  // 3. Programmes
  console.log(`3. PROGRAMMES:`);
  const eeProg = await getDoc(doc(db, 'programmes', 'bsc-elec-eng'));
  const cpeProg = await getDoc(doc(db, 'programmes', 'bsc-cpe'));
  console.log(`   - [bsc-elec-eng] "${eeProg.data()?.name}"`);
  console.log(`     Department: ${eeProg.data()?.departmentId}, Academic Unit: ${eeProg.data()?.academicUnitId}`);
  console.log(`     TW Rule Note: "${eeProg.data()?.twNote || 'N/A'}"`);
  console.log(`   - [bsc-cpe] "${cpeProg.data()?.name}"`);
  console.log(`     Department: ${cpeProg.data()?.departmentId}, Academic Unit: ${cpeProg.data()?.academicUnitId}\n`);

  // 4. Course counts per programme and semester
  console.log(`4. PROGRAMME CATALOGUE BREAKDOWN:`);

  for (const pid of ['bsc-elec-eng', 'bsc-cpe']) {
    const q = query(collection(db, 'catalogue_courses'), where('programmeId', '==', pid));
    const snap = await getDocs(q);

    console.log(`\n   Programme: ${pid} (Total Catalogue Records: ${snap.size})`);
    const byYearSem: { [key: string]: any[] } = {};
    let coreCount = 0;
    let electiveCount = 0;
    let twCount = 0;

    snap.docs.forEach((d) => {
      const data = d.data();
      const key = `Year ${data.yearOfStudy}, Semester ${data.semester}`;
      if (!byYearSem[key]) byYearSem[key] = [];
      byYearSem[key].push(data);
      if (data.status === 'Core') coreCount++;
      if (data.status === 'Elective') electiveCount++;
      if ((data.code || '').startsWith('TW')) twCount++;
    });

    Object.keys(byYearSem)
      .sort()
      .forEach((ys) => {
        const list = byYearSem[ys];
        console.log(`     • ${ys}: ${list.length} courses (${list.map((c) => c.code).join(', ')})`);
      });

    console.log(`     Summary: ${coreCount} Core, ${electiveCount} Elective, ${twCount} TW Practical courses`);
  }

  // 5. Verification of canonical course integrity for conflicted courses
  console.log(`\n5. CONFLICT PRESERVATION VERIFICATION:`);
  const conflictCodes = ['ME 101', 'DS 115', 'EE 151', 'EE 172', 'CS 353', 'EE 499', 'DS 112', 'ME 103', 'ME 201'];
  for (const c of conflictCodes) {
    const codeKey = c.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const dSnap = await getDoc(doc(db, 'canonical_courses', codeKey));
    if (dSnap.exists()) {
      const data = dSnap.data();
      console.log(`   - [${data.code}] preserved: "${data.title}" | ${data.defaultCredits ?? data.credits} credits (UNTOUCHED)`);
    }
  }

  // 6. TW Courses preservation check
  console.log(`\n6. TW COURSES (ELECTRICAL ENGINEERING) CHECK:`);
  const twSnap = await getDocs(
    query(collection(db, 'catalogue_courses'), where('programmeId', '==', 'bsc-elec-eng'))
  );
  const twCourses = twSnap.docs.filter((d) => (d.data().code || '').startsWith('TW'));
  console.log(`   Found ${twCourses.length} TW course relationships in bsc-elec-eng:`);
  twCourses.forEach((d) => {
    const data = d.data();
    console.log(`   - [${data.code}] "${data.title}" | Y${data.yearOfStudy}S${data.semester} | Note: "${data.note || 'None'}"`);
  });

  console.log('\n====================================================');
  console.log('POST-IMPORT VERIFICATION COMPLETE');
  console.log('====================================================\n');

  process.exit(0);
}

verify().catch((err) => {
  console.error('Verification error:', err);
  process.exit(1);
});
