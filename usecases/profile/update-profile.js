function makeUpdateProfileUsecase({ dataAccess, presentProfile }) {
  return async function updateProfileUsecase(payload) {
    const {
      fullName,
      email,
      phone,
      location,
      linkedin,
      github,
      website,
      headline,
      bio,
      avatarUrl,
      isPublic,
    } = payload;

    const existingProfile = await dataAccess.profiles.findProfileByUserId();
    const baseProfile = existingProfile || {
      fullName: '',
      email: '',
      phone: null,
      location: null,
      linkedin: null,
      github: null,
      website: null,
      headline: null,
      bio: null,
      avatarUrl: null,
      isPublic: true,
    };

    const has = (key) => Object.prototype.hasOwnProperty.call(payload, key);

    await dataAccess.profiles.upsertProfileByUserId({
      profileId: existingProfile?.id || null,
      fullName: has('fullName') ? fullName : baseProfile.fullName,
      email: has('email') ? email : baseProfile.email,
      phone: has('phone') ? phone : baseProfile.phone,
      location: has('location') ? location : baseProfile.location,
      linkedin: has('linkedin') ? linkedin : baseProfile.linkedin,
      github: has('github') ? github : baseProfile.github,
      website: has('website') ? website : baseProfile.website,
      headline: has('headline') ? headline : baseProfile.headline,
      bio: has('bio') ? bio : baseProfile.bio,
      avatarUrl: has('avatarUrl') ? avatarUrl : baseProfile.avatarUrl,
      isPublic: has('isPublic') ? isPublic : baseProfile.isPublic,
    });

    const updated = await dataAccess.profiles.findProfileByUserId();
    return presentProfile(updated);
  };
}

module.exports = makeUpdateProfileUsecase;
