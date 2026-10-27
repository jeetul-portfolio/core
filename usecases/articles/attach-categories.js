/** Returns copies of article rows with their categories ([{ id, name, slug }]), fetched in one query. */
function makeAttachCategories({ dataAccess }) {
  return async function attachCategories(rows) {
    const links = await dataAccess.articleCategories.getForArticleIds({ articleIds: rows.map((row) => row.id) });
    return rows.map((row) => ({
      ...row,
      categories: links
        .filter((link) => link.articleId === row.id)
        .map(({ id, name, slug }) => ({ id, name, slug })),
    }));
  };
}

module.exports = makeAttachCategories;
