const test = require('node:test');
const assert = require('node:assert/strict');
const makeGetArticleBySlugUsecase = require('../usecases/articles/get-article-by-slug');
const { buildSlug } = require('../usecases/articles/article-presenter');
const { NotFoundError } = require('../exceptions');

function build(rows) {
  const calls = [];
  const usecase = makeGetArticleBySlugUsecase({
    dataAccess: { articles: { getArticleTitles: async () => rows } },
    buildSlug,
    getArticleById: async (args) => (calls.push(args), { id: args.id }),
    NotFoundError,
  });
  return { usecase, calls };
}

test('resolves a slug derived from the title to the article', async () => {
  const { usecase, calls } = build([{ id: 1, title: 'Other' }, { id: 7, title: 'KEDA & Kubernetes: Scaling!' }]);

  const article = await usecase({ slug: 'keda-kubernetes-scaling' });

  assert.deepEqual(article, { id: 7 });
  assert.deepEqual(calls, [{ id: 7, includeDrafts: false }]);
});

test('throws NotFoundError when no title matches the slug', async () => {
  const { usecase } = build([{ id: 1, title: 'Other' }]);

  await assert.rejects(usecase({ slug: 'missing' }), NotFoundError);
});
