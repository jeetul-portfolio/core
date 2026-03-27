function makeGetPublicProfileUsecase({ dataAccess, presentProfile, NotFoundError }) {
  return async function getPublicProfileUsecase() {
    const profile = await dataAccess.profiles.findPublicProfile();
    if (!profile) {
      throw new NotFoundError('Public profile is not configured');
    }

    return presentProfile(profile);
  };
}

module.exports = makeGetPublicProfileUsecase;
