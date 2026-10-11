function makeIssueTokensUsecase({
  dataAccess,
  jwt,
  settings,
  signingKey,
  issuer,
  nowSec,
  sha256,
  randomToken,
  getAdminRoles,
  ADMIN_ROLE,
  OAuthError,
}) {
  return async function issueTokensUsecase({ userId, clientId, scope, resource, familyId }) {
    const roles = await getAdminRoles({ userId });
    const user = await dataAccess.users.findUserById({ id: userId });

    if (!user || !user.isActive || !roles.includes(ADMIN_ROLE)) {
      throw new OAuthError('invalid_grant', 'User is no longer authorized');
    }

    const accessToken = jwt.sign({ scope, roles, client_id: clientId }, signingKey, {
      algorithm: 'ES256',
      keyid: settings.keyId,
      issuer,
      audience: resource,
      subject: String(userId),
      expiresIn: settings.accessTokenTtlSec,
    });

    const refreshToken = randomToken();
    await dataAccess.oauthRefreshTokens.createRefreshToken({
      tokenHash: sha256(refreshToken),
      familyId,
      clientId,
      userId,
      scope,
      resource,
      expiresAt: nowSec() + settings.refreshTokenTtlDays * 86400,
    });

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: settings.accessTokenTtlSec,
      refresh_token: refreshToken,
      scope,
    };
  };
}

module.exports = makeIssueTokensUsecase;
