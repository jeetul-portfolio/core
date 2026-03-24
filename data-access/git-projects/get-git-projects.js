function makeGetGitProjectsDataAccess({ logger, mysqlPool, tableName, fields }) {
  return async function getGitProjectsDataAccess({
    onlyActive = false,
    projectKeys = [],
    sortBy = 'updatedAt',
    sortOrder = 'desc',
  } = {}) {
    try {
      const sortableFields = ['updatedAt', 'createdAt', 'lastSyncedAt', 'displayName', 'projectKey'];
      const normalizedSortBy = sortableFields.includes(sortBy) ? sortBy : 'updatedAt';
      const normalizedSortOrder = String(sortOrder).toLowerCase() === 'asc' ? 'ASC' : 'DESC';
      const selectFields = fields.join(', ');
      const whereClauses = [];
      const params = [];

      if (onlyActive) {
        whereClauses.push('isActive = 1');
      }

      if (Array.isArray(projectKeys) && projectKeys.length > 0) {
        const placeholders = projectKeys.map(() => '?').join(', ');
        whereClauses.push(`projectKey IN (${placeholders})`);
        params.push(...projectKeys);
      }

      const whereClause = whereClauses.length > 0 ? ` WHERE ${whereClauses.join(' AND ')}` : '';
      const query = `SELECT ${selectFields} FROM ${tableName}${whereClause} ORDER BY ${normalizedSortBy} ${normalizedSortOrder}`;

      const [rows] = await mysqlPool.query(query, params);
      return rows;
    } catch (error) {
      logger.error('Database query failed in getGitProjectsDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeGetGitProjectsDataAccess;