function makeGetTagGraphController({ usecase, formatResponse, formatError, logger }) {
  return async function getTagGraphController(req, res) {
    try {
      const data = await usecase.tagsUsecase.getTagGraph();
      formatResponse(res, { statusCode: 200, body: data });
    } catch (err) {
      logger.error('Error in getTagGraphController:', err.message);
      formatError(res, { error: err });
    }
  };
}

module.exports = makeGetTagGraphController;
