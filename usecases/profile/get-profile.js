function makeGetProfileUsecase({ dataAccess, presentProfile }) {
  return async function getProfileUsecase() {
    const existingProfile = await dataAccess.profiles.findProfileByUserId();
    if (existingProfile) {
      return presentProfile(existingProfile);
    }

    return presentProfile({
      fullName: '',
      email: '',
      isPublic: true,
    });
  };
}

module.exports = makeGetProfileUsecase;
