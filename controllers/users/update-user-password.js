function makeUpdateUserPasswordController({ usecase, formatResponse, formatError, logger, Joi, ValidationError }) {
  return async function updateUserPasswordController(req, res) {
    try {
      const validatedInputs = validateInputs({
        Joi,
        ValidationError,
        id: req.params.id,
        body: req.body,
      });

      const data = await usecase.usersUsecase.updateUserPassword({
        ...validatedInputs,
        actorUserId: Number(req.auth?.sub),
      });

      formatResponse(res, { statusCode: 200, body: data });
    } catch (error) {
      logger.error('Error in updateUserPasswordController:', error.message);
      formatError(res, { error });
    }
  };
}

function validateInputs({ Joi, ValidationError, id, body }) {
  const schema = Joi.object({
    id: Joi.number().integer().min(1).required(),
    currentPassword: Joi.string().trim().min(8).max(128).required(),
    newPassword: Joi.string().trim().min(8).max(128).required(),
  });

  const validatedResponse = schema.validate({
    id,
    ...(body || {}),
  });

  if (validatedResponse.error) {
    throw new ValidationError(validatedResponse.error.message);
  }

  if (validatedResponse.value.currentPassword === validatedResponse.value.newPassword) {
    throw new ValidationError('New password must be different from current password');
  }

  return validatedResponse.value;
}

module.exports = makeUpdateUserPasswordController;
