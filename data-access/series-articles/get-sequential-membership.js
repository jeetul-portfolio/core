/** The (at most one) series in which the article has a part number. */
function makeGetSequentialMembership({ runQuery }) {
  return async function getSequentialMembership({ articleId, db }) {
    const rows = await runQuery('getSequentialMembership', `
      SELECT series_id AS seriesId, article_id AS articleId, part_number AS partNumber
      FROM series_articles
      WHERE sequential_article_id = ?
      FOR UPDATE
    `, [articleId], db);
    return rows[0] || null;
  };
}

module.exports = makeGetSequentialMembership;
