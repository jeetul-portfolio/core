const Joi = require('joi');
const { ValidationError } = require('../../exceptions');
const makeGetProfileController = require('./get-profile');
const makeGetProfilesController = require('./get-profiles');
const makeGetPublicProfileController = require('./get-public-profile');
const makeCreateProfileController = require('./create-profile');
const makeUpdateProfileController = require('./update-profile');
const makeDeleteProfileController = require('./delete-profile');
const makePatchProfileController = require('./patch-profile');
const makePutProfileController = require('./put-profile');

module.exports = function buildProfileController(dependencies) {
  const controllerDependencies = {
    ...dependencies,
    Joi,
    ValidationError,
  };

  return {
    getProfile: makeGetProfileController(controllerDependencies),
    getProfiles: makeGetProfilesController(controllerDependencies),
    getPublicProfile: makeGetPublicProfileController(controllerDependencies),
    createProfile: makeCreateProfileController(controllerDependencies),
    updateProfile: makeUpdateProfileController(controllerDependencies),
    deleteProfile: makeDeleteProfileController(controllerDependencies),
    patchProfile: makePatchProfileController(controllerDependencies),
    putProfile: makePutProfileController(controllerDependencies),
  };
};
