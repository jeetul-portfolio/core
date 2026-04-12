function makeGetCategoryByIdUsecase({ dataAccess, presentCategory, NotFoundError }) {
  return async function getCategoryByIdUsecase({ id }) {
    const category = await dataAccess.categories.getCategoryById({ id });

    if (!category) {
      throw new NotFoundError(`Category not found for id ${id}`);
    }

    return presentCategory(category);
  };
}

module.exports = makeGetCategoryByIdUsecase;
