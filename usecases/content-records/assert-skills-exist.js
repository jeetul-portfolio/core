function makeAssertSkillsExist({ dataAccess, ValidationError }) {
  return async function assertSkillsExist(skillIds) {
    const unique = [...new Set(skillIds)];
    const found = await dataAccess.skills.getSkillsByIds({ ids: unique });
    const foundIds = new Set(found.map((s) => Number(s.id)));
    const missing = unique.filter((id) => !foundIds.has(id));
    if (missing.length > 0) {
      throw new ValidationError(`Unknown skill ids: ${missing.join(', ')}`);
    }
  };
}

module.exports = makeAssertSkillsExist;
