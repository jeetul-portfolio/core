function articlesRoutes({ controller, router }) {
  router.get('/articles', controller.articlesController.getArticles);
  router.get('/articles/:id', controller.articlesController.getArticleById);

  return router;
}

module.exports = articlesRoutes;
