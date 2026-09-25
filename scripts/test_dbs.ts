import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);

async function test() {
  console.log('Testing default database:');
  try {
    const dbDefault = getFirestore(app);
    const snapDefault = await getDocs(collection(dbDefault, 'academic_units'));
    console.log(`Default DB success: ${snapDefault.size} academic units`);
  } catch (e: any) {
    console.log(`Default DB error: ${e.code} - ${e.message}`);
  }

  console.log('Testing custom database:', config.firestoreDatabaseId);
  try {
    const dbNamed = getFirestore(app, config.firestoreDatabaseId);
    const snapNamed = await getDocs(collection(dbNamed, 'academic_units'));
    console.log(`Named DB success: ${snapNamed.size} academic units`);
  } catch (e: any) {
    console.log(`Named DB error: ${e.code} - ${e.message}`);
  }
}

test().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
