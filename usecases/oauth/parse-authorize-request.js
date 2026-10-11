function makeParseAuthorizeRequestUsecase({ dataAccess, settings, SCOPE, OAuthError }) {
  return async function parseAuthorizeRequestUsecase(params = {}) {
    const client = params.client_id
      ? await dataAccess.oauthClients.findClient({ clientId: String(params.client_id) })
      : null;

    if (!client || !client.isActive) {
      throw new OAuthError('invalid_request', 'Unknown client');
    }
    if (!params.redirect_uri || !client.redirectUris.includes(String(params.redirect_uri))) {
      throw new OAuthError('invalid_request', 'redirect_uri is not registered for this client');
    }
    if (params.response_type !== 'code') {
      throw new OAuthError('invalid_request', 'response_type must be code');
    }
    if (params.code_challenge_method !== 'S256' || !/^[A-Za-z0-9_-]{43}$/.test(String(params.code_challenge || ''))) {
      throw new OAuthError('invalid_request', 'PKCE with code_challenge_method=S256 is required');
    }
    if (params.resource !== settings.resourceUri) {
      throw new OAuthError('invalid_target', 'resource must be the MCP server resource URI');
    }

    const scope = params.scope ? String(params.scope) : SCOPE;
    if (scope.split(/\s+/).some((item) => item !== SCOPE)) {
      throw new OAuthError('invalid_scope', `only ${SCOPE} is supported`);
    }

    return {
      client,
      clientId: client.clientId,
      redirectUri: String(params.redirect_uri),
      codeChallenge: String(params.code_challenge),
      resource: settings.resourceUri,
      scope: SCOPE,
      state: params.state === undefined ? undefined : String(params.state).slice(0, 512),
    };
  };
}

module.exports = makeParseAuthorizeRequestUsecase;
