const normalizeAxiosError = require('./normalize-axios-error');

function makeGetRepository({ githubClient }) {
  return async function getRepository({ owner, repo }) {
    try {
      const response = await githubClient.get(`/repos/${owner}/${repo}`);
      return response.data;
    } catch (error) {
      throw normalizeAxiosError(error);
    }
  };
}

module.exports = makeGetRepository;