const backendConfig = require('./backend-config.js');
const serviceConfig = require('./service-config.js');

const config = {
  ...backendConfig,
  ...serviceConfig,
};

module.exports = config;