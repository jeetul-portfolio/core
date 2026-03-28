const makeGetArticlesUsecase = require('./get-articles');
const makeGetArticleByIdUsecase = require('./get-article-by-id');
const makeCreateArticleUsecase = require('./create-article');
const makeUpdateArticleUsecase = require('./update-article');
const makeDeleteArticleUsecase = require('./delete-article');
const { NotFoundError } = require('../../exceptions');
const { presentArticleDetail } = require('./article-presenter');
const { buildExcerpt } = require('./build-excerpt');

module.exports = function buildArticlesUsecase(dependencies) {
  const getArticleById = makeGetArticleByIdUsecase(dependencies);

  return {
    getArticles: makeGetArticlesUsecase(dependencies),
    getArticleById,
    createArticle: makeCreateArticleUsecase({
      ...dependencies,
      getArticleById,
      presentArticleDetail,
      buildExcerpt,
    }),
    updateArticle: makeUpdateArticleUsecase({
      ...dependencies,
      NotFoundError,
      presentArticleDetail,
      buildExcerpt,
    }),
    deleteArticle: makeDeleteArticleUsecase(dependencies),
  };
};
