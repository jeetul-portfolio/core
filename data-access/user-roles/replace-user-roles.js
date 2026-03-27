const makeDeleteUserRolesByUserIdDataAccess = require('./delete-user-roles-by-user-id');
const makeInsertUserRolesDataAccess = require('./insert-user-roles');

function makeReplaceUserRolesDataAccess(dependencies) {
  const deleteUserRolesByUserId = makeDeleteUserRolesByUserIdDataAccess(dependencies);
  const insertUserRoles = makeInsertUserRolesDataAccess(dependencies);

  return async function replaceUserRolesDataAccess({ userId, roleIds }) {
    await deleteUserRolesByUserId({ userId });
    await insertUserRoles({ userId, roleIds });
  };
}

module.exports = makeReplaceUserRolesDataAccess;