function makeCountBySeriesIds({ runQuery }) {
  return async function countBySeriesIds({ seriesIds, publishedOnly = false }) {
    if (!seriesIds || seriesIds.length === 0) return [];
    const statusClause = publishedOnly ? " AND a.status = 'published'" : '';
    return runQuery('countBySeriesIds', `
      SELECT
        sa.series_id AS seriesId,
        COUNT(*) AS articleCount,
        COUNT(sa.part_number) AS partCount
      FROM series_articles sa
      JOIN articles a ON a.id = sa.article_id
      WHERE sa.series_id IN (${seriesIds.map(() => '?').join(', ')})${statusClause}
      GROUP BY sa.series_id
    `, seriesIds);
  };
}

module.exports = makeCountBySeriesIds;
