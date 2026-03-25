function gitRoutes({ controller, router }) {
  router.get('/git/projects/overview', controller.getGitProjectsOverview);
  router.get('/git/projects/overview/pagination-metadata', controller.getGitProjectsOverviewPaginationMetadata);

  return router;
}

module.exports = gitRoutes;