function makeCreateUsecase({
  dataAccess,
  store,
  entityType,
  slugSource,
  prepare,
  normalizeTags,
  assertSkillsExist,
  resolveSlug,
  findRecord,
  syncRecordTags,
  unlinkRecord,
  get,
}) {
  return async function createUsecase({ skillIds, slug, ...input }) {
    if (skillIds) await assertSkillsExist(skillIds);

    const fields = normalizeTags(input);
    const status = fields.status || 'draft';
    const merged = { ...fields, status };
    const payload = {
      ...merged,
      ...prepare(merged),
      slug: await resolveSlug({ requested: slug, source: slugSource(merged) }),
      publishedAt: status === 'published' ? (fields.publishedAt || new Date().toISOString()) : null,
    };

    const { id } = await store.create(payload);
    try {
      if (skillIds) {
        await dataAccess.skillReferences.replaceForReference({ type: entityType, referenceId: id, skillIds });
      }
      await syncRecordTags(await findRecord({ id }));
    } catch (error) {
      // ponytail: compensating delete instead of a cross-table transaction (same as articles);
      // move to a shared connection if creation grows more steps.
      await store.remove({ id });
      await unlinkRecord(id);
      throw error;
    }

    return get({ id });
  };
}

module.exports = makeCreateUsecase;
