const { presentPreference } = require('./preference-presenter');

function makeGetPreferenceUsecase({ dataAccess }) {
  return async function getPreferenceUsecase({ userId, type }) {
    const row = await dataAccess.userPreferences.getPreference({ userId, type });

    if (!row) {
      return { type, meta: {} };
    }

    return presentPreference(row);
  };
}

module.exports = makeGetPreferenceUsecase;
