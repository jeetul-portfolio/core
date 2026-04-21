const { presentTag } = require('./tag-presenter');

function makeUpdateTagUsecase({ dataAccess, NotFoundError }) {
  return async function updateTagUsecase(input) {
    const existing = await dataAccess.tags.getTagById({ id: input.id });

    if (!existing) {
      throw new NotFoundError(`Tag not found for id ${input.id}`);
    }

    const payload = { id: input.id };

    if (Object.prototype.hasOwnProperty.call(input, 'name')) {
      payload.name = input.name.trim();
      payload.slug = slugify(input.name);
    }
    if (Object.prototype.hasOwnProperty.call(input, 'group')) payload.group = input.group;
    if (Object.prototype.hasOwnProperty.call(input, 'color')) payload.color = input.color;
    if (Object.prototype.hasOwnProperty.call(input, 'description')) payload.description = input.description;
    if (Object.prototype.hasOwnProperty.call(input, 'isSeoEnabled')) payload.isSeoEnabled = input.isSeoEnabled;
    if (Object.prototype.hasOwnProperty.call(input, 'isInternal')) payload.isInternal = input.isInternal;

    await dataAccess.tags.updateTag(payload);

    const updated = await dataAccess.tags.getTagById({ id: input.id });
    return presentTag(updated);
  };
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

module.exports = makeUpdateTagUsecase;
