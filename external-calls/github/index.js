const axios = require('axios');
const createGithubClient = require('./create-github-client');
const makeGetRepository = require('./get-repository');
const makeGetCommits = require('./get-commits');
const makeGetCommitDetails = require('./get-commit-details');
const makeGetAuthenticatedUser = require('./get-authenticated-user');
const makeGetAllRepositories = require('./get-all-repositories');

module.exports = function buildGithubExternalCalls({ config }) {
  const githubClient = createGithubClient({ axios, config });

  return {
    getRepository: makeGetRepository({ githubClient }),
    getCommits: makeGetCommits({ githubClient }),
    getCommitDetails: makeGetCommitDetails({ githubClient }),
    getAuthenticatedUser: makeGetAuthenticatedUser({ githubClient }),
    getAllRepositories: makeGetAllRepositories({ githubClient }),
  };
};