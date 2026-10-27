/** Series with its articles; publishedOnly hides draft articles but keeps their part numbers' gaps. */
function makeGetSeriesUsecase({ records, dataAccess, presentSeries, presentSeriesArticles }) {
  return async function getSeriesUsecase({ id, slug, publishedOnly = false }) {
    const record = await records.get({ id, slug, publishedOnly });
    const rows = await dataAccess.seriesArticles.listForSeries({ seriesId: record.id, publishedOnly });
    return { ...presentSeries(record), ...presentSeriesArticles(rows) };
  };
}

module.exports = makeGetSeriesUsecase;
