const makeFindRoleByCodeDataAccess = require('./find-role-by-code');
const makeGetRolesByIdsDataAccess = require('./get-roles-by-ids');
const makeGetRolesDataAccess = require('./get-roles');

module.exports = function buildRolesDataAccess(dependencies) {
  return {
    findRoleByCode: makeFindRoleByCodeDataAccess(dependencies),
    getRolesByIds: makeGetRolesByIdsDataAccess(dependencies),
    getRoles: makeGetRolesDataAccess(dependencies),
  };
};
