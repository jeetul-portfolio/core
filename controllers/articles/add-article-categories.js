function makeAddArticleCategoriesController({ usecase, formatResponse, formatError, logger, Joi, ValidationError }) {
  return async function addArticleCategoriesController(req, res) {
    try {
      const schema = Joi.object({
        id: Joi.number().integer().min(1).required(),
        categoryIds: Joi.array().items(Joi.number().integer().min(1)).unique().min(1).max(50).required(),
      });

      const { error, value } = schema.validate({ ...(req.body || {}), id: req.params.id });
      if (error) {
        throw new ValidationError(error.message);
      }

      const data = await usecase.articlesUsecase.addArticleCategories(value);
      formatResponse(res, { statusCode: 200, body: data });
    } catch (error) {
      logger.error('Error in addArticleCategoriesController:', error.message);
      formatError(res, { error });
    }
  };
}

module.exports = makeAddArticleCategoriesController;
