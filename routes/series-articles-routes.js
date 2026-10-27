const ADMIN_ROLES = ['admin', 'service'];

/**
 * Series membership and sequential parts. Reads of an article's series are public (published
 * only) or admin (drafts too); every write is admin-only.
 */
function seriesArticlesRoutes({ controller, router, middlewares }) {
  const adminOnly = [middlewares.authenticate, middlewares.authorize(ADMIN_ROLES)];
  const series = controller.seriesController;

  router.get('/articles/:id/series', series.getArticleSeries);
  router.get('/admin/articles/:id/series', ...adminOnly, series.getArticleSeriesAdmin);

  router.put('/series/:id/parts/order', ...adminOnly, series.reorderParts);
  router.put('/series/:id/articles/:articleId', ...adminOnly, series.assignArticle);
  router.delete('/series/:id/articles/:articleId', ...adminOnly, series.removeArticle);

  return router;
}

module.exports = seriesArticlesRoutes;
