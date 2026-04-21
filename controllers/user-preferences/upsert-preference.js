function makeUpsertPreferenceController({ usecase, formatResponse, formatError, logger, Joi, ValidationError, ForbiddenError }) {
  return async function upsertPreferenceController(req, res) {
    try {
      const urlUserId = Number(req.params.userId);
      const jwtUserId = Number(req.auth?.sub);
      if (!urlUserId || urlUserId !== jwtUserId) {
        throw new ForbiddenError('Access denied');
      }

      const paramsSchema = Joi.object({
        type: Joi.string().trim().min(1).max(100).required(),
      });
      const { error: paramsError, value: paramsValue } = paramsSchema.validate({ type: req.params.type });
      if (paramsError) throw new ValidationError(paramsError.message);

      const bodySchema = Joi.object({
        meta: Joi.object().required(),
      });
      const { error: bodyError, value: bodyValue } = bodySchema.validate(req.body || {});
      if (bodyError) throw new ValidationError(bodyError.message);

      const data = await usecase.userPreferencesUsecase.upsertPreference({
        userId: jwtUserId,
        type: paramsValue.type,
        meta: bodyValue.meta,
      });

      formatResponse(res, { statusCode: 200, body: data });
    } catch (err) {
      logger.error('Error in upsertPreferenceController:', err.message);
      formatError(res, { error: err });
    }
  };
}

module.exports = makeUpsertPreferenceController;
