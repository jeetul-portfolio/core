const makeGetGitCommits = require('./get-git-commits');
const makeGetGitCommitCounts = require('./get-git-commit-counts');
const makeUpsertGitCommitsForProject = require('./upsert-git-commits-for-project');

const TABLE_NAME = 'git_commits';
const fields = [
  'id',
  'projectId',
  'fullHash',
  'shortHash',
  'message',
  'authorName',
  'authorAvatarUrl',
  'committedAt',
  'commitUrl',
  'additions',
  'deletions',
  'positionRank',
  'isLatest',
  'syncedAt',
  'isAccessible',
  'lastAccessCheckedAt',
  'createdAt',
  'updatedAt',
];

module.exports = function buildGitCommitsDataAccess(dependencies) {
  const getGitCommits = makeGetGitCommits({
    ...dependencies,
    tableName: TABLE_NAME,
    fields,
  });

  const getGitCommitCounts = makeGetGitCommitCounts({
    ...dependencies,
    tableName: TABLE_NAME,
  });

  const upsertGitCommitsForProject = makeUpsertGitCommitsForProject({
    ...dependencies,
    tableName: TABLE_NAME,
  });

  return {
    getGitCommits,
    getGitCommitCounts,
    upsertGitCommitsForProject,
  };
};