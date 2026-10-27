const makeGetArticlesUsecase = require('./get-articles');
const makeGetArticleByIdUsecase = require('./get-article-by-id');
const makeGetArticleBySlugUsecase = require('./get-article-by-slug');
const makeCreateArticleUsecase = require('./create-article');
const makeUpdateArticleUsecase = require('./update-article');
const makeDeleteArticleUsecase = require('./delete-article');
const makePublishArticleUsecase = require('./publish-article');
const makeAddArticleCategoriesUsecase = require('./add-article-categories');
const makeRemoveArticleCategoryUsecase = require('./remove-article-category');
const makeAttachCategories = require('./attach-categories');
const makeAssertCategoriesExist = require('./assert-categories-exist');
const { NotFoundError, ValidationError } = require('../../exceptions');
const { buildArticlePresenter, buildSlug } = require('./article-presenter');
const { buildExcerpt } = require('./build-excerpt');
const { normalizeTagsForStorage, parseTagsFromStorage } = require('../../utils/tags-storage');

module.exports = function buildArticlesUsecase(dependencies) {
  const { presentArticleListItem, presentArticleDetail } = buildArticlePresenter({
    parseTagsFromStorage,
  });

  const attachCategories = makeAttachCategories(dependencies);
  const assertCategoriesExist = makeAssertCategoriesExist({ ...dependencies, ValidationError });

  const getArticleById = makeGetArticleByIdUsecase({
    ...dependencies,
    presentArticleDetail,
    attachCategories,
    NotFoundError,
  });

  return {
    getArticles: makeGetArticlesUsecase({
      ...dependencies,
      presentArticleListItem,
      attachCategories,
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
      assertCategoriesExist,
    }),
    updateArticle: makeUpdateArticleUsecase({
      ...dependencies,
      NotFoundError,
      presentArticleDetail,
      buildExcerpt,
      normalizeTagsForStorage,
      parseTagsFromStorage,
      assertCategoriesExist,
      getArticleById,
    }),
    deleteArticle: makeDeleteArticleUsecase(dependencies),
    publishArticle: makePublishArticleUsecase({
      ...dependencies,
      NotFoundError,
      presentArticleDetail,
      parseTagsFromStorage,
      getArticleById,
    }),
    addArticleCategories: makeAddArticleCategoriesUsecase({
      ...dependencies,
      assertCategoriesExist,
      getArticleById,
      NotFoundError,
    }),
    removeArticleCategory: makeRemoveArticleCategoryUsecase({
      ...dependencies,
      getArticleById,
      NotFoundError,
    }),
  };
};
