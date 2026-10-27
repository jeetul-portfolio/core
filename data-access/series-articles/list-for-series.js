/** Articles of a series: sequential parts by part number, then plain associations newest first. */
function makeListForSeries({ runQuery }) {
  return async function listForSeries({ seriesId, publishedOnly = false }) {
    const statusClause = publishedOnly ? " AND a.status = 'published'" : '';
    return runQuery('listForSeries', `
      SELECT
        sa.part_number AS partNumber,
        a.id,
        a.title,
        a.tags,
        a.excerpt,
        a.content,
        a.status,
        a.published_at AS publishedAt,
        a.created_at AS createdAt,
        a.updated_at AS updatedAt
      FROM series_articles sa
      JOIN articles a ON a.id = sa.article_id
      WHERE sa.series_id = ?${statusClause}
      ORDER BY sa.part_number IS NULL, sa.part_number ASC, COALESCE(a.published_at, a.created_at) DESC, a.id DESC
    `, [seriesId]);
  };
}

module.exports = makeListForSeries;
