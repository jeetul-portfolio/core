function makeUpdateUserController({ usecase, formatResponse, formatError, logger, Joi, ValidationError }) {
  return async function updateUserController(req, res) {
    try {
      const validatedInputs = validateInputs({
        Joi,
        ValidationError,
        id: req.params.id,
        body: req.body,
      });

      const data = await usecase.usersUsecase.updateUser({
        ...validatedInputs,
        actorUserId: Number(req.auth?.sub),
        actorRoles: req.auth?.roles || [],
      });

      formatResponse(res, { statusCode: 200, body: data });
    } catch (error) {
      logger.error('Error in updateUserController:', error.message);
      formatError(res, { error });
    }
  };
}

function validateInputs({ Joi, ValidationError, id, body }) {
  const blockedFields = ['id', 'createdAt', 'updatedAt', 'created_at', 'updated_at'];
  const payload = body || {};
  const attemptedBlockedField = blockedFields.find((field) => Object.prototype.hasOwnProperty.call(payload, field));

  if (attemptedBlockedField) {
    throw new ValidationError(`${attemptedBlockedField} cannot be updated.`);
  }

  const schema = Joi.object({
    id: Joi.number().integer().min(1).required(),
    email: Joi.string().trim().email().optional(),
    fullName: Joi.string().trim().max(120).allow('').optional(),
    isActive: Joi.boolean().optional(),
    roleId: Joi.number().integer().min(1).optional(),
  }).or('email', 'fullName', 'isActive', 'roleId');

  const validatedResponse = schema.validate({
    ...payload,
    id,
  });

  if (validatedResponse.error) {
    throw new ValidationError(validatedResponse.error.message);
  }

  return validatedResponse.value;
}

module.exports = makeUpdateUserController;
