function userPreferencesRoutes({ controller, router, middlewares }) {
  router.get(
    '/users/:userId/preferences',
    middlewares.authenticate,
    controller.userPreferencesController.getAllPreferences
  );

  router.get(
    '/users/:userId/preferences/:type',
    middlewares.authenticate,
    controller.userPreferencesController.getPreference
  );

  router.put(
    '/users/:userId/preferences/:type',
    middlewares.authenticate,
    controller.userPreferencesController.upsertPreference
  );

  return router;
}

module.exports = userPreferencesRoutes;
