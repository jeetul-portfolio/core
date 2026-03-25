function makeGetGitProjectsOverviewPaginationMetadataUsecase({ dataAccess, Joi, ValidationError }) {
  return async function getGitProjectsOverviewPaginationMetadataUsecase({
    page = 1,
    pageSize = 10,
    onlyActive = false,
    projectKeys = [],
  } = {}) {
    const validatedInputs = validateInputs({ Joi, ValidationError, page, pageSize, onlyActive, projectKeys });

    const projects = await dataAccess.gitProjects.getGitProjects({
      onlyActive: validatedInputs.onlyActive,
      projectKeys: validatedInputs.projectKeys,
      sortBy: 'updatedAt',
      sortOrder: 'desc',
    });

    const totalItems = projects.length;
    const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / validatedInputs.pageSize);

    return {
      totalItems,
      totalPages,
    };
  };
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

module.exports = makeGetGitProjectsOverviewPaginationMetadataUsecase;