function skillsRoutes({ controller, router, middlewares }) {
  router.get('/skills', controller.skillsController.getSkills);
  router.get('/skills/:id', controller.skillsController.getSkillById);

  router.post(
    '/skills',
    middlewares.authenticate,
    middlewares.authorize(['admin', 'service']),
    controller.skillsController.createSkill
  );

  router.put(
    '/skills/:id',
    middlewares.authenticate,
    middlewares.authorize(['admin', 'service']),
    controller.skillsController.updateSkill
  );

  router.delete(
    '/skills/:id',
    middlewares.authenticate,
    middlewares.authorize(['admin', 'service']),
    controller.skillsController.deleteSkill
  );

  return router;
}

module.exports = skillsRoutes;
