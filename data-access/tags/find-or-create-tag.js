/**
 * Find an existing tag by slug, or create a new one.
 * Uses INSERT ... ON DUPLICATE KEY UPDATE to atomically upsert.
 * Returns the id of the found or created tag.
 */
function makeFindOrCreateTagDataAccess({ logger, mysqlPool, tableName }) {
  return async function findOrCreateTagDataAccess({ name, slug, group, color, description }) {
    try {
      await mysqlPool.query(
        `INSERT INTO ${tableName} (name, slug, \`group\`, color, description)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)`,
        [name, slug, group || null, color || null, description || null]
      );

      const [rows] = await mysqlPool.query(
        `SELECT id FROM ${tableName} WHERE slug = ?`,
        [slug]
      );

      return rows[0]?.id || null;
    } catch (error) {
      logger.error('Database query failed in findOrCreateTagDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeFindOrCreateTagDataAccess;
