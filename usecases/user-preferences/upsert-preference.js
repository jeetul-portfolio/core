const { presentPreference } = require('./preference-presenter');

function makeUpsertPreferenceUsecase({ dataAccess }) {
  return async function upsertPreferenceUsecase({ userId, type, meta }) {
    // Fetch existing meta and deep-merge so we don't lose unrelated preference keys
    const existing = await dataAccess.userPreferences.getPreference({ userId, type });
    let existingMeta = {};
    if (existing?.meta) {
      try {
        existingMeta = typeof existing.meta === 'string' ? JSON.parse(existing.meta) : existing.meta;
      } catch {
        existingMeta = {};
      }
    }

    const mergedMeta = { ...existingMeta, ...meta };

    const row = await dataAccess.userPreferences.upsertPreference({
      userId,
      type,
      meta: JSON.stringify(mergedMeta),
    });

    return presentPreference(row);
  };
}

module.exports = makeUpsertPreferenceUsecase;
