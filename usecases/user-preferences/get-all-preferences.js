const { presentPreference } = require('./preference-presenter');

function makeGetAllPreferencesUsecase({ dataAccess }) {
  return async function getAllPreferencesUsecase({ userId }) {
    const rows = await dataAccess.userPreferences.getAllPreferences({ userId });
    return rows.map(presentPreference);
  };
}

module.exports = makeGetAllPreferencesUsecase;
