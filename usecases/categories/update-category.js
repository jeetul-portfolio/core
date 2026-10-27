function makeUpdateCategoryUsecase({ dataAccess, getCategoryById, resolveCategorySlug, NotFoundError }) {
  return async function updateCategoryUsecase(input) {
    const existing = await dataAccess.categories.getCategoryById({ id: input.id });

    if (!existing) {
      throw new NotFoundError(`Category not found for id ${input.id}`);
    }

    const payload = buildPayload(input);

    // Slugs stay stable on rename (they are public URLs); they change only when supplied.
    if (payload.slug !== undefined && payload.slug !== existing.slug) {
      payload.slug = await resolveCategorySlug({ requested: payload.slug, source: existing.name, excludeId: input.id });
    } else {
      delete payload.slug;
    }

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
  const fields = ['name', 'slug', 'description', 'sortOrder'];

  for (const field of fields) {
    if (Object.prototype.hasOwnProperty.call(input, field)) {
      payload[field] = input[field];
    }
  }

  return payload;
}

module.exports = makeUpdateCategoryUsecase;
