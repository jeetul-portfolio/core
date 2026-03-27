const { NotFoundError } = require('../../exceptions');
const { presentArticleDetail } = require('./article-presenter');

function makeGetArticleByIdUsecase({ dataAccess }) {
  return async function getArticleByIdUsecase({ id, includeDrafts = false }) {
    const article = await dataAccess.articles.getArticleById({ id, includeDrafts });

    if (!article) {
      throw new NotFoundError(`Article not found for id ${id}`);
    }

    return presentArticleDetail(article);
  };
}

module.exports = makeGetArticleByIdUsecase;
