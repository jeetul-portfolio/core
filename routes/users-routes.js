function usersRoutes({ controller, router, middlewares }) {
  router.get(
    '/users',
    middlewares.authenticate,
    middlewares.authorize(['admin']),
    controller.usersController.getUsers
  );

  router.post(
    '/users',
    middlewares.authenticate,
    middlewares.authorize(['admin']),
    controller.usersController.createUser
  );

  router.patch(
    '/users/:id',
    middlewares.authenticate,
    controller.usersController.updateUser
  );

  router.patch(
    '/users/:id/password',
    middlewares.authenticate,
    controller.usersController.updateUserPassword
  );

  return router;
}

module.exports = usersRoutes;
