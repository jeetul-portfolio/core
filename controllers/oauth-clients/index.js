const makeGetOAuthClientsController = require('./get-oauth-clients');
const makeGetOAuthClientByIdController = require('./get-oauth-client-by-id');
const makeCreateOAuthClientController = require('./create-oauth-client');
const makeUpdateOAuthClientController = require('./update-oauth-client');
const makeRotateOAuthClientSecretController = require('./rotate-oauth-client-secret');
const makeDeleteOAuthClientController = require('./delete-oauth-client');
const Joi = require('joi');
const { ValidationError } = require('../../exceptions');
const { isValidRedirectUri } = require('../../utils/validate-redirect-uri');

const MAX_REDIRECT_URIS = 20;

module.exports = function buildOAuthClientsController(dependencies) {
  const redirectUrisSchema = Joi.array()
    .items(
      Joi.string().trim().max(2048).custom((value, helpers) => (
        isValidRedirectUri(value) ? value : helpers.message(
          `"${value}" must be an https URL (http only for localhost/127.0.0.1) without fragment or wildcard`
        )
      ))
    )
    .min(1)
    .max(MAX_REDIRECT_URIS)
    .unique();

  const controllerDependencies = {
    ...dependencies,
    Joi,
    ValidationError,
    redirectUrisSchema,
  };

  return {
    getOAuthClients: makeGetOAuthClientsController(controllerDependencies),
    getOAuthClientById: makeGetOAuthClientByIdController(controllerDependencies),
    createOAuthClient: makeCreateOAuthClientController(controllerDependencies),
    updateOAuthClient: makeUpdateOAuthClientController(controllerDependencies),
    rotateOAuthClientSecret: makeRotateOAuthClientSecretController(controllerDependencies),
    deleteOAuthClient: makeDeleteOAuthClientController(controllerDependencies),
  };
};
