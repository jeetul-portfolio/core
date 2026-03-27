function authRoutes({ controller, router, middlewares }) {
  router.post('/auth/login', controller.authController.login);
  router.post('/auth/refresh', controller.authController.refresh);
  router.post('/auth/logout', controller.authController.logout);
  router.get('/auth/me', middlewares.authenticate, controller.authController.me);

  return router;
}

module.exports = authRoutes;
