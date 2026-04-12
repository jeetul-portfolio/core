const VALID_REFERENCE_TYPES = ['article', 'experience', 'project'];

function makeCreateSkillController({ usecase, formatResponse, formatError, logger, Joi, ValidationError }) {
  return async function createSkillController(req, res) {
    try {
      const validatedInputs = validateInputs({
        Joi,
        ValidationError,
        body: req.body,
      });

      const data = await usecase.skillsUsecase.createSkill(validatedInputs);
      formatResponse(res, { statusCode: 201, body: data });
    } catch (error) {
      logger.error('Error in createSkillController:', error.message);
      formatError(res, { error });
    }
  };
}

function validateInputs({ Joi, ValidationError, body }) {
  const referenceSchema = Joi.object({
    type: Joi.string().valid(...VALID_REFERENCE_TYPES).required(),
    referenceId: Joi.number().integer().min(1).required(),
  });

  const schema = Joi.object({
    name: Joi.string().trim().min(1).max(255).required(),
    categoryIds: Joi.array().items(Joi.number().integer().min(1)).default([]),
    level: Joi.string().trim().max(50).default('Beginner'),
    notes: Joi.string().trim().allow('', null).optional(),
    sortOrder: Joi.number().integer().min(0).default(0),
    references: Joi.array().items(referenceSchema).default([]),
  });

  const validatedResponse = schema.validate(body || {});

  if (validatedResponse.error) {
    throw new ValidationError(validatedResponse.error.message);
  }

  return validatedResponse.value;
}

module.exports = makeCreateSkillController;
