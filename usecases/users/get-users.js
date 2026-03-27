function makeGetUsersUsecase({ dataAccess, presentUser }) {
  return async function getUsersUsecase({ page = 1, pageSize = 20 } = {}) {
    const users = await dataAccess.users.getUsers({ page, pageSize });

    const userIds = users.map((user) => user.id);
    const userRoleRows = await dataAccess.userRoles.getRoleIdsByUserIds({ userIds });
    const roleIds = [...new Set(userRoleRows.map((row) => row.roleId))];
    const roles = await dataAccess.roles.getRolesByIds({ roleIds });

    const roleById = new Map(roles.map((role) => [role.id, role]));
    const roleDataByUserId = userRoleRows.reduce((acc, row) => {
      if (!acc[row.userId]) {
        acc[row.userId] = {
          roleIds: [],
          roles: [],
        };
      }

      const role = roleById.get(row.roleId);
      if (role) {
        acc[row.userId].roleIds.push(row.roleId);
        acc[row.userId].roles.push(role);
      }

      return acc;
    }, {});

    return users.map((user) => presentUser({
      ...user,
      roleIds: roleDataByUserId[user.id]?.roleIds || [],
      roles: roleDataByUserId[user.id]?.roles || [],
    }));
  };
}

module.exports = makeGetUsersUsecase;
