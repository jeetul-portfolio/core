function makeGetResumesUsecase({ dataAccess, presentResume }) {
  return async function getResumesUsecase() {
    const rows = await dataAccess.resumes.getResumes();
    return rows.map(presentResume);
  };
}

module.exports = makeGetResumesUsecase;
