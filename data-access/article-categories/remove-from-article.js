function makeRemoveFromArticleDataAccess({ logger, mysqlPool }) {
  return async function removeFromArticleDataAccess({ articleId, categoryId }) {
    try {
      const [result] = await mysqlPool.query(
        'DELETE FROM article_categories WHERE article_id = ? AND category_id = ?',
        [articleId, categoryId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Database query failed in removeFromArticleDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeRemoveFromArticleDataAccess;
