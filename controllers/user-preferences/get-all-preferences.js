function makeGetAllPreferencesController({ usecase, formatResponse, formatError, logger, Joi, ValidationError, ForbiddenError }) {
  return async function getAllPreferencesController(req, res) {
    try {
      const urlUserId = Number(req.params.userId);
      const jwtUserId = Number(req.auth?.sub);
      if (!urlUserId || urlUserId !== jwtUserId) {
        throw new ForbiddenError('Access denied');
      }
      const data = await usecase.userPreferencesUsecase.getAllPreferences({ userId: jwtUserId });
      formatResponse(res, { statusCode: 200, body: data });
    } catch (err) {
      logger.error('Error in getAllPreferencesController:', err.message);
      formatError(res, { error: err });
    }
  };
}

module.exports = makeGetAllPreferencesController;
