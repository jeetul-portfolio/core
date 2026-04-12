const { NotFoundError } = require('../../exceptions');

function makeDeleteArticleUsecase({ dataAccess, syncEntityTags }) {
  return async function deleteArticleUsecase({ id }) {
    const deleted = await dataAccess.articles.deleteArticle({ id });

    if (!deleted) {
      throw new NotFoundError(`Article not found for id ${id}`);
    }

    if (syncEntityTags) {
      await dataAccess.tagReferences.deleteByEntity({ entityType: 'article', entityId: id });
    }

    return {
      id,
      deleted: true,
    };
  };
}

module.exports = makeDeleteArticleUsecase;
