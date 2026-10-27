const buildContentRecordsController = require('../content-records');
const makeHandler = require('../content-records/make-handler');
const makeAssignArticleController = require('./assign-article');
const makeRemoveArticleController = require('./remove-article');
const makeReorderPartsController = require('./reorder-parts');
const makeGetArticleSeriesController = require('./get-article-series');
const { createSchema, membershipSchemas } = require('./series-schema');

module.exports = function buildSeriesController(dependencies) {
  const deps = {
    handle: makeHandler({ ...dependencies, usecaseKey: 'seriesUsecase' }),
    series: () => dependencies.usecase.seriesUsecase,
    schemas: membershipSchemas,
  };

  return {
    ...buildContentRecordsController(dependencies, {
      usecaseKey: 'seriesUsecase',
      createSchema,
      requiredKeys: ['title'],
    }),
    assignArticle: makeAssignArticleController(deps),
    removeArticle: makeRemoveArticleController(deps),
    reorderParts: makeReorderPartsController(deps),
    getArticleSeries: makeGetArticleSeriesController(deps, { publishedOnly: true }),
    getArticleSeriesAdmin: makeGetArticleSeriesController(deps, { publishedOnly: false }),
  };
};
