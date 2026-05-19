function makeGetActiveResumeUsecase({ dataAccess, presentResume, NotFoundError }) {
  return async function getActiveResumeUsecase() {
    const row = await dataAccess.resumes.getActiveResume();

    if (!row) {
      throw new NotFoundError('No active resume found');
    }

    return presentResume(row);
  };
}

module.exports = makeGetActiveResumeUsecase;
