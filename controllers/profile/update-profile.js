function makeUpdateProfileController({ usecase, formatResponse, formatError, logger, Joi, ValidationError }) {
  return async function updateProfileController(req, res) {
    try {
      const validatedInputs = validateInputs({
        Joi,
        ValidationError,
        body: req.body,
      });

      const data = await usecase.profileUsecase.updateProfile(validatedInputs);

      formatResponse(res, { statusCode: 200, body: data });
    } catch (error) {
      logger.error('Error in updateProfileController:', error.message);
      formatError(res, { error });
    }
  };
}

function validateInputs({ Joi, ValidationError, body }) {
  const schema = Joi.object({
    fullName: Joi.string().trim().max(120).allow('').optional(),
    email: Joi.string().trim().email().optional(),
    phone: Joi.string().trim().max(50).allow('').optional(),
    location: Joi.string().trim().max(150).allow('').optional(),
    linkedin: Joi.string().uri().allow('').optional(),
    github: Joi.string().uri().allow('').optional(),
    website: Joi.string().uri().allow('').optional(),
    headline: Joi.string().trim().max(180).allow('').optional(),
    bio: Joi.string().trim().max(3000).allow('').optional(),
    avatarUrl: Joi.string().uri().allow('').optional(),
    isPublic: Joi.boolean().optional(),
  }).min(1);

  const validatedResponse = schema.validate(body || {});

  if (validatedResponse.error) {
    throw new ValidationError(validatedResponse.error.message);
  }

  return validatedResponse.value;
}

module.exports = makeUpdateProfileController;
