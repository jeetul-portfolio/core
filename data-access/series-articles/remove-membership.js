function makeRemoveMembership({ runQuery }) {
  return async function removeMembership({ seriesId, articleId, db }) {
    const result = await runQuery('removeMembership', `
      DELETE FROM series_articles WHERE series_id = ? AND article_id = ?
    `, [seriesId, articleId], db);
    return result.affectedRows > 0;
  };
}

module.exports = makeRemoveMembership;
