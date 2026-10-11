const makeCreateAuthorizationCode = require('./create-authorization-code');
const makeConsumeAuthorizationCode = require('./consume-authorization-code');

const TABLE_NAME = 'oauth_authorization_codes';

module.exports = function buildOAuthAuthorizationCodesDataAccess(dependencies) {
  const createAuthorizationCode = makeCreateAuthorizationCode({ ...dependencies, tableName: TABLE_NAME });
  const consumeAuthorizationCode = makeConsumeAuthorizationCode({ ...dependencies, tableName: TABLE_NAME });

  return {
    createAuthorizationCode,
    consumeAuthorizationCode,
  };
};
