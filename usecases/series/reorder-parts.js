/** Renumbers the series' sequential parts 1..n in the given order; must list exactly the current parts. */
function makeReorderPartsUsecase({ dataAccess, getSeries, NotFoundError, ValidationError }) {
  return async function reorderPartsUsecase({ seriesId, articleIds }) {
    const store = dataAccess.seriesArticles;

    await store.withTransaction(async (db) => {
      if (!(await store.lockSeries({ seriesId, db }))) {
        throw new NotFoundError(`Series not found for id ${seriesId}`);
      }
      const currentIds = (await store.listParts({ seriesId, db })).map((part) => Number(part.articleId));
      const isSameSet = currentIds.length === articleIds.length
        && articleIds.every((id) => currentIds.includes(id));
      if (!isSameSet) {
        throw new ValidationError(
          `articleIds must list exactly the series' current sequential parts: [${currentIds.join(', ')}]`
        );
      }
      await store.renumberParts({ seriesId, articleIds, db });
    });

    return getSeries({ id: seriesId });
  };
}

module.exports = makeReorderPartsUsecase;
