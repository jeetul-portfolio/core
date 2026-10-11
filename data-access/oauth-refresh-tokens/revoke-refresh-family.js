function makeRevokeRefreshFamilyDataAccess({ logger, mysqlPool, tableName }) {
  return async function revokeRefreshFamilyDataAccess({ familyId }) {
    try {
      const query = `
        UPDATE ${tableName}
        SET revoked_at = UTC_TIMESTAMP()
        WHERE family_id = ? AND revoked_at IS NULL
      `;

      await mysqlPool.query(query, [familyId]);
    } catch (error) {
      logger.error('Database query failed in revokeRefreshFamilyDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeRevokeRefreshFamilyDataAccess;
