function presentSkill(skill, references, categories) {
  const grouped = groupReferences(references || []);

  return {
    id: skill.id,
    name: skill.name,
    categories: (categories || []).map((c) => ({ id: c.id, name: c.name, description: c.description || null })),
    level: skill.level,
    notes: skill.notes || null,
    sortOrder: skill.sortOrder || 0,
    references: grouped,
    createdAt: toIsoDate(skill.createdAt),
    updatedAt: toIsoDate(skill.updatedAt),
  };
}

function groupReferences(references) {
  const grouped = { articles: [], experiences: [], projects: [] };

  for (const ref of references) {
    if (ref.type === 'article') {
      grouped.articles.push(ref.referenceId);
    } else if (ref.type === 'experience') {
      grouped.experiences.push(ref.referenceId);
    } else if (ref.type === 'project') {
      grouped.projects.push(ref.referenceId);
    }
  }

  return grouped;
}

function toIsoDate(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

module.exports = { presentSkill };
