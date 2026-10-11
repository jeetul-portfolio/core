function makeAuthenticateAdminUsecase({ dataAccess, bcrypt, crypto, getAdminRoles, ADMIN_ROLE, OAuthError }) {
  // Compared when the user is unknown so response time does not reveal valid emails.
  let dummyHash = null;

  return async function authenticateAdminUsecase({ email, password }) {
    const user = await dataAccess.users.findUserForLoginByEmail({
      email: String(email || '').trim().toLowerCase(),
    });

    dummyHash = dummyHash || bcrypt.hashSync(crypto.randomBytes(8).toString('hex'), 10);
    const matches = await bcrypt.compare(String(password || ''), user?.passwordHash || dummyHash);

    if (!user || !user.passwordHash || !matches || !user.isActive) {
      throw new OAuthError('invalid_credentials', 'Invalid credentials', 401);
    }

    const roles = await getAdminRoles({ userId: user.id });
    if (!roles.includes(ADMIN_ROLE)) {
      throw new OAuthError('access_denied', 'Administrator access is required', 403);
    }

    return user;
  };
}

module.exports = makeAuthenticateAdminUsecase;
