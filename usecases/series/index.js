const buildContentRecordsUsecase = require('../content-records');
const makeGetSeriesUsecase = require('./get-series');
const makeListSeriesUsecase = require('./list-series');
const makeAssignArticleUsecase = require('./assign-article');
const makeRemoveArticleUsecase = require('./remove-article');
const makeReorderPartsUsecase = require('./reorder-parts');
const makeGetArticleSeriesUsecase = require('./get-article-series');
const presenters = require('./present-series');
const { NotFoundError, ValidationError, ConflictError } = require('../../exceptions');

/** Series CRUD/publish/reorder come from content-records; membership and parts live here. */
module.exports = function buildSeriesUsecase(dependencies) {
  const records = buildContentRecordsUsecase(dependencies, {
    entityType: 'series',
    label: 'Series',
    store: dependencies.dataAccess.series,
    slugSource: (record) => record.title,
  });
  const deps = { ...dependencies, ...presenters, records, NotFoundError, ValidationError, ConflictError };
  const withoutSkills = (work) => async (input) => presenters.presentSeries(await work(input));

  const getSeries = makeGetSeriesUsecase(deps);
  const getArticleSeries = makeGetArticleSeriesUsecase(deps);

  return {
    list: makeListSeriesUsecase(deps),
    get: getSeries,
    create: withoutSkills(records.create),
    update: withoutSkills(records.update),
    setPublished: withoutSkills(records.setPublished),
    remove: records.remove,
    reorder: records.reorder,
    assignArticle: makeAssignArticleUsecase({ ...deps, getArticleSeries }),
    removeArticle: makeRemoveArticleUsecase(deps),
    reorderParts: makeReorderPartsUsecase({ ...deps, getSeries }),
    getArticleSeries,
  };
};
