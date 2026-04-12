function makeDeleteByEntityDataAccess({ logger, mysqlPool, tableName }) {
  return async function deleteByEntityDataAccess({ entityType, entityId }) {
    try {
      await mysqlPool.query(
        `DELETE FROM ${tableName} WHERE entity_type = ? AND entity_id = ?`,
        [entityType, entityId]
      );
    } catch (error) {
      logger.error('Database query failed in deleteByEntityDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeDeleteByEntityDataAccess;
