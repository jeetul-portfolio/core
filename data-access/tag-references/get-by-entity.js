function makeGetByEntityDataAccess({ logger, mysqlPool, tableName }) {
  return async function getByEntityDataAccess({ entityType, entityId }) {
    try {
      const [rows] = await mysqlPool.query(
        `SELECT tr.id, tr.tag_id AS tagId, t.name, t.slug, t.color
         FROM ${tableName} tr
         JOIN tags t ON t.id = tr.tag_id
         WHERE tr.entity_type = ? AND tr.entity_id = ?
         ORDER BY t.name ASC`,
        [entityType, entityId]
      );
      return rows;
    } catch (error) {
      logger.error('Database query failed in getByEntityDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeGetByEntityDataAccess;
