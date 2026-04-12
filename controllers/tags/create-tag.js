function makeCreateTagController({ usecase, formatResponse, formatError, logger, Joi, ValidationError }) {
  return async function createTagController(req, res) {
    try {
      const schema = Joi.object({
        name: Joi.string().trim().min(1).max(100).required(),
        group: Joi.string().trim().max(50).allow(null, '').optional(),
        color: Joi.string().trim().max(20).allow(null, '').optional(),
        description: Joi.string().trim().max(1000).allow(null, '').optional(),
      });

      const { error, value } = schema.validate(req.body || {});
      if (error) throw new ValidationError(error.message);

      const data = await usecase.tagsUsecase.createTag(value);
      formatResponse(res, { statusCode: 201, body: data });
    } catch (err) {
      logger.error('Error in createTagController:', err.message);
      formatError(res, { error: err });
    }
  };
}

module.exports = makeCreateTagController;
