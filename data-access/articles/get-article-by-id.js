function makeGetArticleByIdDataAccess({ logger, mysqlPool, tableName }) {
  return async function getArticleByIdDataAccess({ id, includeDrafts = false }) {
    try {
      const statusClause = includeDrafts ? '' : " AND status = 'published'";
      const query = `
        SELECT
          id,
          title,
          tags,
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
        WHERE id = ?${statusClause}
        LIMIT 1
      `;

      const [rows] = await mysqlPool.query(query, [id]);
      return rows[0] || null;
    } catch (error) {
      logger.error('Database query failed in getArticleByIdDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeGetArticleByIdDataAccess;
