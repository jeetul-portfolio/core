function makeGetOAuthMetadataUsecase({ issuer, SCOPE }) {
  return function getOAuthMetadataUsecase() {
    return {
      issuer,
      authorization_endpoint: `${issuer}/oauth/authorize`,
      token_endpoint: `${issuer}/oauth/token`,
      jwks_uri: `${issuer}/oauth/jwks`,
      response_types_supported: ['code'],
      grant_types_supported: ['authorization_code', 'refresh_token'],
      code_challenge_methods_supported: ['S256'],
      token_endpoint_auth_methods_supported: ['client_secret_basic', 'client_secret_post'],
      scopes_supported: [SCOPE],
    };
  };
}

module.exports = makeGetOAuthMetadataUsecase;
