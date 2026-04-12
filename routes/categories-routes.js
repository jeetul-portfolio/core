function categoriesRoutes({ controller, router, middlewares }) {
  router.get('/categories', controller.categoriesController.getCategories);
  router.get('/categories/:id', controller.categoriesController.getCategoryById);

  router.post(
    '/categories',
    middlewares.authenticate,
    middlewares.authorize(['admin']),
    controller.categoriesController.createCategory
  );

  router.put(
    '/categories/:id',
    middlewares.authenticate,
    middlewares.authorize(['admin']),
    controller.categoriesController.updateCategory
  );

  router.delete(
    '/categories/:id',
    middlewares.authenticate,
    middlewares.authorize(['admin']),
    controller.categoriesController.deleteCategory
  );

  return router;
}

module.exports = categoriesRoutes;
