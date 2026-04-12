function makeDeleteSkillUsecase({ dataAccess, NotFoundError }) {
  return async function deleteSkillUsecase({ id }) {
    const existing = await dataAccess.skills.getSkillById({ id });

    if (!existing) {
      throw new NotFoundError(`Skill not found for id ${id}`);
    }

    // FK ON DELETE CASCADE handles skill_references and skill_categories cleanup,
    // but we delete explicitly for clarity and portability.
    await dataAccess.skillReferences.deleteBySkillId({ skillId: id });
    await dataAccess.skillCategories.deleteBySkillId({ skillId: id });
    await dataAccess.skills.deleteSkill({ id });

    return { id, deleted: true };
  };
}

module.exports = makeDeleteSkillUsecase;
