/** Series list with article/part counts (published articles only on public listings). */
function makeListSeriesUsecase({ records, dataAccess, presentSeries }) {
  return async function listSeriesUsecase({ publishedOnly = false, ...filters } = {}) {
    const rows = await records.list({ ...filters, publishedOnly });
    const counts = await dataAccess.seriesArticles.countBySeriesIds({
      seriesIds: rows.map((row) => row.id),
      publishedOnly,
    });
    return rows.map((row) => {
      const count = counts.find((c) => c.seriesId === row.id);
      return {
        ...presentSeries(row),
        articleCount: count ? Number(count.articleCount) : 0,
        partCount: count ? Number(count.partCount) : 0,
      };
    });
  };
}

module.exports = makeListSeriesUsecase;
