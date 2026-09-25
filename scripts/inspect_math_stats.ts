import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import * as fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app);

async function inspect() {
  console.log('--- Checking Academic Units ---');
  const unitsSnap = await getDocs(collection(db, 'academic_units'));
  console.log(`Total academic units: ${unitsSnap.size}`);
  unitsSnap.docs.forEach(d => {
    const data = d.data();
    if (d.id.toLowerCase().includes('conas') || (data.name && data.name.toLowerCase().includes('natural and applied'))) {
      console.log(`CoNAS Unit: ID="${d.id}", Name="${data.name}", Code="${data.code}"`);
    }
  });

  console.log('\n--- Checking Departments ---');
  const deptsSnap = await getDocs(collection(db, 'departments'));
  console.log(`Total departments: ${deptsSnap.size}`);
  deptsSnap.docs.forEach(d => {
    const data = d.data();
    if (
      d.id.toLowerCase().includes('math') ||
      d.id.toLowerCase().includes('stat') ||
      (data.name && (data.name.toLowerCase().includes('math') || data.name.toLowerCase().includes('stat')))
    ) {
      console.log(`Dept: ID="${d.id}", Name="${data.name}", UnitId="${data.academicUnitId}", Code="${data.code}"`);
    }
  });

  console.log('\n--- Checking Programmes ---');
  const progsSnap = await getDocs(collection(db, 'programmes'));
  console.log(`Total programmes: ${progsSnap.size}`);
  progsSnap.docs.forEach(d => {
    const data = d.data();
    const name = data.name || '';
    const sName = data.shortName || '';
    if (
      name.toLowerCase().includes('math') ||
      name.toLowerCase().includes('actuarial') ||
      name.toLowerCase().includes('education') ||
      name.toLowerCase().includes('statistic') ||
      data.departmentId?.toLowerCase().includes('math') ||
      data.departmentId?.toLowerCase().includes('stat')
    ) {
      console.log(`Prog: ID="${d.id}", Name="${name}", Short="${sName}", Unit="${data.academicUnitId}", Dept="${data.departmentId}"`);
    }
  });

  console.log('\n--- Checking Programme Courses for relevant programmes ---');
  const pcSnap = await getDocs(collection(db, 'programme_courses'));
  console.log(`Total programme_courses: ${pcSnap.size}`);
  const pcByProg: Record<string, number> = {};
  pcSnap.docs.forEach(d => {
    const data = d.data();
    const pid = data.programmeId || 'unknown';
    pcByProg[pid] = (pcByProg[pid] || 0) + 1;
  });
  for (const [pid, count] of Object.entries(pcByProg)) {
    if (
      pid.toLowerCase().includes('math') ||
      pid.toLowerCase().includes('stat') ||
      pid.toLowerCase().includes('actuarial') ||
      pid.toLowerCase().includes('educ') ||
      pid.toLowerCase().includes('conas')
    ) {
      console.log(`Programme-Courses for ${pid}: ${count} links`);
    }
  }

  console.log('\n--- Checking Catalogue Courses for relevant programmes ---');
  const ccSnap = await getDocs(collection(db, 'catalogue_courses'));
  console.log(`Total catalogue_courses: ${ccSnap.size}`);
  const ccByProg: Record<string, number> = {};
  ccSnap.docs.forEach(d => {
    const data = d.data();
    const pid = data.programmeId || 'unknown';
    ccByProg[pid] = (ccByProg[pid] || 0) + 1;
  });
  for (const [pid, count] of Object.entries(ccByProg)) {
    if (
      pid.toLowerCase().includes('math') ||
      pid.toLowerCase().includes('stat') ||
      pid.toLowerCase().includes('actuarial') ||
      pid.toLowerCase().includes('educ') ||
      pid.toLowerCase().includes('conas')
    ) {
      console.log(`Catalogue-Courses for ${pid}: ${count} records`);
    }
  }
}

inspect().then(() => process.exit(0)).catch(err => {
  console.error('Inspection failed:', err);
  process.exit(1);
});
