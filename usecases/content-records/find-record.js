function makeFindRecord({ store, label, NotFoundError }) {
  return async function findRecord({ id, slug, publishedOnly = false }) {
    const row = await store.getByIdOrSlug({ id, slug, publishedOnly });
    if (!row) {
      throw new NotFoundError(`${label} not found for ${id ? `id ${id}` : `slug ${slug}`}`);
    }
    return row;
  };
}

module.exports = makeFindRecord;
