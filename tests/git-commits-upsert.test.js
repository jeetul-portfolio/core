const test = require('node:test');
const assert = require('node:assert/strict');
const makeUpsert = require('../data-access/git-commits/upsert-git-commits-for-project');

test('appends commits with INSERT IGNORE so stored hashes are skipped by the unique key', async () => {
  const queries = [];
  const stored = new Set(['old1']);
  const mysqlPool = {
    query: async (sql, params) => {
      queries.push(sql);
      // Simulate uq_git_commits_project_fullHash: only unseen hashes count as inserted.
      const inserted = params[0].filter(([, fullHash]) => !stored.has(fullHash) && stored.add(fullHash));
      return [{ affectedRows: inserted.length }];
    },
  };
  const upsert = makeUpsert({ logger: { error() {} }, mysqlPool, tableName: 'git_commits' });

  const result = await upsert({
    projectId: 1,
    commits: ['old1', 'new1', 'new1', 'new2'].map((h) => ({ fullHash: h, shortHash: h, committedAt: new Date() })),
  });

  assert.deepEqual(result, { inserted: 2, updated: 0 });
  assert.equal(queries.length, 1);
  assert.match(queries[0], /INSERT IGNORE INTO git_commits/);
  assert.doesNotMatch(queries[0], /positionRank|isLatest/);
  assert.ok(queries.every((sql) => !/DELETE/.test(sql)));
});

test('re-syncing the same commits inserts nothing and never fails', async () => {
  const stored = new Set();
  const mysqlPool = {
    query: async (sql, params) => [{ affectedRows: params[0].filter(([, h]) => !stored.has(h) && stored.add(h)).length }],
  };
  const upsert = makeUpsert({ logger: { error() {} }, mysqlPool, tableName: 'git_commits' });
  const commits = ['a', 'b'].map((h) => ({ fullHash: h, shortHash: h, committedAt: new Date() }));

  assert.deepEqual(await upsert({ projectId: 5, commits }), { inserted: 2, updated: 0 });
  assert.deepEqual(await upsert({ projectId: 5, commits }), { inserted: 0, updated: 0 });
});
