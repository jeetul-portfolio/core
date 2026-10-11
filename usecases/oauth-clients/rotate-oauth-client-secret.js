// Replaces the secret; the old one stops working immediately. Returns the new secret once.
function makeRotateOAuthClientSecretUsecase({ dataAccess, crypto, hashSecret, getOAuthClientById, NotFoundError }) {
  return async function rotateOAuthClientSecretUsecase({ clientId }) {
    const clientSecret = crypto.randomUUID();
    const updated = await dataAccess.oauthClients.updateClient({ clientId, secretHash: hashSecret(clientSecret) });

    if (!updated) {
      throw new NotFoundError(`Application not found for id ${clientId}`);
    }

    const client = await getOAuthClientById({ clientId });
    return { ...client, clientSecret };
  };
}

module.exports = makeRotateOAuthClientSecretUsecase;
