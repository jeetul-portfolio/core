const { placeholders } = require('./sql-helpers');

function makeGetByIdsDataAccess({ runQuery, tableName, selectList }) {
  return async function getByIdsDataAccess({ ids }) {
    if (!ids || ids.length === 0) return [];
    return runQuery('getByIds', `
      SELECT ${selectList} FROM ${tableName} WHERE id IN (${placeholders(ids)})
    `, ids);
  };
}

module.exports = makeGetByIdsDataAccess;
