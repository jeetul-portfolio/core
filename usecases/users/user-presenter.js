function presentUser(user) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    isActive: Boolean(user.isActive),
    roleIds: Array.isArray(user.roleIds) ? user.roleIds : [],
    roles: Array.isArray(user.roles) ? user.roles : [],
    lastUpdatedAt: toIsoDate(user.updatedAt),
    lastLoginAt: toIsoDate(user.lastLoginAt),
  };
}

function toIsoDate(value) {
  if (!value) {
    return null;
  }

  return new Date(value).toISOString();
}

module.exports = {
  presentUser,
};
