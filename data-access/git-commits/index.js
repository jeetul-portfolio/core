const makeGetGitCommits = require('./get-git-commits');
const makeGetGitCommitCounts = require('./get-git-commit-counts');

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

function getGitCommits(dependencies) {
  return makeGetGitCommits({
    ...dependencies,
    tableName: TABLE_NAME,
    fields,
  });
}

function getGitCommitCounts(dependencies) {
  return makeGetGitCommitCounts({
    ...dependencies,
    tableName: TABLE_NAME,
  });
}

module.exports = {
  getGitCommits,
  getGitCommitCounts,
};