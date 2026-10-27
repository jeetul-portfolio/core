const toDomainError = require('./to-domain-error');

/** Runs a query on `db` (a pooled connection inside a transaction, else the pool). */
function makeRunQuery({ logger, mysqlPool }) {
  return async function runQuery(operation, query, params, db = mysqlPool) {
    try {
      const [result] = await db.query(query, params);
      return result;
    } catch (error) {
      const domainError = toDomainError(error);
      if (domainError) throw domainError;
      logger.error(`Database query failed in seriesArticles.${operation}:`, error.message);
      throw error;
    }
  };
}

module.exports = makeRunQuery;
