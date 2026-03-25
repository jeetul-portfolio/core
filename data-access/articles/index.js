const makeGetArticles = require('./get-articles');
const makeGetArticleById = require('./get-article-by-id');

const TABLE_NAME = 'articles';

module.exports = function buildArticlesDataAccess(dependencies) {
  const getArticles = makeGetArticles({
    ...dependencies,
    tableName: TABLE_NAME,
  });

  const getArticleById = makeGetArticleById({
    ...dependencies,
    tableName: TABLE_NAME,
  });

  return {
    getArticles,
    getArticleById,
  };
};
