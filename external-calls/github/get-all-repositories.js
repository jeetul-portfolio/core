const normalizeAxiosError = require('./normalize-axios-error');

function makeGetAllRepositories({ githubClient }) {
  return async function getAllRepositories() {
    const repositories = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      try {
        const response = await githubClient.get('/user/repos', {
          params: {
            visibility: 'all',
            affiliation: 'owner,collaborator,organization_member',
            sort: 'updated',
            direction: 'desc',
            per_page: perPage,
            page,
          },
        });

        const batch = Array.isArray(response.data) ? response.data : [];
        if (batch.length === 0) {
          break;
        }

        repositories.push(...batch);

        if (batch.length < perPage) {
          break;
        }

        page += 1;
      } catch (error) {
        throw normalizeAxiosError(error);
      }
    }

    return repositories;
  };
}

module.exports = makeGetAllRepositories;