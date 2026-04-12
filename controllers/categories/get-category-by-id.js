function makeGetCategoryByIdController({ usecase, formatResponse, formatError, logger, Joi, ValidationError }) {
  return async function getCategoryByIdController(req, res) {
    try {
      const schema = Joi.object({
        id: Joi.number().integer().min(1).required(),
      });

      const { error, value } = schema.validate({ id: req.params.id });
      if (error) {
        throw new ValidationError(error.message);
      }

      const data = await usecase.categoriesUsecase.getCategoryById(value);
      formatResponse(res, { statusCode: 200, body: data });
    } catch (error) {
      logger.error('Error in getCategoryByIdController:', error.message);
      formatError(res, { error });
    }
  };
}

module.exports = makeGetCategoryByIdController;
