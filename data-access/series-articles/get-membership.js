function makeGetMembership({ runQuery }) {
  return async function getMembership({ seriesId, articleId, db }) {
    const rows = await runQuery('getMembership', `
      SELECT series_id AS seriesId, article_id AS articleId, part_number AS partNumber
      FROM series_articles
      WHERE series_id = ? AND article_id = ?
      FOR UPDATE
    `, [seriesId, articleId], db);
    return rows[0] || null;
  };
}

module.exports = makeGetMembership;
