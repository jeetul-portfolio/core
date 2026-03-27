function makeDeleteProfileUsecase({ dataAccess, NotFoundError }) {
  return async function deleteProfileUsecase({ id }) {
    const deleted = await dataAccess.profiles.deleteProfile({ id });

    if (!deleted) {
      throw new NotFoundError(`Profile not found for id ${id}`);
    }

    return {
      id,
      deleted: true,
    };
  };
}

module.exports = makeDeleteProfileUsecase;
