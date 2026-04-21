function makeGetPreferenceController({ usecase, formatResponse, formatError, logger, Joi, ValidationError, ForbiddenError }) {
  return async function getPreferenceController(req, res) {
    try {
      const urlUserId = Number(req.params.userId);
      const jwtUserId = Number(req.auth?.sub);
      if (!urlUserId || urlUserId !== jwtUserId) {
        throw new ForbiddenError('Access denied');
      }

      const schema = Joi.object({
        type: Joi.string().trim().min(1).max(100).required(),
      });
      const { error, value } = schema.validate({ type: req.params.type });
      if (error) throw new ValidationError(error.message);

      const data = await usecase.userPreferencesUsecase.getPreference({ userId: jwtUserId, type: value.type });
      formatResponse(res, { statusCode: 200, body: data });
    } catch (err) {
      logger.error('Error in getPreferenceController:', err.message);
      formatError(res, { error: err });
    }
  };
}

module.exports = makeGetPreferenceController;
