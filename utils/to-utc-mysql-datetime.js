const moment = require('moment-timezone');

function toUtcMysqlDatetime(dateLike) {
  if (dateLike === null || dateLike === undefined || dateLike === '') {
    return null;
  }

  let parsed = null;

  if (moment.isMoment(dateLike)) {
    parsed = dateLike.clone();
  } else if (dateLike instanceof Date || typeof dateLike === 'number') {
    parsed = moment(dateLike);
  } else if (typeof dateLike === 'string') {
    parsed = moment.parseZone(dateLike, moment.ISO_8601, true);

    if (!parsed.isValid()) {
      parsed = moment.tz(dateLike, moment.tz.guess());
    }

    if (!parsed.isValid()) {
      parsed = moment(new Date(dateLike));
    }
  } else {
    parsed = moment(dateLike);
  }

  if (!parsed.isValid()) {
    throw new Error(`Invalid date value: ${dateLike}`);
  }

  return parsed.utc().format('YYYY-MM-DD HH:mm:ss');
}

module.exports = toUtcMysqlDatetime;