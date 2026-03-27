const makeGetArticlesUsecase = require('./get-articles');
const makeGetArticleByIdUsecase = require('./get-article-by-id');
const makeCreateArticleUsecase = require('./create-article');
const makeUpdateArticleUsecase = require('./update-article');
const makeDeleteArticleUsecase = require('./delete-article');

module.exports = function buildArticlesUsecase(dependencies) {
  return {
    getArticles: makeGetArticlesUsecase(dependencies),
    getArticleById: makeGetArticleByIdUsecase(dependencies),
    createArticle: makeCreateArticleUsecase(dependencies),
    updateArticle: makeUpdateArticleUsecase(dependencies),
    deleteArticle: makeDeleteArticleUsecase(dependencies),
  };
};
