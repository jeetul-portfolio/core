const normalizeAxiosError = require('./normalize-axios-error');

function makeGetAuthenticatedUser({ githubClient }) {
  return async function getAuthenticatedUser() {
    try {
      const response = await githubClient.get('/user');
      return response.data;
    } catch (error) {
      throw normalizeAxiosError(error);
    }
  };
}

module.exports = makeGetAuthenticatedUser;