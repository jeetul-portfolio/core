const test = require('node:test');
const assert = require('node:assert/strict');
const Joi = require('joi');

const buildArticlesUsecase = require('../usecases/articles');
const buildTagsUsecase = require('../usecases/tags');
const makeUpsertReferences = require('../data-access/tag-references/upsert-references');
const makeCreateArticleController = require('../controllers/articles/create-article');
const makeUpdateArticleController = require('../controllers/articles/update-article');

// In-memory stand-in for MySQL: unique tags.slug, unique (tag_id, entity_type, entity_id),
// NOT NULL author_name — the constraints the real schema enforces.
function makeDb({ seedTags = [] } = {}) {
  const articles = new Map();
  const tags = new Map(seedTags.map((t, i) => [i + 1, { id: i + 1, ...t }]));
  let refs = [];
  let nextArticleId = 1;
  let nextTagId = tags.size + 1;
  const fail = { upsert: false };

  const dataAccess = {
    articles: {
      createArticle: async (row) => {
        if (row.authorName == null) throw new Error("Column 'author_name' cannot be null");
        const id = nextArticleId++;
        articles.set(id, { id, ...row, createdAt: new Date(), updatedAt: new Date() });
        return { id };
      },
      getArticleById: async ({ id }) => (articles.has(id) ? { ...articles.get(id) } : null),
      updateArticle: async ({ id, ...patch }) => {
        if (!articles.has(id)) return false;
        if ('authorName' in patch && patch.authorName == null) throw new Error("Column 'author_name' cannot be null");
        articles.set(id, { ...articles.get(id), ...patch, updatedAt: new Date() });
        return true;
      },
      deleteArticle: async ({ id }) => articles.delete(id),
    },
    tags: {
      findOrCreateTag: async ({ name, slug }) => {
        const existing = [...tags.values()].find((t) => t.slug === slug);
        if (existing) return existing.id;
        const id = nextTagId++;
        tags.set(id, { id, name, slug });
        return id;
      },
    },
    tagReferences: {
      upsertReferences: async ({ entityType, entityId, tagIds }) => {
        if (fail.upsert) throw new Error('simulated association failure');
        const kept = refs.filter((r) => !(r.entityType === entityType && r.entityId === entityId));
        const unique = [...new Set(tagIds)].map((tagId) => ({ tagId, entityType, entityId }));
        refs = [...kept, ...unique];
      },
      deleteByEntity: async ({ entityType, entityId }) => {
        refs = refs.filter((r) => !(r.entityType === entityType && r.entityId === entityId));
      },
    },
  };

  const slugsFor = (entityId) => refs
    .filter((r) => r.entityType === 'article' && r.entityId === entityId)
    .map((r) => tags.get(r.tagId).slug)
    .sort();
  // Mirrors get-tags.js: COUNT(tag_references) per tag.
  const usage = (slug) => {
    const tag = [...tags.values()].find((t) => t.slug === slug);
    return tag ? refs.filter((r) => r.tagId === tag.id).length : null;
  };

  return { dataAccess, articles, tags, fail, slugsFor, usage, refCount: () => refs.length };
}

function build(db) {
  const { syncEntityTags } = buildTagsUsecase({ dataAccess: db.dataAccess });
  return buildArticlesUsecase({ dataAccess: db.dataAccess, syncEntityTags });
}

const ARTICLE_13_TAGS = ['Kubernetes', 'Cloud Native', 'KEDA', 'Distributed Systems', 'NATS JetStream', 'GitOps'];
const SEEDED = ['kubernetes', 'cloud-native', 'keda', 'distributed-systems'].map((s) => ({ name: s, slug: s }));

test('create with existing tags reuses tag records', async () => {
  const db = makeDb({ seedTags: SEEDED });
  const a = await build(db).createArticle({ title: 't', content: 'c', authorName: 'Jeetul Samaiya', tags: ['Kubernetes', 'KEDA'] });
  assert.deepEqual(db.slugsFor(a.id), ['keda', 'kubernetes']);
  assert.equal(db.tags.size, SEEDED.length);
});

test('create with unknown tags creates them', async () => {
  const db = makeDb();
  const a = await build(db).createArticle({ title: 't', content: 'c', authorName: 'A', tags: ['NATS JetStream', 'GitOps'] });
  assert.deepEqual(db.slugsFor(a.id), ['gitops', 'nats-jetstream']);
});

test('create with mixed existing and new tags associates all six (article 13 shape)', async () => {
  const db = makeDb({ seedTags: SEEDED });
  const a = await build(db).createArticle({ title: 't', content: 'c', authorName: 'Jeetul Samaiya', tags: ARTICLE_13_TAGS, status: 'draft' });
  assert.deepEqual(db.slugsFor(a.id), ['cloud-native', 'distributed-systems', 'gitops', 'keda', 'kubernetes', 'nats-jetstream']);
  assert.equal(db.tags.size, 6);
  assert.deepEqual(a.tags, ARTICLE_13_TAGS);
  assert.equal(a.status, 'draft');
});

test('duplicate tags differing by case/spacing collapse to one tag and one association', async () => {
  const db = makeDb();
  const a = await build(db).createArticle({
    title: 't', content: 'c', authorName: 'A', tags: ['NATS JetStream', 'nats jetstream', '  NATS   JetStream ', 'gitops', 'GitOps'],
  });
  assert.deepEqual(a.tags, ['NATS JetStream', 'gitops']);
  assert.deepEqual(db.slugsFor(a.id), ['gitops', 'nats-jetstream']);
  assert.equal(db.tags.size, 2);
});

test('content-only update keeps tag associations (the article 13 bug)', async () => {
  const db = makeDb({ seedTags: SEEDED });
  const uc = build(db);
  const a = await uc.createArticle({ title: 't', content: 'c', authorName: 'Jeetul Samaiya', tags: ARTICLE_13_TAGS });
  const before = db.slugsFor(a.id);

  const updated = await uc.updateArticle({ id: a.id, content: '<p>new html</p>', excerpt: 'new' });

  assert.deepEqual(db.slugsFor(a.id), before);
  assert.deepEqual(updated.tags, ARTICLE_13_TAGS);
});

test('update without authorName preserves author and avatar', async () => {
  const db = makeDb();
  const uc = build(db);
  const a = await uc.createArticle({ title: 't', content: 'c', authorName: 'Jeetul Samaiya', authorAvatar: 'https://x/a.png' });
  const updated = await uc.updateArticle({ id: a.id, content: 'new', excerpt: 'e' });
  assert.equal(updated.authorName, 'Jeetul Samaiya');
  assert.equal(updated.authorAvatarUrl, 'https://x/a.png');
});

test('explicit authorName / authorAvatar are applied; null avatar clears it', async () => {
  const db = makeDb();
  const uc = build(db);
  const a = await uc.createArticle({ title: 't', content: 'c', authorName: 'Old', authorAvatar: 'https://x/a.png' });
  const updated = await uc.updateArticle({ id: a.id, authorName: 'New', authorAvatar: null });
  assert.equal(updated.authorName, 'New');
  assert.equal(updated.authorAvatarUrl, null);
});

test('replacing tags removes dropped associations', async () => {
  const db = makeDb();
  const uc = build(db);
  const a = await uc.createArticle({ title: 't', content: 'c', authorName: 'A', tags: ['a', 'b', 'c'] });
  await uc.updateArticle({ id: a.id, tags: ['b', 'd'] });
  assert.deepEqual(db.slugsFor(a.id), ['b', 'd']);
  assert.equal(db.usage('a'), 0);
});

test('tags: [] removes all associations', async () => {
  const db = makeDb();
  const uc = build(db);
  const a = await uc.createArticle({ title: 't', content: 'c', authorName: 'A', tags: ['a', 'b'] });
  const updated = await uc.updateArticle({ id: a.id, tags: [] });
  assert.deepEqual(db.slugsFor(a.id), []);
  assert.deepEqual(updated.tags, []);
});

test('usage counts track create, update and delete', async () => {
  const db = makeDb();
  const uc = build(db);
  const a = await uc.createArticle({ title: 't', content: 'c', authorName: 'A', tags: ['k8s', 'nats'] });
  const b = await uc.createArticle({ title: 't2', content: 'c', authorName: 'A', tags: ['k8s'] });
  assert.equal(db.usage('k8s'), 2);
  assert.equal(db.usage('nats'), 1);

  await uc.updateArticle({ id: a.id, tags: ['nats'] });
  assert.equal(db.usage('k8s'), 1);

  await uc.deleteArticle({ id: b.id });
  assert.equal(db.usage('k8s'), 0);
  assert.equal(db.usage('nats'), 1);
});

test('retrying the same update creates no duplicate tags or associations', async () => {
  const db = makeDb();
  const uc = build(db);
  const a = await uc.createArticle({ title: 't', content: 'c', authorName: 'A', tags: ARTICLE_13_TAGS });
  for (let i = 0; i < 3; i += 1) {
    await uc.updateArticle({ id: a.id, tags: ARTICLE_13_TAGS, content: 'c2' });
  }
  assert.equal(db.tags.size, 6);
  assert.equal(db.refCount(), 6);
});

test('##refs in content are associated on create and update alike', async () => {
  const db = makeDb();
  const uc = build(db);
  const a = await uc.createArticle({ title: 't', content: 'see ##helm', authorName: 'A', tags: ['k8s'] });
  assert.deepEqual(db.slugsFor(a.id), ['helm', 'k8s']);
  await uc.updateArticle({ id: a.id, content: 'see ##argo' });
  assert.deepEqual(db.slugsFor(a.id), ['argo', 'k8s']);
});

test('association failure on create leaves no article and no references', async () => {
  const db = makeDb();
  db.fail.upsert = true;
  await assert.rejects(
    build(db).createArticle({ title: 't', content: 'c', authorName: 'A', tags: ['x'] }),
    /simulated association failure/,
  );
  assert.equal(db.articles.size, 0);
  assert.equal(db.refCount(), 0);
});

test('upsertReferences rolls back delete when insert fails', async () => {
  const calls = [];
  const connection = {
    beginTransaction: async () => calls.push('begin'),
    query: async (sql) => {
      calls.push(sql.trim().split(/\s+/)[0]);
      if (sql.includes('INSERT')) throw new Error('insert failed');
    },
    commit: async () => calls.push('commit'),
    rollback: async () => calls.push('rollback'),
    release: () => calls.push('release'),
  };
  const upsert = makeUpsertReferences({
    logger: { error() {} },
    mysqlPool: { getConnection: async () => connection },
    tableName: 'tag_references',
  });

  await assert.rejects(upsert({ entityType: 'article', entityId: 13, tagIds: [1, 1, 2] }), /insert failed/);
  assert.deepEqual(calls, ['begin', 'DELETE', 'INSERT', 'rollback', 'release']);
});

function runController(makeController, req) {
  let captured;
  const controller = makeController({
    usecase: { articlesUsecase: { createArticle: async (i) => i, updateArticle: async (i) => i } },
    formatResponse: (_res, { body }) => { captured = { ok: true, body }; },
    formatError: (_res, { error }) => { captured = { ok: false, error }; },
    logger: { error() {} },
    Joi,
    ValidationError: class ValidationError extends Error {},
  });
  return controller(req, {}).then(() => captured);
}

test('create rejects missing authorName with a validation error, not a DB error', async () => {
  const r = await runController(makeCreateArticleController, { body: { title: 't', content: 'c' } });
  assert.equal(r.ok, false);
  assert.match(r.error.message, /authorName/);
});

test('update controller does not inject authorName when omitted', async () => {
  const r = await runController(makeUpdateArticleController, { params: { id: '13' }, body: { content: 'x' } });
  assert.equal(r.ok, true);
  assert.equal(Object.prototype.hasOwnProperty.call(r.body, 'authorName'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(r.body, 'tags'), false);
});
