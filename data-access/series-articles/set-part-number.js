function makeSetPartNumber({ runQuery }) {
  return async function setPartNumber({ seriesId, articleId, partNumber, db }) {
    await runQuery('setPartNumber', `
      UPDATE series_articles SET part_number = ? WHERE series_id = ? AND article_id = ?
    `, [partNumber, seriesId, articleId], db);
  };
}

module.exports = makeSetPartNumber;
