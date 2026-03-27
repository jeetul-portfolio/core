const makeGetGitCommits = require('./get-git-commits');
const makeGetGitCommitCounts = require('./get-git-commit-counts');
const makeDeleteGitCommitsByProjectId = require('./delete-git-commits-by-project-id');
const makeInsertGitCommitsBulk = require('./insert-git-commits-bulk');
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
  return {
    getGitCommits: makeGetGitCommits({
      ...dependencies,
      tableName: TABLE_NAME,
      fields,
    }),
    getGitCommitCounts: makeGetGitCommitCounts({
      ...dependencies,
      tableName: TABLE_NAME,
    }),
    deleteGitCommitsByProjectId: makeDeleteGitCommitsByProjectId({
      ...dependencies,
      tableName: TABLE_NAME,
    }),
    insertGitCommitsBulk: makeInsertGitCommitsBulk({
      ...dependencies,
      tableName: TABLE_NAME,
    }),
    upsertGitCommitsForProject: makeUpsertGitCommitsForProject({
      ...dependencies,
      tableName: TABLE_NAME,
    }),
  };
};