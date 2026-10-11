function makeGetOAuthClientsUsecase({ dataAccess, presentOAuthClient }) {
  return async function getOAuthClientsUsecase() {
    const clients = await dataAccess.oauthClients.getClients();
    return clients.map(presentOAuthClient);
  };
}

module.exports = makeGetOAuthClientsUsecase;
