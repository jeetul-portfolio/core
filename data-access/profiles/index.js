const makeFindProfileByUserId = require('./find-profile-by-user-id');
const makeFindProfileById = require('./find-profile-by-id');
const makeFindPublicProfile = require('./find-public-profile');
const makeUpsertProfileByUserId = require('./upsert-profile-by-user-id');
const makeGetProfiles = require('./get-profiles');
const makeDeleteProfile = require('./delete-profile');
const makeCreateProfile = require('./create-profile');
const makeUpdateProfileById = require('./update-profile-by-id');

module.exports = function buildProfilesDataAccess(dependencies) {
  return {
    findProfileByUserId: makeFindProfileByUserId(dependencies),
    findProfileById: makeFindProfileById(dependencies),
    findPublicProfile: makeFindPublicProfile(dependencies),
    upsertProfileByUserId: makeUpsertProfileByUserId(dependencies),
    getProfiles: makeGetProfiles(dependencies),
    deleteProfile: makeDeleteProfile(dependencies),
    createProfile: makeCreateProfile(dependencies),
    updateProfileById: makeUpdateProfileById(dependencies),
  };
};
