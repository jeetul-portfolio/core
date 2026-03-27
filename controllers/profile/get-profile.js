function makeGetProfileController({ usecase, formatResponse, formatError, logger }) {
  return async function getProfileController(req, res) {
    try {
      const data = await usecase.profileUsecase.getProfile();

      formatResponse(res, { statusCode: 200, body: data });
    } catch (error) {
      logger.error('Error in getProfileController:', error.message);
      formatError(res, { error });
    }
  };
}

module.exports = makeGetProfileController;
