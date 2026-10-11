const makeCreateRefreshToken = require('./create-refresh-token');
const makeFindRefreshToken = require('./find-refresh-token');
const makeRevokeRefreshToken = require('./revoke-refresh-token');
const makeRevokeRefreshFamily = require('./revoke-refresh-family');

const TABLE_NAME = 'oauth_refresh_tokens';

module.exports = function buildOAuthRefreshTokensDataAccess(dependencies) {
  const createRefreshToken = makeCreateRefreshToken({ ...dependencies, tableName: TABLE_NAME });
  const findRefreshToken = makeFindRefreshToken({ ...dependencies, tableName: TABLE_NAME });
  const revokeRefreshToken = makeRevokeRefreshToken({ ...dependencies, tableName: TABLE_NAME });
  const revokeRefreshFamily = makeRevokeRefreshFamily({ ...dependencies, tableName: TABLE_NAME });

  return {
    createRefreshToken,
    findRefreshToken,
    revokeRefreshToken,
    revokeRefreshFamily,
  };
};
