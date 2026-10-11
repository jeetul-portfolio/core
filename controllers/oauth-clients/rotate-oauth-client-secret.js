function makeRotateOAuthClientSecretController({ usecase, formatResponse, formatError, logger, Joi, ValidationError, redirectUrisSchema }) {
  return async function rotateOAuthClientSecretController(req, res) {
    try {
      const validatedInputs = validateInputs({ Joi, ValidationError, redirectUrisSchema, input: { clientId: req.params.clientId } });

      const data = await usecase.oauthClientsUsecase.rotateOAuthClientSecret(validatedInputs);
      formatResponse(res, { statusCode: 200, body: data });
    } catch (error) {
      logger.error('Error in rotateOAuthClientSecretController:', error.message);
      formatError(res, { error });
    }
  };
}

function validateInputs({ Joi, ValidationError, redirectUrisSchema, input }) {
  const schema = Joi.object({
    clientId: Joi.string().guid().required(),
  });

  const validatedResponse = schema.validate(input);

  if (validatedResponse.error) {
    throw new ValidationError(validatedResponse.error.message);
  }

  return validatedResponse.value;
}

module.exports = makeRotateOAuthClientSecretController;
