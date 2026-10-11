function makeGetOAuthMetadataController({ usecase, logger }) {
  return function getOAuthMetadataController(req, res) {
    try {
      res.set('Cache-Control', 'public, max-age=300').json(usecase.oauthUsecase.getOAuthMetadata());
    } catch (error) {
      logger.error('Error in getOAuthMetadataController:', error.message);
      res.status(500).json({ error: 'server_error', error_description: 'Internal error' });
    }
  };
}

module.exports = makeGetOAuthMetadataController;
