// RFC 6749 error: `error` is the protocol error code, the message is error_description.
class OAuthError extends Error {
  constructor(error, description, httpStatusCode = 400) {
    super(description);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, OAuthError);
    }

    this.name = 'OAuthError';
    this.error = error;
    this.httpStatusCode = httpStatusCode;
    this.date = new Date();
  }
}
module.exports = OAuthError;
