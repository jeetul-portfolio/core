function makeGetCategoriesController({ usecase, formatResponse, formatError, logger, Joi, ValidationError }) {
  return async function getCategoriesController(req, res) {
    try {
      const validatedInputs = validateInputs({
        Joi,
        ValidationError,
        page: req.query.page,
        pageSize: req.query.pageSize,
        search: req.query.search,
        includeSkills: req.query.includeSkills,
      });

      const data = await usecase.categoriesUsecase.getCategories(validatedInputs);
      formatResponse(res, { statusCode: 200, body: data });
    } catch (error) {
      logger.error('Error in getCategoriesController:', error.message);
      formatError(res, { error });
    }
  };
}

function validateInputs({ Joi, ValidationError, page, pageSize, search, includeSkills }) {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    pageSize: Joi.number().integer().min(1).max(500).default(100),
    search: Joi.string().trim().allow('').default(''),
    includeSkills: Joi.boolean().truthy('true').falsy('false').default(false),
  });

  const validatedResponse = schema.validate({ page, pageSize, search, includeSkills });

  if (validatedResponse.error) {
    throw new ValidationError(validatedResponse.error.message);
  }

  return validatedResponse.value;
}

module.exports = makeGetCategoriesController;
