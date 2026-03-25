const { NotFoundError } = require('../../exceptions');
const { presentArticleDetail } = require('./article-presenter');

function makeGetArticleByIdUsecase({ dataAccess }) {
  return async function getArticleByIdUsecase({ id }) {
    const article = await dataAccess.articles.getArticleById({ id });

    if (!article) {
      throw new NotFoundError(`Article not found for id ${id}`);
    }

    return presentArticleDetail(article);
  };
}

module.exports = makeGetArticleByIdUsecase;
