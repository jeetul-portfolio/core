const { ValidationError } = require('../../exceptions');

/** A current role has no end date; otherwise the end cannot precede the start. */
function prepareExperience(record) {
  if (record.isCurrent) {
    return { endDate: null };
  }
  if (record.startDate && record.endDate && record.endDate < record.startDate) {
    throw new ValidationError('endDate must be on or after startDate');
  }
  return {};
}

module.exports = prepareExperience;
