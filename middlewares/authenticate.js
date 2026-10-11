// In-cluster service-to-service calls (e.g. the MCP server) send this header instead of a token.
// The public service-request-router strips it, so it can only originate inside the cluster.
const INTERNAL_SCOPES_HEADER = 'x-internal-scopes';
// Scope -> role granted to internal callers. 'service' is accepted only on content routes.
const INTERNAL_SCOPE_ROLES = { 'portfolio:admin': 'service' };

function makeAuthenticateMiddleware({ jwt, config, AuthenticationError, dataAccess }) {
  return async function authenticate(req, res, next) {
    const internalScopes = req.headers[INTERNAL_SCOPES_HEADER];
    if (internalScopes !== undefined) {
      const roles = String(internalScopes)
        .split(/[\s,]+/)
        .map((scope) => INTERNAL_SCOPE_ROLES[scope])
        .filter(Boolean);
      if (roles.length === 0) {
        const error = new AuthenticationError('No recognised internal scope');
        return res.status(error.httpStatusCode || 401).json({ message: error.message, name: error.name });
      }
      req.auth = { sub: 'internal', roles: [...new Set(roles)], isInternal: true };
      return next();
    }

    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      const error = new AuthenticationError('Missing or invalid authorization token');
      return res.status(error.httpStatusCode || 401).json({
        message: error.message,
        name: error.name,
      });
    }

    try {
      const payload = jwt.verify(token, config.auth.accessTokenSecret, { algorithms: ['HS256'] });

      const userId = Number(payload?.sub);
      if (!Number.isFinite(userId) || userId <= 0) {
        throw new AuthenticationError('Invalid or expired access token');
      }

      const user = await dataAccess.users.findUserById({ id: userId });
      if (!user || !user.isActive) {
        throw new AuthenticationError('Invalid or expired access token');
      }

      const tokenIssuedAtSec = Number(payload?.iat);
      const tokenIssuedAtMs = Number.isFinite(tokenIssuedAtSec)
        ? tokenIssuedAtSec * 1000
        : Number(payload?.iatMs);
      const userUpdatedAtMs = new Date(user.updatedAt).getTime();
      if (
        Number.isFinite(tokenIssuedAtMs)
        && Number.isFinite(userUpdatedAtMs)
        && userUpdatedAtMs >= tokenIssuedAtMs
      ) {
        throw new AuthenticationError('Session expired. Please login again.');
      }

      req.auth = payload;
      return next();
    } catch (error) {
      const authError = error instanceof AuthenticationError
        ? error
        : new AuthenticationError('Invalid or expired access token');
      return res.status(authError.httpStatusCode || 401).json({
        message: authError.message,
        name: authError.name,
      });
    }
  };
}

module.exports = makeAuthenticateMiddleware;
