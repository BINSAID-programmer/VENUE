import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app);

async function inspect() {
  const snap = await getDocs(collection(db, 'catalogue_courses'));
  const progs = new Map<string, number>();
  snap.docs.forEach(doc => {
    const data = doc.data();
    const pid = data.programmeId || 'unknown';
    progs.set(pid, (progs.get(pid) || 0) + 1);
  });
  console.log('Programmes currently having courses in Firestore:');
  for (const [pid, count] of progs.entries()) {
    console.log(`  - ${pid}: ${count} courses`);
  }
}

inspect().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
