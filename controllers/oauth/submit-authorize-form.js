const { AUTHORIZE_FIELDS, setNoStoreHeaders, sendHtmlError, renderAuthorizeForm } = require('./oauth-http');

const CSRF_COOKIE = 'oauth_csrf';

function makeSubmitAuthorizeFormController({ usecase, logger, crypto, Joi, OAuthError }) {
  return async function submitAuthorizeFormController(req, res) {
    try {
      const { csrf, email, password, ...params } = validateInputs({ Joi, OAuthError, body: req.body });

      const cookie = req.cookies?.[CSRF_COOKIE];
      const expected = Buffer.from(String(cookie || ''));
      const received = Buffer.from(String(csrf || ''));
      if (!cookie || expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
        throw new OAuthError('invalid_request', 'Session expired. Please restart the sign-in.');
      }

      try {
        const redirectUrl = await usecase.oauthUsecase.approveAuthorization({ params, email, password });
        setNoStoreHeaders(res);
        res.clearCookie(CSRF_COOKIE, { path: '/oauth/authorize' });
        res.redirect(303, redirectUrl);
      } catch (error) {
        if (error.name !== 'OAuthError' || error.error !== 'invalid_credentials') {
          throw error;
        }
        // Wrong password: show the form again, keeping the same CSRF token.
        const request = await usecase.oauthUsecase.parseAuthorizeRequest(params);
        renderAuthorizeForm(res, { request, params, csrf: cookie, error: 'Invalid credentials' });
      }
    } catch (error) {
      sendHtmlError(res, error, logger);
    }
  };
}

function validateInputs({ Joi, OAuthError, body }) {
  const schema = Joi.object({
    ...Object.fromEntries(AUTHORIZE_FIELDS.map((field) => [field, Joi.string().max(2048).optional()])),
    csrf: Joi.string().max(256).required(),
    email: Joi.string().max(320).required(),
    password: Joi.string().max(1024).required(),
  });

  const validatedResponse = schema.validate(body || {}, { stripUnknown: true });

  if (validatedResponse.error) {
    throw new OAuthError('invalid_request', validatedResponse.error.message);
  }

  return validatedResponse.value;
}

module.exports = makeSubmitAuthorizeFormController;
