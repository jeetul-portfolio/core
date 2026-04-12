function makeGetSkillsByIdsDataAccess({ logger, mysqlPool, tableName }) {
  return async function getSkillsByIdsDataAccess({ ids }) {
    if (!ids || ids.length === 0) {
      return [];
    }

    try {
      const placeholders = ids.map(() => '?').join(', ');
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
        WHERE id IN (${placeholders})
        ORDER BY FIELD(level, 'Expert', 'Advanced', 'Intermediate', 'Beginner'), sort_order ASC
      `;

      const [rows] = await mysqlPool.query(query, ids);
      return rows;
    } catch (error) {
      logger.error('Database query failed in getSkillsByIdsDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeGetSkillsByIdsDataAccess;
