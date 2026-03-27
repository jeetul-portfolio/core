function makeSyncGitDataUsecase({ dataAccess, config, logger, Joi, ValidationError, buildGithubExternalCalls }) {
  return async function syncGitDataUsecase({ repos, maxCommitsPerRepo } = {}) {
    const validatedInputs = validateInputs({ Joi, ValidationError, repos, maxCommitsPerRepo });
    const syncTimestamp = new Date();
    const normalizedMaxCommits = validatedInputs.maxCommitsPerRepo || config.github.maxCommitsPerRepo || 100;

    if (!config.github.token) {
      throw new ValidationError('GITHUB_TOKEN is required to sync git data from GitHub API.');
    }

    const githubExternalCalls = buildGithubExternalCalls({ config });
    const authenticatedUser = await githubExternalCalls.getAuthenticatedUser();

    if (!authenticatedUser?.login) {
      throw new ValidationError('Unable to resolve authenticated GitHub user for commit ownership filtering.');
    }

    const reposToSync = await resolveReposToSync({
      validatedRepos: validatedInputs.repos,
      dataAccess,
      config,
      logger,
      githubExternalCalls,
    });

    if (reposToSync.length === 0) {
      return {
        syncedAt: syncTimestamp.toISOString(),
        totalReposRequested: 0,
        totalReposSynced: 0,
        totalReposFailed: 0,
        totalCommitsUpserted: 0,
        repoResults: [],
      };
    }

    const repoResults = [];
    let totalCommitsUpserted = 0;

    for (const repo of reposToSync) {
      const syncResult = await syncRepository({
        repo,
        normalizedMaxCommits,
        syncTimestamp,
        dataAccess,
        config,
        logger,
        githubExternalCalls,
        authenticatedUser,
      });

      if (syncResult.status === 'success') {
        totalCommitsUpserted += syncResult.commitsInserted + syncResult.commitsUpdated;
      }

      repoResults.push(syncResult);
    }

    const totalReposSynced = repoResults.filter((result) => result.status === 'success').length;
    const totalReposFailed = repoResults.length - totalReposSynced;

    logger.info('Git sync completed', {
      totalReposRequested: repoResults.length,
      totalReposSynced,
      totalReposFailed,
      totalCommitsUpserted,
    });

    return {
      syncedAt: syncTimestamp.toISOString(),
      totalReposRequested: repoResults.length,
      totalReposSynced,
      totalReposFailed,
      totalCommitsUpserted,
      repoResults,
    };
  };
}

async function syncRepository({ repo, normalizedMaxCommits, syncTimestamp, dataAccess, config, logger, githubExternalCalls, authenticatedUser }) {
  const result = {
    projectKey: repo.projectKey,
    owner: repo.owner,
    repo: repo.repo,
    status: 'success',
    commitsFetched: 0,
    commitsInserted: 0,
    commitsUpdated: 0,
    error: null,
  };

  let projectId;

  try {
    const repositoryData = await githubExternalCalls.getRepository({
      owner: repo.owner,
      repo: repo.repo,
    });

    projectId = await dataAccess.gitProjects.upsertGitProject({
      projectKey: repo.projectKey,
      displayName: repo.displayName || repositoryData.full_name,
      repoOwner: repo.owner,
      repoName: repo.repo,
      repoUrl: repositoryData.html_url,
      defaultBranch: repositoryData.default_branch,
      isActive: true,
      syncStatus: 'partial',
      isStale: false,
    });

    const commits = await githubExternalCalls.getCommits({
      owner: repo.owner,
      repo: repo.repo,
      defaultBranch: repositoryData.default_branch,
      maxCommitsPerRepo: normalizedMaxCommits,
    });

    result.commitsFetched = commits.length;

    const commitsWithStats = await enrichCommitsWithStats({
      owner: repo.owner,
      repo: repo.repo,
      commits,
      githubExternalCalls,
      logger,
      maxConcurrency: config.github.commitStatsConcurrency || 5,
    });

    const myCommits = commitsWithStats.filter((commitItem) =>
      isCommitOwnedByAuthenticatedUser({ commitItem, authenticatedUser }),
    );

    const mappedCommits = myCommits.map((commitItem) => ({
      fullHash: commitItem.sha,
      shortHash: commitItem.sha.slice(0, 7),
      message: commitItem.commit?.message || '',
      authorName:
        commitItem.commit?.author?.name ||
        commitItem.author?.login ||
        commitItem.commit?.committer?.name ||
        'Unknown',
      authorAvatarUrl: commitItem.author?.avatar_url || null,
      committedAt:
        toMysqlDatetime(
          commitItem.commit?.author?.date ||
            commitItem.commit?.committer?.date ||
            syncTimestamp,
        ),
      commitUrl: commitItem.html_url || null,
      additions: Number.isFinite(commitItem?.stats?.additions) ? commitItem.stats.additions : null,
      deletions: Number.isFinite(commitItem?.stats?.deletions) ? commitItem.stats.deletions : null,
      isAccessible: true,
    }));

    const upsertResult = await dataAccess.gitCommits.upsertGitCommitsForProject({
      projectId,
      commits: mappedCommits,
      syncedAt: syncTimestamp,
    });

    result.commitsInserted = upsertResult.inserted;
    result.commitsUpdated = upsertResult.updated;

    await dataAccess.gitProjects.updateGitProjectSyncStatus({
      projectId,
      syncStatus: 'success',
      lastSyncedAt: syncTimestamp,
      nextSyncAt: null,
      isStale: false,
    });

    return result;
  } catch (error) {
    logger.error('Git repo sync failed', {
      projectKey: repo.projectKey,
      owner: repo.owner,
      repo: repo.repo,
      error: error.message,
    });

    result.status = 'failed';
    result.error = error.message;

    if (projectId) {
      await dataAccess.gitProjects.updateGitProjectSyncStatus({
        projectId,
        syncStatus: 'failed',
        lastSyncedAt: null,
        nextSyncAt: null,
        isStale: true,
      });
    }

    return result;
  }
}

async function resolveReposToSync({ validatedRepos, dataAccess, config, logger, githubExternalCalls }) {
  if (Array.isArray(validatedRepos) && validatedRepos.length > 0) {
    return validatedRepos.map((repo) => normalizeRepoInput(repo));
  }

  const mergedRepos = [];

  const fromDatabase = await dataAccess.gitProjects.getGitProjects({
    onlyActive: true,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });

  if (fromDatabase.length > 0) {
    mergedRepos.push(
      ...fromDatabase.map((project) => ({
        projectKey: project.projectKey,
        owner: project.repoOwner,
        repo: project.repoName,
        displayName: project.displayName,
      })),
    );
  }

  const configuredRepos = parseReposFromConfig(config.github.syncRepos || '');
  if (configuredRepos.length > 0) {
    logger.info('Using GITHUB_SYNC_REPOS fallback for git sync', {
      totalConfiguredRepos: configuredRepos.length,
    });
    mergedRepos.push(...configuredRepos);
  }

  const discoveredRepos = await githubExternalCalls.getAllRepositories();
  if (discoveredRepos.length > 0) {
    logger.info('Using GitHub auto-discovered repositories for git sync', {
      totalDiscoveredRepos: discoveredRepos.length,
    });
    mergedRepos.push(
      ...discoveredRepos
        .map((repository) => normalizeDiscoveredRepository(repository))
        .filter(Boolean),
    );
  }

  const dedupedByProjectKey = new Map();
  mergedRepos.forEach((repo) => {
    const normalized = normalizeRepoInput(repo);
    dedupedByProjectKey.set(normalized.projectKey, normalized);
  });

  return Array.from(dedupedByProjectKey.values());
}

function validateInputs({ Joi, ValidationError, repos, maxCommitsPerRepo }) {
  const schema = Joi.object({
    repos: Joi.array()
      .items(
        Joi.object({
          projectKey: Joi.string().trim().min(1).max(80).optional(),
          owner: Joi.string().trim().min(1).max(120).required(),
          repo: Joi.string().trim().min(1).max(120).required(),
          displayName: Joi.string().trim().min(1).max(150).optional(),
        }),
      )
      .default([]),
    maxCommitsPerRepo: Joi.number().integer().min(1).max(500).optional(),
  });

  const validatedResponse = schema.validate({ repos, maxCommitsPerRepo });

  if (validatedResponse.error) {
    throw new ValidationError(validatedResponse.error.message);
  }

  return validatedResponse.value;
}

function parseReposFromConfig(syncReposConfigValue) {
  if (!syncReposConfigValue) {
    return [];
  }

  return String(syncReposConfigValue)
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [projectKeyPart, repoPart] = entry.includes(':') ? entry.split(':') : [null, entry];
      const [owner, repo] = String(repoPart).split('/').map((value) => value.trim());

      if (!owner || !repo) {
        return null;
      }

      return {
        projectKey: projectKeyPart ? projectKeyPart.trim() : `${owner}/${repo}`,
        owner,
        repo,
      };
    })
    .filter(Boolean);
}

function normalizeRepoInput(repo) {
  const normalizedProjectKey = repo.projectKey || `${repo.owner}/${repo.repo}`;
  return {
    projectKey: normalizedProjectKey,
    owner: repo.owner,
    repo: repo.repo,
    displayName: repo.displayName,
  };
}

function normalizeDiscoveredRepository(repository) {
  const owner = repository?.owner?.login;
  const repo = repository?.name;

  if (!owner || !repo) {
    return null;
  }

  return {
    projectKey: `${owner}/${repo}`,
    owner,
    repo,
    displayName: repository.full_name || `${owner}/${repo}`,
  };
}

function toMysqlDatetime(dateLike) {
  const date = new Date(dateLike);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function isCommitOwnedByAuthenticatedUser({ commitItem, authenticatedUser }) {
  const userIdentifiers = buildUserIdentifiers(authenticatedUser);
  if (userIdentifiers.size === 0) {
    return false;
  }

  const commitIdentifiers = buildCommitIdentifiers(commitItem);
  for (const identifier of commitIdentifiers) {
    if (userIdentifiers.has(identifier)) {
      return true;
    }
  }

  return false;
}

function buildUserIdentifiers(authenticatedUser) {
  const values = [
    authenticatedUser?.login,
    authenticatedUser?.name,
    authenticatedUser?.email,
  ];

  return new Set(
    values
      .map((value) => normalizeIdentity(value))
      .filter(Boolean),
  );
}

function buildCommitIdentifiers(commitItem) {
  const values = [
    commitItem?.author?.login,
    commitItem?.committer?.login,
    commitItem?.commit?.author?.name,
    commitItem?.commit?.author?.email,
    commitItem?.commit?.committer?.name,
    commitItem?.commit?.committer?.email,
  ];

  return values
    .map((value) => normalizeIdentity(value))
    .filter(Boolean);
}

function normalizeIdentity(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

async function enrichCommitsWithStats({ owner, repo, commits, githubExternalCalls, logger, maxConcurrency = 5 }) {
  if (!Array.isArray(commits) || commits.length === 0) {
    return [];
  }

  const tasks = commits.map((commit, index) => async () => {
    try {
      const details = await githubExternalCalls.getCommitDetails({
        owner,
        repo,
        sha: commit.sha,
      });

      return { index, commit: details };
    } catch (error) {
      logger.warn('Failed to fetch commit stats. Falling back to list response.', {
        owner,
        repo,
        sha: commit.sha,
        error: error.message,
      });

      return { index, commit };
    }
  });

  const resolved = await runWithConcurrency(tasks, Math.max(1, Number(maxConcurrency) || 1));
  return resolved
    .sort((left, right) => left.index - right.index)
    .map((item) => item.commit);
}

async function runWithConcurrency(tasks, concurrency) {
  const results = [];
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < tasks.length) {
      const current = nextIndex;
      nextIndex += 1;
      results.push(await tasks[current]());
    }
  }

  const workerCount = Math.min(concurrency, tasks.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
}

module.exports = makeSyncGitDataUsecase;
