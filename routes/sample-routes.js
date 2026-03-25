
function sampleRoutes({ controller, router }) {
  router.get('/sample', controller.sampleController.getSampleData);

  return router;
}

module.exports = sampleRoutes;
