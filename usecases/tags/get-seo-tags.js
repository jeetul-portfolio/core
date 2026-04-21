function makeGetSeoTagsUsecase({ dataAccess }) {
  return async function getSeoTagsUsecase() {
    const rows = await dataAccess.tags.getSeoTags();
    return rows.map((row) => ({ name: row.name, slug: row.slug }));
  };
}

module.exports = makeGetSeoTagsUsecase;
