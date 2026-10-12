const test = require('node:test');
const assert = require('node:assert/strict');
const makeCleanup = require('../usecases/git/delete-git-projects-without-commits');

function setup() {
  const deleted = [];
  const dataAccess = {
    gitProjects: {
      getGitProjectsWithoutCommits: async () => [{ id: 3, projectKey: 'me/empty' }, { id: 9, projectKey: 'me/none-mine' }],
      deleteGitProject: async ({ projectId }) => { deleted.push(projectId); return true; },
    },
  };
  return { deleted, cleanup: makeCleanup({ dataAccess, logger: { info() {} } }) };
}

test('dry run reports projects without commits and deletes nothing', async () => {
  const { deleted, cleanup } = setup();
  const result = await cleanup({ dryRun: true });
  assert.deepEqual(result, {
    dryRun: true,
    totalProjectsWithoutCommits: 2,
    deleted: 0,
    projects: [{ id: 3, projectKey: 'me/empty' }, { id: 9, projectKey: 'me/none-mine' }],
  });
  assert.deepEqual(deleted, []);
});

test('real run deletes every project without commits', async () => {
  const { deleted, cleanup } = setup();
  const result = await cleanup();
  assert.equal(result.deleted, 2);
  assert.deepEqual(deleted, [3, 9]);
});
