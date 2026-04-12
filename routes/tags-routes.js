function tagsRoutes({ controller, router, middlewares }) {
  router.get('/tags', controller.tagsController.getTags);
  router.get('/tags/graph', controller.tagsController.getTagGraph);
  router.get('/tags/:id', controller.tagsController.getTagById);
  router.post(
    '/tags',
    middlewares.authenticate,
    middlewares.authorize(['admin']),
    controller.tagsController.createTag
  );
  router.patch(
    '/tags/:id',
    middlewares.authenticate,
    middlewares.authorize(['admin']),
    controller.tagsController.updateTag
  );
  router.delete(
    '/tags/:id',
    middlewares.authenticate,
    middlewares.authorize(['admin']),
    controller.tagsController.deleteTag
  );

  return router;
}

module.exports = tagsRoutes;
