function makeGetSkillsController({ usecase, formatResponse, formatError, logger, Joi, ValidationError }) {
  return async function getSkillsController(req, res) {
    try {
      const validatedInputs = validateInputs({
        Joi,
        ValidationError,
        page: req.query.page,
        pageSize: req.query.pageSize,
        search: req.query.search,
      });

      const data = await usecase.skillsUsecase.getSkills(validatedInputs);
      formatResponse(res, { statusCode: 200, body: data });
    } catch (error) {
      logger.error('Error in getSkillsController:', error.message);
      formatError(res, { error });
    }
  };
}

function validateInputs({ Joi, ValidationError, page, pageSize, search }) {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    pageSize: Joi.number().integer().min(1).max(500).default(20),
    search: Joi.string().trim().allow('').default(''),
  });

  const validatedResponse = schema.validate({ page, pageSize, search });

  if (validatedResponse.error) {
    throw new ValidationError(validatedResponse.error.message);
  }

  return validatedResponse.value;
}

module.exports = makeGetSkillsController;
