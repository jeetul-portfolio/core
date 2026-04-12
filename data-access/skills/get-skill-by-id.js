function makeGetSkillByIdDataAccess({ logger, mysqlPool, tableName }) {
  return async function getSkillByIdDataAccess({ id }) {
    try {
      const query = `
        SELECT
          id,
          name,
          level,
          notes,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM ${tableName}
        WHERE id = ?
        LIMIT 1
      `;

      const [rows] = await mysqlPool.query(query, [id]);
      return rows[0] || null;
    } catch (error) {
      logger.error('Database query failed in getSkillByIdDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeGetSkillByIdDataAccess;
