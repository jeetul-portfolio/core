const { setNoStoreHeaders } = require('./oauth-http');

function makeRequireOAuthEnabledController({ usecase }) {
  return function requireOAuthEnabledController(req, res, next) {
    if (usecase.oauthUsecase.isEnabled()) {
      return next();
    }

    setNoStoreHeaders(res);
    return res.status(503).json({
      error: 'temporarily_unavailable',
      error_description: 'OAuth is not configured',
    });
  };
}

module.exports = makeRequireOAuthEnabledController;
