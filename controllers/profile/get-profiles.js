function makeGetProfilesController({ usecase, formatResponse, formatError, logger }) {
  return async function getProfilesController(req, res) {
    try {
      const data = await usecase.profileUsecase.getProfiles();
      formatResponse(res, { statusCode: 200, body: data });
    } catch (error) {
      logger.error('Error in getProfilesController:', error.message);
      formatError(res, { error });
    }
  };
}

module.exports = makeGetProfilesController;
