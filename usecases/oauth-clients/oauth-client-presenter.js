function presentOAuthClient(client) {
  return {
    clientId: client.clientId,
    clientName: client.clientName,
    redirectUris: parseRedirectUris(client.redirectUris),
    isActive: Boolean(client.isActive),
    createdAt: toIsoDate(client.createdAt),
    updatedAt: toIsoDate(client.updatedAt),
  };
}

function parseRedirectUris(value) {
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function toIsoDate(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

module.exports = { presentOAuthClient };
