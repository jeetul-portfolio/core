function makeListUsecase({ store, attachSkills }) {
  return async function listUsecase({ publishedOnly = false, ...filters } = {}) {
    const rows = await store.list({ ...filters, publishedOnly });
    return attachSkills(rows);
  };
}

module.exports = makeListUsecase;
