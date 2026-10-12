const makeInsertGitCommitsBulkDataAccess = require('./insert-git-commits-bulk');

// Append-only: keeps full commit history; the (projectId, fullHash) unique key makes re-syncs idempotent.
function makeUpsertGitCommitsForProjectDataAccess(dependencies) {
  const insertGitCommitsBulk = makeInsertGitCommitsBulkDataAccess(dependencies);

  return async function upsertGitCommitsForProjectDataAccess({
    projectId,
    commits = [],
    syncedAt = new Date(),
  }) {
    if (!Array.isArray(commits) || commits.length === 0) {
      return { inserted: 0, updated: 0 };
    }

    const inserted = await insertGitCommitsBulk({ projectId, commits, syncedAt });
    return { inserted, updated: 0 };
  };
}

module.exports = makeUpsertGitCommitsForProjectDataAccess;
