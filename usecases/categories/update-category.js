function makeUpdateCategoryUsecase({ dataAccess, getCategoryById, NotFoundError }) {
  return async function updateCategoryUsecase(input) {
    const existing = await dataAccess.categories.getCategoryById({ id: input.id });

    if (!existing) {
      throw new NotFoundError(`Category not found for id ${input.id}`);
    }

    const payload = buildPayload(input);

    if (Object.keys(payload).length > 1) {
      const updated = await dataAccess.categories.updateCategory(payload);
      if (!updated) {
        throw new NotFoundError(`Category not found for id ${input.id}`);
      }
    }

    return getCategoryById({ id: input.id });
  };
}

function buildPayload(input) {
  const payload = { id: input.id };
  const fields = ['name', 'description', 'sortOrder'];

  for (const field of fields) {
    if (Object.prototype.hasOwnProperty.call(input, field)) {
      payload[field] = input[field];
    }
  }

  return payload;
}

module.exports = makeUpdateCategoryUsecase;
