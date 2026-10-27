function makeGetArticlesUsecase({ dataAccess, presentArticleListItem, attachCategories }) {
  return async function getArticlesUsecase({
    page = 1,
    pageSize = 10,
    search = '',
    tag,
    category,
    series,
    includeDrafts = false,
  } = {}) {
    const rows = await dataAccess.articles.getArticles({
      page,
      pageSize,
      search,
      tag,
      category,
      series,
      includeDrafts,
    });

    return (await attachCategories(rows)).map((article) => presentArticleListItem(article));
  };
}

module.exports = makeGetArticlesUsecase;
