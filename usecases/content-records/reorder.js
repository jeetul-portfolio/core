/** Sets display order to the position of each id; all ids must exist. */
function makeReorderUsecase({ store, label, NotFoundError }) {
  return async function reorderUsecase({ ids }) {
    const found = await store.getByIds({ ids });
    const foundIds = new Set(found.map((row) => Number(row.id)));
    const missing = ids.filter((id) => !foundIds.has(id));
    if (missing.length > 0) {
      throw new NotFoundError(`${label} not found for ids ${missing.join(', ')}`);
    }
    await store.reorder({ ids });
    return { ids };
  };
}

module.exports = makeReorderUsecase;
