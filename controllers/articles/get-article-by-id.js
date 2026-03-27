function makeGetArticleByIdController({ usecase, formatResponse, formatError, logger, Joi, ValidationError }) {
  return async function getArticleByIdController(req, res) {
    try {
      const validatedInputs = validateInputs({
        Joi,
        ValidationError,
        id: req.params.id,
        includeDrafts: req.query.includeDrafts,
      });

      const data = await usecase.articlesUsecase.getArticleById(validatedInputs);
      formatResponse(res, { statusCode: 200, body: data });
    } catch (error) {
      logger.error('Error in getArticleByIdController:', error.message);
      formatError(res, { error });
    }
  };
}

function validateInputs({ Joi, ValidationError, id, includeDrafts }) {
  const schema = Joi.object({
    id: Joi.number().integer().min(1).required(),
    includeDrafts: Joi.boolean().truthy('true').truthy('1').falsy('false').falsy('0').default(false),
  });

  const validatedResponse = schema.validate({ id, includeDrafts });

  if (validatedResponse.error) {
    throw new ValidationError(validatedResponse.error.message);
  }

  return validatedResponse.value;
}

module.exports = makeGetArticleByIdController;
