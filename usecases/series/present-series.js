const { buildArticlePresenter, buildSlug } = require('../articles/article-presenter');
const { parseTagsFromStorage } = require('../../utils/tags-storage');

const { presentArticleListItem } = buildArticlePresenter({ parseTagsFromStorage });

/** Series records come from the shared content-records presenter, which adds an unused `skills`. */
function presentSeries({ skills, ...record }) {
  return record;
}

function presentSeriesRef(row) {
  return { id: row.id, slug: row.slug, title: row.title, status: row.status };
}

function presentNeighbor(row) {
  if (!row) return null;
  return { id: row.id, slug: buildSlug(row.title), title: row.title, status: row.status, partNumber: row.partNumber };
}

/** Splits series_articles rows into ordered sequential parts and other associated articles. */
function presentSeriesArticles(rows) {
  const items = rows.map((row) => ({ ...presentArticleListItem(row), partNumber: row.partNumber }));
  return {
    parts: items.filter((item) => item.partNumber !== null),
    relatedArticles: items.filter((item) => item.partNumber === null),
  };
}

module.exports = { presentSeries, presentSeriesRef, presentNeighbor, presentSeriesArticles };
