function makeUpdateUserUsecase({
  dataAccess,
  ValidationError,
  ForbiddenError,
  NotFoundError,
  getUserById,
}) {
  return async function updateUserUsecase(input) {
    const isAdmin = Array.isArray(input.actorRoles) && input.actorRoles.includes('admin');
    const isSelf = Number(input.actorUserId) === Number(input.id);

    if (!isAdmin && !isSelf) {
      throw new ForbiddenError('You can update only your own profile');
    }

    if (!isAdmin && (Object.prototype.hasOwnProperty.call(input, 'roleId') || Object.prototype.hasOwnProperty.call(input, 'isActive'))) {
      throw new ForbiddenError('Only admin can update role or active status');
    }

    const existingById = await getUserById({ id: input.id, throwIfMissing: false });
    if (!existingById) {
      throw new NotFoundError(`User not found for id ${input.id}`);
    }

    if (Object.prototype.hasOwnProperty.call(input, 'email')) {
      const normalizedEmail = String(input.email).trim().toLowerCase();
      input.email = normalizedEmail;
      const existingByEmail = await dataAccess.users.findUserByEmail({ email: normalizedEmail });
      if (existingByEmail && Number(existingByEmail.id) !== Number(input.id)) {
        throw new ValidationError('User already exists with this email');
      }
    }

    const userUpdatePayload = { id: input.id };

    if (Object.prototype.hasOwnProperty.call(input, 'email')) {
      userUpdatePayload.email = input.email;
    }

    if (Object.prototype.hasOwnProperty.call(input, 'fullName')) {
      userUpdatePayload.fullName = input.fullName;
    }

    if (Object.prototype.hasOwnProperty.call(input, 'isActive')) {
      userUpdatePayload.isActive = input.isActive;
    }

    await dataAccess.users.updateUser(userUpdatePayload);

    if (Object.prototype.hasOwnProperty.call(input, 'roleId')) {
      const roles = await dataAccess.roles.getRolesByIds({ roleIds: [input.roleId] });
      const roleRow = roles[0] || null;
      if (!roleRow) {
        throw new ValidationError('Invalid role selected');
      }

      await dataAccess.userRoles.replaceUserRoles({
        userId: input.id,
        roleIds: [roleRow.id],
      });
    }

    await dataAccess.auth.revokeAllRefreshTokensForUser({
      userId: input.id,
      reason: 'user-updated',
    });

    return getUserById({ id: input.id });
  };
}

module.exports = makeUpdateUserUsecase;
