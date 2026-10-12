const { escapeLike } = require('./sql-helpers');

function makeListDataAccess({ runQuery, tableName, fields, selectList, searchColumns, orderBy }) {
  return async function listDataAccess({
    page = 1,
    pageSize = 50,
    search = '',
    status,
    publishedOnly,
    featured,
    tag,
  } = {}) {
    const where = [];
    const params = [];

    if (publishedOnly) {
      where.push("status = 'published'");
    } else if (status) {
      where.push('status = ?');
      params.push(status);
    }

    if (search) {
      const term = `%${escapeLike(search)}%`;
      where.push(`(${searchColumns.map((column) => `${column} LIKE ?`).join(' OR ')})`);
      params.push(...searchColumns.map(() => term));
    }

    if (featured !== undefined && fields.isFeatured) {
      where.push('is_featured = ?');
      params.push(featured ? 1 : 0);
    }

    if (tag && fields.tags) {
      // tags is a JSON array of display names; match one whole element case-insensitively.
      where.push('LOWER(CAST(tags AS CHAR)) LIKE ?');
      params.push(`%${escapeLike(JSON.stringify(String(tag).toLowerCase()))}%`);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    params.push(pageSize, (page - 1) * pageSize);

    return runQuery('list', `
      SELECT ${selectList}
      FROM ${tableName}
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `, params);
  };
}

module.exports = makeListDataAccess;
