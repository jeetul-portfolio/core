const normalizeAxiosError = require('./normalize-axios-error');

function makeGetCommits({ githubClient, logger }) {
  return async function getCommits({ owner, repo, defaultBranch, maxCommitsPerRepo }) {
    const commits = [];
    let page = 1;
    const hasLimit = Number.isFinite(maxCommitsPerRepo) && Number(maxCommitsPerRepo) > 0;
    const perPage = hasLimit ? Math.min(100, Number(maxCommitsPerRepo)) : 100;

    logger?.info('Starting GitHub commit pagination', {
      owner,
      repo,
      defaultBranch,
      hasLimit,
      maxCommitsPerRepo: hasLimit ? Number(maxCommitsPerRepo) : null,
      perPage,
    });

    while (true) {
      if (hasLimit && commits.length >= Number(maxCommitsPerRepo)) {
        logger?.info('Stopping commit pagination because configured limit was reached', {
          owner,
          repo,
          fetched: commits.length,
          maxCommitsPerRepo: Number(maxCommitsPerRepo),
        });
        break;
      }

      try {
        const remaining = hasLimit ? Number(maxCommitsPerRepo) - commits.length : perPage;
        const effectivePerPage = hasLimit ? Math.min(perPage, remaining) : perPage;

        logger?.info('Fetching commit page from GitHub', {
          owner,
          repo,
          page,
          effectivePerPage,
          fetchedSoFar: commits.length,
        });

        const response = await githubClient.get(`/repos/${owner}/${repo}/commits`, {
          params: {
            sha: defaultBranch,
            per_page: effectivePerPage,
            page,
          },
        });

        const commitBatch = Array.isArray(response.data) ? response.data : [];

        if (commitBatch.length === 0) {
          logger?.info('No more commits returned from GitHub; pagination finished', {
            owner,
            repo,
            page,
            fetchedTotal: commits.length,
          });
          break;
        }

        commits.push(...commitBatch);

        logger?.info('Commit page fetched successfully', {
          owner,
          repo,
          page,
          batchSize: commitBatch.length,
          fetchedTotal: commits.length,
        });

        if (commitBatch.length < effectivePerPage) {
          logger?.info('Last commit page detected by short page size', {
            owner,
            repo,
            page,
            batchSize: commitBatch.length,
            requestedPageSize: effectivePerPage,
          });
          break;
        }

        page += 1;
      } catch (error) {
        logger?.error('GitHub commit pagination failed', {
          owner,
          repo,
          page,
          error: error.message,
        });
        throw normalizeAxiosError(error);
      }
    }

    logger?.info('GitHub commit pagination completed', {
      owner,
      repo,
      fetchedTotal: commits.length,
      hasLimit,
      maxCommitsPerRepo: hasLimit ? Number(maxCommitsPerRepo) : null,
    });

    return hasLimit ? commits.slice(0, Number(maxCommitsPerRepo)) : commits;
  };
}

module.exports = makeGetCommits;