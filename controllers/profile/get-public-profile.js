function makeGetPublicProfileController({ usecase, formatResponse, formatError, logger }) {
  return async function getPublicProfileController(req, res) {
    try {
      const data = await usecase.profileUsecase.getPublicProfile();
      formatResponse(res, { statusCode: 200, body: data });
    } catch (error) {
      logger.error('Error in getPublicProfileController:', error.message);
      formatError(res, { error });
    }
  };
}

module.exports = makeGetPublicProfileController;
