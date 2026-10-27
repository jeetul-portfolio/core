function makeGetCategoryByIdUsecase({ dataAccess, presentCategory, NotFoundError }) {
  return async function getCategoryByIdUsecase({ id, slug }) {
    const category = id
      ? await dataAccess.categories.getCategoryById({ id })
      : await dataAccess.categories.getCategoryBySlug({ slug });

    if (!category) {
      throw new NotFoundError(`Category not found for ${id ? `id ${id}` : `slug ${slug}`}`);
    }

    return presentCategory(category);
  };
}

module.exports = makeGetCategoryByIdUsecase;
