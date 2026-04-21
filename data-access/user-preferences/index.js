const makeGetPreferenceDataAccess = require('./get-preference');
const makeGetAllPreferencesDataAccess = require('./get-all-preferences');
const makeUpsertPreferenceDataAccess = require('./upsert-preference');

const TABLE_NAME = 'user_preferences';

module.exports = function buildUserPreferencesDataAccess(dependencies) {
  const deps = { ...dependencies, tableName: TABLE_NAME };

  return {
    getPreference: makeGetPreferenceDataAccess(deps),
    getAllPreferences: makeGetAllPreferencesDataAccess(deps),
    upsertPreference: makeUpsertPreferenceDataAccess(deps),
  };
};
