function gitRoutes({ controller, router }) {
  router.get('/git/projects/overview', controller.getGitProjectsOverview);

  return router;
}

module.exports = gitRoutes;