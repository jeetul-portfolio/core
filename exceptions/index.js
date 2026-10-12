const forbiddenError = require('./forbidden.error.js');
const notFoundError = require('./not-found.error.js');
const validationError = require('./validation.error.js');
const authenticationError = require('./authentication.error.js');
const oauthError = require('./oauth.error.js');
const conflictError = require('./conflict.error.js');

module.exports = {
    ForbiddenError: forbiddenError,
    NotFoundError: notFoundError,
    ValidationError: validationError,
    AuthenticationError: authenticationError,
    OAuthError: oauthError,
    ConflictError: conflictError,
};