const fs = require('fs');
const path = require('path');
const { hasAppwriteConfig, hasAppwriteAdminConfig } = require('../lib/appwrite');

const isMeaningfulValue = (value) => {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  return Boolean(trimmed) &&
    !/^your_/i.test(trimmed) &&
    !/^<.*>$/.test(trimmed) &&
    !/^none$/i.test(trimmed) &&
    !/^default$/i.test(trimmed);
};

const resolveFirebasePath = () => {
  const configured = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (!configured) {
    return path.join(__dirname, '../firebase-service-account.json');
  }

  return path.isAbsolute(configured)
    ? configured
    : path.resolve(__dirname, '..', configured);
};

const getRuntimeStatus = () => {
  const firebasePath = resolveFirebasePath();
  const hasFirebaseConfig = Boolean(process.env.FIREBASE_SERVICE_ACCOUNT) || fs.existsSync(firebasePath);
  const hasCloudinary = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']
    .every((key) => isMeaningfulValue(process.env[key]));
  const hasOpenRouter = isMeaningfulValue(process.env.OPENROUTER_API_KEY);
  const hasOpenCage = isMeaningfulValue(process.env.OPENCAGE_API_KEY);

  const warnings = [];

  if (!hasFirebaseConfig) {
    warnings.push('Firebase service account is missing, so Firestore persistence will fail.');
  }
  if (!hasCloudinary) {
    warnings.push('Cloudinary is not configured, so uploads fall back to local storage.');
  }
  if (!hasOpenRouter) {
    warnings.push('OpenRouter is not configured, so AI categorization falls back to "Other".');
  }
  if (!hasOpenCage) {
    warnings.push('OpenCage is not configured, so reverse geocoding falls back to empty city/state.');
  }
  if (!hasAppwriteConfig) {
    warnings.push('Appwrite client config is missing, so auth cannot be verified.');
  } else if (!hasAppwriteAdminConfig) {
    warnings.push('Appwrite admin API key is not stored locally. This is safer, and session-based auth still works.');
  }

  return {
    auth: {
      appwriteClientConfigured: hasAppwriteConfig,
      appwriteAdminConfigured: hasAppwriteAdminConfig,
      mode: hasAppwriteConfig ? 'appwrite-session' : 'unconfigured',
    },
    features: {
      firebase: hasFirebaseConfig,
      cloudinary: hasCloudinary,
      openRouter: hasOpenRouter,
      openCage: hasOpenCage,
    },
    warnings,
  };
};

module.exports = {
  getRuntimeStatus,
};
