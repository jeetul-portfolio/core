// Verifies the admin's credentials and returns the client redirect URL carrying a one-time code.
function makeApproveAuthorizationUsecase({
  dataAccess,
  settings,
  issuer,
  nowSec,
  sha256,
  randomToken,
  parseAuthorizeRequest,
  authenticateAdmin,
}) {
  return async function approveAuthorizationUsecase({ params, email, password }) {
    const request = await parseAuthorizeRequest(params);
    const user = await authenticateAdmin({ email, password });

    const code = randomToken();
    await dataAccess.oauthAuthorizationCodes.createAuthorizationCode({
      codeHash: sha256(code),
      clientId: request.clientId,
      userId: user.id,
      redirectUri: request.redirectUri,
      codeChallenge: request.codeChallenge,
      scope: request.scope,
      resource: request.resource,
      expiresAt: nowSec() + settings.codeTtlSec,
    });

    const redirect = new URL(request.redirectUri);
    redirect.searchParams.set('code', code);
    redirect.searchParams.set('iss', issuer);
    if (request.state !== undefined) {
      redirect.searchParams.set('state', request.state);
    }
    return redirect.toString();
  };
}

module.exports = makeApproveAuthorizationUsecase;
