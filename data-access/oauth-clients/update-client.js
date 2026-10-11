function makeUpdateClientDataAccess({ logger, mysqlPool, tableName }) {
  return async function updateClientDataAccess(payload) {
    try {
      const assignments = [];
      const values = [];

      if (Object.prototype.hasOwnProperty.call(payload, 'clientName')) {
        assignments.push('client_name = ?');
        values.push(payload.clientName);
      }
      if (Object.prototype.hasOwnProperty.call(payload, 'redirectUris')) {
        assignments.push('redirect_uris = ?');
        values.push(JSON.stringify(payload.redirectUris));
      }
      if (Object.prototype.hasOwnProperty.call(payload, 'isActive')) {
        assignments.push('is_active = ?');
        values.push(payload.isActive ? 1 : 0);
      }
      if (Object.prototype.hasOwnProperty.call(payload, 'secretHash')) {
        assignments.push('client_secret_hash = ?');
        values.push(payload.secretHash);
      }

      if (assignments.length === 0) {
        return false;
      }

      values.push(payload.clientId);
      const query = `
        UPDATE ${tableName}
        SET ${assignments.join(', ')}
        WHERE client_id = ?
      `;

      const [result] = await mysqlPool.query(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Database query failed in updateClientDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeUpdateClientDataAccess;
