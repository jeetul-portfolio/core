function makeDeleteCategoryUsecase({ dataAccess, NotFoundError }) {
  return async function deleteCategoryUsecase({ id }) {
    const existing = await dataAccess.categories.getCategoryById({ id });

    if (!existing) {
      throw new NotFoundError(`Category not found for id ${id}`);
    }

    // skill_categories rows are deleted by FK ON DELETE CASCADE
    await dataAccess.categories.deleteCategory({ id });

    return { id, deleted: true };
  };
}

module.exports = makeDeleteCategoryUsecase;
