const makeGetUsersUsecase = require('./get-users');
const makeGetUserByIdUsecase = require('./get-user-by-id');
const makeCreateUserUsecase = require('./create-user');
const makeUpdateUserUsecase = require('./update-user');
const makeUpdateUserPasswordUsecase = require('./update-user-password');
const bcrypt = require('bcryptjs');
const { presentUser } = require('./user-presenter');
const {
  ValidationError,
  ForbiddenError,
  NotFoundError,
  AuthenticationError,
} = require('../../exceptions');

module.exports = function buildUsersUsecase(dependencies) {
  const baseDependencies = {
    ...dependencies,
    bcrypt,
    presentUser,
    ValidationError,
    ForbiddenError,
    NotFoundError,
    AuthenticationError,
  };

  const getUserById = makeGetUserByIdUsecase(baseDependencies);

  const usecaseDependencies = {
    ...baseDependencies,
    getUserById,
  };

  return {
    getUsers: makeGetUsersUsecase(usecaseDependencies),
    getUserById,
    createUser: makeCreateUserUsecase(usecaseDependencies),
    updateUser: makeUpdateUserUsecase(usecaseDependencies),
    updateUserPassword: makeUpdateUserPasswordUsecase(usecaseDependencies),
  };
};
