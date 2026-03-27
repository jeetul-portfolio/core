function makeGetRolesUsecase({ dataAccess }) {
  return async function getRolesUsecase() {
    return dataAccess.roles.getRoles();
  };
}

module.exports = makeGetRolesUsecase;
