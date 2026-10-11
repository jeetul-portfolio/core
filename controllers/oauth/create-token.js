const { setNoStoreHeaders, sendJsonError } = require('./oauth-http');

function makeCreateTokenController({ usecase, logger, Joi, OAuthError }) {
  return async function createTokenController(req, res) {
    try {
      const validatedInputs = validateInputs({ Joi, OAuthError, body: withClientCredentials(req) });

      const data = await usecase.oauthUsecase.createToken(validatedInputs);
      setNoStoreHeaders(res);
      res.status(200).json(data);
    } catch (error) {
      sendJsonError(res, error, logger);
    }
  };
}

// client_secret_basic: credentials arrive form-urlencoded in the Authorization header (RFC 6749 2.3.1).
function withClientCredentials(req) {
  const body = { ...(req.body || {}) };
  const header = req.headers.authorization || '';

  if (header.startsWith('Basic ')) {
    const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
    const separator = decoded.indexOf(':');
    if (separator > 0) {
      try {
        body.client_id = decodeURIComponent(decoded.slice(0, separator));
        body.client_secret = decodeURIComponent(decoded.slice(separator + 1));
      } catch {
        // malformed credentials fall through to invalid_client
      }
    }
  }

  return body;
}

function validateInputs({ Joi, OAuthError, body }) {
  const text = Joi.string().max(2048);
  const schema = Joi.object({
    grant_type: text.required(),
    client_id: text.optional(),
    client_secret: text.optional(),
    code: text.optional(),
    code_verifier: text.optional(),
    redirect_uri: text.optional(),
    resource: text.optional(),
    refresh_token: text.optional(),
  });

  const validatedResponse = schema.validate(body, { stripUnknown: true });

  if (validatedResponse.error) {
    throw new OAuthError('invalid_request', validatedResponse.error.message);
  }

  return validatedResponse.value;
}

module.exports = makeCreateTokenController;
