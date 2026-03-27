function makeGetProfilesUsecase({ dataAccess, presentProfile }) {
  return async function getProfilesUsecase() {
    const rows = await dataAccess.profiles.getProfiles();
    return rows.map((profile) => presentProfile(profile));
  };
}

module.exports = makeGetProfilesUsecase;
