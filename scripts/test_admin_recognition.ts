import { adminAuthService } from "../src/services/adminAuthService";

async function testRecognition() {
  const targetUid = "Faz9X1kqMZWkujTMKYaRfvM4jvw1";
  console.log(`Testing recognition for UID: ${targetUid}`);

  const admin = await adminAuthService.fetchAdminUser(targetUid);
  console.log("Admin record returned:", admin);

  const isSuper = await adminAuthService.isSuperAdmin(targetUid);
  console.log(`isSuperAdmin(${targetUid}):`, isSuper);

  if (isSuper && admin?.role === "super_admin") {
    console.log("✓ SUCCESS: Super Admin is fully recognized by AdminAuthService & AdminGuard!");
  } else {
    console.error("✗ FAILURE: Super Admin was not recognized!");
    process.exit(1);
  }

  // Also test an unauthorized UID
  const fakeUid = "unauthorized_user_12345";
  const fakeIsSuper = await adminAuthService.isSuperAdmin(fakeUid);
  console.log(`isSuperAdmin(${fakeUid}) (should be false):`, fakeIsSuper);
  if (fakeIsSuper !== false) {
    console.error("✗ FAILURE: Unauthorized user evaluated to super admin!");
    process.exit(1);
  }
  console.log("✓ SUCCESS: Unauthorized user correctly rejected.");

  process.exit(0);
}

testRecognition().catch(e => {
  console.error("Error:", e);
  process.exit(1);
});
