const SLUG_MAX_LENGTH = 160;
const MAX_SLUG_ATTEMPTS = 50;

/**
 * Returns the requested slug if free (else ConflictError), or generates a unique one from
 * `source` by appending -2, -3, ...
 */
function makeResolveSlug({ store, entityType, label, slugify, ConflictError }) {
  return async function resolveSlug({ requested, source, excludeId = 0 }) {
    if (requested) {
      if (await store.slugExists({ slug: requested, excludeId })) {
        throw new ConflictError(`Slug "${requested}" is already used by another ${label.toLowerCase()}`);
      }
      return requested;
    }

    const base = slugify(source) || entityType;
    for (let attempt = 1; attempt <= MAX_SLUG_ATTEMPTS; attempt += 1) {
      const suffix = attempt === 1 ? '' : `-${attempt}`;
      const candidate = `${base.slice(0, SLUG_MAX_LENGTH - suffix.length).replace(/-+$/, '')}${suffix}`;
      if (!(await store.slugExists({ slug: candidate, excludeId }))) {
        return candidate;
      }
    }
    throw new ConflictError(`Could not generate a unique slug for "${source}"; provide one explicitly`);
  };
}

module.exports = makeResolveSlug;
