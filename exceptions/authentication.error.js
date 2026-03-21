class AuthenticationError extends Error {
  constructor(...params) {
    super(...params);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuthenticationError);
    }

    this.name = 'AuthenticationError';
    this.httpStatusCode=401;
    this.date = new Date();
  }
}
module.exports=AuthenticationError;