function makeCreateResumeUsecase({ dataAccess, presentResume }) {
  return async function createResumeUsecase({ filename, fileUrl }) {
    const row = await dataAccess.resumes.createResume({ filename, fileUrl });
    return presentResume(row);
  };
}

module.exports = makeCreateResumeUsecase;
