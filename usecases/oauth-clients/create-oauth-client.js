// Returns the plaintext secret exactly once; only its hash is stored.
function makeCreateOAuthClientUsecase({ dataAccess, crypto, hashSecret, getOAuthClientById, ValidationError }) {
  return async function createOAuthClientUsecase({ clientName, redirectUris, isActive = true }) {
    const name = String(clientName).trim();

    const existing = await dataAccess.oauthClients.findClientByName({ clientName: name });
    if (existing) {
      throw new ValidationError('An application with this name already exists');
    }

    const clientId = crypto.randomUUID();
    const clientSecret = crypto.randomUUID();

    await dataAccess.oauthClients.createClient({
      clientId,
      clientName: name,
      secretHash: hashSecret(clientSecret),
      redirectUris,
      isActive,
    });

    const client = await getOAuthClientById({ clientId });
    return { ...client, clientSecret };
  };
}

module.exports = makeCreateOAuthClientUsecase;
