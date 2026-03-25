function gitRoutes({ controller, router }) {
  router.get('/git/projects/overview', controller.gitController.getGitProjectsOverview);
  router.get('/git/projects/overview/pagination-metadata', controller.gitController.getGitProjectsOverviewPaginationMetadata);

  return router;
}

module.exports = gitRoutes;