const { presentArticleListItem } = require('./article-presenter');

function makeGetArticlesUsecase({ dataAccess }) {
  return async function getArticlesUsecase({
    page = 1,
    pageSize = 10,
    search = '',
    tag,
  } = {}) {
    const rows = await dataAccess.articles.getArticles({
      page,
      pageSize,
      search,
      tag,
    });

    return rows.map((article) => presentArticleListItem(article));
  };
}

module.exports = makeGetArticlesUsecase;
