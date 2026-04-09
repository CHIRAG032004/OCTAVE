# OCTAVE

OCTAVE is a full-stack civic issue reporting platform with image uploads, geolocation, community voting, and admin workflows.

## What It Does

- Citizens can report local problems with a photo and optional note.
- Reports can use geolocation and reverse geocoding for location context.
- Community members can view and vote on issues.
- Admins can review, update status, manage officers, and inspect logs.
- Optional services degrade gracefully instead of breaking the app.

## Stack

- Frontend: React, Vite, Tailwind CSS, Leaflet, Chart.js
- Backend: Node.js, Express 5
- Database: Firebase Firestore via Firebase Admin SDK
- Auth: Appwrite
- Uploads: Cloudinary with local fallback
- AI / Geocoding: OpenRouter and OpenCage

## Architecture

![System Architecture Diagram](./docs/Jagruk_Diagram.png)

## Repository Structure

```txt
.
|-- backend
|-- frontend
|-- docs
|-- scripts
```

## Quick Start

### 1. Install dependencies

From the repo root:

```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

### 2. Create env files

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Add your real service credentials to `backend/.env` and `frontend/.env`.

### 3. Add Firebase service account

Place your Firebase admin JSON file at:

```txt
backend/firebase-service-account.json
```

Or set `FIREBASE_SERVICE_ACCOUNT` as a JSON string in `backend/.env`.

### 4. Run the project

Run both apps together from the repo root:

```bash
npm run dev
```

Or run them separately:

```bash
npm run dev:backend
npm run dev:frontend
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

## Environment Variables

### Backend

```env
PORT=3000

FIREBASE_SERVICE_ACCOUNT_PATH=firebase-service-account.json
# or
# FIREBASE_SERVICE_ACCOUNT={"type":"service_account", ...}

APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_appwrite_project_id
APPWRITE_API_KEY=your_appwrite_api_key

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

OPENROUTER_API_KEY=your_openrouter_api_key
OPENCAGE_API_KEY=your_opencage_api_key
```

### Frontend

```env
VITE_BACKEND_URL=http://localhost:3000
VITE_APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_appwrite_project_id
```

## Useful Commands

```bash
npm run dev
npm run dev:backend
npm run dev:frontend
npm run build:frontend
npm --prefix frontend run lint
```

## API Overview

- `GET /api/status` returns current runtime/integration status
- `GET /api/issues` returns public issues
- `GET /api/issues/all` returns all issues
- `GET /api/issues/search` searches issues
- `POST /api/issues` creates an issue and requires auth
- `PATCH /api/issues/:id/status` updates status and requires admin auth
- `POST /api/issues/:id/vote` toggles vote and requires auth
- `GET /api/user/:userId/issues` returns a user's issues and requires auth
- `POST /api/upload` uploads an image and requires auth
- `GET /api/logs` and `GET /api/logs/stats` require admin auth
- `/api/officers` routes require admin auth

## Fallback Behavior

- Missing Cloudinary config: uploads fall back to local `backend/uploads`
- Missing OpenRouter key: AI categorization falls back to basic defaults
- Missing OpenCage key: city/state lookup falls back to empty values
- Missing Appwrite config: local demo auth mode can be used for testing

## Security Notes

- Never commit `.env` files or real service credentials.
- Never commit `backend/firebase-service-account.json`.
- Rotate any key that has been shared in chat, screenshots, or logs.

## Additional Docs

- [Firebase Setup](./backend/FIREBASE_SETUP.md)
- [Firebase Quickstart](./backend/FIREBASE_QUICKSTART.md)
- [FAQ](./docs/FAQ.md)
