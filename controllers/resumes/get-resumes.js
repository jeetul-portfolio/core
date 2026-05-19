function makeGetResumesController({ usecase, formatResponse, formatError, logger }) {
  return async function getResumesController(req, res) {
    try {
      const data = await usecase.resumesUsecase.getResumes();
      formatResponse(res, { statusCode: 200, body: data });
    } catch (error) {
      logger.error('Error in getResumesController:', error.message);
      formatError(res, { error });
    }
  };
}

module.exports = makeGetResumesController;
