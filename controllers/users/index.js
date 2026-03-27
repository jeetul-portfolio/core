const Joi = require('joi');
const { ValidationError } = require('../../exceptions');
const makeGetUsersController = require('./get-users');
const makeCreateUserController = require('./create-user');
const makeUpdateUserController = require('./update-user');
const makeUpdateUserPasswordController = require('./update-user-password');

module.exports = function buildUsersController(dependencies) {
  const controllerDependencies = {
    ...dependencies,
    Joi,
    ValidationError,
  };

  return {
    getUsers: makeGetUsersController(controllerDependencies),
    createUser: makeCreateUserController(controllerDependencies),
    updateUser: makeUpdateUserController(controllerDependencies),
    updateUserPassword: makeUpdateUserPasswordController(controllerDependencies),
  };
};
