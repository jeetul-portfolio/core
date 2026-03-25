function makeGetArticlesController({ usecase, formatResponse, formatError, logger, Joi, ValidationError }) {
  return async function getArticlesController(req, res) {
    try {
      const validatedInputs = validateInputs({
        Joi,
        ValidationError,
        page: req.query.page,
        pageSize: req.query.pageSize,
        search: req.query.search,
        tag: req.query.tag,
      });

      const data = await usecase.articlesUsecase.getArticles(validatedInputs);
      formatResponse(res, { statusCode: 200, body: data });
    } catch (error) {
      logger.error('Error in getArticlesController:', error.message);
      formatError(res, { error });
    }
  };
}

function validateInputs({ Joi, ValidationError, page, pageSize, search, tag }) {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    pageSize: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().trim().allow('').default(''),
    tag: Joi.string().trim().max(80).optional(),
  });

  const validatedResponse = schema.validate({ page, pageSize, search, tag });

  if (validatedResponse.error) {
    throw new ValidationError(validatedResponse.error.message);
  }

  return validatedResponse.value;
}

module.exports = makeGetArticlesController;
