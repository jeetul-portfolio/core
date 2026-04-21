function makeGetSeoTagsDataAccess({ logger, mysqlPool, tableName }) {
  return async function getSeoTagsDataAccess() {
    try {
      const [rows] = await mysqlPool.query(
        `SELECT id, name, slug, \`group\`, color, description
         FROM ${tableName}
         WHERE is_seo_enabled = 1 AND is_internal = 0
         ORDER BY name ASC`
      );
      return rows;
    } catch (error) {
      logger.error('Database query failed in getSeoTagsDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeGetSeoTagsDataAccess;
