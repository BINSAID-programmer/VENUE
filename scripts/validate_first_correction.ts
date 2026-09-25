import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import * as fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app);

async function validate() {
  console.log('--- 1. Checking Academic Units & Departments ---');
  const conasDoc = await getDoc(doc(db, 'academic_units', 'conas'));
  const mathDeptDoc = await getDoc(doc(db, 'departments', 'dept-math'));
  const statsDeptDoc = await getDoc(doc(db, 'departments', 'dept-stats'));

  console.log('CoNAS exists:', conasDoc.exists(), '| name:', conasDoc.data()?.name);
  console.log('dept-math exists:', mathDeptDoc.exists(), '| name:', mathDeptDoc.data()?.name, '| unit:', mathDeptDoc.data()?.academicUnitId);
  console.log('dept-stats exists:', statsDeptDoc.exists(), '| name:', statsDeptDoc.data()?.name, '| unit:', statsDeptDoc.data()?.academicUnitId);

  console.log('\n--- 2. Checking Department of Mathematics Programmes ---');
  const progsSnap = await getDocs(collection(db, 'programmes'));
  const mathProgs = progsSnap.docs
    .filter(d => (d.data() as any).departmentId === 'dept-math')
    .map(d => ({ id: d.id, ...(d.data() as any) }));

  console.log(`Found ${mathProgs.length} programmes under dept-math:`);
  mathProgs.forEach(p => console.log(`  - [${p.id}] "${p.name}" (unit: ${p.academicUnitId})`));

  console.log('\n--- 3. Checking Department of Statistics Programmes ---');
  const statsProgs = progsSnap.docs
    .filter(d => (d.data() as any).departmentId === 'dept-stats')
    .map(d => ({ id: d.id, ...(d.data() as any) }));

  console.log(`Found ${statsProgs.length} programmes under dept-stats:`);
  statsProgs.forEach(p => console.log(`  - [${p.id}] "${p.name}" (unit: ${p.academicUnitId})`));

  console.log('\n--- 4. Checking Course Preservation ---');
  const pcSnap = await getDocs(collection(db, 'programme_courses'));
  const mathStatsPC = pcSnap.docs.filter(d => (d.data() as any).programmeId === 'math-stats');
  const actuarialPC = pcSnap.docs.filter(d => (d.data() as any).programmeId === 'bsc-actuarial');
  const statsPC = pcSnap.docs.filter(d => (d.data() as any).programmeId === 'bsc-stats');

  console.log('Preserved courses:');
  console.log(`  math-stats: ${mathStatsPC.length} courses`);
  console.log(`  bsc-actuarial: ${actuarialPC.length} courses`);
  console.log(`  bsc-stats: ${statsPC.length} courses`);

  // Assertions
  const hasMathStatsInMath = mathProgs.some(p => p.id === 'math-stats' && p.name === 'Bachelor of Science in Mathematics and Statistics');
  const hasActuarialInMath = mathProgs.some(p => p.id === 'bsc-actuarial' && p.name === 'Bachelor of Science in Actuarial Science');
  const hasBscEdInMath = mathProgs.some(p => p.id === 'bsc-ed' && p.name === 'Bachelor of Science with Education');
  const statsHasMathStats = statsProgs.some(p => p.id.includes('math-stats') || p.name?.includes('Mathematics and Statistics'));

  if (!hasMathStatsInMath) throw new Error('Assertion failed: math-stats missing from dept-math');
  if (!hasActuarialInMath) throw new Error('Assertion failed: bsc-actuarial missing from dept-math');
  if (!hasBscEdInMath) throw new Error('Assertion failed: bsc-ed missing from dept-math');
  if (statsHasMathStats) throw new Error('Assertion failed: dept-stats still contains math-stats');

  console.log('\nALL ASSERTIONS PASSED SUCCESSFULLY!');
}

validate().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
