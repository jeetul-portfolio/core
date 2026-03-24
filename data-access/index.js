
const { getSampleData } = require('./sample');
const { getGreeting } = require('./greeting');
const { getGitProjects } = require('./git-projects');
const { getGitCommits, getGitCommitCounts } = require('./git-commits');
const mysql = require('mysql2/promise');

module.exports = function buildDataAccess(dependencies) {
  const { config } = dependencies;

  // Create a MySQL connection pool using the config
  const pool = mysql.createPool({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
    connectionLimit: config.mysql.maxConnections,
    port: config.mysql.port,
  });

  const dataAccessDependencies = {
    ...dependencies,
    mysqlPool: pool,
  };

  return {
    getSampleData: getSampleData(dataAccessDependencies),
    getGreeting: getGreeting(dataAccessDependencies),
    getGitProjects: getGitProjects(dataAccessDependencies),
    getGitCommits: getGitCommits(dataAccessDependencies),
    getGitCommitCounts: getGitCommitCounts(dataAccessDependencies),
  };
};
