function makeRemoveDataAccess({ runQuery, tableName }) {
  return async function removeDataAccess({ id }) {
    const result = await runQuery('remove', `DELETE FROM ${tableName} WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  };
}

module.exports = makeRemoveDataAccess;
