const makeCreateRefreshTokenDataAccess = require('./create-refresh-token');
const makeFindRefreshTokenByHashDataAccess = require('./find-refresh-token-by-hash');
const makeRevokeRefreshTokenByHashDataAccess = require('./revoke-refresh-token-by-hash');
const makeRevokeAllRefreshTokensForUserDataAccess = require('./revoke-all-refresh-tokens-for-user');

module.exports = function buildAuthDataAccess(dependencies) {
  return {
    createRefreshToken: makeCreateRefreshTokenDataAccess(dependencies),
    findRefreshTokenByHash: makeFindRefreshTokenByHashDataAccess(dependencies),
    revokeRefreshTokenByHash: makeRevokeRefreshTokenByHashDataAccess(dependencies),
    revokeAllRefreshTokensForUser: makeRevokeAllRefreshTokensForUserDataAccess(dependencies),
  };
};
