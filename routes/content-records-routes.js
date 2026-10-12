const ADMIN_ROLES = ['admin', 'service'];

/**
 * Public reads expose published records only; drafts are readable solely through the
 * authenticated /admin/<resource> routes. All writes are admin-only.
 */
function contentRecordsRoutes({ router, middlewares, controller, resource }) {
  const adminOnly = [middlewares.authenticate, middlewares.authorize(ADMIN_ROLES)];

  router.get(`/${resource}`, controller.listPublished);
  router.get(`/${resource}/:idOrSlug`, controller.getPublished);

  router.get(`/admin/${resource}`, ...adminOnly, controller.listAll);
  router.get(`/admin/${resource}/:idOrSlug`, ...adminOnly, controller.getAny);

  // Registered before /:id so "reorder" is never parsed as an id.
  router.put(`/${resource}/reorder`, ...adminOnly, controller.reorder);
  router.post(`/${resource}`, ...adminOnly, controller.create);
  router.put(`/${resource}/:id`, ...adminOnly, controller.update);
  router.delete(`/${resource}/:id`, ...adminOnly, controller.remove);
  router.patch(`/${resource}/:id/publish`, ...adminOnly, controller.setPublished);

  return router;
}

module.exports = contentRecordsRoutes;
