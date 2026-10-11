function makeRefreshAccessTokenUsecase({ dataAccess, settings, nowSec, sha256, issueTokens, OAuthError }) {
  return async function refreshAccessTokenUsecase(params) {
    if (!params.refresh_token || !params.client_id) {
      throw new OAuthError('invalid_request', 'refresh_token and client_id are required');
    }
    if (params.resource !== undefined && params.resource !== settings.resourceUri) {
      throw new OAuthError('invalid_target', 'resource mismatch');
    }

    const invalidGrant = () => new OAuthError('invalid_grant', 'Invalid refresh token');
    const tokenHash = sha256(params.refresh_token);

    const row = await dataAccess.oauthRefreshTokens.findRefreshToken({ tokenHash });
    if (!row || row.clientId !== params.client_id) {
      throw invalidGrant();
    }
    if (row.revokedAt) {
      // A rotated token being replayed means it leaked: revoke the whole family.
      await dataAccess.oauthRefreshTokens.revokeRefreshFamily({ familyId: row.familyId });
      throw invalidGrant();
    }
    if (Number(row.expiresAt) <= nowSec()) {
      throw invalidGrant();
    }

    const next = await issueTokens({
      userId: row.userId,
      clientId: row.clientId,
      scope: row.scope,
      resource: row.resource,
      familyId: row.familyId,
    });

    const rotated = await dataAccess.oauthRefreshTokens.revokeRefreshToken({
      tokenHash,
      replacedByHash: sha256(next.refresh_token),
    });
    if (!rotated) {
      await dataAccess.oauthRefreshTokens.revokeRefreshFamily({ familyId: row.familyId });
      throw invalidGrant();
    }

    return next;
  };
}

module.exports = makeRefreshAccessTokenUsecase;
