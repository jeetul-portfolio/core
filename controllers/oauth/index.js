const makeRequireOAuthEnabledController = require('./require-oauth-enabled');
const makeGetOAuthMetadataController = require('./get-oauth-metadata');
const makeGetJwksController = require('./get-jwks');
const makeShowAuthorizeFormController = require('./show-authorize-form');
const makeSubmitAuthorizeFormController = require('./submit-authorize-form');
const makeCreateTokenController = require('./create-token');
const Joi = require('joi');
const { OAuthError } = require('../../exceptions');

module.exports = function buildOAuthController(dependencies) {
  const controllerDependencies = {
    ...dependencies,
    Joi,
    OAuthError,
  };

  return {
    requireEnabled: makeRequireOAuthEnabledController(controllerDependencies),
    getOAuthMetadata: makeGetOAuthMetadataController(controllerDependencies),
    getJwks: makeGetJwksController(controllerDependencies),
    showAuthorizeForm: makeShowAuthorizeFormController(controllerDependencies),
    submitAuthorizeForm: makeSubmitAuthorizeFormController(controllerDependencies),
    createToken: makeCreateTokenController(controllerDependencies),
  };
};
