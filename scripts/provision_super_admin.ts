/**
 * VENUE Super Admin Provisioning Utility
 *
 * This utility allows platform operators or CI workflows to grant Super Admin
 * authority to a specified Firebase Auth UID.
 *
 * Usage:
 *   npx tsx scripts/provision_super_admin.ts <UID> <EMAIL> [DISPLAY_NAME]
 *
 * Example:
 *   npx tsx scripts/provision_super_admin.ts abc123uid admin@udsm.ac.tz "Platform Administrator"
 */
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import * as fs from "fs";

async function provisionSuperAdmin() {
  const args = process.argv.slice(2);
  const uid = args[0] || "Faz9X1kqMZWkujTMKYaRfvM4jvw1";
  const email = args[1] || "binsaid679@gmail.com";
  const displayName = args[2] || "Platform Administrator";

  console.log(`Provisioning Super Admin: UID=${uid}, Email=${email}, DisplayName=${displayName}`);

  const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf8"));
  const app = initializeApp(config);
  const dbNamed = getFirestore(app, config.firestoreDatabaseId);
  const dbDefault = getFirestore(app);

  const databases = [
    { name: `Named (${config.firestoreDatabaseId})`, db: dbNamed },
    { name: "Default ((default))", db: dbDefault },
  ];

  for (const { name, db } of databases) {
    try {
      const ref = doc(db, "admin_users", uid);
      const existing = await getDoc(ref);
      const dataToSet: any = {
        uid,
        email,
        displayName,
        role: "super_admin",
        status: "active",
        updatedAt: new Date().toISOString(),
        assignedBy: "system_bootstrap",
      };

      if (!existing.exists()) {
        dataToSet.createdAt = serverTimestamp();
      }

      await setDoc(ref, dataToSet, { merge: true });
      console.log(`✓ [${name}] Successfully provisioned Super Admin role for UID: ${uid} (${email}) in Firestore.`);
    } catch (err: any) {
      console.error(`✗ [${name}] Failed to provision:`, err?.message || err);
    }
  }
  process.exit(0);
}

provisionSuperAdmin();

