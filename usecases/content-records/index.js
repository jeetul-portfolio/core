const makeFindRecord = require('./find-record');
const makeAttachSkills = require('./attach-skills');
const makeAssertSkillsExist = require('./assert-skills-exist');
const makeResolveSlug = require('./resolve-slug');
const makeSyncRecordTags = require('./sync-record-tags');
const makeUnlinkRecord = require('./unlink-record');
const makeListUsecase = require('./list');
const makeGetUsecase = require('./get');
const makeCreateUsecase = require('./create');
const makeUpdateUsecase = require('./update');
const makeSetPublishedUsecase = require('./set-published');
const makeRemoveUsecase = require('./remove');
const makeReorderUsecase = require('./reorder');
const slugify = require('./slugify');
const normalizeTags = require('./normalize-tags');
const { presentRecord } = require('./presenter');
const { NotFoundError, ValidationError, ConflictError } = require('../../exceptions');

/**
 * Usecases shared by publishable content (experiences, projects).
 * definition: { entityType, label, store, slugSource(record), prepare?(merged) }
 *   - store: the entity's content-records data access
 *   - prepare: entity-specific normalisation/validation of the merged record; returns field overrides
 */
module.exports = function buildContentRecordsUsecase(dependencies, definition) {
  const deps = {
    ...dependencies,
    prepare: () => ({}),
    ...definition,
    presentRecord,
    normalizeTags,
    slugify,
    NotFoundError,
    ValidationError,
    ConflictError,
  };

  const findRecord = makeFindRecord(deps);
  const attachSkills = makeAttachSkills(deps);
  const helpers = {
    ...deps,
    findRecord,
    attachSkills,
    assertSkillsExist: makeAssertSkillsExist(deps),
    resolveSlug: makeResolveSlug(deps),
    syncRecordTags: makeSyncRecordTags(deps),
    unlinkRecord: makeUnlinkRecord(deps),
  };

  const get = makeGetUsecase(helpers);
  const update = makeUpdateUsecase({ ...helpers, get });

  return {
    list: makeListUsecase(helpers),
    get,
    create: makeCreateUsecase({ ...helpers, get }),
    update,
    setPublished: makeSetPublishedUsecase({ update }),
    remove: makeRemoveUsecase(helpers),
    reorder: makeReorderUsecase(helpers),
  };
};
