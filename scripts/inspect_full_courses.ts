import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import * as fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app);

async function inspectCourses() {
  const pcSnap = await getDocs(collection(db, 'programme_courses'));
  const ccSnap = await getDocs(collection(db, 'catalogue_courses'));

  console.log('--- math-stats programme_courses ---');
  const msPC = pcSnap.docs.filter(d => d.data().programmeId === 'math-stats').map(d => d.data());
  console.log(`Total: ${msPC.length}`);
  msPC.forEach(c => {
    console.log(`  PC: ${c.code || c.courseCode} | ${c.title} | Y${c.yearOfStudy}S${c.semester} | status=${c.status || c.courseType} | dept=${c.departmentId} | unit=${c.academicUnitId}`);
  });

  console.log('\n--- bsc-actuarial programme_courses ---');
  const actPC = pcSnap.docs.filter(d => d.data().programmeId === 'bsc-actuarial').map(d => d.data());
  console.log(`Total: ${actPC.length}`);
  actPC.forEach(c => {
    console.log(`  PC: ${c.code || c.courseCode} | ${c.title} | Y${c.yearOfStudy}S${c.semester} | status=${c.status || c.courseType} | dept=${c.departmentId} | unit=${c.academicUnitId}`);
  });

  console.log('\n--- check catalogue_courses for math-stats ---');
  const msCC = ccSnap.docs.filter(d => d.data().programmeId === 'math-stats').map(d => d.data());
  console.log(`Total: ${msCC.length}`);
  console.log('Sample CC:', msCC.slice(0, 3));

  console.log('\n--- check catalogue_courses for bsc-actuarial ---');
  const actCC = ccSnap.docs.filter(d => d.data().programmeId === 'bsc-actuarial').map(d => d.data());
  console.log(`Total: ${actCC.length}`);
  console.log('Sample CC:', actCC.slice(0, 3));
}

inspectCourses().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
