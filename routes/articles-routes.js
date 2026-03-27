function articlesRoutes({ controller, router }) {
  router.get('/articles', controller.articlesController.getArticles);
  router.get('/articles/:id', controller.articlesController.getArticleById);
  router.post('/articles', controller.articlesController.createArticle);
  router.put('/articles/:id', controller.articlesController.updateArticle);
  router.delete('/articles/:id', controller.articlesController.deleteArticle);

  return router;
}

module.exports = articlesRoutes;
