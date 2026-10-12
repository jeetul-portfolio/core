function makeSetPublishedUsecase({ update }) {
  return async function setPublishedUsecase({ id, action }) {
    return update({ id, status: action === 'publish' ? 'published' : 'draft' });
  };
}

module.exports = makeSetPublishedUsecase;
