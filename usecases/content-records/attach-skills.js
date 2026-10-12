/** Presents rows with their linked skills, fetched in one query. */
function makeAttachSkills({ dataAccess, entityType, presentRecord }) {
  return async function attachSkills(rows) {
    const skills = await dataAccess.skillReferences.getSkillsForReferences({
      type: entityType,
      referenceIds: rows.map((row) => row.id),
    });
    return rows.map((row) => presentRecord(
      row,
      skills.filter((s) => s.referenceId === row.id).map(({ id, name }) => ({ id, name }))
    ));
  };
}

module.exports = makeAttachSkills;
