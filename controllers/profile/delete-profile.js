function makeDeleteProfileController({ usecase, formatResponse, formatError, logger, Joi, ValidationError }) {
  return async function deleteProfileController(req, res) {
    try {
      const validatedInputs = validateInputs({
        Joi,
        ValidationError,
        id: req.params.id,
      });

      const data = await usecase.profileUsecase.deleteProfile(validatedInputs);
      formatResponse(res, { statusCode: 200, body: data });
    } catch (error) {
      logger.error('Error in deleteProfileController:', error.message);
      formatError(res, { error });
    }
  };
}

function validateInputs({ Joi, ValidationError, id }) {
  const schema = Joi.object({
    id: Joi.number().integer().min(1).required(),
  });

  const validatedResponse = schema.validate({ id });

  if (validatedResponse.error) {
    throw new ValidationError(validatedResponse.error.message);
  }

  return validatedResponse.value;
}

module.exports = makeDeleteProfileController;
