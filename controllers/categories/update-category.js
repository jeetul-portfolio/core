function makeUpdateCategoryController({ usecase, formatResponse, formatError, logger, Joi, ValidationError }) {
  return async function updateCategoryController(req, res) {
    try {
      const schema = Joi.object({
        id: Joi.number().integer().min(1).required(),
        name: Joi.string().trim().min(1).max(100).optional(),
        description: Joi.string().trim().allow('', null).optional(),
        sortOrder: Joi.number().integer().min(0).optional(),
      });

      const { error, value } = schema.validate({ id: req.params.id, ...(req.body || {}) });
      if (error) {
        throw new ValidationError(error.message);
      }

      const data = await usecase.categoriesUsecase.updateCategory(value);
      formatResponse(res, { statusCode: 200, body: data });
    } catch (error) {
      logger.error('Error in updateCategoryController:', error.message);
      formatError(res, { error });
    }
  };
}

module.exports = makeUpdateCategoryController;
