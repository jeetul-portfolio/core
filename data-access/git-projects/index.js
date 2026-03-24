const makeGetGitProjects = require('./get-git-projects');
const makeUpsertGitProject = require('./upsert-git-project');
const makeUpdateGitProjectSyncStatus = require('./update-git-project-sync-status');

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

  const upsertGitProject = makeUpsertGitProject({
    ...dependencies,
    tableName: TABLE_NAME,
  });

  const updateGitProjectSyncStatus = makeUpdateGitProjectSyncStatus({
    ...dependencies,
    tableName: TABLE_NAME,
  });

  return {
    getGitProjects,
    upsertGitProject,
    updateGitProjectSyncStatus,
  };
};