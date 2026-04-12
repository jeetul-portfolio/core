function makeGetSkillsDataAccess({ logger, mysqlPool, tableName }) {
  return async function getSkillsDataAccess({ page = 1, pageSize = 20, search = '' } = {}) {
    try {
      const offset = (page - 1) * pageSize;
      const whereClauses = [];
      const params = [];

      if (search) {
        const searchTerm = `%${search}%`;
        whereClauses.push('(name LIKE ? OR notes LIKE ?)');
        params.push(searchTerm, searchTerm);
      }

      const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

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
        ${whereClause}
        ORDER BY sort_order ASC, created_at DESC
        LIMIT ? OFFSET ?
      `;

      params.push(pageSize, offset);

      const [rows] = await mysqlPool.query(query, params);
      return rows;
    } catch (error) {
      logger.error('Database query failed in getSkillsDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeGetSkillsDataAccess;
