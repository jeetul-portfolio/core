function makeGetTagByIdDataAccess({ logger, mysqlPool, tableName }) {
  return async function getTagByIdDataAccess({ id }) {
    try {
      const query = `
        SELECT
          t.id,
          t.name,
          t.slug,
          t.\`group\`,
          t.color,
          t.description,
          t.created_at AS createdAt,
          t.updated_at AS updatedAt,
          COUNT(tr.id) AS usageCount
        FROM ${tableName} t
        LEFT JOIN tag_references tr ON t.id = tr.tag_id
        WHERE t.id = ?
        GROUP BY t.id
      `;

      const [rows] = await mysqlPool.query(query, [id]);
      return rows[0] || null;
    } catch (error) {
      logger.error('Database query failed in getTagByIdDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeGetTagByIdDataAccess;
