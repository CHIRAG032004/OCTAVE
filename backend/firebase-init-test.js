/**
 * Firebase Initialization Test
 * 
 * This file demonstrates the Firebase Admin SDK initialization pattern.
 * Use this to verify your Firebase setup is working correctly.
 * 
 * Run: node firebase-init-test.js
 */

const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

// Load service account key
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
  ? (path.isAbsolute(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
      ? process.env.FIREBASE_SERVICE_ACCOUNT_PATH
      : path.resolve(__dirname, process.env.FIREBASE_SERVICE_ACCOUNT_PATH))
  : path.join(__dirname, "firebase-service-account.json");

try {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

  // Initialize Firebase Admin SDK
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });

  const db = admin.firestore();

  console.log("✅ Firebase initialized successfully!");
  console.log(`Project ID: ${serviceAccount.project_id}`);
  
  // Test a simple read
  (async () => {
    try {
      const snapshot = await db.collection("issues").limit(1).get();
      console.log(`✅ Firestore connected - found ${snapshot.size} issues`);
      process.exit(0);
    } catch (error) {
      console.error("❌ Firestore read error:", error.message);
      process.exit(1);
    }
  })();

} catch (error) {
  console.error("❌ Firebase initialization failed:");
  console.error(`   ${error.message}`);
  console.error("\nMake sure:");
  console.error("  1. firebase-service-account.json exists in the backend folder");
  console.error("  2. The JSON file contains valid Firebase credentials");
  process.exit(1);
}
