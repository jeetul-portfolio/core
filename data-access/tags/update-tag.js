function makeUpdateTagDataAccess({ logger, mysqlPool, tableName }) {
  return async function updateTagDataAccess(input) {
    try {
      const assignments = [];
      const params = [];

      const appendAssignment = (col, value) => {
        assignments.push(`${col} = ?`);
        params.push(value);
      };

      if (Object.prototype.hasOwnProperty.call(input, 'name')) appendAssignment('name', input.name);
      if (Object.prototype.hasOwnProperty.call(input, 'slug')) appendAssignment('slug', input.slug);
      if (Object.prototype.hasOwnProperty.call(input, 'group')) appendAssignment('`group`', input.group);
      if (Object.prototype.hasOwnProperty.call(input, 'color')) appendAssignment('color', input.color);
      if (Object.prototype.hasOwnProperty.call(input, 'description')) appendAssignment('description', input.description);

      if (assignments.length === 0) {
        return false;
      }

      params.push(input.id);
      const [result] = await mysqlPool.query(
        `UPDATE ${tableName} SET ${assignments.join(', ')} WHERE id = ?`,
        params
      );

      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Database query failed in updateTagDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeUpdateTagDataAccess;
