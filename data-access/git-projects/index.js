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

function getGitProjects(dependencies) {
  return makeGetGitProjects({
    ...dependencies,
    tableName: TABLE_NAME,
    fields,
  });
}

module.exports = {
  getGitProjects,
};