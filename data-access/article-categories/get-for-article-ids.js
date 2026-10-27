function makeGetForArticleIdsDataAccess({ logger, mysqlPool }) {
  return async function getForArticleIdsDataAccess({ articleIds }) {
    if (!articleIds || articleIds.length === 0) return [];

    try {
      const query = `
        SELECT ac.article_id AS articleId, c.id, c.name, c.slug
        FROM article_categories ac
        JOIN categories c ON c.id = ac.category_id
        WHERE ac.article_id IN (${articleIds.map(() => '?').join(', ')})
        ORDER BY c.sort_order ASC, c.name ASC
      `;

      const [rows] = await mysqlPool.query(query, articleIds);
      return rows;
    } catch (error) {
      logger.error('Database query failed in getForArticleIdsDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeGetForArticleIdsDataAccess;
