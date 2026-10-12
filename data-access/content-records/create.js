const { toColumnValues, placeholders } = require('./sql-helpers');

function makeCreateDataAccess({ runQuery, tableName, fields }) {
  return async function createDataAccess(payload) {
    const pairs = toColumnValues(fields, payload);
    const result = await runQuery('create', `
      INSERT INTO ${tableName} (${pairs.map(([column]) => column).join(', ')}, created_at, updated_at)
      VALUES (${placeholders(pairs)}, NOW(), NOW())
    `, pairs.map(([, value]) => value));
    return { id: result.insertId };
  };
}

module.exports = makeCreateDataAccess;
