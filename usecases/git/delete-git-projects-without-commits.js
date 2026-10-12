/**
 * Database-only cleanup: removes git projects with no stored commits (no GitHub calls).
 * With dryRun, only reports what would be deleted.
 */
function makeDeleteGitProjectsWithoutCommitsUsecase({ dataAccess, logger }) {
  return async function deleteGitProjectsWithoutCommitsUsecase({ dryRun = false } = {}) {
    const projects = await dataAccess.gitProjects.getGitProjectsWithoutCommits();

    if (!dryRun) {
      for (const project of projects) {
        await dataAccess.gitProjects.deleteGitProject({ projectId: project.id });
        logger.info('Removed git project with no commits', { projectKey: project.projectKey, projectId: project.id });
      }
    }

    return {
      dryRun,
      totalProjectsWithoutCommits: projects.length,
      deleted: dryRun ? 0 : projects.length,
      projects: projects.map(({ id, projectKey }) => ({ id, projectKey })),
    };
  };
}

module.exports = makeDeleteGitProjectsWithoutCommitsUsecase;
