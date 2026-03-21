
function sampleRoutes({ controller, router }) {
  router.get('/sample', controller.getSampleData);

  return router;
}

module.exports = sampleRoutes;
