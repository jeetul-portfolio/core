const makeDeleteGitCommitsByProjectIdDataAccess = require('./delete-git-commits-by-project-id');
const makeInsertGitCommitsBulkDataAccess = require('./insert-git-commits-bulk');

function makeUpsertGitCommitsForProjectDataAccess(dependencies) {
  const deleteGitCommitsByProjectId = makeDeleteGitCommitsByProjectIdDataAccess(dependencies);
  const insertGitCommitsBulk = makeInsertGitCommitsBulkDataAccess(dependencies);

  return async function upsertGitCommitsForProjectDataAccess({
    projectId,
    commits = [],
    syncedAt = new Date(),
  }) {
    await deleteGitCommitsByProjectId({ projectId });

    if (!Array.isArray(commits) || commits.length === 0) {
      return { inserted: 0, updated: 0 };
    }

    const inserted = await insertGitCommitsBulk({ projectId, commits, syncedAt });
    return { inserted, updated: 0 };
  };
}

module.exports = makeUpsertGitCommitsForProjectDataAccess;