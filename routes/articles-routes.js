function articlesRoutes({ controller, router, middlewares }) {
  router.get('/articles', controller.articlesController.getArticles);
  router.get('/articles/slug/:slug', controller.articlesController.getArticleBySlug);
  router.get('/articles/:id', controller.articlesController.getArticleById);
  router.post(
    '/articles',
    middlewares.authenticate,
    middlewares.authorize(['admin', 'editor', 'service']),
    controller.articlesController.createArticle
  );
  router.put(
    '/articles/:id',
    middlewares.authenticate,
    middlewares.authorize(['admin', 'editor', 'service']),
    controller.articlesController.updateArticle
  );
  router.delete(
    '/articles/:id',
    middlewares.authenticate,
    middlewares.authorize(['admin', 'service']),
    controller.articlesController.deleteArticle
  );
  router.patch(
    '/articles/:id/publish',
    middlewares.authenticate,
    middlewares.authorize(['admin', 'editor', 'service']),
    controller.articlesController.publishArticle
  );

  router.post(
    '/articles/:id/categories',
    middlewares.authenticate,
    middlewares.authorize(['admin', 'editor', 'service']),
    controller.articlesController.addArticleCategories
  );
  router.delete(
    '/articles/:id/categories/:categoryId',
    middlewares.authenticate,
    middlewares.authorize(['admin', 'editor', 'service']),
    controller.articlesController.removeArticleCategory
  );

  return router;
}

module.exports = articlesRoutes;
