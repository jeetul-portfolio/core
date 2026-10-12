const { ConflictError } = require('../../exceptions');

/** Runs a query, mapping unique-key violations to ConflictError and logging other failures. */
function makeRunQuery({ logger, mysqlPool, tableName }) {
  return async function runQuery(operation, query, params) {
    try {
      const [result] = await mysqlPool.query(query, params);
      return result;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictError('A record with this slug already exists');
      }
      logger.error(`Database query failed in ${tableName}.${operation}:`, error.message);
      throw error;
    }
  };
}

module.exports = makeRunQuery;
