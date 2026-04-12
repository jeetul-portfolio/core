function makeCreateSkillUsecase({ dataAccess, getSkillById }) {
  return async function createSkillUsecase({ name, categoryIds, level, notes, sortOrder, references }) {
    const created = await dataAccess.skills.createSkill({
      name: String(name).trim(),
      level: level || 'Beginner',
      notes: notes ? String(notes).trim() : null,
      sortOrder: sortOrder || 0,
    });

    const normalizedRefs = normalizeReferences(references);
    const normalizedCategoryIds = normalizeCategoryIds(categoryIds);

    await dataAccess.skillReferences.deleteBySkillId({ skillId: created.id });
    await dataAccess.skillReferences.insertReferences({ skillId: created.id, references: normalizedRefs });
    await dataAccess.skillCategories.deleteBySkillId({ skillId: created.id });
    await dataAccess.skillCategories.insertCategoryLinks({ skillId: created.id, categoryIds: normalizedCategoryIds });

    return getSkillById({ id: created.id });
  };
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

module.exports = makeCreateSkillUsecase;
