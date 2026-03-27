function rolesRoutes({ controller, router, middlewares }) {
  router.get(
    '/roles',
    middlewares.authenticate,
    middlewares.authorize(['admin']),
    controller.rolesController.getRoles
  );

  return router;
}

module.exports = rolesRoutes;
