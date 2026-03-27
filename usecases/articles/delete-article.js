const { NotFoundError } = require('../../exceptions');

function makeDeleteArticleUsecase({ dataAccess }) {
  return async function deleteArticleUsecase({ id }) {
    const deleted = await dataAccess.articles.deleteArticle({ id });

    if (!deleted) {
      throw new NotFoundError(`Article not found for id ${id}`);
    }

    return {
      id,
      deleted: true,
    };
  };
}

module.exports = makeDeleteArticleUsecase;
