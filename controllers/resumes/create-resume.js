function makeCreateResumeController({ usecase, config, formatResponse, formatError, logger, ValidationError }) {
  return async function createResumeController(req, res) {
    try {
      if (!req.file) {
        throw new ValidationError('No file uploaded. Send a PDF as multipart/form-data field "file".');
      }

      const fileUrl = `${config.publicBaseUrl}/apis/core/assets/resume/${req.file.filename}`;

      const data = await usecase.resumesUsecase.createResume({
        filename: req.file.filename,
        fileUrl,
      });

      formatResponse(res, { statusCode: 201, body: data });
    } catch (error) {
      logger.error('Error in createResumeController:', error.message);
      formatError(res, { error });
    }
  };
}

module.exports = makeCreateResumeController;
