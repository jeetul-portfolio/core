function makeDeleteArticleController({ usecase, formatResponse, formatError, logger, Joi, ValidationError }) {
  return async function deleteArticleController(req, res) {
    try {
      const validatedInputs = validateInputs({
        Joi,
        ValidationError,
        id: req.params.id,
      });

      const data = await usecase.articlesUsecase.deleteArticle(validatedInputs);
      formatResponse(res, { statusCode: 200, body: data });
    } catch (error) {
      logger.error('Error in deleteArticleController:', error.message);
      formatError(res, { error });
    }
  };
}

function validateInputs({ Joi, ValidationError, id }) {
  const schema = Joi.object({
    id: Joi.number().integer().min(1).required(),
  });

  const validatedResponse = schema.validate({ id });

  if (validatedResponse.error) {
    throw new ValidationError(validatedResponse.error.message);
  }

  return validatedResponse.value;
}

module.exports = makeDeleteArticleController;
