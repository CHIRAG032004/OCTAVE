export const normalizeIssueStatus = (status, fallback = 'pending') => {
  if (!status || typeof status !== 'string') {
    return fallback;
  }

  const normalized = status
    .trim()
    .toLowerCase()
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ');

  const allowed = new Set(['open', 'in progress', 'pending', 'closed', 'resolved']);
  return allowed.has(normalized) ? normalized : fallback;
};

export const formatIssueStatus = (status) => {
  const normalized = normalizeIssueStatus(status);
  return normalized.replace(/\b\w/g, (char) => char.toUpperCase());
};
