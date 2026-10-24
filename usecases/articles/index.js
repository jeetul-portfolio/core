const makeGetArticlesUsecase = require('./get-articles');
const makeGetArticleByIdUsecase = require('./get-article-by-id');
const makeGetArticleBySlugUsecase = require('./get-article-by-slug');
const makeCreateArticleUsecase = require('./create-article');
const makeUpdateArticleUsecase = require('./update-article');
const makeDeleteArticleUsecase = require('./delete-article');
const makePublishArticleUsecase = require('./publish-article');
const { NotFoundError } = require('../../exceptions');
const { buildArticlePresenter, buildSlug } = require('./article-presenter');
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
    getArticleBySlug: makeGetArticleBySlugUsecase({
      ...dependencies,
      buildSlug,
      getArticleById,
      NotFoundError,
    }),
    createArticle: makeCreateArticleUsecase({
      ...dependencies,
      getArticleById,
      presentArticleDetail,
      buildExcerpt,
      normalizeTagsForStorage,
      parseTagsFromStorage,
    }),
    updateArticle: makeUpdateArticleUsecase({
      ...dependencies,
      NotFoundError,
      presentArticleDetail,
      buildExcerpt,
      normalizeTagsForStorage,
      parseTagsFromStorage,
    }),
    deleteArticle: makeDeleteArticleUsecase(dependencies),
    publishArticle: makePublishArticleUsecase({
      ...dependencies,
      NotFoundError,
      presentArticleDetail,
      parseTagsFromStorage,
    }),
  };
};
