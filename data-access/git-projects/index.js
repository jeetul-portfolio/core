const makeGetGitProjects = require('./get-git-projects');

const TABLE_NAME = 'git_projects';
const fields = [
  'id',
  'projectKey',
  'displayName',
  'repoOwner',
  'repoName',
  'repoUrl',
  'defaultBranch',
  'isActive',
  'lastSyncedAt',
  'nextSyncAt',
  'syncStatus',
  'isStale',
  'createdAt',
  'updatedAt',
];

module.exports = function buildGitProjectsDataAccess(dependencies) {
  const getGitProjects = makeGetGitProjects({
    ...dependencies,
    tableName: TABLE_NAME,
    fields,
  });

  return {
    getGitProjects,
  };
};