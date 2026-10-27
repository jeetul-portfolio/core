/** Nearest parts before and after partNumber; drafts are skipped when publishedOnly. */
function makeGetNeighbors({ runQuery }) {
  return async function getNeighbors({ seriesId, partNumber, publishedOnly = false }) {
    const statusClause = publishedOnly ? " AND a.status = 'published'" : '';
    const select = (comparison, direction) => `
      (SELECT ? AS direction, a.id, a.title, a.status, sa.part_number AS partNumber
       FROM series_articles sa
       JOIN articles a ON a.id = sa.article_id
       WHERE sa.series_id = ? AND sa.part_number ${comparison} ?${statusClause}
       ORDER BY sa.part_number ${direction}
       LIMIT 1)
    `;
    const rows = await runQuery('getNeighbors', `${select('<', 'DESC')} UNION ALL ${select('>', 'ASC')}`, [
      'previous', seriesId, partNumber,
      'next', seriesId, partNumber,
    ]);
    return {
      previous: rows.find((row) => row.direction === 'previous') || null,
      next: rows.find((row) => row.direction === 'next') || null,
    };
  };
}

module.exports = makeGetNeighbors;
