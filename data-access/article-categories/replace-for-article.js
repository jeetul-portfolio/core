/** Replaces an article's category set atomically. */
function makeReplaceForArticleDataAccess({ logger, mysqlPool }) {
  return async function replaceForArticleDataAccess({ articleId, categoryIds }) {
    const connection = await mysqlPool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query('DELETE FROM article_categories WHERE article_id = ?', [articleId]);
      if (categoryIds.length > 0) {
        await connection.query(
          `INSERT INTO article_categories (article_id, category_id) VALUES ${categoryIds.map(() => '(?, ?)').join(', ')}`,
          categoryIds.flatMap((categoryId) => [articleId, categoryId])
        );
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      logger.error('Database query failed in replaceForArticleDataAccess:', error.message);
      throw error;
    } finally {
      connection.release();
    }
  };
}

module.exports = makeReplaceForArticleDataAccess;
