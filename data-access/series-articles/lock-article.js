/** Locks the article row; changes to its sequential membership serialise on it. */
function makeLockArticle({ runQuery }) {
  return async function lockArticle({ articleId, db }) {
    const rows = await runQuery('lockArticle', 'SELECT id FROM articles WHERE id = ? FOR UPDATE', [articleId], db);
    return rows.length > 0;
  };
}

module.exports = makeLockArticle;
