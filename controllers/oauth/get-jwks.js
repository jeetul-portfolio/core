function makeGetJwksController({ usecase, logger }) {
  return function getJwksController(req, res) {
    try {
      res.set('Cache-Control', 'public, max-age=300').json(usecase.oauthUsecase.getJwks());
    } catch (error) {
      logger.error('Error in getJwksController:', error.message);
      res.status(500).json({ error: 'server_error', error_description: 'Internal error' });
    }
  };
}

module.exports = makeGetJwksController;
