const makeGetForArticleIds = require('./get-for-article-ids');
const makeAddToArticle = require('./add-to-article');
const makeReplaceForArticle = require('./replace-for-article');
const makeRemoveFromArticle = require('./remove-from-article');
const makeGetCategoriesWithArticleCounts = require('./get-categories-with-article-counts');

module.exports = function buildArticleCategoriesDataAccess(dependencies) {
  return {
    getForArticleIds: makeGetForArticleIds(dependencies),
    addToArticle: makeAddToArticle(dependencies),
    replaceForArticle: makeReplaceForArticle(dependencies),
    removeFromArticle: makeRemoveFromArticle(dependencies),
    getCategoriesWithArticleCounts: makeGetCategoriesWithArticleCounts(dependencies),
  };
};
