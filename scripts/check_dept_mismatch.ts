import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as fs from 'fs';
import { AUDITED_PROGRAMMES } from '../src/data/udsmAuditedCatalogue2025';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app);

async function check() {
  const deptsSnap = await getDocs(collection(db, 'departments'));
  const deptIds = new Set(deptsSnap.docs.map(d => d.id));

  console.log(`Checking ${AUDITED_PROGRAMMES.length} programmes against ${deptIds.size} existing departments:`);
  const missing: any[] = [];
  for (const p of AUDITED_PROGRAMMES) {
    if (!deptIds.has(p.departmentId)) {
      missing.push({ prog: p.id, name: p.name, unit: p.academicUnitId, dept: p.departmentId });
    }
  }
  console.log(`Found ${missing.length} programmes whose departmentId is not an existing department doc:`);
  missing.forEach(m => console.log(`  - ${m.prog} (${m.unit}): deptId="${m.dept}"`));
}

check().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
