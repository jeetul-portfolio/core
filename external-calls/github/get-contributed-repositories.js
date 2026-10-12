const normalizeAxiosError = require('./normalize-axios-error');

const PER_PAGE = 100;
const MAX_PAGES = 10; // GitHub search caps results at 1000

// Repos the user doesn't own but has merged PRs into (open-source contributions).
function makeGetContributedRepositories({ githubClient }) {
  return async function getContributedRepositories({ login }) {
    const repos = new Map();

    for (let page = 1; page <= MAX_PAGES; page += 1) {
      let items;
      try {
        const response = await githubClient.get('/search/issues', {
          params: { q: `type:pr is:merged author:${login} -user:${login}`, per_page: PER_PAGE, page },
        });
        items = Array.isArray(response.data?.items) ? response.data.items : [];
      } catch (error) {
        throw normalizeAxiosError(error);
      }

      items.forEach((item) => {
        const [owner, repo] = String(item.repository_url || '').split('/repos/')[1]?.split('/') || [];
        if (owner && repo) repos.set(`${owner}/${repo}`, { owner, repo });
      });

      if (items.length < PER_PAGE) break;
    }

    return Array.from(repos.values());
  };
}

module.exports = makeGetContributedRepositories;
