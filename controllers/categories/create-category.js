function makeCreateCategoryController({ usecase, formatResponse, formatError, logger, Joi, ValidationError }) {
  return async function createCategoryController(req, res) {
    try {
      const schema = Joi.object({
        name: Joi.string().trim().min(1).max(100).required(),
        description: Joi.string().trim().allow('', null).optional(),
        sortOrder: Joi.number().integer().min(0).default(0),
      });

      const { error, value } = schema.validate(req.body || {});
      if (error) {
        throw new ValidationError(error.message);
      }

      const data = await usecase.categoriesUsecase.createCategory(value);
      formatResponse(res, { statusCode: 201, body: data });
    } catch (error) {
      logger.error('Error in createCategoryController:', error.message);
      formatError(res, { error });
    }
  };
}

module.exports = makeCreateCategoryController;
