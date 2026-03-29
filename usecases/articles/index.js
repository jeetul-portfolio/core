const makeGetArticlesUsecase = require('./get-articles');
const makeGetArticleByIdUsecase = require('./get-article-by-id');
const makeCreateArticleUsecase = require('./create-article');
const makeUpdateArticleUsecase = require('./update-article');
const makeDeleteArticleUsecase = require('./delete-article');
const { NotFoundError } = require('../../exceptions');
const { buildArticlePresenter } = require('./article-presenter');
const { buildExcerpt } = require('./build-excerpt');
const { normalizeTagsForStorage, parseTagsFromStorage } = require('../../utils/tags-storage');

module.exports = function buildArticlesUsecase(dependencies) {
  const { presentArticleListItem, presentArticleDetail } = buildArticlePresenter({
    parseTagsFromStorage,
  });

  const getArticleById = makeGetArticleByIdUsecase({
    ...dependencies,
    presentArticleDetail,
    NotFoundError,
  });

  return {
    getArticles: makeGetArticlesUsecase({
      ...dependencies,
      presentArticleListItem,
    }),
    getArticleById,
    createArticle: makeCreateArticleUsecase({
      ...dependencies,
      getArticleById,
      presentArticleDetail,
      buildExcerpt,
      normalizeTagsForStorage,
    }),
    updateArticle: makeUpdateArticleUsecase({
      ...dependencies,
      NotFoundError,
      presentArticleDetail,
      buildExcerpt,
      normalizeTagsForStorage,
    }),
    deleteArticle: makeDeleteArticleUsecase(dependencies),
  };
};
