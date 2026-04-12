function makeDeleteTagUsecase({ dataAccess, NotFoundError }) {
  return async function deleteTagUsecase({ id }) {
    const existing = await dataAccess.tags.getTagById({ id });

    if (!existing) {
      throw new NotFoundError(`Tag not found for id ${id}`);
    }

    // CASCADE constraint on tag_references handles cleanup automatically
    await dataAccess.tags.deleteTag({ id });

    return { id, deleted: true };
  };
}

module.exports = makeDeleteTagUsecase;
