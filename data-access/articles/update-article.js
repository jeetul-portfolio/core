function makeUpdateArticleDataAccess({ logger, mysqlPool, tableName }) {
  return async function updateArticleDataAccess(payload) {
    try {
      const assignments = [];
      const values = [];

      appendAssignment(payload, 'title', 'title', assignments, values);
      appendAssignment(payload, 'excerpt', 'excerpt', assignments, values);
      appendAssignment(payload, 'content', 'content', assignments, values);
      appendAssignment(payload, 'coverImage', 'cover_image', assignments, values);
      appendAssignment(payload, 'authorName', 'author_name', assignments, values);
      appendAssignment(payload, 'authorAvatar', 'author_avatar', assignments, values);
      appendAssignment(payload, 'status', 'status', assignments, values);
      appendAssignment(payload, 'publishedAt', 'published_at', assignments, values);

      if (assignments.length === 0) {
        return false;
      }

      assignments.push('updated_at = NOW()');
      values.push(payload.id);

      const query = `
        UPDATE ${tableName}
        SET ${assignments.join(', ')}
        WHERE id = ?
      `;

      const [result] = await mysqlPool.query(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Database query failed in updateArticleDataAccess:', error.message);
      throw error;
    }
  };
}

function appendAssignment(payload, inputField, dbField, assignments, values) {
  if (!Object.prototype.hasOwnProperty.call(payload, inputField)) {
    return;
  }

  assignments.push(`${dbField} = ?`);
  values.push(payload[inputField]);
}

module.exports = makeUpdateArticleDataAccess;
