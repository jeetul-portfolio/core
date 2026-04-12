function makeDeleteProfileUsecase({ dataAccess, NotFoundError, syncEntityTags }) {
  return async function deleteProfileUsecase({ id }) {
    const deleted = await dataAccess.profiles.deleteProfile({ id });

    if (!deleted) {
      throw new NotFoundError(`Profile not found for id ${id}`);
    }

    await dataAccess.tagReferences.deleteByEntity({ entityType: 'profile', entityId: id });

    return {
      id,
      deleted: true,
    };
  };
}

module.exports = makeDeleteProfileUsecase;
