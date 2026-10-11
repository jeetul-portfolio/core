function makeUpdateOAuthClientController({ usecase, formatResponse, formatError, logger, Joi, ValidationError, redirectUrisSchema }) {
  return async function updateOAuthClientController(req, res) {
    try {
      const validatedInputs = validateInputs({ Joi, ValidationError, redirectUrisSchema, input: { clientId: req.params.clientId, ...(req.body || {}) } });

      const data = await usecase.oauthClientsUsecase.updateOAuthClient(validatedInputs);
      formatResponse(res, { statusCode: 200, body: data });
    } catch (error) {
      logger.error('Error in updateOAuthClientController:', error.message);
      formatError(res, { error });
    }
  };
}

function validateInputs({ Joi, ValidationError, redirectUrisSchema, input }) {
  const schema = Joi.object({
    clientId: Joi.string().guid().required(),
    clientName: Joi.string().trim().min(1).max(100).optional(),
    redirectUris: redirectUrisSchema.optional(),
    isActive: Joi.boolean().optional(),
  }).or('clientName', 'redirectUris', 'isActive');

  const validatedResponse = schema.validate(input);

  if (validatedResponse.error) {
    throw new ValidationError(validatedResponse.error.message);
  }

  return validatedResponse.value;
}

module.exports = makeUpdateOAuthClientController;
