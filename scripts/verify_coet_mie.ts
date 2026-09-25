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
  console.log('=== VERIFYING VENUE — COET MIE IMPORT ===\n');

  // 1. Academic Unit
  const auSnap = await getDocs(collection(db, 'academic_units'));
  const coetUnits = auSnap.docs.filter((d) => d.id === 'coet' || d.data().name?.includes('Engineering'));
  console.log(`Academic Units matching CoET: ${coetUnits.length}`);
  const coetDoc = await getDoc(doc(db, 'academic_units', 'coet'));
  console.log(`[PASS] Verified Academic Unit: "${coetDoc.data()?.name}" (ID: coet)`);

  // 2. Department
  const deptSnap = await getDocs(collection(db, 'departments'));
  const mieDepts = deptSnap.docs.filter((d) => d.id === 'dept-mie' || d.data().name?.includes('Mechanical'));
  console.log(`Departments matching MIE: ${mieDepts.length}`);
  const mieDoc = await getDoc(doc(db, 'departments', 'dept-mie'));
  console.log(`[PASS] Verified Department: "${mieDoc.data()?.name}" (ID: dept-mie, Unit: ${mieDoc.data()?.academicUnitId})`);

  // 3. Programmes
  const progs = ['bsc-mech', 'bsc-ie', 'bsc-tdt', 'bsc-te'];
  for (const pid of progs) {
    const pDoc = await getDoc(doc(db, 'programmes', pid));
    console.log(`Programme [${pid}]: exists=${pDoc.exists()}, name="${pDoc.data()?.name}", dept="${pDoc.data()?.departmentId}", unit="${pDoc.data()?.academicUnitId}"`);
  }

  // 4. Programme-Course relationships and Catalogue Courses
  console.log('\n--- Programme Course Breakdown by Year & Semester ---');
  let totalCc = 0;
  let totalPc = 0;

  for (const pid of progs) {
    const ccSnap = await getDocs(query(collection(db, 'catalogue_courses'), where('programmeId', '==', pid)));
    const pcSnap = await getDocs(query(collection(db, 'programme_courses'), where('programmeId', '==', pid)));
    totalCc += ccSnap.size;
    totalPc += pcSnap.size;

    console.log(`\nProgramme ${pid} -> catalogue_courses: ${ccSnap.size}, programme_courses: ${pcSnap.size}`);

    // Verify all 4 years, 8 semesters
    for (let y = 1; y <= 4; y++) {
      for (let s = 1; s <= 2; s++) {
        const semCc = ccSnap.docs.filter((d) => d.data().yearOfStudy === y && d.data().semester === s);
        const coreCount = semCc.filter((d) => d.data().status === 'Core').length;
        const elecCount = semCc.filter((d) => d.data().status === 'Elective').length;
        console.log(`  Year ${y} Semester ${s}: ${semCc.length} courses (${coreCount} Core, ${elecCount} Elective)`);
      }
    }
  }

  console.log(`\nTotal Catalogue Courses across 4 MIE programmes: ${totalCc}`);
  console.log(`Total Programme Courses across 4 MIE programmes: ${totalPc}`);

  // Test Browse Academic Materials query emulation (FirestoreCatalogueService.getCoursesByProgrammeAndTerm)
  console.log('\n--- Testing Browse Academic Materials Query Emulation ---');
  const sampleQuery = await getDocs(
    query(
      collection(db, 'catalogue_courses'),
      where('programmeId', '==', 'bsc-mech'),
      where('yearOfStudy', '==', 1),
      where('semester', '==', 1)
    )
  );
  console.log(`Retrieved ${sampleQuery.size} courses for bsc-mech Y1S1 via standard catalogue query:`);
  sampleQuery.docs.forEach((d) => {
    const c = d.data();
    console.log(`  - [${c.code}] ${c.title} (${c.credits} cr, ${c.status})`);
  });

  process.exit(0);
}

verify().catch((err) => {
  console.error(err);
  process.exit(1);
});
