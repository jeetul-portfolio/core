const toUtcMysqlDatetime = require('../../utils/to-utc-mysql-datetime');

function makeCreateArticleDataAccess({ logger, mysqlPool, tableName }) {
  return async function createArticleDataAccess({
    title,
    tags,
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
          (title, tags, excerpt, content, cover_image, author_name, author_avatar, status, published_at, created_at, updated_at)
        VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;

      const [result] = await mysqlPool.query(query, [
        title,
        tags,
        excerpt,
        content,
        coverImage,
        authorName,
        authorAvatar,
        status,
        toUtcMysqlDatetime(publishedAt),
      ]);
      return { id: result.insertId };
    } catch (error) {
      logger.error('Database query failed in createArticleDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeCreateArticleDataAccess;
