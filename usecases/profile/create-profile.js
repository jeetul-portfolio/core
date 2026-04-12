function makeCreateProfileUsecase({ dataAccess, presentProfile, syncEntityTags }) {
  return async function createProfileUsecase(payload) {
    const id = await dataAccess.profiles.createProfile(payload);
    const created = await dataAccess.profiles.findProfileById({ id });

    if (syncEntityTags) {
      await syncEntityTags({
        entityType: 'profile',
        entityId: id,
        explicitTags: [],
        textFields: [payload.bio],
      });
    }

    return presentProfile(created);
  };
}

module.exports = makeCreateProfileUsecase;
