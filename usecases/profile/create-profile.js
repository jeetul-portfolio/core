function makeCreateProfileUsecase({ dataAccess, presentProfile }) {
  return async function createProfileUsecase(payload) {
    const id = await dataAccess.profiles.createProfile(payload);
    const created = await dataAccess.profiles.findProfileById({ id });
    return presentProfile(created);
  };
}

module.exports = makeCreateProfileUsecase;
