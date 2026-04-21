const { presentTag } = require('./tag-presenter');

function makeCreateTagUsecase({ dataAccess, NotFoundError }) {
  return async function createTagUsecase({ name, group, color, description, isSeoEnabled, isInternal }) {
    const slug = slugify(name);
    const tagId = await dataAccess.tags.findOrCreateTag({ name: name.trim(), slug, group, color, description });

    // Apply non-default boolean flags if explicitly provided
    const flagUpdates = { id: tagId };
    if (isSeoEnabled !== undefined) flagUpdates.isSeoEnabled = isSeoEnabled;
    if (isInternal !== undefined) flagUpdates.isInternal = isInternal;
    if (Object.keys(flagUpdates).length > 1) {
      await dataAccess.tags.updateTag(flagUpdates);
    }

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
