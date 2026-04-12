function makeUpdateTagController({ usecase, formatResponse, formatError, logger, Joi, ValidationError }) {
  return async function updateTagController(req, res) {
    try {
      const paramsSchema = Joi.object({ id: Joi.number().integer().min(1).required() });
      const { error: paramsError, value: paramsValue } = paramsSchema.validate({ id: req.params.id });
      if (paramsError) throw new ValidationError(paramsError.message);

      const bodySchema = Joi.object({
        name: Joi.string().trim().min(1).max(100).optional(),
        group: Joi.string().trim().max(50).allow(null, '').optional(),
        color: Joi.string().trim().max(20).allow(null, '').optional(),
        description: Joi.string().trim().max(1000).allow(null, '').optional(),
      }).or('name', 'group', 'color', 'description');

      const { error: bodyError, value: bodyValue } = bodySchema.validate(req.body || {});
      if (bodyError) throw new ValidationError(bodyError.message);

      const data = await usecase.tagsUsecase.updateTag({ id: paramsValue.id, ...bodyValue });
      formatResponse(res, { statusCode: 200, body: data });
    } catch (err) {
      logger.error('Error in updateTagController:', err.message);
      formatError(res, { error: err });
    }
  };
}

module.exports = makeUpdateTagController;
