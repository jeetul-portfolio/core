/**
 * Integration tests for article categories and series against a real, migrated MySQL 8.
 * Opt-in: set INTEGRATION_MYSQL_HOST/PORT/USER/PASSWORD/DATABASE (never point this at production).
 * Only rows created here are touched; they are removed afterwards.
 */
const test = require('node:test');
const assert = require('node:assert/strict');

const baseConfig = require('../config');
const buildDataAccess = require('../data-access');
const buildUsecases = require('../usecases');
const { ConflictError, NotFoundError, ValidationError } = require('../exceptions');

const env = process.env;
const enabled = Boolean(env.INTEGRATION_MYSQL_HOST);
const RUN = `it${Date.now().toString(36)}`;

const logger = { error: () => {}, info: () => {} };

function setup() {
  const config = {
    ...baseConfig,
    mysql: {
      host: env.INTEGRATION_MYSQL_HOST,
      port: Number(env.INTEGRATION_MYSQL_PORT || 3306),
      user: env.INTEGRATION_MYSQL_USER || 'root',
      password: env.INTEGRATION_MYSQL_PASSWORD || '',
      database: env.INTEGRATION_MYSQL_DATABASE || 'portfolio',
      maxConnections: 10,
    },
  };
  const dataAccess = buildDataAccess({ config, logger });
  const usecase = buildUsecases({ dataAccess, config, logger });
  return { dataAccess, usecase };
}

test('categories and series against MySQL', { skip: !enabled && 'set INTEGRATION_MYSQL_HOST to run' }, async (t) => {
  const { dataAccess, usecase } = setup();
  const articles = usecase.articlesUsecase;
  const categories = usecase.categoriesUsecase;
  const series = usecase.seriesUsecase;
  const created = { articles: [], categories: [], series: [] };

  const newArticle = async (title, status = 'published') => {
    const article = await articles.createArticle({ title: `${RUN} ${title}`, content: `<p>${title}</p>`, authorName: 'Test', status });
    created.articles.push(article.id);
    return article;
  };
  const newSeries = async (title, status = 'published') => {
    const record = await series.create({ title: `${RUN} ${title}`, status });
    created.series.push(record.id);
    return record;
  };
  const statusOf = async (id) => (await dataAccess.articles.getArticleById({ id, includeDrafts: true })).status;

  t.after(async () => {
    for (const id of created.series) await dataAccess.series.remove({ id });
    for (const id of created.articles) await dataAccess.articles.deleteArticle({ id });
    for (const id of created.categories) await dataAccess.categories.deleteCategory({ id });
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  await t.test('categories: unique generated slugs, id-or-slug lookup, conflict on taken slug', async () => {
    const a = await categories.createCategory({ name: `${RUN} Distributed Systems` });
    const b = await categories.createCategory({ name: `${RUN} Databases`, slug: `${RUN}-db` });
    created.categories.push(a.id, b.id);

    assert.equal(a.slug, `${RUN}-distributed-systems`);
    assert.equal((await categories.getCategoryById({ slug: `${RUN}-db` })).id, b.id);
    await assert.rejects(categories.createCategory({ name: `${RUN} Other`, slug: `${RUN}-db` }), ConflictError);
    await assert.rejects(categories.updateCategory({ id: a.id, slug: `${RUN}-db` }), ConflictError);
  });

  await t.test('article categories: many-to-many, no duplicates, filtering, delete keeps articles', async () => {
    const [cat1, cat2] = await Promise.all([
      categories.createCategory({ name: `${RUN} Cat One` }),
      categories.createCategory({ name: `${RUN} Cat Two` }),
    ]);
    created.categories.push(cat1.id, cat2.id);

    const published = await newArticle('Categorised');
    const draft = await newArticle('Draft categorised', 'draft');

    const withBoth = await articles.updateArticle({ id: published.id, categoryIds: [cat1.id, cat2.id] });
    assert.deepEqual(withBoth.categories.map((c) => c.id).sort(), [cat1.id, cat2.id].sort());

    const again = await articles.addArticleCategories({ id: published.id, categoryIds: [cat1.id] });
    assert.equal(again.categories.length, 2, 'adding an existing link does not duplicate it');

    await articles.addArticleCategories({ id: draft.id, categoryIds: [cat1.id] });
    await assert.rejects(articles.addArticleCategories({ id: draft.id, categoryIds: [999999999] }), ValidationError);

    const publicList = await articles.getArticles({ category: cat1.slug, pageSize: 50 });
    assert.deepEqual(publicList.map((a) => a.id), [published.id], 'drafts are not listed publicly');
    const adminList = await articles.getArticles({ category: cat1.slug, includeDrafts: true, pageSize: 50 });
    assert.equal(adminList.length, 2);

    const counts = await categories.getCategories({ hasArticles: true, search: RUN });
    assert.equal(counts.find((c) => c.id === cat1.id).articleCount, 1, 'counts published articles only');

    const afterRemove = await articles.removeArticleCategory({ id: published.id, categoryId: cat2.id });
    assert.deepEqual(afterRemove.categories.map((c) => c.id), [cat1.id]);

    await categories.deleteCategory({ id: cat1.id });
    assert.ok(await dataAccess.articles.getArticleById({ id: published.id, includeDrafts: true }), 'article survives');
    assert.deepEqual((await articles.getArticleById({ id: published.id })).categories, []);
  });

  await t.test('series: invariants on part numbers and sequential membership', async () => {
    const s1 = await newSeries('Internals of Distributed Systems');
    const s2 = await newSeries('Messaging');
    const [a1, a2, a3] = [await newArticle('Consistent Hashing'), await newArticle('Bloom Filters'), await newArticle('Kafka vs NATS')];

    await assert.rejects(series.create({ title: 'dup', slug: s1.slug }), ConflictError, 'series slug is unique');

    await series.assignArticle({ seriesId: s1.id, articleId: a1.id, partNumber: 1 });
    await series.assignArticle({ seriesId: s1.id, articleId: a2.id, partNumber: 2 });

    await assert.rejects(series.assignArticle({ seriesId: s1.id, articleId: a3.id, partNumber: 2 }), ConflictError, 'part numbers unique per series');

    // Plain (non-sequential) association with another series is allowed.
    const membership = await series.assignArticle({ seriesId: s2.id, articleId: a1.id });
    assert.equal(membership.series.length, 2);
    assert.equal(membership.sequential.series.id, s1.id);

    await assert.rejects(
      series.assignArticle({ seriesId: s2.id, articleId: a1.id, partNumber: 1 }),
      ConflictError,
      'an article is a numbered part of at most one series'
    );

    // Raw constraint check: the schema rejects it even without the usecase.
    await assert.rejects(
      dataAccess.seriesArticles.setPartNumber({ seriesId: s2.id, articleId: a1.id, partNumber: 5 }),
      ConflictError
    );
    await assert.rejects(
      dataAccess.seriesArticles.insertMembership({ seriesId: s2.id, articleId: a3.id, partNumber: 0 }),
      ValidationError,
      'CHECK rejects non-positive parts'
    );

    // Transactional reassignment: old membership becomes a plain association.
    const moved = await series.assignArticle({ seriesId: s2.id, articleId: a1.id, partNumber: 1, reassign: true });
    assert.equal(moved.sequential.series.id, s2.id);
    assert.equal(moved.series.find((s) => s.id === s1.id).partNumber, null);

    await assert.rejects(series.assignArticle({ seriesId: 999999999, articleId: a1.id }), NotFoundError);
  });

  await t.test('series: concurrent assignments leave exactly one winner', async () => {
    const s1 = await newSeries('Race A');
    const s2 = await newSeries('Race B');
    const [a1, a2] = [await newArticle('Racer 1'), await newArticle('Racer 2')];

    const samePart = await Promise.allSettled([
      series.assignArticle({ seriesId: s1.id, articleId: a1.id, partNumber: 1 }),
      series.assignArticle({ seriesId: s1.id, articleId: a2.id, partNumber: 1 }),
    ]);
    assert.equal(samePart.filter((r) => r.status === 'fulfilled').length, 1);
    assert.ok(samePart.find((r) => r.status === 'rejected').reason instanceof ConflictError);

    const twoSeries = await Promise.allSettled([
      series.assignArticle({ seriesId: s1.id, articleId: a2.id, partNumber: 7 }),
      series.assignArticle({ seriesId: s2.id, articleId: a2.id, partNumber: 1 }),
    ]);
    const sequentialRows = (await dataAccess.seriesArticles.listForArticle({ articleId: a2.id }))
      .filter((row) => row.partNumber !== null);
    assert.equal(sequentialRows.length, 1, 'still at most one sequential series');
    assert.ok(twoSeries.some((r) => r.status === 'fulfilled'));
  });

  await t.test('series: reorder, navigation, visibility, independent publishing, delete', async () => {
    const s = await newSeries('Ordered');
    const draftSeries = await newSeries('Hidden', 'draft');
    const p1 = await newArticle('Part one');
    const p2 = await newArticle('Part two (draft)', 'draft');
    const p3 = await newArticle('Part three');
    const extra = await newArticle('Related reading');

    for (const [article, part] of [[p1, 1], [p2, 2], [p3, 3]]) {
      await series.assignArticle({ seriesId: s.id, articleId: article.id, partNumber: part });
    }
    await series.assignArticle({ seriesId: s.id, articleId: extra.id });
    await series.assignArticle({ seriesId: draftSeries.id, articleId: extra.id });

    // Public detail: drafts hidden, parts ordered by part number, plain associations separate.
    const publicView = await series.get({ id: s.id, publishedOnly: true });
    assert.deepEqual(publicView.parts.map((p) => [p.id, p.partNumber]), [[p1.id, 1], [p3.id, 3]]);
    assert.deepEqual(publicView.relatedArticles.map((a) => a.id), [extra.id]);
    assert.equal((await series.get({ id: s.id })).parts.length, 3, 'admin sees drafts');

    // Navigation skips the draft part 2.
    const nav = await series.getArticleSeries({ articleId: p1.id, publishedOnly: true });
    assert.equal(nav.sequential.partNumber, 1);
    assert.equal(nav.sequential.previous, null);
    assert.equal(nav.sequential.next.id, p3.id);
    const adminNav = await series.getArticleSeries({ articleId: p1.id });
    assert.equal(adminNav.sequential.next.id, p2.id);
    await assert.rejects(series.getArticleSeries({ articleId: p2.id, publishedOnly: true }), NotFoundError);

    // Draft series are invisible publicly, including through article membership and filters.
    const extraPublic = await series.getArticleSeries({ articleId: extra.id, publishedOnly: true });
    assert.deepEqual(extraPublic.series.map((x) => x.id), [s.id]);
    assert.equal(extraPublic.sequential, null);
    await assert.rejects(series.get({ id: draftSeries.id, publishedOnly: true }), NotFoundError);
    assert.deepEqual(await articles.getArticles({ series: draftSeries.slug }), []);
    const bySeries = await articles.getArticles({ series: s.slug, pageSize: 50 });
    assert.deepEqual(bySeries.map((a) => a.id).sort(), [p1.id, p3.id, extra.id].sort());

    // Reorder must list exactly the current parts.
    await assert.rejects(series.reorderParts({ seriesId: s.id, articleIds: [p3.id, p1.id] }), ValidationError);
    const reordered = await series.reorderParts({ seriesId: s.id, articleIds: [p3.id, p1.id, p2.id] });
    assert.deepEqual(reordered.parts.map((p) => [p.id, p.partNumber]), [[p3.id, 1], [p1.id, 2], [p2.id, 3]]);

    // Publishing a series does not touch its articles, and vice versa.
    await series.setPublished({ id: draftSeries.id, action: 'publish' });
    assert.equal(await statusOf(p2.id), 'draft');
    await series.setPublished({ id: s.id, action: 'unpublish' });
    assert.equal(await statusOf(p1.id), 'published');
    await articles.publishArticle({ id: p2.id, action: 'publish' });
    assert.equal((await series.get({ id: s.id })).status, 'draft');

    // Removing an association / deleting the series keeps the articles.
    await series.removeArticle({ seriesId: s.id, articleId: extra.id });
    await assert.rejects(series.removeArticle({ seriesId: s.id, articleId: extra.id }), NotFoundError);
    await series.remove({ id: s.id });
    created.series = created.series.filter((id) => id !== s.id);
    assert.equal(await statusOf(p1.id), 'published');
    assert.equal((await series.getArticleSeries({ articleId: p1.id })).sequential, null);
  });
});
