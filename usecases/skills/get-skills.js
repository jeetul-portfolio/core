function makeGetSkillsUsecase({ dataAccess, presentSkill }) {
  return async function getSkillsUsecase({ page = 1, pageSize = 20, search = '' } = {}) {
    const skills = await dataAccess.skills.getSkills({ page, pageSize, search });

    if (skills.length === 0) {
      return [];
    }

    const skillIds = skills.map((s) => s.id);

    const [allRefs, allCategoryLinks] = await Promise.all([
      dataAccess.skillReferences.getReferencesForSkillIds({ skillIds }),
      dataAccess.skillCategories.getCategoryLinksForSkillIds({ skillIds }),
    ]);

    const refsBySkillId = allRefs.reduce((acc, ref) => {
      if (!acc[ref.skillId]) acc[ref.skillId] = [];
      acc[ref.skillId].push(ref);
      return acc;
    }, {});

    const categoryLinksBySkillId = allCategoryLinks.reduce((acc, link) => {
      if (!acc[link.skillId]) acc[link.skillId] = [];
      acc[link.skillId].push(link.categoryId);
      return acc;
    }, {});

    const uniqueCategoryIds = [...new Set(allCategoryLinks.map((l) => l.categoryId))];
    const categoryRows = uniqueCategoryIds.length > 0
      ? await dataAccess.categories.getCategoriesByIds({ ids: uniqueCategoryIds })
      : [];

    const categoryById = categoryRows.reduce((acc, c) => {
      acc[c.id] = c;
      return acc;
    }, {});

    return skills.map((skill) => {
      const catIds = categoryLinksBySkillId[skill.id] || [];
      const categories = catIds.map((cid) => categoryById[cid]).filter(Boolean);
      return presentSkill(skill, refsBySkillId[skill.id] || [], categories);
    });
  };
}

module.exports = makeGetSkillsUsecase;
