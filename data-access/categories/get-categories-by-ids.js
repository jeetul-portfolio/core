function makeGetCategoriesByIdsDataAccess({ logger, mysqlPool, tableName }) {
  return async function getCategoriesByIdsDataAccess({ ids }) {
    if (!ids || ids.length === 0) {
      return [];
    }

    try {
      const placeholders = ids.map(() => '?').join(', ');
      const query = `
        SELECT
          id,
          name,
          description,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM ${tableName}
        WHERE id IN (${placeholders})
        ORDER BY sort_order ASC, name ASC
      `;

      const [rows] = await mysqlPool.query(query, ids);
      return rows;
    } catch (error) {
      logger.error('Database query failed in getCategoriesByIdsDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeGetCategoriesByIdsDataAccess;
