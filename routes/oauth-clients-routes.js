// OAuth applications (clients) management. Admin only: these define who may obtain tokens.
function oauthClientsRoutes({ controller, router, middlewares }) {
  const adminOnly = [middlewares.authenticate, middlewares.authorize(['admin'])];
  const c = controller.oauthClientsController;

  router.get('/oauth-clients', ...adminOnly, c.getOAuthClients);
  router.get('/oauth-clients/:clientId', ...adminOnly, c.getOAuthClientById);
  router.post('/oauth-clients', ...adminOnly, c.createOAuthClient);
  router.put('/oauth-clients/:clientId', ...adminOnly, c.updateOAuthClient);
  router.post('/oauth-clients/:clientId/rotate-secret', ...adminOnly, c.rotateOAuthClientSecret);
  router.delete('/oauth-clients/:clientId', ...adminOnly, c.deleteOAuthClient);

  return router;
}

module.exports = oauthClientsRoutes;
