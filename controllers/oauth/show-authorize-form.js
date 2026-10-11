const { AUTHORIZE_FIELDS, sendHtmlError, renderAuthorizeForm } = require('./oauth-http');

const CSRF_COOKIE = 'oauth_csrf';
const CSRF_COOKIE_MAX_AGE_MS = 10 * 60 * 1000;

function makeShowAuthorizeFormController({ usecase, config, logger, crypto, Joi, OAuthError }) {
  const secureCookie = String(config.oauth.issuer).startsWith('https://');

  return async function showAuthorizeFormController(req, res) {
    try {
      const params = validateInputs({ Joi, OAuthError, query: req.query });
      const request = await usecase.oauthUsecase.parseAuthorizeRequest(params);

      const csrf = crypto.randomBytes(24).toString('base64url');
      res.cookie(CSRF_COOKIE, csrf, {
        httpOnly: true,
        sameSite: 'strict',
        secure: secureCookie,
        path: '/oauth/authorize',
        maxAge: CSRF_COOKIE_MAX_AGE_MS,
      });
      renderAuthorizeForm(res, { request, params, csrf });
    } catch (error) {
      sendHtmlError(res, error, logger);
    }
  };
}

function validateInputs({ Joi, OAuthError, query }) {
  const schema = Joi.object(
    Object.fromEntries(AUTHORIZE_FIELDS.map((field) => [field, Joi.string().max(2048).optional()]))
  );

  const validatedResponse = schema.validate(query || {}, { stripUnknown: true });

  if (validatedResponse.error) {
    throw new OAuthError('invalid_request', validatedResponse.error.message);
  }

  return validatedResponse.value;
}

module.exports = makeShowAuthorizeFormController;
