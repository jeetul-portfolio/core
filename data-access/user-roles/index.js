const makeGetRoleIdsByUserIdDataAccess = require('./get-role-ids-by-user-id');
const makeGetRoleIdsByUserIdsDataAccess = require('./get-role-ids-by-user-ids');
const makeDeleteUserRolesByUserIdDataAccess = require('./delete-user-roles-by-user-id');
const makeInsertUserRolesDataAccess = require('./insert-user-roles');
const makeReplaceUserRolesDataAccess = require('./replace-user-roles');

module.exports = function buildUserRolesDataAccess(dependencies) {
  return {
    getRoleIdsByUserId: makeGetRoleIdsByUserIdDataAccess(dependencies),
    getRoleIdsByUserIds: makeGetRoleIdsByUserIdsDataAccess(dependencies),
    deleteUserRolesByUserId: makeDeleteUserRolesByUserIdDataAccess(dependencies),
    insertUserRoles: makeInsertUserRolesDataAccess(dependencies),
    replaceUserRoles: makeReplaceUserRolesDataAccess(dependencies),
  };
};
