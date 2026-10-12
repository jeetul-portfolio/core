const test = require('node:test');
const assert = require('node:assert/strict');
const makeGetTagGraphUsecase = require('../usecases/tags/get-tag-graph');

test('tag graph project and experience nodes carry label and slug for routing', async () => {
  const dataAccess = {
    tags: {
      getTagGraph: async () => ({
        tags: [{ id: 1, name: 'kafka', slug: 'kafka' }],
        references: [
          { tagId: 1, entityType: 'project', entityId: 7 },
          { tagId: 1, entityType: 'experience', entityId: 3 },
          { tagId: 1, entityType: 'project', entityId: 99 }, // deleted project: no node
        ],
      }),
    },
    projects: { getByIds: async ({ ids }) => ids.filter((id) => id === 7).map((id) => ({ id, title: 'Event Pipeline', slug: 'event-pipeline' })) },
    experiences: { getByIds: async () => [{ id: 3, role: 'Engineer', company: 'Acme', slug: 'engineer-acme' }] },
  };

  const { nodes, links } = await makeGetTagGraphUsecase({ dataAccess })();

  const project = nodes.find((n) => n.id === 'project-7');
  assert.deepEqual(
    { label: project.label, slug: project.slug, entityId: project.entityId, type: project.type },
    { label: 'Event Pipeline', slug: 'event-pipeline', entityId: 7, type: 'project' }
  );
  assert.equal(nodes.find((n) => n.id === 'experience-3').label, 'Engineer @ Acme');
  assert.equal(nodes.some((n) => n.id === 'project-99'), false);
  assert.equal(links.length, 2);
});
