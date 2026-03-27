function makeCreateProfileController({ usecase, formatResponse, formatError, logger, Joi, ValidationError }) {
  return async function createProfileController(req, res) {
    try {
      const validatedInputs = validateCreateInputs({
        Joi,
        ValidationError,
        body: req.body,
      });

      const data = await usecase.profileUsecase.createProfile(validatedInputs);
      formatResponse(res, { statusCode: 201, body: data });
    } catch (error) {
      logger.error('Error in createProfileController:', error.message);
      formatError(res, { error });
    }
  };
}

function buildBaseSchema(Joi) {
  return {
    fullName: Joi.string().trim().max(120),
    email: Joi.string().trim().email(),
    phone: Joi.string().trim().max(50).allow(''),
    location: Joi.string().trim().max(150).allow(''),
    linkedin: Joi.string().uri().allow(''),
    github: Joi.string().uri().allow(''),
    website: Joi.string().uri().allow(''),
    headline: Joi.string().trim().max(180).allow(''),
    bio: Joi.string().trim().max(3000).allow(''),
    avatarUrl: Joi.string().uri().allow(''),
    isPublic: Joi.boolean(),
  };
}

function validateCreateInputs({ Joi, ValidationError, body }) {
  const schema = Joi.object({
    ...buildBaseSchema(Joi),
    fullName: buildBaseSchema(Joi).fullName.required(),
    email: buildBaseSchema(Joi).email.required(),
  });

  const validatedResponse = schema.validate(body || {});

  if (validatedResponse.error) {
    throw new ValidationError(validatedResponse.error.message);
  }

  return validatedResponse.value;
}

module.exports = makeCreateProfileController;
