function makeAuthenticateMiddleware({ jwt, config, AuthenticationError }) {
  return function authenticate(req, res, next) {
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
      const payload = jwt.verify(token, config.auth.accessTokenSecret);
      req.auth = payload;
      return next();
    } catch (error) {
      const authError = new AuthenticationError('Invalid or expired access token');
      return res.status(authError.httpStatusCode || 401).json({
        message: authError.message,
        name: authError.name,
      });
    }
  };
}

module.exports = makeAuthenticateMiddleware;
