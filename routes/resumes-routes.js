const { uploadResume } = require('../middlewares/upload');

function resumesRoutes({ controller, router, middlewares }) {
  // Public routes — no auth required
  router.get('/resumes', controller.resumesController.getResumes);
  router.get('/resumes/active', controller.resumesController.getActiveResume);

  // Admin-only routes
  router.post(
    '/resumes',
    middlewares.authenticate,
    middlewares.authorize(['admin']),
    uploadResume,
    controller.resumesController.createResume
  );

  router.put(
    '/resumes/:id/activate',
    middlewares.authenticate,
    middlewares.authorize(['admin']),
    controller.resumesController.activateResume
  );

  router.delete(
    '/resumes/:id',
    middlewares.authenticate,
    middlewares.authorize(['admin']),
    controller.resumesController.deleteResume
  );

  return router;
}

module.exports = resumesRoutes;
