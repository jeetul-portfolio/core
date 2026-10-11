const { hashSecret, verifySecret } = require('../../utils/client-secret');

// Verified when the client is unknown so timing does not reveal valid client ids.
const DUMMY_SECRET_HASH = hashSecret('unknown-client-placeholder');

// Confidential-client authentication: the secret is checked against the stored scrypt hash.
function makeAuthenticateClientUsecase({ dataAccess, OAuthError }) {
  return async function authenticateClientUsecase(params) {
    const client = params.client_id
      ? await dataAccess.oauthClients.findClient({ clientId: String(params.client_id) })
      : null;

    const secretMatches = verifySecret(params.client_secret, client?.secretHash || DUMMY_SECRET_HASH);
    if (!client || !client.isActive || !secretMatches) {
      throw new OAuthError('invalid_client', 'Client authentication failed', 401);
    }

    return client;
  };
}

module.exports = makeAuthenticateClientUsecase;
