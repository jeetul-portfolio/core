
const { getSampleData } = require('./sample');
const { getGreeting } = require('./greeting');
const buildGitProjectsDataAccess = require('./git-projects');
const buildGitCommitsDataAccess = require('./git-commits');
const buildArticlesDataAccess = require('./articles');
const buildAuthDataAccess = require('./auth');
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

  const gitProjects = buildGitProjectsDataAccess(dataAccessDependencies);
  const gitCommits = buildGitCommitsDataAccess(dataAccessDependencies);
  const articles = buildArticlesDataAccess(dataAccessDependencies);
  const auth = buildAuthDataAccess(dataAccessDependencies);

  return {
    getSampleData: getSampleData(dataAccessDependencies),
    getGreeting: getGreeting(dataAccessDependencies),
    gitProjects,
    gitCommits,
    articles,
    auth,
  };
};
