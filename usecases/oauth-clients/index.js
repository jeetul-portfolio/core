const crypto = require('crypto');
const makeGetOAuthClientsUsecase = require('./get-oauth-clients');
const makeGetOAuthClientByIdUsecase = require('./get-oauth-client-by-id');
const makeCreateOAuthClientUsecase = require('./create-oauth-client');
const makeUpdateOAuthClientUsecase = require('./update-oauth-client');
const makeRotateOAuthClientSecretUsecase = require('./rotate-oauth-client-secret');
const makeDeleteOAuthClientUsecase = require('./delete-oauth-client');
const { NotFoundError, ValidationError } = require('../../exceptions');
const { presentOAuthClient } = require('./oauth-client-presenter');
const { hashSecret } = require('../../utils/client-secret');

module.exports = function buildOAuthClientsUsecase(dependencies) {
  const baseDependencies = {
    ...dependencies,
    crypto,
    hashSecret,
    presentOAuthClient,
    NotFoundError,
    ValidationError,
  };

  const getOAuthClientById = makeGetOAuthClientByIdUsecase(baseDependencies);

  const usecaseDependencies = {
    ...baseDependencies,
    getOAuthClientById,
  };

  return {
    getOAuthClients: makeGetOAuthClientsUsecase(usecaseDependencies),
    getOAuthClientById,
    createOAuthClient: makeCreateOAuthClientUsecase(usecaseDependencies),
    updateOAuthClient: makeUpdateOAuthClientUsecase(usecaseDependencies),
    rotateOAuthClientSecret: makeRotateOAuthClientSecretUsecase(usecaseDependencies),
    deleteOAuthClient: makeDeleteOAuthClientUsecase(usecaseDependencies),
  };
};
