# Firebase Setup Guide

This project has been migrated from MongoDB to Google Cloud Firestore for data persistence.

## Quick Start

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter your project name and follow the setup wizard
4. Enable Firestore in the "Build" section

### 2. Generate Service Account Credentials

1. Go to Project Settings (gear icon) → Service Accounts tab
2. Click "Generate New Private Key"
3. A JSON file will be downloaded - this is your `firebase-service-account.json`
4. Move this file to the `backend/` folder

### 3. Configure Environment Variables

Option A (Recommended): Using the JSON file
```bash
# In backend/.env
FIREBASE_SERVICE_ACCOUNT_PATH=firebase-service-account.json
```

Option B: Using environment variable (useful for CI/CD)
```bash
# In backend/.env
FIREBASE_SERVICE_ACCOUNT={your-json-as-string}
```

### 4. Start the Backend

```bash
cd backend
npm install  # if you haven't already
npm run dev  # or npm start
```

The backend should now connect to Firestore and create collections automatically.

## Collections

The app uses these Firestore collections:

- **issues** - Community reported issues
- **logs** - System activity logs  
- **officers** - Government officers

## Important Notes

- Firestore is case-sensitive and doesn't support regex queries natively
- Complex queries are performed in-memory by the backend
- First 1GB of reads/writes per month are free with Firestore

## Troubleshooting

**Error: "Firebase service account not found"**
- Make sure `firebase-service-account.json` is in the `backend/` folder
- Or set the `FIREBASE_SERVICE_ACCOUNT_PATH` environment variable correctly

**Error: "Cannot initialize Firestore"**
- Check that the service account JSON is valid
- Verify the project_id in the service account matches your Firebase project

**App running but no data persists**
- Check Firestore quotas in Firebase Console
- Verify write permissions in Firestore Rules (default allows authenticated writes)
