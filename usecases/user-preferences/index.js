const makeGetPreferenceUsecase = require('./get-preference');
const makeGetAllPreferencesUsecase = require('./get-all-preferences');
const makeUpsertPreferenceUsecase = require('./upsert-preference');

module.exports = function buildUserPreferencesUsecase(dependencies) {
  return {
    getPreference: makeGetPreferenceUsecase(dependencies),
    getAllPreferences: makeGetAllPreferencesUsecase(dependencies),
    upsertPreference: makeUpsertPreferenceUsecase(dependencies),
  };
};
