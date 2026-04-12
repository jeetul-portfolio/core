const { presentTag } = require('./tag-presenter');

function makeCreateTagUsecase({ dataAccess, NotFoundError }) {
  return async function createTagUsecase({ name, group, color, description }) {
    const slug = slugify(name);
    const tagId = await dataAccess.tags.findOrCreateTag({ name: name.trim(), slug, group, color, description });

    const created = await dataAccess.tags.getTagById({ id: tagId });

    if (!created) {
      throw new NotFoundError(`Tag could not be retrieved after creation`);
    }

    return presentTag(created);
  };
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

module.exports = makeCreateTagUsecase;
