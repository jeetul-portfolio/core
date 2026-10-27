const toDomainError = require('./to-domain-error');

/** Runs work(connection) in a transaction; commits on success, rolls back on any error. */
function makeWithTransaction({ mysqlPool }) {
  return async function withTransaction(work) {
    const connection = await mysqlPool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await work(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw toDomainError(error) || error;
    } finally {
      connection.release();
    }
  };
}

module.exports = makeWithTransaction;
