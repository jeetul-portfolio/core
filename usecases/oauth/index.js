const makeCheckOAuthConfiguration = require('./check-oauth-configuration');
const makeGetOAuthMetadata = require('./get-oauth-metadata');
const makeGetJwks = require('./get-jwks');
const makeParseAuthorizeRequest = require('./parse-authorize-request');
const makeGetAdminRoles = require('./get-admin-roles');
const makeAuthenticateAdmin = require('./authenticate-admin');
const makeApproveAuthorization = require('./approve-authorization');
const makeAuthenticateClient = require('./authenticate-client');
const makeIssueTokens = require('./issue-tokens');
const makeExchangeAuthorizationCode = require('./exchange-authorization-code');
const makeRefreshAccessToken = require('./refresh-access-token');
const makeCreateToken = require('./create-token');
const buildOAuthSupport = require('./oauth-support');
const { OAuthError } = require('../../exceptions');

module.exports = function buildOAuthUsecase(dependencies) {
  const baseDependencies = {
    ...dependencies,
    ...buildOAuthSupport(dependencies),
    OAuthError,
  };

  const configurationProblem = makeCheckOAuthConfiguration(baseDependencies)();
  if (configurationProblem && dependencies.logger) {
    dependencies.logger.warn(`OAuth disabled: ${configurationProblem}`);
  }
  const isEnabled = () => configurationProblem === null;

  const getAdminRoles = makeGetAdminRoles(baseDependencies);
  const parseAuthorizeRequest = makeParseAuthorizeRequest(baseDependencies);
  const authenticateAdmin = makeAuthenticateAdmin({ ...baseDependencies, getAdminRoles });
  const authenticateClient = makeAuthenticateClient(baseDependencies);
  const issueTokens = makeIssueTokens({ ...baseDependencies, getAdminRoles });

  const usecaseDependencies = {
    ...baseDependencies,
    isEnabled,
    parseAuthorizeRequest,
    authenticateAdmin,
    authenticateClient,
    issueTokens,
  };

  const exchangeAuthorizationCode = makeExchangeAuthorizationCode(usecaseDependencies);
  const refreshAccessToken = makeRefreshAccessToken(usecaseDependencies);

  return {
    isEnabled,
    getConfigurationProblem: () => configurationProblem,
    getOAuthMetadata: makeGetOAuthMetadata(usecaseDependencies),
    getJwks: makeGetJwks(usecaseDependencies),
    parseAuthorizeRequest,
    approveAuthorization: makeApproveAuthorization(usecaseDependencies),
    createToken: makeCreateToken({
      ...usecaseDependencies,
      exchangeAuthorizationCode,
      refreshAccessToken,
    }),
  };
};
