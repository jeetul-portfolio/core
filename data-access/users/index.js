const makeGetUsersDataAccess = require('./get-users');
const makeFindUserByEmailDataAccess = require('./find-user-by-email');
const makeCreateUserDataAccess = require('./create-user');
const makeFindUserByIdDataAccess = require('./find-user-by-id');
const makeFindUserCredentialsByIdDataAccess = require('./find-user-credentials-by-id');
const makeFindUserForLoginByEmailDataAccess = require('./find-user-for-login-by-email');
const makeUpdateUserLoginMetaDataAccess = require('./update-user-login-meta');
const makeUpdateUserDataAccess = require('./update-user');
const makeUpdateUserPasswordHashDataAccess = require('./update-user-password-hash');

module.exports = function buildUsersDataAccess(dependencies) {
  return {
    getUsers: makeGetUsersDataAccess(dependencies),
    findUserByEmail: makeFindUserByEmailDataAccess(dependencies),
    findUserById: makeFindUserByIdDataAccess(dependencies),
    findUserCredentialsById: makeFindUserCredentialsByIdDataAccess(dependencies),
    findUserForLoginByEmail: makeFindUserForLoginByEmailDataAccess(dependencies),
    updateUserLoginMeta: makeUpdateUserLoginMetaDataAccess(dependencies),
    createUser: makeCreateUserDataAccess(dependencies),
    updateUser: makeUpdateUserDataAccess(dependencies),
    updateUserPasswordHash: makeUpdateUserPasswordHashDataAccess(dependencies),
  };
};
