function normalizeAxiosError(error) {
  if (!error || !error.response) {
    return new Error(error?.message || 'GitHub API request failed');
  }

  const status = error.response.status;
  const payload = typeof error.response.data === 'string'
    ? error.response.data
    : JSON.stringify(error.response.data);

  return new Error(`GitHub API request failed (${status}): ${payload}`);
}

module.exports = normalizeAxiosError;