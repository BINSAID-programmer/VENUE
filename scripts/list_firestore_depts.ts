import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import * as fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app);

async function listDepts() {
  const snap = await getDocs(collection(db, 'departments'));
  console.log(`Found ${snap.size} departments in Firestore:`);
  const byUnit: Record<string, string[]> = {};
  snap.docs.forEach(doc => {
    const data = doc.data();
    const unit = data.academicUnitId || 'unknown';
    if (!byUnit[unit]) byUnit[unit] = [];
    byUnit[unit].push(`${doc.id} (${data.name})`);
  });

  for (const [unit, list] of Object.entries(byUnit)) {
    console.log(`Unit: ${unit} (${list.length} depts):`);
    list.forEach(d => console.log(`  - ${d}`));
  }
}

listDepts().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
