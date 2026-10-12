function normalizeAxiosError(error) {
  if (!error || !error.response) {
    return new Error(error?.message || 'GitHub API request failed');
  }

  const status = error.response.status;
  const payload = typeof error.response.data === 'string'
    ? error.response.data
    : JSON.stringify(error.response.data);

  const normalized = new Error(`GitHub API request failed (${status}): ${payload}`);
  normalized.status = status;
  return normalized;
}

module.exports = normalizeAxiosError;
