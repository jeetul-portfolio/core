const makeGetPreferenceController = require('./get-preference');
const makeGetAllPreferencesController = require('./get-all-preferences');
const makeUpsertPreferenceController = require('./upsert-preference');
const Joi = require('joi');
const { ValidationError } = require('../../exceptions');
const { ForbiddenError } = require('../../exceptions');

module.exports = function buildUserPreferencesController(dependencies) {
  const controllerDependencies = {
    ...dependencies,
    Joi,
    ValidationError,
    ForbiddenError,
  };

  return {
    getPreference: makeGetPreferenceController(controllerDependencies),
    getAllPreferences: makeGetAllPreferencesController(controllerDependencies),
    upsertPreference: makeUpsertPreferenceController(controllerDependencies),
  };
};
