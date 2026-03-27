const Joi = require('joi');
const { ValidationError } = require('../../exceptions');

module.exports = function buildAuthController({ usecase, formatResponse, formatError, logger, config }) {
  const cookieName = config.auth.refreshTokenCookieName;

  return {
    login,
    refresh,
    logout,
    me,
  };

  async function login(req, res) {
    try {
      const validated = validateLoginInput(req.body || {});
      const data = await usecase.authUsecase.login({
        ...validated,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      setRefreshTokenCookie(res, data.refreshToken, config.auth);

      return formatResponse(res, {
        statusCode: 200,
        body: {
          accessToken: data.accessToken,
          accessTokenExpiresIn: data.accessTokenExpiresIn,
          user: data.user,
        },
      });
    } catch (error) {
      logger.error('Error in login controller:', error.message);
      return formatError(res, { error });
    }
  }

  async function refresh(req, res) {
    try {
      const refreshToken = req.cookies?.[cookieName];
      const data = await usecase.authUsecase.refresh({
        refreshToken,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      setRefreshTokenCookie(res, data.refreshToken, config.auth);

      return formatResponse(res, {
        statusCode: 200,
        body: {
          accessToken: data.accessToken,
          accessTokenExpiresIn: data.accessTokenExpiresIn,
        },
      });
    } catch (error) {
      logger.error('Error in refresh controller:', error.message);
      return formatError(res, { error });
    }
  }

  async function logout(req, res) {
    try {
      const refreshToken = req.cookies?.[cookieName];
      await usecase.authUsecase.logout({ refreshToken });
      clearRefreshTokenCookie(res, config.auth);

      return formatResponse(res, {
        statusCode: 200,
        body: { loggedOut: true },
      });
    } catch (error) {
      logger.error('Error in logout controller:', error.message);
      return formatError(res, { error });
    }
  }

  async function me(req, res) {
    try {
      const userId = Number(req.auth?.sub);
      const data = await usecase.authUsecase.me({ userId });

      return formatResponse(res, {
        statusCode: 200,
        body: data,
      });
    } catch (error) {
      logger.error('Error in me controller:', error.message);
      return formatError(res, { error });
    }
  }

  function validateLoginInput(body) {
    const schema = Joi.object({
      email: Joi.string().trim().email().required(),
      password: Joi.string().min(8).required(),
    });

    const validatedResponse = schema.validate(body);
    if (validatedResponse.error) {
      throw new ValidationError(validatedResponse.error.message);
    }

    return validatedResponse.value;
  }
};

function setRefreshTokenCookie(res, token, authConfig) {
  res.cookie(authConfig.refreshTokenCookieName, token, {
    httpOnly: true,
    secure: authConfig.cookieSecure,
    sameSite: authConfig.cookieSameSite,
    maxAge: authConfig.refreshTokenTtlDays * 24 * 60 * 60 * 1000,
    path: '/apis/core/auth',
  });
}

function clearRefreshTokenCookie(res, authConfig) {
  res.clearCookie(authConfig.refreshTokenCookieName, {
    httpOnly: true,
    secure: authConfig.cookieSecure,
    sameSite: authConfig.cookieSameSite,
    path: '/apis/core/auth',
  });
}
