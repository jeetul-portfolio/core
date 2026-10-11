// Token endpoint: authenticates the client, then dispatches on grant_type.
function makeCreateTokenUsecase({ authenticateClient, exchangeAuthorizationCode, refreshAccessToken, OAuthError }) {
  return async function createTokenUsecase(params = {}) {
    await authenticateClient(params);

    if (params.grant_type === 'authorization_code') {
      return exchangeAuthorizationCode(params);
    }
    if (params.grant_type === 'refresh_token') {
      return refreshAccessToken(params);
    }
    throw new OAuthError('unsupported_grant_type', 'grant_type must be authorization_code or refresh_token');
  };
}

module.exports = makeCreateTokenUsecase;
