/**
 * Replaces all tag_references for a given entity with a new set of tagIds.
 * Deletes existing references first, then bulk-inserts new ones.
 */
function makeUpsertReferencesDataAccess({ logger, mysqlPool, tableName }) {
  return async function upsertReferencesDataAccess({ entityType, entityId, tagIds }) {
    try {
      await mysqlPool.query(
        `DELETE FROM ${tableName} WHERE entity_type = ? AND entity_id = ?`,
        [entityType, entityId]
      );

      if (!tagIds || tagIds.length === 0) {
        return;
      }

      const placeholders = tagIds.map(() => '(?, ?, ?)').join(', ');
      const values = tagIds.flatMap((tagId) => [tagId, entityType, entityId]);

      await mysqlPool.query(
        `INSERT IGNORE INTO ${tableName} (tag_id, entity_type, entity_id) VALUES ${placeholders}`,
        values
      );
    } catch (error) {
      logger.error('Database query failed in upsertReferencesDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeUpsertReferencesDataAccess;
