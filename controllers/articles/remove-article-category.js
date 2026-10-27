function makeRemoveArticleCategoryController({ usecase, formatResponse, formatError, logger, Joi, ValidationError }) {
  return async function removeArticleCategoryController(req, res) {
    try {
      const schema = Joi.object({
        id: Joi.number().integer().min(1).required(),
        categoryId: Joi.number().integer().min(1).required(),
      });

      const { error, value } = schema.validate({ id: req.params.id, categoryId: req.params.categoryId });
      if (error) {
        throw new ValidationError(error.message);
      }

      const data = await usecase.articlesUsecase.removeArticleCategory(value);
      formatResponse(res, { statusCode: 200, body: data });
    } catch (error) {
      logger.error('Error in removeArticleCategoryController:', error.message);
      formatError(res, { error });
    }
  };
}

module.exports = makeRemoveArticleCategoryController;
