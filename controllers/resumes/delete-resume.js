function makeDeleteResumeController({ usecase, formatResponse, formatError, logger, Joi, ValidationError }) {
  return async function deleteResumeController(req, res) {
    try {
      const { id } = validateInputs({ Joi, ValidationError, id: req.params.id });
      const data = await usecase.resumesUsecase.deleteResume({ id });
      formatResponse(res, { statusCode: 200, body: data });
    } catch (error) {
      logger.error('Error in deleteResumeController:', error.message);
      formatError(res, { error });
    }
  };
}

function validateInputs({ Joi, ValidationError, id }) {
  const schema = Joi.object({
    id: Joi.number().integer().min(1).required(),
  });

  const { error, value } = schema.validate({ id });

  if (error) {
    throw new ValidationError(error.message);
  }

  return value;
}

module.exports = makeDeleteResumeController;
