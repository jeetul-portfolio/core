/** Removes a record's skill links and tag references. */
function makeUnlinkRecord({ dataAccess, entityType }) {
  return async function unlinkRecord(id) {
    await dataAccess.skillReferences.replaceForReference({ type: entityType, referenceId: id, skillIds: [] });
    await dataAccess.tagReferences.deleteByEntity({ entityType, entityId: id });
  };
}

module.exports = makeUnlinkRecord;
