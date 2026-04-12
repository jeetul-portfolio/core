const { presentTag } = require('./tag-presenter');

function makeGetTagByIdUsecase({ dataAccess, NotFoundError }) {
  return async function getTagByIdUsecase({ id }) {
    const row = await dataAccess.tags.getTagById({ id });

    if (!row) {
      throw new NotFoundError(`Tag not found for id ${id}`);
    }

    return presentTag(row);
  };
}

module.exports = makeGetTagByIdUsecase;
