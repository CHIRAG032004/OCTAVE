# Firebase Setup - Quick Start

## The Error You're Seeing

```
❌ Firebase initialization failed:
   Cannot find module 'firebase-service-account.json'
```

This is **normal** - Firebase credentials are not included in the repo for security. You need to provide your own.

## Get Real Firebase Credentials (5 minutes)

### 1. Create a Firebase Project
- Go to **[firebase.google.com](https://firebase.google.com)**
- Click "Go to console"
- Sign in with Google
- Click "Add project"
- Name it (e.g., "OCTAVE") and create

### 2. Enable Firestore
- In Firebase Console, go to **Build** → **Firestore Database**
- Click "Create database"
- Choose region (e.g., us-central1)
- Start in test mode
- Click "Enable"

### 3. Download Service Account Credentials
- In Firebase Console, click ⚙️ (gear icon) → **Project Settings**
- Go to **Service Accounts** tab
- Click **Generate New Private Key** button
- A JSON file downloads - this is your credentials

### 4. Add to Backend
- Move the JSON file to `backend/` folder
- Rename it to `firebase-service-account.json`
- Or set `FIREBASE_SERVICE_ACCOUNT_PATH` in `.env` with full path

### 5. Start Backend
```bash
cd backend
npm run dev
```

Should see:
```
✅ Connected to Firestore (Project: your-project-id)
Connected to MongoDB: mongodb://localhost:27017/smart-community
Server is running at http://localhost:3000
```

## Troubleshooting

**Still getting "Cannot find module" error?**
- Check filename is exactly `firebase-service-account.json`
- Check it's in the `backend/` folder (same level as index.js)

**Getting "Failed to parse private key" error?**
- The JSON file might be corrupted
- Download a fresh copy from Firebase

**Getting permission denial errors?**
- Go to Firestore → Rules
- Change to test mode (allows all reads/writes)
- Or add proper security rules

## File Structure
```
backend/
├── firebase-service-account.json  ← Your credentials (add this!)
├── .env
├── index.js
├── config/
│   └── firebase.js
└── ... other files
```

## Cost

- Firestore: **First 1GB reads/writes per month = FREE**
- Perfect for development and testing
- See [Firestore pricing](https://firebase.google.com/pricing#firestore)

## Questions?

See `FIREBASE_SETUP.md` for detailed information.
