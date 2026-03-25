function makeGetGitProjectsOverviewPaginationMetadataController({ usecase, formatResponse, formatError, logger, Joi, ValidationError }) {
  return async function getGitProjectsOverviewPaginationMetadataController(req, res) {
    try {
      const validatedInputs = validateInputs({
        Joi,
        ValidationError,
        page: req.query.page,
        pageSize: req.query.pageSize,
        onlyActive: req.query.onlyActive,
        projectKeys: parseProjectKeys(req.query.projectKeys),
      });

      const data = await usecase.getGitProjectsOverviewPaginationMetadata(validatedInputs);
      formatResponse(res, { statusCode: 200, body: data });
    } catch (error) {
      logger.error('Error in getGitProjectsOverviewPaginationMetadataController:', error.message);
      formatError(res, { error });
    }
  };
}

function parseProjectKeys(projectKeys) {
  if (!projectKeys) {
    return [];
  }

  if (Array.isArray(projectKeys)) {
    return projectKeys
      .flatMap((value) => String(value).split(','))
      .map((key) => key.trim())
      .filter(Boolean);
  }

  return String(projectKeys)
    .split(',')
    .map((key) => key.trim())
    .filter(Boolean);
}

function validateInputs({ Joi, ValidationError, page, pageSize, onlyActive, projectKeys }) {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    pageSize: Joi.number().integer().min(1).max(100).default(10),
    onlyActive: Joi.boolean().truthy('1', 'true', 'yes').falsy('0', 'false', 'no').default(false),
    projectKeys: Joi.array().items(Joi.string().trim().min(1).max(80)).default([]),
  });

  const validatedResponse = schema.validate({ page, pageSize, onlyActive, projectKeys });

  if (validatedResponse.error) {
    throw new ValidationError(validatedResponse.error.message);
  }

  return validatedResponse.value;
}

module.exports = makeGetGitProjectsOverviewPaginationMetadataController;