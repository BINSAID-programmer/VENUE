import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import * as fs from "fs";

async function check() {
  const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf8"));
  const app = initializeApp(config);

  const uid = "Faz9X1kqMZWkujTMKYaRfvM4jvw1";

  console.log("Checking in (default) database:");
  const dbDefault = getFirestore(app);
  const snapDef = await getDoc(doc(dbDefault, "admin_users", uid));
  console.log("Default DB exists:", snapDef.exists());
  if (snapDef.exists()) {
    console.log("Default DB data:", snapDef.data());
  }

  console.log("\nChecking in named database:", config.firestoreDatabaseId);
  const dbNamed = getFirestore(app, config.firestoreDatabaseId);
  try {
    const snapNamed = await getDoc(doc(dbNamed, "admin_users", uid));
    console.log("Named DB exists:", snapNamed.exists());
    if (snapNamed.exists()) {
      console.log("Named DB data:", snapNamed.data());
    }
  } catch (e: any) {
    console.log("Named DB getDoc error:", e.code, e.message);
  }

  process.exit(0);
}

check();
