const makeGetGitCommitsDataAccess = require('./get-git-commits');
const makeInsertGitCommitsBulkDataAccess = require('./insert-git-commits-bulk');

// Append-only: keeps full commit history, inserts only hashes not already stored for the project.
function makeUpsertGitCommitsForProjectDataAccess(dependencies) {
  const getGitCommits = makeGetGitCommitsDataAccess(dependencies);
  const insertGitCommitsBulk = makeInsertGitCommitsBulkDataAccess(dependencies);

  return async function upsertGitCommitsForProjectDataAccess({
    projectId,
    commits = [],
    syncedAt = new Date(),
  }) {
    if (!Array.isArray(commits) || commits.length === 0) {
      return { inserted: 0, updated: 0 };
    }

    // ponytail: read-then-insert without a unique key; concurrent syncs of the same project could
    // double-insert. Add UNIQUE(projectId, fullHash) + INSERT IGNORE if syncs ever run in parallel.
    const existing = await getGitCommits({ projectId, fieldsToSelect: ['fullHash'] });
    const seen = new Set(existing.map((row) => row.fullHash));
    const newCommits = commits.filter((commit) => {
      if (seen.has(commit.fullHash)) return false;
      seen.add(commit.fullHash);
      return true;
    });

    const inserted = await insertGitCommitsBulk({ projectId, commits: newCommits, syncedAt });
    return { inserted, updated: 0 };
  };
}

module.exports = makeUpsertGitCommitsForProjectDataAccess;
