const { toColumnValues } = require('./sql-helpers');

/** Updates only the supplied fields. */
function makeUpdateDataAccess({ runQuery, tableName, fields }) {
  return async function updateDataAccess({ id, ...payload }) {
    const pairs = toColumnValues(fields, payload);
    if (pairs.length === 0) return true;
    const result = await runQuery('update', `
      UPDATE ${tableName}
      SET ${pairs.map(([column]) => `${column} = ?`).join(', ')}, updated_at = NOW()
      WHERE id = ?
    `, [...pairs.map(([, value]) => value), id]);
    return result.affectedRows > 0;
  };
}

module.exports = makeUpdateDataAccess;
