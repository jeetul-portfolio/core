function makePutProfileController({ usecase, formatResponse, formatError, logger, Joi, ValidationError }) {
  return async function putProfileController(req, res) {
    try {
      const validatedInputs = validatePutInputs({
        Joi,
        ValidationError,
        id: req.params.id,
        body: req.body,
      });

      const data = await usecase.profileUsecase.putProfile(validatedInputs);
      formatResponse(res, { statusCode: 200, body: data });
    } catch (error) {
      logger.error('Error in putProfileController:', error.message);
      formatError(res, { error });
    }
  };
}

function validatePutInputs({ Joi, ValidationError, id, body }) {
  const schema = Joi.object({
    id: Joi.number().integer().min(1).required(),
    fullName: Joi.string().trim().max(120).required(),
    email: Joi.string().trim().email().required(),
    phone: Joi.string().trim().max(50).allow('').optional(),
    location: Joi.string().trim().max(150).allow('').optional(),
    linkedin: Joi.string().uri().allow('').optional(),
    github: Joi.string().uri().allow('').optional(),
    website: Joi.string().uri().allow('').optional(),
    headline: Joi.string().trim().max(180).allow('').optional(),
    bio: Joi.string().trim().max(3000).allow('').optional(),
    avatarUrl: Joi.string().uri().allow('').optional(),
    isPublic: Joi.boolean().optional(),
  });

  const validatedResponse = schema.validate({ id, ...(body || {}) });

  if (validatedResponse.error) {
    throw new ValidationError(validatedResponse.error.message);
  }

  return validatedResponse.value;
}

module.exports = makePutProfileController;
