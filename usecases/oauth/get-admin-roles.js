function makeGetAdminRolesUsecase({ dataAccess }) {
  return async function getAdminRolesUsecase({ userId }) {
    const roleIds = await dataAccess.userRoles.getRoleIdsByUserId({ userId });
    const roles = await dataAccess.roles.getRolesByIds({ roleIds });
    return roles.map((role) => role.code);
  };
}

module.exports = makeGetAdminRolesUsecase;
