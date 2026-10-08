import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import * as fs from "fs";

async function checkUsers() {
  const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf8"));
  const app = initializeApp(config);
  const db = getFirestore(app, config.firestoreDatabaseId);

  const studentsSnap = await getDocs(collection(db, "students"));
  console.log("Students count:", studentsSnap.size);
  studentsSnap.docs.forEach(d => {
    console.log(`Student ${d.id}: email=${d.data().email}, name=${d.data().name}`);
  });

  const usersSnap = await getDocs(collection(db, "users"));
  console.log("Users count:", usersSnap.size);
  usersSnap.docs.forEach(d => {
    console.log(`User ${d.id}: email=${d.data().email}, role=${d.data().role}`);
  });

  const adminSnap = await getDocs(collection(db, "admin_users"));
  console.log("Admin users count:", adminSnap.size);

  process.exit(0);
}

checkUsers().catch(e => {
  console.error(e);
  process.exit(1);
});
