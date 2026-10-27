/**
 * Plain INSERT on purpose: ON DUPLICATE KEY UPDATE would also fire on the part-number and
 * sequential-article unique keys and silently no-op instead of reporting the conflict.
 */
function makeInsertMembership({ runQuery }) {
  return async function insertMembership({ seriesId, articleId, partNumber, db }) {
    await runQuery('insertMembership', `
      INSERT INTO series_articles (series_id, article_id, part_number) VALUES (?, ?, ?)
    `, [seriesId, articleId, partNumber], db);
  };
}

module.exports = makeInsertMembership;
