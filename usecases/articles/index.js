const makeGetArticlesUsecase = require('./get-articles');
const makeGetArticleByIdUsecase = require('./get-article-by-id');

module.exports = function buildArticlesUsecase(dependencies) {
  return {
    getArticles: makeGetArticlesUsecase(dependencies),
    getArticleById: makeGetArticleByIdUsecase(dependencies),
  };
};
