const rawBaseApiUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const normalizedBaseApiUrl = /^https?:\/\//i.test(rawBaseApiUrl)
  ? rawBaseApiUrl
  : `https://${rawBaseApiUrl}`;

export const BASE_API_URL = normalizedBaseApiUrl.replace(/\/+$/, '');
