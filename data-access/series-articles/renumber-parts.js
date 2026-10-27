/**
 * Gives articleIds[i] part i + 1. Unique keys are checked per row, so the parts are cleared
 * first and then reassigned; the caller's transaction keeps the gap invisible.
 */
function makeRenumberParts({ runQuery }) {
  return async function renumberParts({ seriesId, articleIds, db }) {
    if (articleIds.length === 0) return;
    const inList = articleIds.map(() => '?').join(', ');
    await runQuery('renumberParts.clear', `
      UPDATE series_articles SET part_number = NULL WHERE series_id = ? AND article_id IN (${inList})
    `, [seriesId, ...articleIds], db);
    await runQuery('renumberParts.assign', `
      UPDATE series_articles
      SET part_number = CASE article_id ${articleIds.map(() => 'WHEN ? THEN ?').join(' ')} END
      WHERE series_id = ? AND article_id IN (${inList})
    `, [...articleIds.flatMap((id, index) => [id, index + 1]), seriesId, ...articleIds], db);
  };
}

module.exports = makeRenumberParts;
