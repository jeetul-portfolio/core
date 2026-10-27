/** Links categories to an article; existing links are left as they are (no duplicates). */
function makeAddToArticleDataAccess({ logger, mysqlPool }) {
  return async function addToArticleDataAccess({ articleId, categoryIds }) {
    if (!categoryIds || categoryIds.length === 0) return;

    try {
      const query = `
        INSERT IGNORE INTO article_categories (article_id, category_id)
        VALUES ${categoryIds.map(() => '(?, ?)').join(', ')}
      `;

      await mysqlPool.query(query, categoryIds.flatMap((categoryId) => [articleId, categoryId]));
    } catch (error) {
      logger.error('Database query failed in addToArticleDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeAddToArticleDataAccess;
