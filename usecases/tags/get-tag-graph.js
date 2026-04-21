/**
 * Builds graph data for D3 visualization.
 * Returns:
 *   nodes: Array of { id, label, type, color, slug? }
 *   links: Array of { source, target }
 *
 * Node id format:
 *   - tag nodes:    "tag-{tagId}"
 *   - entity nodes: "{entityType}-{entityId}"
 */
function makeGetTagGraphUsecase({ dataAccess }) {
  return async function getTagGraphUsecase() {
    const { tags: allTags, references } = await dataAccess.tags.getTagGraph();

    // Filter out internal tags — they should not appear in the public graph
    const tags = allTags.filter((t) => !t.isInternal);
    const visibleTagIds = new Set(tags.map((t) => t.id));

    // Remove references that point to filtered-out internal tags
    const visibleRefs = references.filter((r) => visibleTagIds.has(r.tagId));

    if (visibleRefs.length === 0) {
      return {
        nodes: tags.map((t) => buildTagNode(t)),
        links: [],
      };
    }

    // Collect entity ids per entity type to batch-fetch labels
    const entityMap = groupByType(visibleRefs);

    const entityLabelMap = await resolveEntityLabels(entityMap, dataAccess);

    const nodeSet = new Map();
    const links = [];

    for (const tag of tags) {
      const nodeId = `tag-${tag.id}`;
      nodeSet.set(nodeId, buildTagNode(tag));
    }

    for (const ref of visibleRefs) {
      const tagNodeId = `tag-${ref.tagId}`;
      const entityNodeId = `${ref.entityType}-${ref.entityId}`;

      // Only add entity node if we have a label for it (entity still exists)
      const label = entityLabelMap[ref.entityType]?.[ref.entityId];
      if (!label) continue;

      if (!nodeSet.has(entityNodeId)) {
        nodeSet.set(entityNodeId, {
          id: entityNodeId,
          label,
          type: ref.entityType,
          entityId: ref.entityId,
          color: ENTITY_COLORS[ref.entityType] || '#6b7280',
        });
      }

      if (nodeSet.has(tagNodeId)) {
        links.push({ source: tagNodeId, target: entityNodeId });
      }
    }

    return {
      nodes: Array.from(nodeSet.values()),
      links,
    };
  };
}

async function resolveEntityLabels(entityMap, dataAccess) {
  const result = {};

  await Promise.all(
    Object.entries(entityMap).map(async ([entityType, ids]) => {
      result[entityType] = {};
      const uniqueIds = [...new Set(ids)];

      if (entityType === 'article') {
        const rows = await fetchArticleLabels(dataAccess, uniqueIds);
        for (const row of rows) {
          result[entityType][row.id] = row.label;
        }
      } else if (entityType === 'skill') {
        const rows = await fetchSkillLabels(dataAccess, uniqueIds);
        for (const row of rows) {
          result[entityType][row.id] = row.label;
        }
      } else if (entityType === 'profile') {
        const rows = await fetchProfileLabels(dataAccess, uniqueIds);
        for (const row of rows) {
          result[entityType][row.id] = row.label;
        }
      }
      // Future entity types can be added here in the same pattern
    })
  );

  return result;
}

async function fetchArticleLabels(dataAccess, ids) {
  if (!ids.length) return [];
  try {
    const rows = await dataAccess.articles.getArticlesByIds({ ids, includeDrafts: true });
    return rows.map((r) => ({ id: r.id, label: r.title }));
  } catch {
    return [];
  }
}

async function fetchSkillLabels(dataAccess, ids) {
  if (!ids.length) return [];
  try {
    const rows = await dataAccess.skills.getSkillsByIds({ ids });
    return rows.map((r) => ({ id: r.id, label: r.name }));
  } catch {
    return [];
  }
}

async function fetchProfileLabels(dataAccess, ids) {
  if (!ids.length) return [];
  try {
    const rows = await dataAccess.profiles.getProfilesByIds({ ids });
    return rows.map((r) => ({ id: r.id, label: r.fullName || 'Profile' }));
  } catch {
    return [];
  }
}

function groupByType(references) {
  return references.reduce((acc, ref) => {
    if (!acc[ref.entityType]) acc[ref.entityType] = [];
    acc[ref.entityType].push(ref.entityId);
    return acc;
  }, {});
}

function buildTagNode(tag) {
  return {
    id: `tag-${tag.id}`,
    label: tag.name,
    type: 'tag',
    slug: tag.slug,
    color: tag.color || '#10b981',
    group: tag.group || null,
  };
}

const ENTITY_COLORS = {
  article: '#3b82f6',
  skill: '#22c55e',
  profile: '#f97316',
  experience: '#a855f7',
  email_template: '#ec4899',
};

module.exports = makeGetTagGraphUsecase;
