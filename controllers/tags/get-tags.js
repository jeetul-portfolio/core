function makeGetTagsController({ usecase, formatResponse, formatError, logger, Joi, ValidationError }) {
  return async function getTagsController(req, res) {
    try {
      const schema = Joi.object({
        page: Joi.number().integer().min(1).default(1),
        pageSize: Joi.number().integer().min(1).max(500).default(50),
        search: Joi.string().trim().allow('').default(''),
      });

      const { error, value } = schema.validate({
        page: req.query.page,
        pageSize: req.query.pageSize,
        search: req.query.search,
      });

      if (error) throw new ValidationError(error.message);

      const data = await usecase.tagsUsecase.getTags(value);
      formatResponse(res, { statusCode: 200, body: data });
    } catch (err) {
      logger.error('Error in getTagsController:', err.message);
      formatError(res, { error: err });
    }
  };
}

module.exports = makeGetTagsController;
