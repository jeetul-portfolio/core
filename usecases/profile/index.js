const makeGetProfileUsecase = require('./get-profile');
const makeGetProfilesUsecase = require('./get-profiles');
const makeGetPublicProfileUsecase = require('./get-public-profile');
const makeCreateProfileUsecase = require('./create-profile');
const makeUpdateProfileUsecase = require('./update-profile');
const makeDeleteProfileUsecase = require('./delete-profile');
const makePatchProfileUsecase = require('./patch-profile');
const makePutProfileUsecase = require('./put-profile');
const { presentProfile } = require('./profile-presenter');
const { NotFoundError } = require('../../exceptions');

module.exports = function buildProfileUsecase(dependencies) {
  const usecaseDependencies = {
    ...dependencies,
    presentProfile,
    NotFoundError,
  };

  return {
    getProfile: makeGetProfileUsecase(usecaseDependencies),
    getProfiles: makeGetProfilesUsecase(usecaseDependencies),
    getPublicProfile: makeGetPublicProfileUsecase(usecaseDependencies),
    createProfile: makeCreateProfileUsecase(usecaseDependencies),
    updateProfile: makeUpdateProfileUsecase(usecaseDependencies),
    deleteProfile: makeDeleteProfileUsecase(usecaseDependencies),
    patchProfile: makePatchProfileUsecase(usecaseDependencies),
    putProfile: makePutProfileUsecase(usecaseDependencies),
  };
};
