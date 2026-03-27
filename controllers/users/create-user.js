function makeCreateUserController({ usecase, formatResponse, formatError, logger, Joi, ValidationError }) {
  return async function createUserController(req, res) {
    try {
      const validatedInputs = validateInputs({
        Joi,
        ValidationError,
        body: req.body,
      });

      const data = await usecase.usersUsecase.createUser(validatedInputs);
      formatResponse(res, { statusCode: 201, body: data });
    } catch (error) {
      logger.error('Error in createUserController:', error.message);
      formatError(res, { error });
    }
  };
}

function validateInputs({ Joi, ValidationError, body }) {
  const schema = Joi.object({
    email: Joi.string().trim().email().required(),
    password: Joi.string().trim().min(8).max(128).required(),
    fullName: Joi.string().trim().max(120).allow('').optional(),
    roleId: Joi.number().integer().min(1).required(),
  });

  const validatedResponse = schema.validate(body || {});

  if (validatedResponse.error) {
    throw new ValidationError(validatedResponse.error.message);
  }

  return validatedResponse.value;
}

module.exports = makeCreateUserController;
