const coerceDate = (value) => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value?.toDate === 'function') {
    const converted = value.toDate();
    return Number.isNaN(converted.getTime()) ? null : converted;
  }

  if (typeof value === 'object') {
    if (typeof value.seconds === 'number') {
      return new Date(value.seconds * 1000);
    }

    if (typeof value._seconds === 'number') {
      return new Date(value._seconds * 1000);
    }
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const formatDate = (value, options, fallback = 'N/A') => {
  const date = coerceDate(value);
  if (!date) {
    return fallback;
  }

  return date.toLocaleDateString('en-US', options);
};

export const formatDateTime = (value, options, fallback = 'N/A') => {
  const date = coerceDate(value);
  if (!date) {
    return fallback;
  }

  return date.toLocaleString('en-US', options);
};

export const getDate = (value) => coerceDate(value);
