/** Partial update: only supplied fields change; supplying skillIds replaces the whole set. */
function makeUpdateUsecase({
  dataAccess,
  store,
  entityType,
  slugSource,
  prepare,
  presentRecord,
  normalizeTags,
  assertSkillsExist,
  resolveSlug,
  findRecord,
  syncRecordTags,
  get,
}) {
  return async function updateUsecase({ id, skillIds, slug, ...input }) {
    const fields = normalizeTags(input);
    const current = presentRecord(await findRecord({ id }), []);
    if (skillIds) await assertSkillsExist(skillIds);

    const merged = { ...current, ...fields };
    const payload = {
      ...fields,
      ...prepare(merged),
      ...publishedAtChange(fields, current.status),
    };

    if (slug !== undefined && slug !== current.slug) {
      payload.slug = await resolveSlug({ requested: slug, source: slugSource(merged), excludeId: id });
    }

    await store.update({ id, ...payload });
    if (skillIds) {
      await dataAccess.skillReferences.replaceForReference({ type: entityType, referenceId: id, skillIds });
    }
    await syncRecordTags(await findRecord({ id }));

    return get({ id });
  };
}

// First publish stamps publishedAt; moving back to draft clears it.
function publishedAtChange(fields, currentStatus) {
  if (fields.status === 'published' && currentStatus !== 'published') {
    return { publishedAt: fields.publishedAt || new Date().toISOString() };
  }
  if (fields.status === 'draft') {
    return { publishedAt: null };
  }
  return {};
}

module.exports = makeUpdateUsecase;
