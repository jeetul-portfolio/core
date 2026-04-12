function makeGetCategoriesDataAccess({ logger, mysqlPool, tableName }) {
  return async function getCategoriesDataAccess({ page = 1, pageSize = 100, search = '' } = {}) {
    try {
      const offset = (page - 1) * pageSize;
      const whereClauses = [];
      const params = [];

      if (search) {
        whereClauses.push('(name LIKE ? OR description LIKE ?)');
        params.push(`%${search}%`, `%${search}%`);
      }

      const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      const query = `
        SELECT
          id,
          name,
          description,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM ${tableName}
        ${whereClause}
        ORDER BY sort_order ASC, name ASC
        LIMIT ? OFFSET ?
      `;

      params.push(pageSize, offset);

      const [rows] = await mysqlPool.query(query, params);
      return rows;
    } catch (error) {
      logger.error('Database query failed in getCategoriesDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeGetCategoriesDataAccess;
