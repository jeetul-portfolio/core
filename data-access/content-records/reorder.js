const { placeholders } = require('./sql-helpers');

/** Sets sort_order to each id's position in `ids` in one (atomic) statement. */
function makeReorderDataAccess({ runQuery, tableName }) {
  return async function reorderDataAccess({ ids }) {
    const cases = ids.map(() => 'WHEN ? THEN ?').join(' ');
    await runQuery('reorder', `
      UPDATE ${tableName}
      SET sort_order = CASE id ${cases} END, updated_at = NOW()
      WHERE id IN (${placeholders(ids)})
    `, [...ids.flatMap((id, index) => [id, index]), ...ids]);
  };
}

module.exports = makeReorderDataAccess;
