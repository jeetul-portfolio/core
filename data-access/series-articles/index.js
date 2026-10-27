const makeRunQuery = require('./run-query');
const makeWithTransaction = require('./with-transaction');
const makeLockSeries = require('./lock-series');
const makeLockArticle = require('./lock-article');
const makeGetMembership = require('./get-membership');
const makeGetSequentialMembership = require('./get-sequential-membership');
const makeInsertMembership = require('./insert-membership');
const makeSetPartNumber = require('./set-part-number');
const makeRemoveMembership = require('./remove-membership');
const makeListParts = require('./list-parts');
const makeRenumberParts = require('./renumber-parts');
const makeListForSeries = require('./list-for-series');
const makeListForArticle = require('./list-for-article');
const makeGetNeighbors = require('./get-neighbors');
const makeCountBySeriesIds = require('./count-by-series-ids');

/**
 * series_articles access. Write helpers take an optional `db` (the connection handed out by
 * withTransaction); without it they run on the pool.
 */
module.exports = function buildSeriesArticlesDataAccess(dependencies) {
  const deps = { ...dependencies, runQuery: makeRunQuery(dependencies) };

  return {
    withTransaction: makeWithTransaction(deps),
    lockSeries: makeLockSeries(deps),
    lockArticle: makeLockArticle(deps),
    getMembership: makeGetMembership(deps),
    getSequentialMembership: makeGetSequentialMembership(deps),
    insertMembership: makeInsertMembership(deps),
    setPartNumber: makeSetPartNumber(deps),
    removeMembership: makeRemoveMembership(deps),
    listParts: makeListParts(deps),
    renumberParts: makeRenumberParts(deps),
    listForSeries: makeListForSeries(deps),
    listForArticle: makeListForArticle(deps),
    getNeighbors: makeGetNeighbors(deps),
    countBySeriesIds: makeCountBySeriesIds(deps),
  };
};
