const { parseIdOrSlug } = require('../content-records/request-helpers');

function makeGetCategoryByIdController({ usecase, formatResponse, formatError, logger }) {
  return async function getCategoryByIdController(req, res) {
    try {
      // Accepts a numeric id or a slug.
      const data = await usecase.categoriesUsecase.getCategoryById(parseIdOrSlug(req.params.id));
      formatResponse(res, { statusCode: 200, body: data });
    } catch (error) {
      logger.error('Error in getCategoryByIdController:', error.message);
      formatError(res, { error });
    }
  };
}

module.exports = makeGetCategoryByIdController;
