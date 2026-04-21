function makeGetTagGraphDataAccess({ logger, mysqlPool, tableName }) {
  return async function getTagGraphDataAccess() {
    try {
      const [tags] = await mysqlPool.query(
        `SELECT id, name, slug, \`group\`, color, is_internal AS isInternal FROM ${tableName} ORDER BY name ASC`
      );

      const [references] = await mysqlPool.query(
        `SELECT tag_id AS tagId, entity_type AS entityType, entity_id AS entityId
         FROM tag_references
         ORDER BY tag_id ASC`
      );

      return { tags, references };
    } catch (error) {
      logger.error('Database query failed in getTagGraphDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeGetTagGraphDataAccess;
