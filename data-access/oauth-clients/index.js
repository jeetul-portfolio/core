const makeFindClient = require('./find-client');
const makeFindClientByName = require('./find-client-by-name');
const makeGetClients = require('./get-clients');
const makeGetClientById = require('./get-client-by-id');
const makeCreateClient = require('./create-client');
const makeUpdateClient = require('./update-client');
const makeDeleteClient = require('./delete-client');

const TABLE_NAME = 'oauth_clients';

module.exports = function buildOAuthClientsDataAccess(dependencies) {
  const findClient = makeFindClient({ ...dependencies, tableName: TABLE_NAME });
  const findClientByName = makeFindClientByName({ ...dependencies, tableName: TABLE_NAME });
  const getClients = makeGetClients({ ...dependencies, tableName: TABLE_NAME });
  const getClientById = makeGetClientById({ ...dependencies, tableName: TABLE_NAME });
  const createClient = makeCreateClient({ ...dependencies, tableName: TABLE_NAME });
  const updateClient = makeUpdateClient({ ...dependencies, tableName: TABLE_NAME });
  const deleteClient = makeDeleteClient({ ...dependencies, tableName: TABLE_NAME });

  return {
    findClient,
    findClientByName,
    getClients,
    getClientById,
    createClient,
    updateClient,
    deleteClient,
  };
};
