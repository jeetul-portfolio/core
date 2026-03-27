function makeAuthorizeMiddleware({ ForbiddenError }) {
  return function authorize(allowedRoles = []) {
    return function authorizeMiddleware(req, res, next) {
      if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
        return next();
      }

      const userRoles = Array.isArray(req.auth?.roles) ? req.auth.roles : [];
      const isAllowed = allowedRoles.some((role) => userRoles.includes(role));

      if (!isAllowed) {
        const error = new ForbiddenError('You are not allowed to perform this action');
        return res.status(error.httpStatusCode || 403).json({
          message: error.message,
          name: error.name,
        });
      }

      return next();
    };
  };
}

module.exports = makeAuthorizeMiddleware;
