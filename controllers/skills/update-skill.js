const VALID_REFERENCE_TYPES = ['article', 'experience', 'project'];

function makeUpdateSkillController({ usecase, formatResponse, formatError, logger, Joi, ValidationError }) {
  return async function updateSkillController(req, res) {
    try {
      const validatedInputs = validateInputs({
        Joi,
        ValidationError,
        id: req.params.id,
        body: req.body,
      });

      const data = await usecase.skillsUsecase.updateSkill(validatedInputs);
      formatResponse(res, { statusCode: 200, body: data });
    } catch (error) {
      logger.error('Error in updateSkillController:', error.message);
      formatError(res, { error });
    }
  };
}

function validateInputs({ Joi, ValidationError, id, body }) {
  const referenceSchema = Joi.object({
    type: Joi.string().valid(...VALID_REFERENCE_TYPES).required(),
    referenceId: Joi.number().integer().min(1).required(),
  });

  const schema = Joi.object({
    id: Joi.number().integer().min(1).required(),
    name: Joi.string().trim().min(1).max(255).optional(),
    categoryIds: Joi.array().items(Joi.number().integer().min(1)).optional(),
    level: Joi.string().trim().max(50).optional(),
    notes: Joi.string().trim().allow('', null).optional(),
    sortOrder: Joi.number().integer().min(0).optional(),
    references: Joi.array().items(referenceSchema).optional(),
  });

  const validatedResponse = schema.validate({ id, ...(body || {}) });

  if (validatedResponse.error) {
    throw new ValidationError(validatedResponse.error.message);
  }

  return validatedResponse.value;
}

module.exports = makeUpdateSkillController;
