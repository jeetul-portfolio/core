const forbiddenError = require('./forbidden.error.js');
const notFoundError = require('./not-found.error.js');
const validationError = require('./validation.error.js');
const authenticationError = require('./authentication.error.js');

module.exports = {
    ForbiddenError: forbiddenError,
    NotFoundError: notFoundError,
    ValidationError: validationError,
    AuthenticationError: authenticationError,
};