function makeGetRolesController({ usecase, formatResponse, formatError, logger }) {
  return async function getRolesController(req, res) {
    try {
      const data = await usecase.rolesUsecase.getRoles();
      formatResponse(res, { statusCode: 200, body: data });
    } catch (error) {
      logger.error('Error in getRolesController:', error.message);
      formatError(res, { error });
    }
  };
}

module.exports = makeGetRolesController;
