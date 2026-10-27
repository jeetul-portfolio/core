function makeAssertCategoriesExist({ dataAccess, ValidationError }) {
  return async function assertCategoriesExist(categoryIds) {
    const unique = [...new Set(categoryIds)];
    const found = await dataAccess.categories.getCategoriesByIds({ ids: unique });
    const foundIds = new Set(found.map((category) => Number(category.id)));
    const missing = unique.filter((id) => !foundIds.has(id));
    if (missing.length > 0) {
      throw new ValidationError(`Unknown category ids: ${missing.join(', ')}`);
    }
  };
}

module.exports = makeAssertCategoriesExist;
