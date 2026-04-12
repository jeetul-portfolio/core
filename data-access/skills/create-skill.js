function makeCreateSkillDataAccess({ logger, mysqlPool, tableName }) {
  return async function createSkillDataAccess({ name, level, notes, sortOrder }) {
    try {
      const query = `
        INSERT INTO ${tableName}
          (name, level, notes, sort_order, created_at, updated_at)
        VALUES
          (?, ?, ?, ?, NOW(), NOW())
      `;

      const [result] = await mysqlPool.query(query, [
        name,
        level || 'Beginner',
        notes || null,
        sortOrder || 0,
      ]);

      return { id: result.insertId };
    } catch (error) {
      logger.error('Database query failed in createSkillDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeCreateSkillDataAccess;
