function articlesRoutes({ controller, router, middlewares }) {
  router.get('/articles', controller.articlesController.getArticles);
  router.get('/articles/:id', controller.articlesController.getArticleById);
  router.post(
    '/articles',
    middlewares.authenticate,
    middlewares.authorize(['admin', 'editor']),
    controller.articlesController.createArticle
  );
  router.put(
    '/articles/:id',
    middlewares.authenticate,
    middlewares.authorize(['admin', 'editor']),
    controller.articlesController.updateArticle
  );
  router.delete(
    '/articles/:id',
    middlewares.authenticate,
    middlewares.authorize(['admin']),
    controller.articlesController.deleteArticle
  );

  return router;
}

module.exports = articlesRoutes;
