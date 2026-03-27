function makeUpdateUserDataAccess({ logger, mysqlPool }) {
  return async function updateUserDataAccess(payload) {
    const { id, email, fullName, isActive } = payload;

    try {
      const assignments = [];
      const values = [];

      if (Object.prototype.hasOwnProperty.call(payload, 'email')) {
        assignments.push('email = ?');
        values.push(email);
      }

      if (Object.prototype.hasOwnProperty.call(payload, 'fullName')) {
        assignments.push('full_name = ?');
        values.push(fullName || null);
      }

      if (Object.prototype.hasOwnProperty.call(payload, 'isActive')) {
        assignments.push('is_active = ?');
        values.push(isActive ? 1 : 0);
      }

      if (assignments.length === 0) {
        return { affectedRows: 0 };
      }

      assignments.push('updated_at = NOW()');
      values.push(id);

      const [result] = await mysqlPool.query(
        `
          UPDATE users
          SET ${assignments.join(', ')}
          WHERE id = ?
        `,
        values
      );

      return { affectedRows: result.affectedRows };
    } catch (error) {
      logger.error('Database query failed in updateUserDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeUpdateUserDataAccess;
