const { presentSkill } = require('../skills/skill-presenter');

function makeGetCategoriesUsecase({ dataAccess, presentCategory }) {
  return async function getCategoriesUsecase({ page = 1, pageSize = 100, search = '', includeSkills = false } = {}) {
    const categories = await dataAccess.categories.getCategories({ page, pageSize, search });

    if (!includeSkills) {
      return categories.map(presentCategory);
    }

    const categoryIds = categories.map((c) => c.id);
    const links = await dataAccess.skillCategories.getLinksForCategoryIds({ categoryIds });

    // Build map: categoryId → skillId[]
    const skillIdsByCategoryId = new Map();
    for (const link of links) {
      if (!skillIdsByCategoryId.has(link.categoryId)) {
        skillIdsByCategoryId.set(link.categoryId, []);
      }
      skillIdsByCategoryId.get(link.categoryId).push(link.skillId);
    }

    // Only include categories that have at least one skill
    const categoriesWithSkills = categories.filter((c) => skillIdsByCategoryId.has(c.id));

    const uniqueSkillIds = [...new Set(links.map((l) => l.skillId))];

    const [skills, allRefs] = await Promise.all([
      dataAccess.skills.getSkillsByIds({ ids: uniqueSkillIds }),
      dataAccess.skillReferences.getReferencesForSkillIds({ skillIds: uniqueSkillIds }),
    ]);

    const skillById = new Map(skills.map((s) => [s.id, s]));
    const refsBySkillId = new Map();
    for (const ref of allRefs) {
      if (!refsBySkillId.has(ref.skillId)) {
        refsBySkillId.set(ref.skillId, []);
      }
      refsBySkillId.get(ref.skillId).push(ref);
    }

    return categoriesWithSkills.map((category) => {
      const skillIds = skillIdsByCategoryId.get(category.id) || [];
      // Preserve the order returned by getSkillsByIds (sorted by level Expert→Beginner)
      const orderedSkills = skills.filter((s) => skillIds.includes(s.id));
      const presentedSkills = orderedSkills.map((s) =>
        presentSkill(s, refsBySkillId.get(s.id) || [], [category])
      );
      return { ...presentCategory(category), skills: presentedSkills };
    });
  };
}

module.exports = makeGetCategoriesUsecase;
