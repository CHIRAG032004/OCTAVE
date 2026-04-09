# Smart Community Issue Reporting System

> OCTAVE is a full-stack civic issue reporting app with image uploads, geolocation, community voting, and admin management.

# OCTAVE

## Stack

- Frontend: React, Vite, Tailwind CSS, Leaflet, Chart.js
- Backend: Node.js, Express 5
- Data store: Firebase Firestore via Firebase Admin SDK
- Services: Appwrite (auth), Cloudinary or local uploads, OpenRouter, OpenCage

## Architecture

![System Architecture Diagram](./docs/Jagruk_Diagram.png)

## Quick Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Environment Variables

### Backend `.env`

```env
PORT=3000

# Firebase
FIREBASE_SERVICE_ACCOUNT_PATH=firebase-service-account.json
# or
# FIREBASE_SERVICE_ACCOUNT={"type":"service_account", ...}

# Appwrite
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_appwrite_project_id
APPWRITE_API_KEY=your_appwrite_api_key

# Uploads
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# AI / Geocoding
OPENROUTER_API_KEY=your_openrouter_api_key
OPENCAGE_API_KEY=your_opencage_api_key
```

### Frontend `.env`

```env
VITE_BACKEND_URL=http://localhost:3000
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_appwrite_project_id
```

## API Overview

- `GET /api/issues` returns paginated public issues
- `GET /api/issues/all` returns all issues
- `GET /api/issues/search` searches issues
- `POST /api/issues` creates an issue and requires auth
- `PATCH /api/issues/:id/status` updates status and requires admin auth
- `POST /api/issues/:id/vote` toggles vote and requires auth
- `GET /api/user/:userId/issues` returns a user's issues and requires auth
- `POST /api/upload` uploads an image and requires auth
- `GET /api/logs` and `/api/logs/stats` require admin auth
- `/api/officers` routes require admin auth

## Notes

- If Cloudinary keys are missing, uploads fall back to the local `backend/uploads` folder.
- If Appwrite is not configured, the frontend/backend use demo auth behavior for local testing.
- The backend serves `frontend/dist` when a production build exists.
