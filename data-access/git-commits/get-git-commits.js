function makeGetGitCommitsDataAccess({ logger, mysqlPool, tableName, fields }) {
  return async function getGitCommitsDataAccess({
    projectId,
    projectIds,
    fieldsToSelect,
    sortBy = 'committedAt',
    sortOrder = 'desc',
    limitPerProject,
  } = {}) {
    try {
      const sortableFields = ['committedAt', 'updatedAt', 'createdAt', 'id'];
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
      const orderBy = `ORDER BY ${normalizedSortBy} ${normalizedSortOrder}`;
      let query = `SELECT ${selectFields} FROM ${tableName}${whereClause} ${orderBy}`;

      // Top-N per project (MySQL 8+ window function) so growing history isn't loaded in full.
      if (Number.isInteger(limitPerProject) && limitPerProject > 0) {
        query = `
          SELECT ${selectFields} FROM (
            SELECT ${selectFields}, ROW_NUMBER() OVER (PARTITION BY projectId ${orderBy}) AS rowNum
            FROM ${tableName}${whereClause}
          ) ranked
          WHERE rowNum <= ?
          ${orderBy}
        `;
        params.push(limitPerProject);
      }

      const [rows] = await mysqlPool.query(query, params);
      return rows;
    } catch (error) {
      logger.error('Database query failed in getGitCommitsDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeGetGitCommitsDataAccess;