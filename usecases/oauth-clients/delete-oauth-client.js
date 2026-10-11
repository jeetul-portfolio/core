function makeDeleteOAuthClientUsecase({ dataAccess, NotFoundError }) {
  return async function deleteOAuthClientUsecase({ clientId }) {
    const deleted = await dataAccess.oauthClients.deleteClient({ clientId });

    if (!deleted) {
      throw new NotFoundError(`Application not found for id ${clientId}`);
    }

    return { clientId, deleted: true };
  };
}

module.exports = makeDeleteOAuthClientUsecase;
