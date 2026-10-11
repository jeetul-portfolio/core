function makeUpdateOAuthClientUsecase({ dataAccess, getOAuthClientById, NotFoundError, ValidationError }) {
  return async function updateOAuthClientUsecase(input) {
    const existing = await dataAccess.oauthClients.getClientById({ clientId: input.clientId });
    if (!existing) {
      throw new NotFoundError(`Application not found for id ${input.clientId}`);
    }

    const payload = { clientId: input.clientId };

    if (Object.prototype.hasOwnProperty.call(input, 'clientName')) {
      const name = String(input.clientName).trim();
      const sameName = await dataAccess.oauthClients.findClientByName({ clientName: name });
      if (sameName && sameName.clientId !== input.clientId) {
        throw new ValidationError('An application with this name already exists');
      }
      payload.clientName = name;
    }
    if (Object.prototype.hasOwnProperty.call(input, 'redirectUris')) {
      payload.redirectUris = input.redirectUris;
    }
    if (Object.prototype.hasOwnProperty.call(input, 'isActive')) {
      payload.isActive = input.isActive;
    }

    await dataAccess.oauthClients.updateClient(payload);
    return getOAuthClientById({ clientId: input.clientId });
  };
}

module.exports = makeUpdateOAuthClientUsecase;
