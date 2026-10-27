/** Categories that have at least one published article, with that count. */
function makeGetCategoriesWithArticleCountsDataAccess({ logger, mysqlPool }) {
  return async function getCategoriesWithArticleCountsDataAccess({ page = 1, pageSize = 100, search = '' } = {}) {
    try {
      const params = [];
      let searchClause = '';
      if (search) {
        searchClause = 'WHERE (c.name LIKE ? OR c.description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      const query = `
        SELECT
          c.id,
          c.name,
          c.slug,
          c.description,
          c.sort_order AS sortOrder,
          c.created_at AS createdAt,
          c.updated_at AS updatedAt,
          COUNT(a.id) AS articleCount
        FROM categories c
        JOIN article_categories ac ON ac.category_id = c.id
        JOIN articles a ON a.id = ac.article_id AND a.status = 'published'
        ${searchClause}
        GROUP BY c.id
        ORDER BY c.sort_order ASC, c.name ASC
        LIMIT ? OFFSET ?
      `;

      params.push(pageSize, (page - 1) * pageSize);
      const [rows] = await mysqlPool.query(query, params);
      return rows;
    } catch (error) {
      logger.error('Database query failed in getCategoriesWithArticleCountsDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeGetCategoriesWithArticleCountsDataAccess;
