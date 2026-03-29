function makeCreateArticleController({ usecase, formatResponse, formatError, logger, Joi, ValidationError }) {
  return async function createArticleController(req, res) {
    try {
      const validatedInputs = validateInputs({
        Joi,
        ValidationError,
        body: req.body,
      });

      const data = await usecase.articlesUsecase.createArticle(validatedInputs);
      formatResponse(res, { statusCode: 201, body: data });
    } catch (error) {
      logger.error('Error in createArticleController:', error.message);
      formatError(res, { error });
    }
  };
}

function validateInputs({ Joi, ValidationError, body }) {
  const schema = Joi.object({
    title: Joi.string().trim().min(1).max(255).required(),
    tags: Joi.alternatives()
      .try(
        Joi.array().items(Joi.string().trim().min(1).max(80)).max(50),
        Joi.string().trim().allow('')
      )
      .optional(),
    excerpt: Joi.string().trim().allow('').max(2000).optional(),
    content: Joi.string().trim().min(1).required(),
    coverImage: Joi.string().uri().allow(null, '').optional(),
    authorName: Joi.string().trim().max(120).allow('').optional(),
    authorAvatar: Joi.string().uri().allow(null, '').optional(),
    status: Joi.string().valid('draft', 'published').default('draft'),
    publishedAt: Joi.date().iso().allow(null).optional(),
  });

  const validatedResponse = schema.validate(body || {});

  if (validatedResponse.error) {
    throw new ValidationError(validatedResponse.error.message);
  }

  return validatedResponse.value;
}

module.exports = makeCreateArticleController;
