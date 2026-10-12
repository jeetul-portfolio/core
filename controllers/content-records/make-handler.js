/** Wraps a request -> data function with the standard response envelope and error logging. */
function makeHandler({ formatResponse, formatError, logger, usecaseKey }) {
  return function handle(name, statusCode, work) {
    return async function contentRecordsController(req, res) {
      try {
        const data = await work(req);
        formatResponse(res, { statusCode, body: data });
      } catch (error) {
        logger.error(`Error in ${usecaseKey}.${name}:`, error.message);
        formatError(res, { error });
      }
    };
  };
}

module.exports = makeHandler;
