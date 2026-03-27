function makeCreateArticleDataAccess({ logger, mysqlPool, tableName }) {
  return async function createArticleDataAccess({
    title,
    excerpt,
    content,
    coverImage,
    authorName,
    authorAvatar,
    status,
    publishedAt,
  }) {
    try {
      const query = `
        INSERT INTO ${tableName}
          (title, excerpt, content, cover_image, author_name, author_avatar, status, published_at, created_at, updated_at)
        VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;

      const [result] = await mysqlPool.query(query, [
        title,
        excerpt,
        content,
        coverImage,
        authorName,
        authorAvatar,
        status,
        publishedAt,
      ]);

      const [rows] = await mysqlPool.query(
        `
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
          WHERE id = ?
          LIMIT 1
        `,
        [result.insertId]
      );

      return rows[0] || null;
    } catch (error) {
      logger.error('Database query failed in createArticleDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeCreateArticleDataAccess;
