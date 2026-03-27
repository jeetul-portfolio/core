function makeUpdateUserPasswordUsecase({
  dataAccess,
  bcrypt,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
}) {
  return async function updateUserPasswordUsecase({ id, actorUserId, currentPassword, newPassword }) {
    if (Number(actorUserId) !== Number(id)) {
      throw new ForbiddenError('You can update only your own password');
    }

    const userCredentials = await dataAccess.users.findUserCredentialsById({ id });
    if (!userCredentials) {
      throw new NotFoundError(`User not found for id ${id}`);
    }

    const currentPasswordMatches = await bcrypt.compare(currentPassword, userCredentials.passwordHash);
    if (!currentPasswordMatches) {
      throw new AuthenticationError('Current password is incorrect');
    }

    const nextPasswordHash = await bcrypt.hash(newPassword, 12);
    await dataAccess.users.updateUserPasswordHash({ id, passwordHash: nextPasswordHash });
    await dataAccess.auth.revokeAllRefreshTokensForUser({
      userId: id,
      reason: 'password-changed',
    });

    return { updated: true };
  };
}

module.exports = makeUpdateUserPasswordUsecase;
