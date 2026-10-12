function makeRemoveUsecase({ store, findRecord, unlinkRecord }) {
  return async function removeUsecase({ id }) {
    await findRecord({ id });
    await store.remove({ id });
    await unlinkRecord(id);
    return { id, deleted: true };
  };
}

module.exports = makeRemoveUsecase;
