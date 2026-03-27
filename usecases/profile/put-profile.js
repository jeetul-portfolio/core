function makePutProfileUsecase({ dataAccess, presentProfile, NotFoundError }) {
  return async function putProfileUsecase(payload) {
    const { id } = payload;
    const existing = await dataAccess.profiles.findProfileById({ id });

    if (!existing) {
      throw new NotFoundError(`Profile not found for id ${id}`);
    }

    await dataAccess.profiles.updateProfileById({
      id,
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone ?? null,
      location: payload.location ?? null,
      linkedin: payload.linkedin ?? null,
      github: payload.github ?? null,
      website: payload.website ?? null,
      headline: payload.headline ?? null,
      bio: payload.bio ?? null,
      avatarUrl: payload.avatarUrl ?? null,
      isPublic: payload.isPublic ?? true,
    });

    const updated = await dataAccess.profiles.findProfileById({ id });
    return presentProfile(updated);
  };
}

module.exports = makePutProfileUsecase;
