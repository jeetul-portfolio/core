function makeActivateResumeUsecase({ dataAccess, presentResume, NotFoundError }) {
  return async function activateResumeUsecase({ id }) {
    const existing = await dataAccess.resumes.getResumeById({ id });

    if (!existing) {
      throw new NotFoundError(`Resume not found for id ${id}`);
    }

    await dataAccess.resumes.activateResume({ id });

    const updated = await dataAccess.resumes.getResumeById({ id });
    return presentResume(updated);
  };
}

module.exports = makeActivateResumeUsecase;
