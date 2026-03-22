
function makeGetSampleDataDataAccess({ config, logger, mysqlPool }) {
  return async function getSampleDataDataAccess() {
    try {
      const [rows] = await mysqlPool.query('SELECT * FROM sample');
      return rows;
    } catch (error) {
      logger.error('Database query failed in getSampleDataDataAccess:', error.message);
      throw error;
    }
  }
}

module.exports = makeGetSampleDataDataAccess;
