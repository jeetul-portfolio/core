/** Series an article belongs to, sequential membership first. */
function makeListForArticle({ runQuery }) {
  return async function listForArticle({ articleId, publishedOnly = false }) {
    const statusClause = publishedOnly ? " AND s.status = 'published'" : '';
    return runQuery('listForArticle', `
      SELECT
        s.id,
        s.slug,
        s.title,
        s.status,
        sa.part_number AS partNumber
      FROM series_articles sa
      JOIN series s ON s.id = sa.series_id
      WHERE sa.article_id = ?${statusClause}
      ORDER BY sa.part_number IS NULL, s.sort_order ASC, s.title ASC
    `, [articleId]);
  };
}

module.exports = makeListForArticle;
