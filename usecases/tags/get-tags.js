const { presentTag } = require('./tag-presenter');

function makeGetTagsUsecase({ dataAccess }) {
  return async function getTagsUsecase({ page, pageSize, search } = {}) {
    const rows = await dataAccess.tags.getTags({ page, pageSize, search });
    return rows.map(presentTag);
  };
}

module.exports = makeGetTagsUsecase;
