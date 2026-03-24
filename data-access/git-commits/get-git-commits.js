function makeGetGitCommitsDataAccess({ logger, mysqlPool, tableName, fields }) {
  return async function getGitCommitsDataAccess({
    projectId,
    projectIds,
    fieldsToSelect,
    sortBy = 'committedAt',
    sortOrder = 'desc',
  } = {}) {
    try {
      const sortableFields = ['committedAt', 'updatedAt', 'createdAt', 'id', 'positionRank'];
      const normalizedSortBy = sortableFields.includes(sortBy) ? sortBy : 'committedAt';
      const normalizedSortOrder = String(sortOrder).toLowerCase() === 'asc' ? 'ASC' : 'DESC';
      const selectFields = fieldsToSelect ? fieldsToSelect.join(', ') : fields.join(', ');
      const whereClauses = [];
      const params = [];

      if (projectId) {
        whereClauses.push('projectId = ?');
        params.push(projectId);
      } else if (Array.isArray(projectIds) && projectIds.length > 0) {
        const placeholders = projectIds.map(() => '?').join(', ');
        whereClauses.push(`projectId IN (${placeholders})`);
        params.push(...projectIds);
      }

      const whereClause = whereClauses.length > 0 ? ` WHERE ${whereClauses.join(' AND ')}` : '';
      const query = `SELECT ${selectFields} FROM ${tableName}${whereClause} ORDER BY ${normalizedSortBy} ${normalizedSortOrder}`;

      const [rows] = await mysqlPool.query(query, params);
      return rows;
    } catch (error) {
      logger.error('Database query failed in getGitCommitsDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeGetGitCommitsDataAccess;