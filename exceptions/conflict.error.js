class ConflictError extends Error {
  constructor(...params) {
    super(...params);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ConflictError);
    }

    this.name = 'ConflictError';
    this.httpStatusCode=409;
    this.date = new Date();
  }
}
module.exports=ConflictError;
