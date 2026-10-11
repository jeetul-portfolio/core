const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jwt = require('jsonwebtoken');

const buildOAuthClientsUsecase = require('../usecases/oauth-clients');
const buildOAuthClientsController = require('../controllers/oauth-clients');
const oauthClientsRoutes = require('../routes/oauth-clients-routes');
const makeAuthenticate = require('../middlewares/authenticate');
const makeAuthorize = require('../middlewares/authorize');
const { AuthenticationError, ForbiddenError } = require('../exceptions');
const { formatResponse, formatError } = require('../controllers/response-formatter');
const { verifySecret } = require('../utils/client-secret');

const SECRET = 'test-hs256-secret';
const logger = { error() {}, warn() {}, info() {} };

function makeDataAccess() {
  const rows = new Map();
  const users = { 1: { id: 1, isActive: true, updatedAt: '2000-01-01' }, 2: { id: 2, isActive: true, updatedAt: '2000-01-01' } };
  const strip = ({ secretHash, ...rest }) => rest;
  return {
    rows,
    users: { findUserById: async ({ id }) => users[id] || null },
    oauthClients: {
      findClientByName: async ({ clientName }) => [...rows.values()].find((r) => r.clientName === clientName) || null,
      getClients: async () => [...rows.values()].map(strip),
      getClientById: async ({ clientId }) => (rows.has(clientId) ? strip(rows.get(clientId)) : null),
      createClient: async ({ redirectUris, ...c }) => rows.set(c.clientId, { ...c, redirectUris: JSON.stringify(redirectUris), createdAt: new Date(), updatedAt: new Date() }),
      updateClient: async ({ clientId, ...p }) => {
        const row = rows.get(clientId);
        if (!row) return false;
        if (p.redirectUris) p.redirectUris = JSON.stringify(p.redirectUris);
        Object.assign(row, p);
        return true;
      },
      deleteClient: async ({ clientId }) => rows.delete(clientId),
    },
  };
}

async function start() {
  const dataAccess = makeDataAccess();
  const config = { auth: { accessTokenSecret: SECRET } };
  const usecase = { oauthClientsUsecase: buildOAuthClientsUsecase({ dataAccess, config, logger }) };
  const controller = { oauthClientsController: buildOAuthClientsController({ usecase, config, logger, formatResponse, formatError }) };
  const middlewares = {
    authenticate: makeAuthenticate({ jwt, config, AuthenticationError, dataAccess }),
    authorize: makeAuthorize({ ForbiddenError }),
  };
  const app = express();
  app.use(express.json());
  app.use('/apis/core', oauthClientsRoutes({ controller, router: express.Router(), middlewares }));
  const server = await new Promise((r) => { const s = app.listen(0, '127.0.0.1', () => r(s)); });
  const base = `http://127.0.0.1:${server.address().port}/apis/core`;
  const token = (roles, sub = '1') => jwt.sign({ sub, roles }, SECRET, { expiresIn: '5m' });
  const call = async (method, path, body, auth = token(['admin'])) => {
    const res = await fetch(`${base}${path}`, {
      method,
      headers: { 'content-type': 'application/json', ...(auth ? { authorization: `Bearer ${auth}` } : {}) },
      body: body && method !== 'GET' ? JSON.stringify(body) : undefined,
    });
    return { status: res.status, body: await res.json().catch(() => null) };
  };
  return { dataAccess, call, token, close: () => server.close() };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

test('create returns uuid id and a one-time uuid secret; only the hash is stored', async () => {
  const s = await start();
  try {
    const r = await s.call('POST', '/oauth-clients', { clientName: 'cli', redirectUris: ['http://localhost:6274/cb'] });
    assert.equal(r.status, 201);
    const app = r.body.Data;
    assert.match(app.clientId, UUID);
    assert.match(app.clientSecret, UUID);
    assert.equal(app.isActive, true);
    assert.deepEqual(app.redirectUris, ['http://localhost:6274/cb']);
    const row = s.dataAccess.rows.get(app.clientId);
    assert.ok(verifySecret(app.clientSecret, row.secretHash));
    assert.ok(!JSON.stringify(row).includes(app.clientSecret));

    const listed = await s.call('GET', '/oauth-clients');
    assert.equal(listed.body.Data.length, 1);
    assert.equal(listed.body.Data[0].clientSecret, undefined);
    assert.ok(!JSON.stringify(listed.body).includes('scrypt$'), 'no hash in listings');
    const one = await s.call('GET', `/oauth-clients/${app.clientId}`);
    assert.equal(one.body.Data.clientSecret, undefined);
  } finally { s.close(); }
});

test('update changes name, redirect URIs and active flag', async () => {
  const s = await start();
  try {
    const { body } = await s.call('POST', '/oauth-clients', { clientName: 'a', redirectUris: ['https://a.example.com/cb'] });
    const id = body.Data.clientId;
    const r = await s.call('PUT', `/oauth-clients/${id}`, { clientName: 'b', redirectUris: ['https://b.example.com/cb', 'http://127.0.0.1:9/cb'], isActive: false });
    assert.equal(r.status, 200);
    assert.equal(r.body.Data.clientName, 'b');
    assert.deepEqual(r.body.Data.redirectUris, ['https://b.example.com/cb', 'http://127.0.0.1:9/cb']);
    assert.equal(r.body.Data.isActive, false);
    assert.equal((await s.call('PUT', `/oauth-clients/${id}`, {})).status, 400, 'empty update rejected');
  } finally { s.close(); }
});

test('rotate-secret issues a new secret and invalidates the old one', async () => {
  const s = await start();
  try {
    const { body } = await s.call('POST', '/oauth-clients', { clientName: 'a', redirectUris: ['https://a.example.com/cb'] });
    const r = await s.call('POST', `/oauth-clients/${body.Data.clientId}/rotate-secret`);
    assert.equal(r.status, 200);
    assert.notEqual(r.body.Data.clientSecret, body.Data.clientSecret);
    const hash = s.dataAccess.rows.get(body.Data.clientId).secretHash;
    assert.ok(verifySecret(r.body.Data.clientSecret, hash));
    assert.ok(!verifySecret(body.Data.clientSecret, hash));
  } finally { s.close(); }
});

test('delete removes the application; unknown ids are 404', async () => {
  const s = await start();
  try {
    const { body } = await s.call('POST', '/oauth-clients', { clientName: 'a', redirectUris: ['https://a.example.com/cb'] });
    assert.equal((await s.call('DELETE', `/oauth-clients/${body.Data.clientId}`)).status, 200);
    assert.equal(s.dataAccess.rows.size, 0);
    const missing = '00000000-0000-4000-8000-000000000000';
    for (const [m, p] of [['GET', ''], ['DELETE', ''], ['PUT', ''], ['POST', '/rotate-secret']]) {
      const r = await s.call(m, `/oauth-clients/${missing}${p}`, m === 'PUT' ? { isActive: true } : undefined);
      assert.equal(r.status, 404, `${m} ${p}`);
    }
  } finally { s.close(); }
});

test('validation: bad redirect URIs, duplicates, names and ids are rejected', async () => {
  const s = await start();
  try {
    const bad = ['http://evil.example.com/cb', 'https://a.example.com/cb#frag', 'https://*.example.com/cb', 'javascript:alert(1)', 'https://u:p@a.example.com/cb', 'not a url'];
    for (const uri of bad) {
      const r = await s.call('POST', '/oauth-clients', { clientName: 'x', redirectUris: [uri] });
      assert.equal(r.status, 400, uri);
    }
    assert.equal((await s.call('POST', '/oauth-clients', { clientName: 'x', redirectUris: [] })).status, 400, 'at least one URI');
    assert.equal((await s.call('POST', '/oauth-clients', { clientName: 'x', redirectUris: ['https://a.example.com/cb', 'https://a.example.com/cb'] })).status, 400, 'duplicate URIs');
    assert.equal((await s.call('POST', '/oauth-clients', { clientName: '', redirectUris: ['https://a.example.com/cb'] })).status, 400);
    assert.equal((await s.call('GET', '/oauth-clients/not-a-uuid')).status, 400);

    await s.call('POST', '/oauth-clients', { clientName: 'dup', redirectUris: ['https://a.example.com/cb'] });
    const dup = await s.call('POST', '/oauth-clients', { clientName: 'dup', redirectUris: ['https://a.example.com/cb'] });
    assert.equal(dup.status, 400);
    assert.match(dup.body.Data.message, /already exists/);
  } finally { s.close(); }
});

test('every endpoint requires an authenticated admin', async () => {
  const s = await start();
  try {
    const { body } = await s.call('POST', '/oauth-clients', { clientName: 'a', redirectUris: ['https://a.example.com/cb'] });
    const id = body.Data.clientId;
    const endpoints = [['GET', '/oauth-clients'], ['GET', `/oauth-clients/${id}`], ['POST', '/oauth-clients'], ['PUT', `/oauth-clients/${id}`], ['POST', `/oauth-clients/${id}/rotate-secret`], ['DELETE', `/oauth-clients/${id}`]];
    for (const [m, p] of endpoints) {
      assert.equal((await s.call(m, p, { isActive: true }, null)).status, 401, `anon ${m} ${p}`);
      assert.equal((await s.call(m, p, { isActive: true }, s.token(['editor'], '2'))).status, 403, `editor ${m} ${p}`);
    }
    assert.equal(s.dataAccess.rows.size, 1, 'nothing changed');
  } finally { s.close(); }
});
