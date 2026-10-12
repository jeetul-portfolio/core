const test = require('node:test');
const assert = require('node:assert/strict');
const Joi = require('joi');
const makeSyncGitData = require('../usecases/git/sync-git-data');

const ME = { login: 'me', name: 'Me', email: 'me@x.io' };
const mine = (sha) => ({ sha, author: { login: 'me' }, commit: { message: sha, author: { name: 'Me', date: '2026-01-01' } } });

test('skips forks, deactivates stored forks, and syncs open-source contributions with an author filter', async () => {
  const upserts = [];
  const commitCalls = [];
  const repoMeta = {
    'me/app': { fork: false },
    'me/old-fork': { fork: true },
    'oss/lib': { fork: false },
  };

  const githubExternalCalls = {
    getAuthenticatedUser: async () => ME,
    getAllRepositories: async () => [
      { owner: { login: 'me' }, name: 'app', fork: false },
      { owner: { login: 'me' }, name: 'new-fork', fork: true },
    ],
    getContributedRepositories: async () => [{ owner: 'oss', repo: 'lib' }],
    getRepository: async ({ owner, repo }) => ({
      ...repoMeta[`${owner}/${repo}`], full_name: `${owner}/${repo}`, default_branch: 'main', html_url: 'u',
    }),
    getCommits: async (args) => { commitCalls.push(args); return [mine(`${args.owner}-1`)]; },
    getCommitDetails: async ({ sha }) => mine(sha),
  };

  const dataAccess = {
    gitProjects: {
      getGitProjects: async () => [{ projectKey: 'me/old-fork', repoOwner: 'me', repoName: 'old-fork' }],
      upsertGitProject: async (row) => { upserts.push(row); return upserts.length; },
      updateGitProjectSyncStatus: async () => {},
    },
    gitCommits: { upsertGitCommitsForProject: async ({ commits }) => ({ inserted: commits.length, updated: 0 }) },
  };

  const sync = makeSyncGitData({
    dataAccess,
    config: { github: { token: 't', maxCommitsPerRepo: 100 } },
    logger: { info() {}, warn() {}, error() {} },
    Joi,
    ValidationError: Error,
    buildGithubExternalCalls: () => githubExternalCalls,
  });

  const result = await sync();
  const byKey = Object.fromEntries(result.repoResults.map((r) => [r.projectKey, r.status]));

  assert.deepEqual(byKey, { 'me/old-fork': 'skipped', 'me/app': 'success', 'oss/lib': 'success' });
  assert.equal(result.totalReposFailed, 0);
  assert.equal(upserts.find((u) => u.projectKey === 'me/old-fork').isActive, false);
  assert.equal(commitCalls.find((c) => c.repo === 'lib').author, 'me');
  assert.equal(commitCalls.find((c) => c.repo === 'app').author, undefined);
});

test('an empty GitHub repository (409) syncs successfully with zero commits', async () => {
  const statusUpdates = [];
  const emptyRepoError = Object.assign(new Error('GitHub API request failed (409): {"message":"Git Repository is empty."}'), { status: 409 });
  const githubExternalCalls = {
    getAuthenticatedUser: async () => ME,
    getAllRepositories: async () => [{ owner: { login: 'me' }, name: 'empty', fork: false }],
    getContributedRepositories: async () => [],
    getRepository: async () => ({ fork: false, full_name: 'me/empty', default_branch: 'main', html_url: 'u' }),
    getCommits: async () => { throw emptyRepoError; },
    getCommitDetails: async () => { throw new Error('should not be called'); },
  };
  const sync = makeSyncGitData({
    dataAccess: {
      gitProjects: {
        getGitProjects: async () => [],
        upsertGitProject: async () => 1,
        updateGitProjectSyncStatus: async (row) => statusUpdates.push(row.syncStatus),
      },
      gitCommits: { upsertGitCommitsForProject: async ({ commits }) => ({ inserted: commits.length, updated: 0 }) },
    },
    config: { github: { token: 't', maxCommitsPerRepo: 0 } },
    logger: { info() {}, warn() {}, error() {} },
    Joi,
    ValidationError: Error,
    buildGithubExternalCalls: () => githubExternalCalls,
  });

  const result = await sync();

  assert.deepEqual(result.repoResults.map((r) => [r.status, r.commitsFetched, r.error]), [['success', 0, null]]);
  assert.equal(result.totalReposFailed, 0);
  assert.deepEqual(statusUpdates, ['success']);
});
