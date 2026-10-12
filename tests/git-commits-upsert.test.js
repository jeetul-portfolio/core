const test = require('node:test');
const assert = require('node:assert/strict');
const makeUpsert = require('../data-access/git-commits/upsert-git-commits-for-project');

test('keeps stored commits and inserts only new hashes', async () => {
  const queries = [];
  const mysqlPool = {
    query: async (sql, params) => {
      queries.push(sql);
      if (/^\s*SELECT/.test(sql)) return [[{ fullHash: 'old1' }]];
      if (/INSERT/.test(sql)) return [{ affectedRows: params[0].length }];
      throw new Error(`unexpected query: ${sql}`);
    },
  };
  const upsert = makeUpsert({ logger: { error() {} }, mysqlPool, tableName: 'git_commits', fields: ['fullHash'] });

  const result = await upsert({
    projectId: 1,
    commits: ['old1', 'new1', 'new1', 'new2'].map((h) => ({ fullHash: h, shortHash: h, committedAt: new Date() })),
  });

  assert.deepEqual(result, { inserted: 2, updated: 0 });
  assert.ok(queries.every((sql) => !/DELETE/.test(sql)));
});
