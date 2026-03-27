function profileRoutes({ controller, router, middlewares }) {
  router.get('/profile/public', controller.profileController.getPublicProfile);

  router.get(
    '/profiles',
    middlewares.authenticate,
    controller.profileController.getProfiles,
  );

  router.post(
    '/profiles',
    middlewares.authenticate,
    controller.profileController.createProfile,
  );

  router.get(
    '/profile',
    middlewares.authenticate,
    controller.profileController.getProfile,
  );

  router.patch(
    '/profile',
    middlewares.authenticate,
    controller.profileController.updateProfile,
  );

  router.patch(
    '/profiles/:id',
    middlewares.authenticate,
    controller.profileController.patchProfile,
  );

  router.put(
    '/profiles/:id',
    middlewares.authenticate,
    controller.profileController.putProfile,
  );

  router.delete(
    '/profiles/:id',
    middlewares.authenticate,
    controller.profileController.deleteProfile,
  );

  return router;
}

module.exports = profileRoutes;
