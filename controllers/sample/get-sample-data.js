function makeGetSampleDataController({ usecase, formatResponse, formatError, logger }) {
  return async function getSampleDataController(req, res) {
    try {
      const data = await usecase.sampleUsecase.getSampleData();
      formatResponse(res, { statusCode: 200, body: data });
    } catch (error) {
      logger.error('Error in getSampleDataController:', error.message);
      formatError(res, { error });
    }
  };
}

module.exports = makeGetSampleDataController;
