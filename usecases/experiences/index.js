const buildContentRecordsUsecase = require('../content-records');
const prepareExperience = require('./prepare-experience');

module.exports = function buildExperiencesUsecase(dependencies) {
  return buildContentRecordsUsecase(dependencies, {
    entityType: 'experience',
    label: 'Experience',
    store: dependencies.dataAccess.experiences,
    slugSource: (record) => `${record.role || ''} ${record.company || ''}`,
    prepare: prepareExperience,
  });
};
