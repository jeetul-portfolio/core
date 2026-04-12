function makeDeleteTagController({ usecase, formatResponse, formatError, logger, Joi, ValidationError }) {
  return async function deleteTagController(req, res) {
    try {
      const schema = Joi.object({ id: Joi.number().integer().min(1).required() });
      const { error, value } = schema.validate({ id: req.params.id });
      if (error) throw new ValidationError(error.message);

      const data = await usecase.tagsUsecase.deleteTag(value);
      formatResponse(res, { statusCode: 200, body: data });
    } catch (err) {
      logger.error('Error in deleteTagController:', err.message);
      formatError(res, { error: err });
    }
  };
}

module.exports = makeDeleteTagController;
