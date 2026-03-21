class ValidationError extends Error {
  constructor(...params) {
    super(...params);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }

    this.name = 'ValidationError';
    this.httpStatusCode=400;
    this.date = new Date();
  }
}
module.exports=ValidationError