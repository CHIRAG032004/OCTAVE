const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin SDK
const configuredServiceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const serviceAccountPath = configuredServiceAccountPath
  ? (path.isAbsolute(configuredServiceAccountPath)
      ? configuredServiceAccountPath
      : path.resolve(__dirname, '..', configuredServiceAccountPath))
  : path.join(__dirname, '../firebase-service-account.json');

let db = null;
let isInitialized = false;
let isDemo = false;
let isOfflineMode = false;

const initializeFirebase = async () => {
  try {
    if (isInitialized) {
      return db;
    }

    // Check if service account file exists or if credentials are in env
    let serviceAccount;
    
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else {
      if (fs.existsSync(serviceAccountPath)) {
        serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      } else {
        throw new Error(
          `Firebase service account not found at ${serviceAccountPath}. Provide FIREBASE_SERVICE_ACCOUNT or a valid FIREBASE_SERVICE_ACCOUNT_PATH`
        );
      }
    }

    // Check if this is a demo key
    if (serviceAccount.project_id === 'octave-demo-project' || 
        serviceAccount.private_key?.includes('DemoKey')) {
      isDemo = true;
    }

    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });

      db = admin.firestore();
      isInitialized = true;

      if (isDemo) {
        console.warn('⚠️  Using DEMO Firebase credentials. Replace with real credentials for production.');
        console.warn('    See FIREBASE_SETUP.md for instructions.');
      } else {
        console.log(`✅ Connected to Firestore (Project: ${serviceAccount.project_id})`);
      }
    } catch (initError) {
      if (isDemo || serviceAccount.project_id === 'octave-demo-project') {
        console.warn('⚠️  Demo Firebase credentials invalid - running in OFFLINE MODE');
        console.warn('    Data will NOT be persisted. Get real credentials to use Firestore.');
        console.warn('    See FIREBASE_SETUP.md for instructions.');
        isOfflineMode = true;
        isInitialized = true;
        return null;
      }
      throw initError;
    }

    return db;
  } catch (error) {
    console.error('Firebase initialization error:', error.message);
    process.exit(1);
  }
};

const getFirestore = () => {
  if (!isInitialized) {
    throw new Error('Firestore not initialized. Call initializeFirebase() first.');
  }
  if (isOfflineMode) {
    console.warn('⚠️  Offline mode - data will not be persisted');
  }
  return db;
};

const isDemoMode = () => isDemo;
const isOffline = () => isOfflineMode;

module.exports = {
  initializeFirebase,
  getFirestore,
  isDemoMode,
  isOffline,
  admin,
};
