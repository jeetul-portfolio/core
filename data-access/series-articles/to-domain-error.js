const { ConflictError, NotFoundError, ValidationError } = require('../../exceptions');

/**
 * Maps series_articles constraint violations to API errors. The schema is the source of truth:
 * these fire even when two requests race past the usecase checks.
 */
function toDomainError(error) {
  const message = String(error.sqlMessage || error.message || '');
  if (error.code === 'ER_DUP_ENTRY' && message.includes('uq_series_articles_part')) {
    return new ConflictError('That part number is already used in this series');
  }
  if (error.code === 'ER_DUP_ENTRY' && message.includes('uq_series_articles_sequential_article')) {
    return new ConflictError('The article is already a sequential part of another series');
  }
  if (error.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
    return new ValidationError('Part numbers must be positive integers');
  }
  if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    return new NotFoundError('Series or article not found');
  }
  if (error.code === 'ER_LOCK_DEADLOCK' || error.code === 'ER_LOCK_WAIT_TIMEOUT') {
    return new ConflictError('The series was modified concurrently; retry the request');
  }
  return null;
}

module.exports = toDomainError;
