function makeDeleteResumeUsecase({ dataAccess, NotFoundError }) {
  return async function deleteResumeUsecase({ id }) {
    const existing = await dataAccess.resumes.getResumeById({ id });

    if (!existing) {
      throw new NotFoundError(`Resume not found for id ${id}`);
    }

    await dataAccess.resumes.deleteResume({ id });

    return { id, deleted: true };
  };
}

module.exports = makeDeleteResumeUsecase;
