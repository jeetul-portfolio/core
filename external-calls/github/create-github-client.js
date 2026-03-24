function createGithubClient({ axios, config }) {
  return axios.create({
    baseURL: config.github.apiBaseUrl,
    timeout: config.github.requestTimeoutMs || 15000,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${config.github.token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': config.github.userAgent,
    },
  });
}

module.exports = createGithubClient;