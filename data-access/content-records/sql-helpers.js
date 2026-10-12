const toUtcMysqlDatetime = require('../../utils/to-utc-mysql-datetime');

/**
 * SQL fragments derived from an entity's field map
 * ({ apiField: { column, kind } }, kind: string | int | bool | date | datetime | json).
 * Column names always come from the field map, never from input.
 */
function buildSelectList(fields) {
  return [
    'id',
    ...Object.entries(fields).map(([field, { column, kind }]) => (
      kind === 'date'
        ? `DATE_FORMAT(${column}, '%Y-%m-%d') AS ${field}`
        : `${column} AS ${field}`
    )),
    'created_at AS createdAt',
    'updated_at AS updatedAt',
  ].join(', ');
}

/** [[column, dbValue], ...] for the payload fields the entity knows about. */
function toColumnValues(fields, payload) {
  return Object.entries(fields)
    .filter(([field]) => Object.prototype.hasOwnProperty.call(payload, field))
    .map(([field, { column, kind }]) => [column, toDbValue(kind, payload[field])]);
}

function toDbValue(kind, value) {
  if (value === undefined || value === null) return null;
  if (kind === 'json') return JSON.stringify(value);
  if (kind === 'bool') return value ? 1 : 0;
  if (kind === 'datetime') return toUtcMysqlDatetime(value);
  return value;
}

function escapeLike(value) {
  return String(value).replace(/[\\%_]/g, (c) => `\\${c}`);
}

function placeholders(values) {
  return values.map(() => '?').join(', ');
}

module.exports = { buildSelectList, toColumnValues, escapeLike, placeholders };
