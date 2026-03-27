const crypto = require('crypto');
const { AuthenticationError, ForbiddenError } = require('../../exceptions');

module.exports = function buildAuthUsecase({ dataAccess, config, jwt, bcrypt }) {
  const authConfig = config.auth;

  return {
    login,
    refresh,
    logout,
    me,
  };

  async function login({ email, password, ipAddress, userAgent }) {
    const user = await dataAccess.auth.findUserByEmail({ email });

    if (!user || !user.passwordHash) {
      throw new AuthenticationError('Invalid credentials');
    }

    if (!user.isActive) {
      throw new ForbiddenError('User account is disabled');
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new AuthenticationError('Invalid credentials');
    }

    const roles = await dataAccess.auth.getUserRoles({ userId: user.id });

    const accessToken = signAccessToken({ userId: user.id, roles });
    const refreshToken = createRefreshTokenValue();
    const refreshTokenHash = hashToken(refreshToken);
    const refreshTokenExpiresAt = new Date(Date.now() + authConfig.refreshTokenTtlDays * 24 * 60 * 60 * 1000);

    await dataAccess.auth.createRefreshToken({
      userId: user.id,
      tokenHash: refreshTokenHash,
      tokenFamilyId: crypto.randomUUID(),
      expiresAt: refreshTokenExpiresAt,
      ipAddress,
      userAgent,
    });

    await dataAccess.auth.updateUserLoginMeta({ userId: user.id });

    return {
      accessToken,
      accessTokenExpiresIn: authConfig.accessTokenExpiresIn,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        roles,
      },
    };
  }

  async function refresh({ refreshToken, ipAddress, userAgent }) {
    if (!refreshToken) {
      throw new AuthenticationError('Refresh token is required');
    }

    const refreshTokenHash = hashToken(refreshToken);
    const tokenRecord = await dataAccess.auth.findRefreshTokenByHash({ tokenHash: refreshTokenHash });

    if (!tokenRecord) {
      throw new AuthenticationError('Invalid refresh token');
    }

    if (tokenRecord.revokedAt) {
      throw new AuthenticationError('Refresh token has been revoked');
    }

    if (new Date(tokenRecord.expiresAt).getTime() <= Date.now()) {
      throw new AuthenticationError('Refresh token has expired');
    }

    const user = await dataAccess.auth.findUserById({ id: tokenRecord.userId });
    if (!user || !user.isActive) {
      throw new AuthenticationError('User is not allowed');
    }

    const roles = await dataAccess.auth.getUserRoles({ userId: user.id });

    const newAccessToken = signAccessToken({ userId: user.id, roles });
    const newRefreshToken = createRefreshTokenValue();
    const newRefreshTokenHash = hashToken(newRefreshToken);

    await dataAccess.auth.revokeRefreshTokenByHash({
      tokenHash: refreshTokenHash,
      reason: 'rotated',
      replacedByTokenHash: newRefreshTokenHash,
    });

    const refreshTokenExpiresAt = new Date(Date.now() + authConfig.refreshTokenTtlDays * 24 * 60 * 60 * 1000);

    await dataAccess.auth.createRefreshToken({
      userId: user.id,
      tokenHash: newRefreshTokenHash,
      tokenFamilyId: tokenRecord.tokenFamilyId,
      expiresAt: refreshTokenExpiresAt,
      ipAddress,
      userAgent,
    });

    return {
      accessToken: newAccessToken,
      accessTokenExpiresIn: authConfig.accessTokenExpiresIn,
      refreshToken: newRefreshToken,
    };
  }

  async function logout({ refreshToken }) {
    if (!refreshToken) {
      return { loggedOut: true };
    }

    const refreshTokenHash = hashToken(refreshToken);
    await dataAccess.auth.revokeRefreshTokenByHash({
      tokenHash: refreshTokenHash,
      reason: 'logout',
    });

    return { loggedOut: true };
  }

  async function me({ userId }) {
    const user = await dataAccess.auth.findUserById({ id: userId });

    if (!user || !user.isActive) {
      throw new AuthenticationError('User not found or inactive');
    }

    const roles = await dataAccess.auth.getUserRoles({ userId: user.id });

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roles,
    };
  }

  function signAccessToken({ userId, roles }) {
    return jwt.sign(
      {
        sub: String(userId),
        roles,
      },
      authConfig.accessTokenSecret,
      {
        expiresIn: authConfig.accessTokenExpiresIn,
        issuer: authConfig.issuer,
      }
    );
  }

  function createRefreshTokenValue() {
    return crypto.randomBytes(64).toString('hex');
  }

  function hashToken(value) {
    return crypto.createHash('sha256').update(String(value)).digest('hex');
  }
};
