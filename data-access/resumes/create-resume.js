function makeCreateResumeDataAccess({ logger, mysqlPool, tableName }) {
  return async function createResumeDataAccess({ filename, fileUrl }) {
    try {
      const insertQuery = `
        INSERT INTO ${tableName} (filename, file_url)
        VALUES (?, ?)
      `;

      const [result] = await mysqlPool.query(insertQuery, [filename, fileUrl]);

      const selectQuery = `
        SELECT
          id,
          filename,
          file_url AS fileUrl,
          is_active AS isActive,
          uploaded_at AS uploadedAt
        FROM ${tableName}
        WHERE id = ?
        LIMIT 1
      `;

      const [rows] = await mysqlPool.query(selectQuery, [result.insertId]);
      return rows[0];
    } catch (error) {
      logger.error('Database query failed in createResumeDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeCreateResumeDataAccess;
