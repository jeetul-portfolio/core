function makeGetActiveResumeController({ usecase, formatResponse, formatError, logger }) {
  return async function getActiveResumeController(req, res) {
    try {
      const data = await usecase.resumesUsecase.getActiveResume();
      formatResponse(res, { statusCode: 200, body: data });
    } catch (error) {
      logger.error('Error in getActiveResumeController:', error.message);
      formatError(res, { error });
    }
  };
}

module.exports = makeGetActiveResumeController;
