/** Published records are indexed in tag_references; drafts are removed from it (same rule as articles). */
function makeSyncRecordTags({ dataAccess, syncEntityTags, entityType, presentRecord }) {
  return async function syncRecordTags(row) {
    if (!syncEntityTags) return;
    if (row.status === 'published') {
      await syncEntityTags({
        entityType,
        entityId: row.id,
        explicitTags: presentRecord(row, []).tags || [],
        textFields: [],
      });
    } else {
      await dataAccess.tagReferences.deleteByEntity({ entityType, entityId: row.id });
    }
  };
}

module.exports = makeSyncRecordTags;
