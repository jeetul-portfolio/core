const RECENT_COMMIT_FIELDS = [
  'id',
  'projectId',
  'fullHash',
  'shortHash',
  'message',
  'authorName',
  'authorAvatarUrl',
  'committedAt',
  'updatedAt',
  'commitUrl',
  'additions',
  'deletions',
  'isAccessible',
  'lastAccessCheckedAt',
];

function makeGetGitProjectsOverviewUsecase({ dataAccess, logger, Joi, ValidationError }) {
  return async function getGitProjectsOverviewUsecase({
    limit = 5,
    sortBy = 'committedAt',
    sortOrder = 'desc',
    onlyActive = false,
    projectKeys = [],
  } = {}) {
    const validatedInputs = validateInputs({
      Joi,
      ValidationError,
      limit,
      sortBy,
      sortOrder,
      onlyActive,
      projectKeys,
    });

    const normalizedLimit = validatedInputs.limit;

    const projectSortBy = validatedInputs.sortBy === 'committedAt' ? 'updatedAt' : validatedInputs.sortBy;

    const projects = await dataAccess.gitProjects.getGitProjects({
      onlyActive: validatedInputs.onlyActive,
      projectKeys: validatedInputs.projectKeys,
      sortBy: projectSortBy,
      sortOrder: validatedInputs.sortOrder,
    });

    if (!projects.length) {
      return [];
    }

    const projectIds = projects.map((project) => project.id);

    const [commitCounts, commits] = await Promise.all([
      dataAccess.gitCommits.getGitCommitCounts({ projectIds }),
      dataAccess.gitCommits.getGitCommits({
        projectIds,
        fieldsToSelect: RECENT_COMMIT_FIELDS,
        sortBy: 'committedAt',
        sortOrder: 'desc',
      }),
    ]);

    logger.info('Git overview data retrieved', {
      totalProjects: projects.length,
      totalCommitsFetched: commits.length,
      limit: normalizedLimit,
    });

    const commitCountMap = new Map(
      commitCounts.map((row) => [Number(row.projectId), Number(row.totalCommitCount)]),
    );

    const commitsByProject = new Map();
    commits.forEach((commit) => {
      const projectId = Number(commit.projectId);
      if (!commitsByProject.has(projectId)) {
        commitsByProject.set(projectId, []);
      }

      const existing = commitsByProject.get(projectId);
      if (existing.length < normalizedLimit) {
        existing.push({
          id: commit.id,
          fullHash: commit.fullHash,
          shortHash: commit.shortHash,
          message: commit.message,
          authorName: commit.authorName,
          authorAvatarUrl: commit.authorAvatarUrl,
          committedAt: commit.committedAt,
          updatedAt: commit.updatedAt,
          commitUrl: commit.commitUrl,
          additions: commit.additions,
          deletions: commit.deletions,
          isAccessible: Boolean(commit.isAccessible),
          lastAccessCheckedAt: commit.lastAccessCheckedAt,
        });
      }
    });

    const overviewRows = projects.map((project) => {
      const projectId = Number(project.id);
      const recentCommits = commitsByProject.get(projectId) || [];

      return {
        projectId,
        projectKey: project.projectKey,
        displayName: project.displayName,
        repoOwner: project.repoOwner,
        repoName: project.repoName,
        repoUrl: project.repoUrl,
        defaultBranch: project.defaultBranch,
        isActive: Boolean(project.isActive),
        lastSyncedAt: project.lastSyncedAt,
        totalCommitCount: commitCountMap.get(projectId) || 0,
        latestCommit: recentCommits[0] || null,
        recentCommits,
      };
    });

    if (validatedInputs.sortBy === 'committedAt') {
      return sortByCommittedAt(overviewRows, validatedInputs.sortOrder);
    }

    return overviewRows;
  };
  
  function validateInputs({ Joi, ValidationError, limit, sortBy, sortOrder, onlyActive, projectKeys }) {
  const schema = Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(5),
      sortBy: Joi.string().trim().valid('committedAt', 'updatedAt', 'createdAt', 'lastSyncedAt', 'displayName', 'projectKey').default('committedAt'),
    sortOrder: Joi.string().trim().lowercase().valid('asc', 'desc').default('desc'),
    onlyActive: Joi.boolean().truthy('1', 'true', 'yes').falsy('0', 'false', 'no').default(false),
    projectKeys: Joi.array().items(Joi.string().trim().min(1).max(80)).default([]),
  });

  const validatedResponse = schema.validate({
    limit,
    sortBy,
    sortOrder,
    onlyActive,
    projectKeys,
  });

  if (validatedResponse.error) {
    throw new ValidationError(validatedResponse.error.message);
  }

  return validatedResponse.value;
}

function sortByCommittedAt(rows, sortOrder = 'desc') {
  const direction = String(sortOrder).toLowerCase() === 'asc' ? 1 : -1;

  return [...rows].sort((left, right) => {
    const leftValue = left.latestCommit?.committedAt ? new Date(left.latestCommit.committedAt).getTime() : 0;
    const rightValue = right.latestCommit?.committedAt ? new Date(right.latestCommit.committedAt).getTime() : 0;

    if (leftValue === rightValue) {
      return 0;
    }

    return leftValue > rightValue ? direction : -direction;
  });
}

}

module.exports = makeGetGitProjectsOverviewUsecase;