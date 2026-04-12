function makeGetProfilesByIdsDataAccess({ logger, mysqlPool }) {
  return async function getProfilesByIdsDataAccess({ ids }) {
    if (!ids || ids.length === 0) return [];

    try {
      const placeholders = ids.map(() => '?').join(', ');
      const query = `
        SELECT
          id,
          full_name AS fullName
        FROM profiles
        WHERE id IN (${placeholders})
      `;

      const [rows] = await mysqlPool.query(query, ids);
      return rows;
    } catch (error) {
      logger.error('Database query failed in getProfilesByIdsDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeGetProfilesByIdsDataAccess;
