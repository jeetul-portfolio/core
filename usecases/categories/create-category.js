function makeCreateCategoryUsecase({ dataAccess, getCategoryById }) {
  return async function createCategoryUsecase({ name, description, sortOrder }) {
    const created = await dataAccess.categories.createCategory({
      name: String(name).trim(),
      description: description ? String(description).trim() : null,
      sortOrder: sortOrder || 0,
    });

    return getCategoryById({ id: created.id });
  };
}

module.exports = makeCreateCategoryUsecase;
