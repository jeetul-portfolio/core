const { ConflictError } = require('../../exceptions');

function makeCreateCategoryDataAccess({ logger, mysqlPool, tableName }) {
  return async function createCategoryDataAccess({ name, slug, description, sortOrder }) {
    try {
      const query = `
        INSERT INTO ${tableName}
          (name, slug, description, sort_order, created_at, updated_at)
        VALUES
          (?, ?, ?, ?, NOW(), NOW())
      `;

      const [result] = await mysqlPool.query(query, [
        name,
        slug,
        description || null,
        sortOrder || 0,
      ]);

      return { id: result.insertId };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictError('A category with this name or slug already exists');
      }
      logger.error('Database query failed in createCategoryDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeCreateCategoryDataAccess;
