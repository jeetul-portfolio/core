function makeCreateOAuthClientController({ usecase, formatResponse, formatError, logger, Joi, ValidationError, redirectUrisSchema }) {
  return async function createOAuthClientController(req, res) {
    try {
      const validatedInputs = validateInputs({ Joi, ValidationError, redirectUrisSchema, input: req.body || {} });

      const data = await usecase.oauthClientsUsecase.createOAuthClient(validatedInputs);
      formatResponse(res, { statusCode: 201, body: data });
    } catch (error) {
      logger.error('Error in createOAuthClientController:', error.message);
      formatError(res, { error });
    }
  };
}

function validateInputs({ Joi, ValidationError, redirectUrisSchema, input }) {
  const schema = Joi.object({
    clientName: Joi.string().trim().min(1).max(100).required(),
    redirectUris: redirectUrisSchema.required(),
    isActive: Joi.boolean().default(true),
  });

  const validatedResponse = schema.validate(input);

  if (validatedResponse.error) {
    throw new ValidationError(validatedResponse.error.message);
  }

  return validatedResponse.value;
}

module.exports = makeCreateOAuthClientController;
