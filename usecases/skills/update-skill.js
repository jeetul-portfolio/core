function makeUpdateSkillUsecase({ dataAccess, getSkillById, NotFoundError, syncEntityTags }) {
  return async function updateSkillUsecase(input) {
    const existing = await dataAccess.skills.getSkillById({ id: input.id });

    if (!existing) {
      throw new NotFoundError(`Skill not found for id ${input.id}`);
    }

    const payload = buildPayload(input);

    if (Object.keys(payload).length > 1) {
      const updated = await dataAccess.skills.updateSkill(payload);
      if (!updated) {
        throw new NotFoundError(`Skill not found for id ${input.id}`);
      }
    }

    if (Object.prototype.hasOwnProperty.call(input, 'references')) {
      const normalizedRefs = normalizeReferences(input.references);
      await dataAccess.skillReferences.deleteBySkillId({ skillId: input.id });
      await dataAccess.skillReferences.insertReferences({ skillId: input.id, references: normalizedRefs });
    }

    if (Object.prototype.hasOwnProperty.call(input, 'categoryIds')) {
      const normalizedCategoryIds = normalizeCategoryIds(input.categoryIds);
      await dataAccess.skillCategories.deleteBySkillId({ skillId: input.id });
      await dataAccess.skillCategories.insertCategoryLinks({ skillId: input.id, categoryIds: normalizedCategoryIds });
    }

    if (syncEntityTags && Object.prototype.hasOwnProperty.call(input, 'notes')) {
      const latestSkill = await getSkillById({ id: input.id });
      await syncEntityTags({
        entityType: 'skill',
        entityId: input.id,
        explicitTags: [],
        textFields: [latestSkill.notes],
      });
    }

    return getSkillById({ id: input.id });
  };
}

function buildPayload(input) {
  const payload = { id: input.id };
  const fields = ['name', 'level', 'notes', 'sortOrder'];

  for (const field of fields) {
    if (Object.prototype.hasOwnProperty.call(input, field)) {
      payload[field] = input[field];
    }
  }

  return payload;
}

function normalizeReferences(references) {
  if (!Array.isArray(references)) return [];
  return references
    .filter((r) => r && r.type && r.referenceId)
    .map((r) => ({ type: String(r.type), referenceId: Number(r.referenceId) }));
}

function normalizeCategoryIds(categoryIds) {
  if (!Array.isArray(categoryIds)) return [];
  return categoryIds.map(Number).filter((id) => id > 0);
}

module.exports = makeUpdateSkillUsecase;
