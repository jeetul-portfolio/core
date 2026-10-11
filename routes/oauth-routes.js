const makeRateLimiter = require('../utils/rate-limit');

// Mounted at the origin root (not under /apis/<service>) because RFC 8414 / RFC 9728
// discovery requires well-known paths there.
function oauthRoutes({ controller, router, express }) {
  const c = controller.oauthController;
  const form = express.urlencoded({ extended: false, limit: '16kb' });
  const minute = (max) => makeRateLimiter({ windowMs: 60 * 1000, max });

  // Guard per-route: router.use() here would 503 every app request, since this router is mounted at root.
  const enabled = c.requireEnabled;
  router.get('/.well-known/oauth-authorization-server', enabled, c.getOAuthMetadata);
  router.get('/oauth/jwks', enabled, c.getJwks);
  router.get('/oauth/authorize', enabled, minute(60), c.showAuthorizeForm);
  router.post('/oauth/authorize', enabled, minute(10), form, c.submitAuthorizeForm);
  router.post('/oauth/token', enabled, minute(60), form, c.createToken);

  return router;
}

module.exports = oauthRoutes;
