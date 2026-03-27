module.exports = function buildAuthDataAccess({ mysqlPool, logger }) {
  return {
    findUserByEmail,
    findUserById,
    getUserRoles,
    createRefreshToken,
    findRefreshTokenByHash,
    revokeRefreshTokenByHash,
    revokeAllRefreshTokensForUser,
    updateUserLoginMeta,
  };

  async function findUserByEmail({ email }) {
    try {
      const [rows] = await mysqlPool.query(
        `
          SELECT
            id,
            email,
            password_hash AS passwordHash,
            full_name AS fullName,
            is_active AS isActive,
            failed_login_count AS failedLoginCount,
            locked_until AS lockedUntil
          FROM users
          WHERE email = ?
          LIMIT 1
        `,
        [email]
      );

      return rows[0] || null;
    } catch (error) {
      logger.error('Database query failed in findUserByEmail:', error.message);
      throw error;
    }
  }

  async function findUserById({ id }) {
    try {
      const [rows] = await mysqlPool.query(
        `
          SELECT
            id,
            email,
            full_name AS fullName,
            is_active AS isActive
          FROM users
          WHERE id = ?
          LIMIT 1
        `,
        [id]
      );

      return rows[0] || null;
    } catch (error) {
      logger.error('Database query failed in findUserById:', error.message);
      throw error;
    }
  }

  async function getUserRoles({ userId }) {
    try {
      const [rows] = await mysqlPool.query(
        `
          SELECT r.code
          FROM user_roles ur
          INNER JOIN roles r ON r.id = ur.role_id
          WHERE ur.user_id = ?
          ORDER BY r.code ASC
        `,
        [userId]
      );

      return rows.map((row) => row.code);
    } catch (error) {
      logger.error('Database query failed in getUserRoles:', error.message);
      throw error;
    }
  }

  async function createRefreshToken({
    userId,
    tokenHash,
    tokenFamilyId,
    expiresAt,
    ipAddress,
    userAgent,
  }) {
    try {
      await mysqlPool.query(
        `
          INSERT INTO refresh_tokens
            (user_id, token_hash, token_family_id, issued_at, expires_at, ip_address, user_agent, created_at)
          VALUES
            (?, ?, ?, NOW(), ?, ?, ?, NOW())
        `,
        [userId, tokenHash, tokenFamilyId, expiresAt, ipAddress || null, userAgent || null]
      );
    } catch (error) {
      logger.error('Database query failed in createRefreshToken:', error.message);
      throw error;
    }
  }

  async function findRefreshTokenByHash({ tokenHash }) {
    try {
      const [rows] = await mysqlPool.query(
        `
          SELECT
            id,
            user_id AS userId,
            token_hash AS tokenHash,
            token_family_id AS tokenFamilyId,
            expires_at AS expiresAt,
            revoked_at AS revokedAt
          FROM refresh_tokens
          WHERE token_hash = ?
          LIMIT 1
        `,
        [tokenHash]
      );

      return rows[0] || null;
    } catch (error) {
      logger.error('Database query failed in findRefreshTokenByHash:', error.message);
      throw error;
    }
  }

  async function revokeRefreshTokenByHash({ tokenHash, reason, replacedByTokenHash }) {
    try {
      const [result] = await mysqlPool.query(
        `
          UPDATE refresh_tokens
          SET
            revoked_at = NOW(),
            revoke_reason = ?,
            replaced_by_token_hash = ?
          WHERE token_hash = ? AND revoked_at IS NULL
        `,
        [reason || null, replacedByTokenHash || null, tokenHash]
      );

      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Database query failed in revokeRefreshTokenByHash:', error.message);
      throw error;
    }
  }

  async function revokeAllRefreshTokensForUser({ userId, reason }) {
    try {
      await mysqlPool.query(
        `
          UPDATE refresh_tokens
          SET revoked_at = NOW(), revoke_reason = ?
          WHERE user_id = ? AND revoked_at IS NULL
        `,
        [reason || null, userId]
      );
    } catch (error) {
      logger.error('Database query failed in revokeAllRefreshTokensForUser:', error.message);
      throw error;
    }
  }

  async function updateUserLoginMeta({ userId }) {
    try {
      await mysqlPool.query(
        `
          UPDATE users
          SET
            failed_login_count = 0,
            locked_until = NULL,
            last_login_at = NOW(),
            updated_at = NOW()
          WHERE id = ?
        `,
        [userId]
      );
    } catch (error) {
      logger.error('Database query failed in updateUserLoginMeta:', error.message);
      throw error;
    }
  }
};
