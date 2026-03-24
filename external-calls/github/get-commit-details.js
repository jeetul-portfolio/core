const normalizeAxiosError = require('./normalize-axios-error');

function makeGetCommitDetails({ githubClient }) {
  return async function getCommitDetails({ owner, repo, sha }) {
    try {
      const response = await githubClient.get(`/repos/${owner}/${repo}/commits/${sha}`);
      return response.data;
    } catch (error) {
      throw normalizeAxiosError(error);
    }
  };
}

module.exports = makeGetCommitDetails;