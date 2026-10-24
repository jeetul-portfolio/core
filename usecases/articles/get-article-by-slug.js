// ponytail: slugs are derived from titles (no column), so this scans id+title of every article;
// add an indexed slug column if the article count grows large.
function makeGetArticleBySlugUsecase({ dataAccess, buildSlug, getArticleById, NotFoundError }) {
  return async function getArticleBySlugUsecase({ slug, includeDrafts = false }) {
    const articles = await dataAccess.articles.getArticleTitles({ includeDrafts });
    const match = articles.find((article) => buildSlug(article.title) === slug);

    if (!match) {
      throw new NotFoundError(`Article not found for slug ${slug}`);
    }

    return getArticleById({ id: match.id, includeDrafts });
  };
}

module.exports = makeGetArticleBySlugUsecase;
