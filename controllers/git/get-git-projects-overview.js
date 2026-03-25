function makeGetGitProjectsOverviewController({ usecase, formatResponse, formatError, logger, Joi, ValidationError }) {
  return async function getGitProjectsOverviewController(req, res) {
    try {
      const validatedInputs = validateInputs({
        Joi,
        ValidationError,
        limit: req.query.limit,
        page: req.query.page,
        pageSize: req.query.pageSize,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder,
        onlyActive: req.query.onlyActive,
        projectKeys: parseProjectKeys(req.query.projectKeys),
      });

      const data = await usecase.gitUsecase.getGitProjectsOverview(validatedInputs);

      formatResponse(res, { statusCode: 200, body: data });
    } catch (error) {
      logger.error('Error in getGitProjectsOverviewController:', error.message);
      formatError(res, { error });
    }
  };

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


function validateInputs({ Joi, ValidationError, limit, page, pageSize, sortBy, sortOrder, onlyActive, projectKeys }) {
  const schema = Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(5),
    page: Joi.number().integer().min(1).default(1),
    pageSize: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().trim().valid('committedAt', 'updatedAt', 'createdAt', 'lastSyncedAt', 'displayName', 'projectKey').default('committedAt'),
    sortOrder: Joi.string().trim().lowercase().valid('asc', 'desc').default('desc'),
    onlyActive: Joi.boolean().truthy('1', 'true', 'yes').falsy('0', 'false', 'no').default(false),
    projectKeys: Joi.array().items(Joi.string().trim().min(1).max(80)).default([]),
  });

  const validatedResponse = schema.validate({
    limit,
    page,
    pageSize,
    sortBy,
    sortOrder,
    onlyActive,
    projectKeys,
  });

  if (validatedResponse.error) {
    throw new ValidationError(validatedResponse.error.message);
  }

  return validatedResponse.value;
}
}

module.exports = makeGetGitProjectsOverviewController;