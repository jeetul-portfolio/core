function makeGetArticleBySlugController({ usecase, formatResponse, formatError, logger, Joi, ValidationError }) {
  return async function getArticleBySlugController(req, res) {
    try {
      const validatedInputs = validateInputs({
        Joi,
        ValidationError,
        slug: req.params.slug,
        includeDrafts: req.query.includeDrafts,
      });

      const data = await usecase.articlesUsecase.getArticleBySlug(validatedInputs);
      formatResponse(res, { statusCode: 200, body: data });
    } catch (error) {
      logger.error('Error in getArticleBySlugController:', error.message);
      formatError(res, { error });
    }
  };
}

function validateInputs({ Joi, ValidationError, slug, includeDrafts }) {
  const schema = Joi.object({
    slug: Joi.string().trim().lowercase().max(255).pattern(/^[a-z0-9-]+$/).required(),
    includeDrafts: Joi.boolean().truthy('true').truthy('1').falsy('false').falsy('0').default(false),
  });

  const validatedResponse = schema.validate({ slug, includeDrafts });

  if (validatedResponse.error) {
    throw new ValidationError(validatedResponse.error.message);
  }

  return validatedResponse.value;
}

module.exports = makeGetArticleBySlugController;
