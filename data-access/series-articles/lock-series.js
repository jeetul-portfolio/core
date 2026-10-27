/** Locks the series row; every part change in a series serialises on it. */
function makeLockSeries({ runQuery }) {
  return async function lockSeries({ seriesId, db }) {
    const rows = await runQuery('lockSeries', 'SELECT id FROM series WHERE id = ? FOR UPDATE', [seriesId], db);
    return rows.length > 0;
  };
}

module.exports = makeLockSeries;
