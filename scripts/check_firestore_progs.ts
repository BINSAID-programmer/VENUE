import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app);

async function checkProgs() {
  const snap = await getDocs(collection(db, 'programmes'));
  console.log(`Found ${snap.size} programmes in Firestore.`);
  for (const doc of snap.docs) {
    const data = doc.data();
    if (['coss', 'cohu', 'udse', 'coict'].includes(data.academicUnitId)) {
      console.log(`${data.academicUnitId} -> ${data.id} (${data.shortName}): dept = ${data.departmentId}`);
    }
  }
}

checkProgs().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
