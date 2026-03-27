const makeGetRolesController = require('./get-roles');

module.exports = function buildRolesController(dependencies) {
  return {
    getRoles: makeGetRolesController(dependencies),
  };
};
