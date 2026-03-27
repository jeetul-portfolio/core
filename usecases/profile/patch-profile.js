function makePatchProfileUsecase({ dataAccess, presentProfile, NotFoundError }) {
  return async function patchProfileUsecase({ id, ...payload }) {
    const existing = await dataAccess.profiles.findProfileById({ id });

    if (!existing) {
      throw new NotFoundError(`Profile not found for id ${id}`);
    }

    const has = (key) => Object.prototype.hasOwnProperty.call(payload, key);

    await dataAccess.profiles.updateProfileById({
      id,
      fullName: has('fullName') ? payload.fullName : existing.fullName,
      email: has('email') ? payload.email : existing.email,
      phone: has('phone') ? payload.phone : existing.phone,
      location: has('location') ? payload.location : existing.location,
      linkedin: has('linkedin') ? payload.linkedin : existing.linkedin,
      github: has('github') ? payload.github : existing.github,
      website: has('website') ? payload.website : existing.website,
      headline: has('headline') ? payload.headline : existing.headline,
      bio: has('bio') ? payload.bio : existing.bio,
      avatarUrl: has('avatarUrl') ? payload.avatarUrl : existing.avatarUrl,
      isPublic: has('isPublic') ? payload.isPublic : Boolean(existing.isPublic),
    });

    const updated = await dataAccess.profiles.findProfileById({ id });
    return presentProfile(updated);
  };
}

module.exports = makePatchProfileUsecase;
