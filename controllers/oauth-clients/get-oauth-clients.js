function makeGetOAuthClientsController({ usecase, formatResponse, formatError, logger, Joi, ValidationError, redirectUrisSchema }) {
  return async function getOAuthClientsController(req, res) {
    try {
      const validatedInputs = validateInputs({ Joi, ValidationError, redirectUrisSchema, input: {} });

      const data = await usecase.oauthClientsUsecase.getOAuthClients(validatedInputs);
      formatResponse(res, { statusCode: 200, body: data });
    } catch (error) {
      logger.error('Error in getOAuthClientsController:', error.message);
      formatError(res, { error });
    }
  };
}

function validateInputs({ Joi, ValidationError, redirectUrisSchema, input }) {
  const schema = Joi.object({

  });

  const validatedResponse = schema.validate(input);

  if (validatedResponse.error) {
    throw new ValidationError(validatedResponse.error.message);
  }

  return validatedResponse.value;
}

module.exports = makeGetOAuthClientsController;
