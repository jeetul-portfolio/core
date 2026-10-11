function makeExchangeAuthorizationCodeUsecase({
  dataAccess,
  crypto,
  settings,
  nowSec,
  sha256,
  safeEqual,
  issueTokens,
  OAuthError,
}) {
  return async function exchangeAuthorizationCodeUsecase(params) {
    if (!params.code || !params.code_verifier || !params.client_id || !params.redirect_uri) {
      throw new OAuthError('invalid_request', 'code, code_verifier, client_id and redirect_uri are required');
    }
    if (params.resource !== settings.resourceUri) {
      throw new OAuthError('invalid_target', 'resource must be the MCP server resource URI');
    }

    const invalidGrant = () => new OAuthError('invalid_grant', 'Invalid or expired authorization code');

    const row = await dataAccess.oauthAuthorizationCodes.consumeAuthorizationCode({ codeHash: sha256(params.code) });
    if (!row || Number(row.expiresAt) <= nowSec()) {
      throw invalidGrant();
    }

    const verifier = String(params.code_verifier);
    const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
    const verifierOk = /^[A-Za-z0-9._~-]{43,128}$/.test(verifier) && safeEqual(challenge, row.codeChallenge);
    const bindingOk = row.clientId === params.client_id
      && row.redirectUri === params.redirect_uri
      && row.resource === params.resource;

    if (!verifierOk || !bindingOk) {
      throw invalidGrant();
    }

    return issueTokens({
      userId: row.userId,
      clientId: row.clientId,
      scope: row.scope,
      resource: row.resource,
      familyId: crypto.randomUUID(),
    });
  };
}

module.exports = makeExchangeAuthorizationCodeUsecase;
