/**
 * Replaces all tag_references for a given entity with a new set of tagIds.
 * Delete + insert run in one transaction so a failure never leaves the entity untagged.
 */
function makeUpsertReferencesDataAccess({ logger, mysqlPool, tableName }) {
  return async function upsertReferencesDataAccess({ entityType, entityId, tagIds }) {
    const connection = await mysqlPool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query(
        `DELETE FROM ${tableName} WHERE entity_type = ? AND entity_id = ?`,
        [entityType, entityId]
      );

      const uniqueTagIds = [...new Set(tagIds || [])];
      if (uniqueTagIds.length > 0) {
        const placeholders = uniqueTagIds.map(() => '(?, ?, ?)').join(', ');
        const values = uniqueTagIds.flatMap((tagId) => [tagId, entityType, entityId]);

        await connection.query(
          `INSERT IGNORE INTO ${tableName} (tag_id, entity_type, entity_id) VALUES ${placeholders}`,
          values
        );
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      logger.error('Database query failed in upsertReferencesDataAccess:', error.message);
      throw error;
    } finally {
      connection.release();
    }
  };
}

module.exports = makeUpsertReferencesDataAccess;
