import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app);

async function check() {
  const collections = ['universities', 'academic_units', 'departments', 'programmes', 'academic_years', 'catalogue_courses', 'canonical_courses', 'programme_courses'];
  for (const c of collections) {
    try {
      const snap = await getDocs(collection(db, c));
      console.log(`Collection "${c}": total ${snap.size} docs`);
      if (snap.size > 0 && snap.size <= 10) {
        console.log(`  IDs:`, snap.docs.map(d => d.id).join(', '));
      } else if (snap.size > 10) {
        console.log(`  First 5 IDs:`, snap.docs.slice(0, 5).map(d => d.id).join(', '));
      }
    } catch (e: any) {
      console.log(`Collection "${c}": error ->`, e.message);
    }
  }
}

check().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
