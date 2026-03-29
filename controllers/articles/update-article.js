function makeUpdateArticleController({ usecase, formatResponse, formatError, logger, Joi, ValidationError }) {
  return async function updateArticleController(req, res) {
    try {
      const validatedInputs = validateInputs({
        Joi,
        ValidationError,
        id: req.params.id,
        body: req.body,
      });

      const data = await usecase.articlesUsecase.updateArticle(validatedInputs);
      formatResponse(res, { statusCode: 200, body: data });
    } catch (error) {
      logger.error('Error in updateArticleController:', error.message);
      formatError(res, { error });
    }
  };
}

function validateInputs({ Joi, ValidationError, id, body }) {
  const schema = Joi.object({
    id: Joi.number().integer().min(1).required(),
    title: Joi.string().trim().min(1).max(255).optional(),
    tags: Joi.alternatives()
      .try(
        Joi.array().items(Joi.string().trim().min(1).max(80)).max(50),
        Joi.string().trim().allow('')
      )
      .optional(),
    excerpt: Joi.string().trim().allow('').max(2000).optional(),
    content: Joi.string().trim().min(1).optional(),
    coverImage: Joi.string().uri().allow(null, '').optional(),
    authorName: Joi.string().trim().max(120).allow('').optional(),
    authorAvatar: Joi.string().uri().allow(null, '').optional(),
    status: Joi.string().valid('draft', 'published').optional(),
    publishedAt: Joi.date().iso().allow(null).optional(),
  }).or('title', 'tags', 'excerpt', 'content', 'coverImage', 'authorName', 'authorAvatar', 'status', 'publishedAt');

  const validatedResponse = schema.validate({
    id,
    ...(body || {}),
  });

  if (validatedResponse.error) {
    throw new ValidationError(validatedResponse.error.message);
  }

  return validatedResponse.value;
}

module.exports = makeUpdateArticleController;
