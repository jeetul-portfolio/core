const makeGetArticles = require('./get-articles');
const makeGetArticleById = require('./get-article-by-id');
const makeCreateArticle = require('./create-article');
const makeUpdateArticle = require('./update-article');
const makeDeleteArticle = require('./delete-article');

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

  const createArticle = makeCreateArticle({
    ...dependencies,
    tableName: TABLE_NAME,
  });

  const updateArticle = makeUpdateArticle({
    ...dependencies,
    tableName: TABLE_NAME,
  });

  const deleteArticle = makeDeleteArticle({
    ...dependencies,
    tableName: TABLE_NAME,
  });

  return {
    getArticles,
    getArticleById,
    createArticle,
    updateArticle,
    deleteArticle,
  };
};
