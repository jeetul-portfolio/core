function makePublishArticleController({ usecase, formatResponse, formatError, logger, Joi, ValidationError }) {
  return async function publishArticleController(req, res) {
    try {
      const validatedInputs = validateInputs({ Joi, ValidationError, id: req.params.id, body: req.body });
      const data = await usecase.articlesUsecase.publishArticle(validatedInputs);
      formatResponse(res, { statusCode: 200, body: data });
    } catch (error) {
      logger.error('Error in publishArticleController:', error.message);
      formatError(res, { error });
    }
  };
}

function validateInputs({ Joi, ValidationError, id, body }) {
  const schema = Joi.object({
    id: Joi.number().integer().min(1).required(),
    action: Joi.string().valid('publish', 'unpublish').required(),
  });

  const validatedResponse = schema.validate({ id, ...(body || {}) });
  if (validatedResponse.error) {
    throw new ValidationError(validatedResponse.error.message);
  }

  return validatedResponse.value;
}

module.exports = makePublishArticleController;
