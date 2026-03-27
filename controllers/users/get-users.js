function makeGetUsersController({ usecase, formatResponse, formatError, logger, Joi, ValidationError }) {
  return async function getUsersController(req, res) {
    try {
      const validatedInputs = validateInputs({
        Joi,
        ValidationError,
        page: req.query.page,
        pageSize: req.query.pageSize,
      });

      const data = await usecase.usersUsecase.getUsers(validatedInputs);
      formatResponse(res, { statusCode: 200, body: data });
    } catch (error) {
      logger.error('Error in getUsersController:', error.message);
      formatError(res, { error });
    }
  };
}

function validateInputs({ Joi, ValidationError, page, pageSize }) {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    pageSize: Joi.number().integer().min(1).max(100).default(20),
  });

  const validatedResponse = schema.validate({ page, pageSize });

  if (validatedResponse.error) {
    throw new ValidationError(validatedResponse.error.message);
  }

  return validatedResponse.value;
}

module.exports = makeGetUsersController;
