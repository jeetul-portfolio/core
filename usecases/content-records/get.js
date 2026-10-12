function makeGetUsecase({ findRecord, attachSkills }) {
  return async function getUsecase({ id, slug, publishedOnly = false }) {
    const row = await findRecord({ id, slug, publishedOnly });
    const [record] = await attachSkills([row]);
    return record;
  };
}

module.exports = makeGetUsecase;
