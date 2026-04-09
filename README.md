# OCTAVE

OCTAVE is a full-stack civic issue reporting platform with image uploads, geolocation, community voting, and admin workflows.

## Live Demo

- Frontend: `https://octave-1.onrender.com`

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

## Deployment

### Render

This repository includes a [`render.yaml`](./render.yaml) blueprint for deploying both services on Render.

- Backend service: `octave-backend`
- Frontend service: `octave-frontend`
- Live frontend URL: `https://octave-1.onrender.com`

Important deployment notes:

- Add backend secrets in Render for `APPWRITE_API_KEY`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `OPENROUTER_API_KEY`, `OPENCAGE_API_KEY`, and `FIREBASE_SERVICE_ACCOUNT`.
- Add the deployed frontend hostname to your Appwrite Web platform settings.
- For production, prefer Cloudinary over temporary local upload fallback.

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

### Frontend On Render

```env
VITE_BACKEND_URL=https://your-backend-service.onrender.com
VITE_APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=69d7ead700140df655f6
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

## Production Notes

- Render free services can spin down during inactivity, which may delay the first request.
- Appwrite must allow the deployed frontend hostname in its Web platform settings.
- Backend uploads should use Cloudinary in production because ephemeral local storage is not durable.

## Security Notes

- Never commit `.env` files or real service credentials.
- Never commit `backend/firebase-service-account.json`.
- Rotate any key that has been shared in chat, screenshots, or logs.

## Additional Docs

- [Firebase Setup](./backend/FIREBASE_SETUP.md)
- [Firebase Quickstart](./backend/FIREBASE_QUICKSTART.md)
- [FAQ](./docs/FAQ.md)
