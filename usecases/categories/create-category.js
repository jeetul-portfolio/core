function makeCreateCategoryUsecase({ dataAccess, getCategoryById, resolveCategorySlug }) {
  return async function createCategoryUsecase({ name, slug, description, sortOrder }) {
    const trimmedName = String(name).trim();
    const created = await dataAccess.categories.createCategory({
      name: trimmedName,
      slug: await resolveCategorySlug({ requested: slug, source: trimmedName }),
      description: description ? String(description).trim() : null,
      sortOrder: sortOrder || 0,
    });

    return getCategoryById({ id: created.id });
  };
}

module.exports = makeCreateCategoryUsecase;
