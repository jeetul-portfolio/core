function makeGetArticlesDataAccess({ logger, mysqlPool, tableName }) {
  return async function getArticlesDataAccess({
    page = 1,
    pageSize = 10,
    search = '',
    tag,
    includeDrafts = false,
  } = {}) {
    try {
      const offset = (page - 1) * pageSize;
      const whereClauses = [];
      const params = [];

      if (!includeDrafts) {
        whereClauses.push("status = 'published'");
      }

      if (search) {
        const searchTerm = `%${search}%`;
        whereClauses.push('(title LIKE ? OR excerpt LIKE ? OR content LIKE ? OR author_name LIKE ?)');
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }

      if (tag) {
        const tagTerm = `%${tag}%`;
        whereClauses.push('(title LIKE ? OR excerpt LIKE ? OR content LIKE ?)');
        params.push(tagTerm, tagTerm, tagTerm);
      }

      const whereClause = whereClauses.length > 0 ? ` WHERE ${whereClauses.join(' AND ')}` : '';

      const query = `
        SELECT
          id,
          title,
          excerpt,
          content,
          cover_image AS coverImage,
          author_name AS authorName,
          author_avatar AS authorAvatar,
          status,
          published_at AS publishedAt,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM ${tableName}
        ${whereClause}
        ORDER BY COALESCE(published_at, created_at) DESC, id DESC
        LIMIT ? OFFSET ?
      `;

      params.push(pageSize, offset);

      const [rows] = await mysqlPool.query(query, params);
      return rows;
    } catch (error) {
      logger.error('Database query failed in getArticlesDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeGetArticlesDataAccess;
