function makeUpdateSkillDataAccess({ logger, mysqlPool, tableName }) {
  return async function updateSkillDataAccess(payload) {
    try {
      const assignments = [];
      const values = [];

      appendAssignment(payload, 'name', 'name', assignments, values);
      appendAssignment(payload, 'level', 'level', assignments, values);
      appendAssignment(payload, 'notes', 'notes', assignments, values);
      appendAssignment(payload, 'sortOrder', 'sort_order', assignments, values);

      if (assignments.length === 0) {
        return false;
      }

      assignments.push('updated_at = NOW()');
      values.push(payload.id);

      const query = `
        UPDATE ${tableName}
        SET ${assignments.join(', ')}
        WHERE id = ?
      `;

      const [result] = await mysqlPool.query(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Database query failed in updateSkillDataAccess:', error.message);
      throw error;
    }
  };
}

function appendAssignment(payload, inputField, dbField, assignments, values) {
  if (!Object.prototype.hasOwnProperty.call(payload, inputField)) {
    return;
  }
  assignments.push(`${dbField} = ?`);
  values.push(payload[inputField]);
}

module.exports = makeUpdateSkillDataAccess;
