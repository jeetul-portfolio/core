const normalizeAxiosError = require('./normalize-axios-error');

function makeGetCommits({ githubClient }) {
  return async function getCommits({ owner, repo, defaultBranch, maxCommitsPerRepo }) {
    const commits = [];
    let page = 1;
    const perPage = Math.min(100, maxCommitsPerRepo);

    while (commits.length < maxCommitsPerRepo) {
      try {
        const response = await githubClient.get(`/repos/${owner}/${repo}/commits`, {
          params: {
            sha: defaultBranch,
            per_page: perPage,
            page,
          },
        });

        const commitBatch = Array.isArray(response.data) ? response.data : [];

        if (commitBatch.length === 0) {
          break;
        }

        commits.push(...commitBatch);

        if (commitBatch.length < perPage) {
          break;
        }

        page += 1;
      } catch (error) {
        throw normalizeAxiosError(error);
      }
    }

    return commits.slice(0, maxCommitsPerRepo);
  };
}

module.exports = makeGetCommits;