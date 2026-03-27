function makeCreateUserDataAccess({ logger, mysqlPool }) {
  return async function createUserDataAccess({ email, passwordHash, fullName }) {
    try {
      const [insertResult] = await mysqlPool.query(
        `
          INSERT INTO users
            (email, password_hash, full_name, is_active, created_at, updated_at)
          VALUES
            (?, ?, ?, 1, NOW(), NOW())
        `,
        [email, passwordHash, fullName || null]
      );
      return { id: insertResult.insertId };
    } catch (error) {
      logger.error('Database query failed in createUserDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeCreateUserDataAccess;
