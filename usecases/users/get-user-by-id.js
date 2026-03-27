function makeGetUserByIdUsecase({ dataAccess, presentUser, NotFoundError }) {
  return async function getUserByIdUsecase({ id, throwIfMissing = true }) {
    const user = await dataAccess.users.findUserById({ id });

    if (!user) {
      if (!throwIfMissing) {
        return null;
      }

      throw new NotFoundError(`User not found for id ${id}`);
    }

    const roleIds = await dataAccess.userRoles.getRoleIdsByUserId({ userId: user.id });
    const roles = await dataAccess.roles.getRolesByIds({ roleIds });

    return presentUser({
      ...user,
      roleIds,
      roles,
    });
  };
}

module.exports = makeGetUserByIdUsecase;
