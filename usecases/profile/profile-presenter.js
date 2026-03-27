function presentProfile(profile = {}) {
  return {
    id: profile.id || null,
    fullName: profile.fullName || '',
    email: profile.email || '',
    phone: profile.phone || '',
    location: profile.location || '',
    linkedin: profile.linkedin || '',
    github: profile.github || '',
    website: profile.website || '',
    headline: profile.headline || '',
    bio: profile.bio || '',
    avatarUrl: profile.avatarUrl || '',
    isPublic: Boolean(profile.isPublic),
    createdAt: toIsoDate(profile.createdAt),
    updatedAt: toIsoDate(profile.updatedAt),
  };
}

function toIsoDate(value) {
  if (!value) {
    return null;
  }

  return new Date(value).toISOString();
}

module.exports = {
  presentProfile,
};
