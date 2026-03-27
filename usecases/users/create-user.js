function makeCreateUserUsecase({ dataAccess, bcrypt, ValidationError, getUserById }) {
  return async function createUserUsecase({ email, password, fullName, roleId }) {
    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await dataAccess.users.findUserByEmail({ email: normalizedEmail });

    if (existingUser) {
      throw new ValidationError('User already exists with this email');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const createdUser = await dataAccess.users.createUser({
      email: normalizedEmail,
      passwordHash,
      fullName,
    });

    const roles = await dataAccess.roles.getRolesByIds({ roleIds: [roleId] });
    const roleRow = roles[0] || null;
    if (!roleRow) {
      throw new ValidationError('Invalid role selected');
    }

    await dataAccess.userRoles.replaceUserRoles({
      userId: createdUser.id,
      roleIds: [roleRow.id],
    });

    return getUserById({ id: createdUser.id });
  };
}

module.exports = makeCreateUserUsecase;
