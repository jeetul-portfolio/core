const { presentArticleListItem } = require('./article-presenter');

function makeGetArticlesUsecase({ dataAccess }) {
  return async function getArticlesUsecase({
    page = 1,
    pageSize = 10,
    search = '',
    tag,
    includeDrafts = false,
  } = {}) {
    const rows = await dataAccess.articles.getArticles({
      page,
      pageSize,
      search,
      tag,
      includeDrafts,
    });

    return rows.map((article) => presentArticleListItem(article));
  };
}

module.exports = makeGetArticlesUsecase;
