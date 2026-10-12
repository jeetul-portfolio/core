const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jwt = require('jsonwebtoken');

const buildExperiencesUsecase = require('../usecases/experiences');
const buildProjectsUsecase = require('../usecases/projects');
const buildExperiencesController = require('../controllers/experiences');
const buildProjectsController = require('../controllers/projects');
const contentRecordsRoutes = require('../routes/content-records-routes');
const makeAuthenticate = require('../middlewares/authenticate');
const makeAuthorize = require('../middlewares/authorize');
const { formatResponse, formatError } = require('../controllers/response-formatter');
const { AuthenticationError, ForbiddenError, ConflictError } = require('../exceptions');

const SECRET = 'test-secret';
const logger = { error: () => {}, info: () => {} };

// In-memory stand-in for a content-records table: unique slug, status filter, sort order.
function makeStore() {
  const rows = new Map();
  let nextId = 1;
  return {
    rows,
    list: async ({ publishedOnly, status, featured } = {}) => [...rows.values()]
      .filter((r) => (publishedOnly ? r.status === 'published' : !status || r.status === status))
      .filter((r) => featured === undefined || Boolean(r.isFeatured) === featured)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0) || b.id - a.id)
      .map((r) => ({ ...r })),
    getByIdOrSlug: async ({ id, slug, publishedOnly }) => {
      const row = [...rows.values()].find((r) => (id ? r.id === id : r.slug === slug));
      if (!row || (publishedOnly && row.status !== 'published')) return null;
      return { ...row };
    },
    getByIds: async ({ ids }) => ids.filter((id) => rows.has(id)).map((id) => ({ ...rows.get(id) })),
    slugExists: async ({ slug, excludeId = 0 }) => [...rows.values()].some((r) => r.slug === slug && r.id !== excludeId),
    create: async (payload) => {
      if ([...rows.values()].some((r) => r.slug === payload.slug)) throw new ConflictError('dup');
      const id = nextId++;
      rows.set(id, { status: 'draft', sortOrder: 0, ...payload, id, createdAt: new Date(), updatedAt: new Date() });
      return { id };
    },
    update: async ({ id, ...patch }) => {
      rows.set(id, { ...rows.get(id), ...patch, updatedAt: new Date() });
      return true;
    },
    remove: async ({ id }) => rows.delete(id),
    reorder: async ({ ids }) => ids.forEach((id, index) => rows.set(id, { ...rows.get(id), sortOrder: index })),
  };
}

function makeDataAccess() {
  let skillRefs = [];
  let tagRefs = [];
  const skills = [{ id: 1, name: 'Go' }, { id: 2, name: 'MySQL' }];
  const dataAccess = {
    experiences: makeStore(),
    projects: makeStore(),
    skills: { getSkillsByIds: async ({ ids }) => skills.filter((s) => ids.includes(s.id)) },
    skillReferences: {
      getSkillsForReferences: async ({ type, referenceIds }) => skillRefs
        .filter((r) => r.type === type && referenceIds.includes(r.referenceId))
        .map((r) => ({ referenceId: r.referenceId, ...skills.find((s) => s.id === r.skillId) })),
      replaceForReference: async ({ type, referenceId, skillIds }) => {
        skillRefs = [
          ...skillRefs.filter((r) => !(r.type === type && r.referenceId === referenceId)),
          ...skillIds.map((skillId) => ({ type, referenceId, skillId })),
        ];
      },
    },
    tagReferences: {
      deleteByEntity: async ({ entityType, entityId }) => {
        tagRefs = tagRefs.filter((r) => !(r.entityType === entityType && r.entityId === entityId));
      },
    },
    users: { findUserById: async ({ id }) => ({ id, isActive: true, updatedAt: new Date(0) }) },
  };
  const syncEntityTags = async ({ entityType, entityId, explicitTags }) => {
    tagRefs = [
      ...tagRefs.filter((r) => !(r.entityType === entityType && r.entityId === entityId)),
      ...explicitTags.map((tag) => ({ entityType, entityId, tag })),
    ];
  };
  return { dataAccess, syncEntityTags, tagRefs: () => tagRefs };
}

async function startApp() {
  const env = makeDataAccess();
  const usecase = {
    experiencesUsecase: buildExperiencesUsecase(env),
    projectsUsecase: buildProjectsUsecase(env),
  };
  const deps = { usecase, formatResponse, formatError, logger };
  const middlewares = {
    authenticate: makeAuthenticate({ jwt, config: { auth: { accessTokenSecret: SECRET } }, AuthenticationError, dataAccess: env.dataAccess }),
    authorize: makeAuthorize({ ForbiddenError }),
  };
  const app = express();
  app.use(express.json());
  app.use(contentRecordsRoutes({ router: express.Router(), middlewares, controller: buildExperiencesController(deps), resource: 'experiences' }));
  app.use(contentRecordsRoutes({ router: express.Router(), middlewares, controller: buildProjectsController(deps), resource: 'projects' }));
  const server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  const base = `http://127.0.0.1:${server.address().port}`;

  const call = async (method, path, { body, as } = {}) => {
    const headers = { 'content-type': 'application/json' };
    if (as === 'admin') headers.authorization = `Bearer ${jwt.sign({ sub: 1, roles: ['admin'] }, SECRET)}`;
    if (as === 'editor') headers.authorization = `Bearer ${jwt.sign({ sub: 1, roles: ['editor'] }, SECRET)}`;
    if (as === 'service') headers['x-internal-scopes'] = 'portfolio:admin';
    const res = await fetch(`${base}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
    const json = await res.json();
    return { status: res.status, data: json.Data, error: json.Data };
  };

  return { call, env, close: () => server.close() };
}

test('writes require an admin or service caller', async (t) => {
  const app = await startApp();
  t.after(app.close);

  assert.equal((await app.call('POST', '/projects', { body: { title: 'X' } })).status, 401);
  assert.equal((await app.call('POST', '/projects', { body: { title: 'X' }, as: 'editor' })).status, 403);
  assert.equal((await app.call('GET', '/admin/projects')).status, 401);
  assert.equal((await app.call('POST', '/projects', { body: { title: 'X' }, as: 'service' })).status, 201);
  assert.equal((await app.call('POST', '/projects', { body: { title: 'Y' }, as: 'admin' })).status, 201);
});

test('drafts are hidden publicly until published, then hidden again on unpublish', async (t) => {
  const app = await startApp();
  t.after(app.close);

  const created = await app.call('POST', '/projects', { body: { title: 'Realtime Engine', tags: ['Data', 'data'] }, as: 'admin' });
  assert.equal(created.data.status, 'draft');
  assert.equal(created.data.slug, 'realtime-engine');
  assert.deepEqual(created.data.tags, ['Data']);

  assert.deepEqual((await app.call('GET', '/projects')).data, []);
  assert.equal((await app.call('GET', '/projects/realtime-engine')).status, 404);
  assert.equal((await app.call('GET', '/admin/projects/realtime-engine', { as: 'admin' })).status, 200);
  assert.equal(app.env.tagRefs().length, 0, 'drafts are not tag-indexed');

  const published = await app.call('PATCH', `/projects/${created.data.id}/publish`, { body: { action: 'publish' }, as: 'admin' });
  assert.equal(published.data.status, 'published');
  assert.ok(published.data.publishedAt);
  assert.equal((await app.call('GET', '/projects/realtime-engine')).data.title, 'Realtime Engine');
  assert.equal(app.env.tagRefs().length, 1);

  await app.call('PATCH', `/projects/${created.data.id}/publish`, { body: { action: 'unpublish' }, as: 'admin' });
  assert.equal((await app.call('GET', `/projects/${created.data.id}`)).status, 404);
  assert.equal(app.env.tagRefs().length, 0);
});

test('slugs are generated uniquely; explicit duplicates conflict', async (t) => {
  const app = await startApp();
  t.after(app.close);

  const a = await app.call('POST', '/experiences', { body: { role: 'Backend Engineer', company: 'Acme' }, as: 'admin' });
  const b = await app.call('POST', '/experiences', { body: { role: 'Backend Engineer', company: 'Acme' }, as: 'admin' });
  assert.equal(a.data.slug, 'backend-engineer-acme');
  assert.equal(b.data.slug, 'backend-engineer-acme-2');

  const dup = await app.call('PUT', `/experiences/${b.data.id}`, { body: { slug: 'backend-engineer-acme' }, as: 'admin' });
  assert.equal(dup.status, 409);
  const bad = await app.call('POST', '/experiences', { body: { role: 'R', company: 'C', slug: 'Bad Slug' }, as: 'admin' });
  assert.equal(bad.status, 400);
});

test('experience validation: required fields, dates, urls, skills', async (t) => {
  const app = await startApp();
  t.after(app.close);
  const post = (body) => app.call('POST', '/experiences', { body, as: 'admin' });

  assert.equal((await post({ role: 'R' })).status, 400);
  assert.equal((await post({ role: 'R', company: 'C', startDate: '2024-02-30' })).status, 400);
  assert.equal((await post({ role: 'R', company: 'C', startDate: '2024-05-01', endDate: '2024-01-01' })).status, 400);
  assert.equal((await post({ role: 'R', company: 'C', companyUrl: 'javascript:alert(1)' })).status, 400);
  assert.equal((await post({ role: 'R', company: 'C', skillIds: [99] })).status, 400);
  assert.equal((await post({ role: 'R', company: 'C', unknownField: 1 })).status, 400);

  const ok = await post({
    role: 'R', company: 'C', startDate: '2023-01-01', endDate: '2024-01-01', isCurrent: true,
    skillIds: [2], achievements: ['Shipped'], companyUrl: '',
  });
  assert.equal(ok.status, 201);
  assert.equal(ok.data.endDate, null, 'current role drops endDate');
  assert.equal(ok.data.companyUrl, null);
  assert.deepEqual(ok.data.skills, [{ id: 2, name: 'MySQL' }]);
  assert.deepEqual(ok.data.achievements, ['Shipped']);

  const emptyUpdate = await app.call('PUT', `/experiences/${ok.data.id}`, { body: {}, as: 'admin' });
  assert.equal(emptyUpdate.status, 400);
  assert.match(emptyUpdate.error.message, /at least one field/);
});

test('update changes only supplied fields; delete removes record and links', async (t) => {
  const app = await startApp();
  t.after(app.close);

  const { data } = await app.call('POST', '/projects', { body: { title: 'P', summary: 'S', skillIds: [1] }, as: 'admin' });
  const updated = await app.call('PUT', `/projects/${data.id}`, { body: { title: 'P2' }, as: 'admin' });
  assert.equal(updated.data.title, 'P2');
  assert.equal(updated.data.summary, 'S');
  assert.equal(updated.data.slug, 'p', 'slug is stable across title edits');
  assert.deepEqual(updated.data.skills, [{ id: 1, name: 'Go' }]);

  const removed = await app.call('DELETE', `/projects/${data.id}`, { as: 'admin' });
  assert.deepEqual(removed.data, { id: data.id, deleted: true });
  assert.equal((await app.call('DELETE', `/projects/${data.id}`, { as: 'admin' })).status, 404);
  assert.equal((await app.call('PUT', '/projects/999', { body: { title: 'x' }, as: 'admin' })).status, 404);
});

test('reorder sets display order and rejects unknown ids', async (t) => {
  const app = await startApp();
  t.after(app.close);

  const ids = [];
  for (const title of ['A', 'B', 'C']) {
    ids.push((await app.call('POST', '/projects', { body: { title, status: 'published' }, as: 'admin' })).data.id);
  }
  const res = await app.call('PUT', '/projects/reorder', { body: { ids: [ids[1], ids[2], ids[0]] }, as: 'admin' });
  assert.equal(res.status, 200);
  assert.deepEqual((await app.call('GET', '/projects')).data.map((p) => p.title), ['B', 'C', 'A']);

  assert.equal((await app.call('PUT', '/projects/reorder', { body: { ids: [ids[0], 999] }, as: 'admin' })).status, 404);
  assert.equal((await app.call('PUT', '/projects/reorder', { body: { ids: [1, 1] }, as: 'admin' })).status, 400);
  assert.equal((await app.call('PUT', '/projects/reorder', { body: { ids: [1] } })).status, 401);
});

test('invalid id-or-slug path params are rejected', async (t) => {
  const app = await startApp();
  t.after(app.close);
  assert.equal((await app.call('GET', '/projects/Not_A_Slug')).status, 400);
  assert.equal((await app.call('GET', '/projects/-bad-')).status, 400);
});

test('project links: many per type, validated, replaced as a whole list', async (t) => {
  const app = await startApp();
  t.after(app.close);
  const post = (links) => app.call('POST', '/projects', { body: { title: `P ${Math.random()}`, links }, as: 'admin' });

  const links = [
    { type: 'repository', label: 'Backend (Go)', url: 'https://github.com/acme/api' },
    { type: 'repository', label: 'Frontend (React)', url: 'https://github.com/acme/web' },
    { type: 'demo', label: 'Production', url: 'https://app.example.com' },
    { type: 'demo', label: 'Staging', url: 'https://staging.example.com' },
    { label: 'Talk', url: 'https://youtube.com/watch?v=1' },
  ];
  const created = await post(links);
  assert.equal(created.status, 201);
  assert.equal(created.data.links.length, 5);
  assert.equal(created.data.links.filter((l) => l.type === 'repository').length, 2);
  assert.equal(created.data.links[4].type, 'other', 'type defaults to other');

  assert.equal((await post([{ type: 'blog', label: 'x', url: 'https://x.y' }])).status, 400, 'unknown type');
  assert.equal((await post([{ type: 'demo', url: 'https://x.y' }])).status, 400, 'label required');
  assert.equal((await post([{ type: 'demo', label: 'x', url: 'javascript:alert(1)' }])).status, 400, 'http(s) only');
  assert.equal((await post([{ type: 'demo', label: 'x', url: '' }])).status, 400, 'url required');
  assert.equal((await post(Array.from({ length: 21 }, (_, i) => ({ label: `l${i}`, url: `https://x.y/${i}` })))).status, 400, 'max 20');

  const replaced = await app.call('PUT', `/projects/${created.data.id}`, {
    body: { links: [{ type: 'documentation', label: 'Docs', url: 'https://docs.example.com' }] },
    as: 'admin',
  });
  assert.deepEqual(replaced.data.links, [{ type: 'documentation', label: 'Docs', url: 'https://docs.example.com' }]);

  const cleared = await app.call('PUT', `/projects/${created.data.id}`, { body: { links: [] }, as: 'admin' });
  assert.deepEqual(cleared.data.links, []);
});
