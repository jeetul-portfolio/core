function makeGetSkillByIdUsecase({ dataAccess, presentSkill, NotFoundError }) {
  return async function getSkillByIdUsecase({ id }) {
    const skill = await dataAccess.skills.getSkillById({ id });

    if (!skill) {
      throw new NotFoundError(`Skill not found for id ${id}`);
    }

    const [refs, categoryLinks] = await Promise.all([
      dataAccess.skillReferences.getReferencesForSkillIds({ skillIds: [id] }),
      dataAccess.skillCategories.getCategoryLinksForSkillIds({ skillIds: [id] }),
    ]);

    const categoryIds = categoryLinks.map((l) => l.categoryId);
    const categories = categoryIds.length > 0
      ? await dataAccess.categories.getCategoriesByIds({ ids: categoryIds })
      : [];

    return presentSkill(skill, refs, categories);
  };
}

module.exports = makeGetSkillByIdUsecase;
