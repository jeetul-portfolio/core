const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jwt = require('jsonwebtoken');

const buildSeriesController = require('../controllers/series');
const buildArticlesController = require('../controllers/articles');
const contentRecordsRoutes = require('../routes/content-records-routes');
const seriesArticlesRoutes = require('../routes/series-articles-routes');
const articlesRoutes = require('../routes/articles-routes');
const makeAuthenticate = require('../middlewares/authenticate');
const makeAuthorize = require('../middlewares/authorize');
const { formatResponse, formatError } = require('../controllers/response-formatter');
const { AuthenticationError, ForbiddenError } = require('../exceptions');

const SECRET = 'test-secret';
const logger = { error: () => {}, info: () => {} };

// Usecase stubs record the validated input each route hands over.
function makeUsecase() {
  const calls = [];
  const record = (name) => async (input) => (calls.push([name, input]), { name, input });
  return {
    calls,
    usecase: {
      seriesUsecase: {
        list: record('list'),
        get: record('get'),
        create: record('create'),
        assignArticle: record('assignArticle'),
        removeArticle: record('removeArticle'),
        reorderParts: record('reorderParts'),
        getArticleSeries: record('getArticleSeries'),
      },
      articlesUsecase: {
        getArticles: record('getArticles'),
        updateArticle: record('updateArticle'),
        addArticleCategories: record('addArticleCategories'),
        removeArticleCategory: record('removeArticleCategory'),
      },
    },
  };
}

async function startApp() {
  const { usecase, calls } = makeUsecase();
  const controllerDeps = { usecase, formatResponse, formatError, logger };
  const controller = {
    seriesController: buildSeriesController(controllerDeps),
    articlesController: buildArticlesController(controllerDeps),
  };
  const middlewares = {
    authenticate: makeAuthenticate({
      jwt,
      config: { auth: { accessTokenSecret: SECRET } },
      AuthenticationError,
      dataAccess: { users: { findUserById: async ({ id }) => ({ id, isActive: true, updatedAt: new Date(0) }) } },
    }),
    authorize: makeAuthorize({ ForbiddenError }),
  };
  const app = express();
  app.use(express.json());
  app.use(contentRecordsRoutes({ router: express.Router(), middlewares, controller: controller.seriesController, resource: 'series' }));
  app.use(seriesArticlesRoutes({ router: express.Router(), middlewares, controller }));
  app.use(articlesRoutes({ router: express.Router(), middlewares, controller }));
  const server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  const base = `http://127.0.0.1:${server.address().port}`;

  const call = async (method, path, { body, as } = {}) => {
    const headers = { 'content-type': 'application/json' };
    if (as) headers.authorization = `Bearer ${jwt.sign({ sub: 1, roles: [as] }, SECRET)}`;
    const res = await fetch(`${base}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
    const json = await res.json();
    return { status: res.status, data: json.Data };
  };

  return { call, calls, close: () => server.close() };
}

test('series membership writes are admin/service only', async (t) => {
  const app = await startApp();
  t.after(app.close);

  assert.equal((await app.call('PUT', '/series/1/articles/2', { body: { partNumber: 1 } })).status, 401);
  assert.equal((await app.call('PUT', '/series/1/articles/2', { body: { partNumber: 1 }, as: 'editor' })).status, 403);
  assert.equal((await app.call('DELETE', '/series/1/articles/2', { as: 'editor' })).status, 403);
  assert.equal((await app.call('PUT', '/series/1/parts/order', { body: { articleIds: [1] }, as: 'editor' })).status, 403);
  assert.equal((await app.call('GET', '/admin/articles/2/series')).status, 401);
  assert.equal((await app.call('POST', '/series', { body: { title: 'S' }, as: 'editor' })).status, 403);
  assert.equal(app.calls.length, 0);
});

test('assign validates part numbers before reaching the usecase', async (t) => {
  const app = await startApp();
  t.after(app.close);

  for (const partNumber of [0, -1, 1.5, 'two']) {
    assert.equal((await app.call('PUT', '/series/1/articles/2', { body: { partNumber }, as: 'admin' })).status, 400, `${partNumber}`);
  }
  assert.equal((await app.call('PUT', '/series/x/articles/2', { body: {}, as: 'admin' })).status, 400);
  assert.equal(app.calls.length, 0);

  await app.call('PUT', '/series/1/articles/2', { body: {}, as: 'admin' });
  await app.call('PUT', '/series/1/articles/3', { body: { partNumber: 2, reassign: true }, as: 'admin' });
  assert.deepEqual(app.calls, [
    ['assignArticle', { seriesId: 1, articleId: 2, partNumber: null, reassign: false }],
    ['assignArticle', { seriesId: 1, articleId: 3, partNumber: 2, reassign: true }],
  ]);
});

test('reorder requires unique positive article ids', async (t) => {
  const app = await startApp();
  t.after(app.close);

  assert.equal((await app.call('PUT', '/series/1/parts/order', { body: { articleIds: [] }, as: 'admin' })).status, 400);
  assert.equal((await app.call('PUT', '/series/1/parts/order', { body: { articleIds: [2, 2] }, as: 'admin' })).status, 400);
  const ok = await app.call('PUT', '/series/1/parts/order', { body: { articleIds: [3, 2] }, as: 'admin' });
  assert.equal(ok.status, 200);
  assert.deepEqual(app.calls.at(-1), ['reorderParts', { seriesId: 1, articleIds: [3, 2] }]);
});

test('public reads are published-only; admin reads include drafts', async (t) => {
  const app = await startApp();
  t.after(app.close);

  await app.call('GET', '/articles/5/series');
  await app.call('GET', '/admin/articles/5/series', { as: 'admin' });
  await app.call('GET', '/series/internals');
  assert.deepEqual(app.calls, [
    ['getArticleSeries', { articleId: 5, publishedOnly: true }],
    ['getArticleSeries', { articleId: 5, publishedOnly: false }],
    ['get', { slug: 'internals', publishedOnly: true }],
  ]);
});

test('article category routes and filters', async (t) => {
  const app = await startApp();
  t.after(app.close);

  assert.equal((await app.call('POST', '/articles/1/categories', { body: { categoryIds: [2] } })).status, 401);
  assert.equal((await app.call('POST', '/articles/1/categories', { body: { categoryIds: [] }, as: 'editor' })).status, 400);
  assert.equal((await app.call('POST', '/articles/1/categories', { body: { categoryIds: [2, 3] }, as: 'editor' })).status, 200);
  assert.equal((await app.call('DELETE', '/articles/1/categories/3', { as: 'editor' })).status, 200);
  assert.equal((await app.call('PUT', '/articles/1', { body: { categoryIds: [4] }, as: 'editor' })).status, 200);
  assert.equal((await app.call('GET', '/articles?category=Bad%20Slug')).status, 400);
  await app.call('GET', '/articles?category=distributed-systems&series=internals');

  assert.deepEqual(app.calls.map(([name]) => name), ['addArticleCategories', 'removeArticleCategory', 'updateArticle', 'getArticles']);
  assert.deepEqual(app.calls[2][1], { id: 1, categoryIds: [4] });
  assert.equal(app.calls[3][1].category, 'distributed-systems');
  assert.equal(app.calls[3][1].series, 'internals');
});
