const makeGetRolesUsecase = require('./get-roles');

module.exports = function buildRolesUsecase(dependencies) {
  return {
    getRoles: makeGetRolesUsecase(dependencies),
  };
};
