function makeGetOAuthClientByIdUsecase({ dataAccess, presentOAuthClient, NotFoundError }) {
  return async function getOAuthClientByIdUsecase({ clientId }) {
    const client = await dataAccess.oauthClients.getClientById({ clientId });

    if (!client) {
      throw new NotFoundError(`Application not found for id ${clientId}`);
    }

    return presentOAuthClient(client);
  };
}

module.exports = makeGetOAuthClientByIdUsecase;
