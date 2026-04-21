function makeGetSeoTagsController({ usecase, formatResponse, formatError, logger }) {
  return async function getSeoTagsController(req, res) {
    try {
      const data = await usecase.tagsUsecase.getSeoTags();
      formatResponse(res, { statusCode: 200, body: data });
    } catch (err) {
      logger.error('Error in getSeoTagsController:', err.message);
      formatError(res, { error: err });
    }
  };
}

module.exports = makeGetSeoTagsController;
