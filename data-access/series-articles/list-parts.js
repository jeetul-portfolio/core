/** Sequential parts of a series (all statuses), locked for a reorder. */
function makeListParts({ runQuery }) {
  return async function listParts({ seriesId, db }) {
    return runQuery('listParts', `
      SELECT article_id AS articleId, part_number AS partNumber
      FROM series_articles
      WHERE series_id = ? AND part_number IS NOT NULL
      ORDER BY part_number ASC
      FOR UPDATE
    `, [seriesId], db);
  };
}

module.exports = makeListParts;
