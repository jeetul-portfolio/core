const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const buildOAuthUsecase = require('../usecases/oauth');
const buildOAuthController = require('../controllers/oauth');
const buildOAuthRoutes = require('../routes/oauth-routes');
const makeAuthenticate = require('../middlewares/authenticate');
const makeAuthorize = require('../middlewares/authorize');
const { AuthenticationError, ForbiddenError } = require('../exceptions');
const { hashSecret } = require('../utils/client-secret');

const RESOURCE = 'http://127.0.0.1:8765/mcp';
const logger = { warn() {}, error() {}, info() {} };

function makeDataAccess() {
  const db = { clients: new Map(), codes: new Map(), refresh: new Map() };
  const passwordHash = bcrypt.hashSync('correct horse', 4);
  const users = {
    'admin@example.com': { id: 1, email: 'admin@example.com', passwordHash, isActive: true },
    'editor@example.com': { id: 2, email: 'editor@example.com', passwordHash, isActive: true },
  };
  const roleIdsByUser = { 1: [1], 2: [2] };
  const roles = { 1: { id: 1, code: 'admin' }, 2: { id: 2, code: 'editor' } };
  return {
    db,
    users: {
      findUserForLoginByEmail: async ({ email }) => users[email] || null,
      findUserById: async ({ id }) => Object.values(users).find((u) => u.id === id) || null,
    },
    userRoles: { getRoleIdsByUserId: async ({ userId }) => roleIdsByUser[userId] || [] },
    roles: { getRolesByIds: async ({ roleIds }) => roleIds.map((i) => roles[i]) },
    oauthClients: {
      findClient: async ({ clientId }) => db.clients.get(clientId) || null,
    },
    oauthAuthorizationCodes: {
      createAuthorizationCode: async (c) => db.codes.set(c.codeHash, { ...c, used: false }),
      consumeAuthorizationCode: async ({ codeHash }) => {
        const c = db.codes.get(codeHash);
        if (!c || c.used) return null;
        c.used = true;
        return c;
      },
    },
    oauthRefreshTokens: {
      createRefreshToken: async (r) => db.refresh.set(r.tokenHash, { ...r, revokedAt: null }),
      findRefreshToken: async ({ tokenHash }) => db.refresh.get(tokenHash) || null,
      revokeRefreshToken: async ({ tokenHash }) => {
        const r = db.refresh.get(tokenHash);
        if (!r || r.revokedAt) return false;
        r.revokedAt = new Date();
        return true;
      },
      revokeRefreshFamily: async ({ familyId }) => {
        for (const r of db.refresh.values()) if (r.familyId === familyId) r.revokedAt = r.revokedAt || new Date();
      },
    },
  };
}

async function startServer(overrides = {}) {
  const { privateKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
  const pem = privateKey.export({ type: 'pkcs8', format: 'pem' });
  const config = {
    auth: { accessTokenSecret: 'legacy-hs256-secret' },
    oauth: {
      issuer: 'http://127.0.0.1:3000', resourceUri: RESOURCE, signingPrivateKey: pem, keyId: 'k1',
      accessTokenTtlSec: 600, refreshTokenTtlDays: 30, codeTtlSec: 60, ...overrides,
    },
  };
  const dataAccess = makeDataAccess();
  const clock = { t: Date.now() };
  const oauthUsecase = buildOAuthUsecase({ dataAccess, config, jwt, bcrypt, crypto, logger, now: () => clock.t });
  const controller = { oauthController: buildOAuthController({ usecase: { oauthUsecase }, config, logger, crypto }) };
  const app = express();
  app.use(cookieParser());
  app.use(buildOAuthRoutes({ controller, router: express.Router(), express }));
  const server = await new Promise((r) => { const s = app.listen(0, '127.0.0.1', () => r(s)); });
  const base = `http://127.0.0.1:${server.address().port}`;
  return { base, server, dataAccess, config, clock, oauthUsecase, secrets: new Map(), close: () => server.close() };
}

const b64u = (b) => Buffer.from(b).toString('base64url');
function pkce() {
  const verifier = b64u(crypto.randomBytes(32));
  return { verifier, challenge: b64u(crypto.createHash('sha256').update(verifier).digest()) };
}

async function register(s, redirect = 'http://127.0.0.1:9999/callback', extra = {}) {
  const clientId = crypto.randomUUID();
  const clientSecret = crypto.randomUUID();
  s.secrets.set(clientId, clientSecret);
  s.dataAccess.db.clients.set(clientId, { clientId, clientName: 'Test', secretHash: hashSecret(clientSecret), redirectUris: [redirect], isActive: true, ...extra });
  return { status: 201, body: { client_id: clientId, client_secret: clientSecret } };
}

function authorizeParams(clientId, challenge, extra = {}) {
  return {
    response_type: 'code', client_id: clientId, redirect_uri: 'http://127.0.0.1:9999/callback',
    code_challenge: challenge, code_challenge_method: 'S256', resource: RESOURCE, state: 'xyz', ...extra,
  };
}

async function signIn(s, params, creds = { email: 'admin@example.com', password: 'correct horse' }) {
  const page = await fetch(`${s.base}/oauth/authorize?${new URLSearchParams(params)}`);
  const cookie = (page.headers.get('set-cookie') || '').split(';')[0];
  const html = await page.text();
  const csrf = /name="csrf" value="([^"]+)"/.exec(html)?.[1];
  const r = await fetch(`${s.base}/oauth/authorize`, {
    method: 'POST', redirect: 'manual',
    headers: { 'content-type': 'application/x-www-form-urlencoded', cookie },
    body: new URLSearchParams({ ...params, ...creds, csrf: csrf || '' }),
  });
  return { page, html, response: r };
}

const token = (s, body, headers = {}) => fetch(`${s.base}/oauth/token`, {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded', ...headers },
  body: new URLSearchParams({ ...(s.secrets.has(body.client_id) ? { client_secret: s.secrets.get(body.client_id) } : {}), ...body }),
});

async function fullFlow(s) {
  const { body: client } = await register(s);
  const { verifier, challenge } = pkce();
  const { response } = await signIn(s, authorizeParams(client.client_id, challenge));
  assert.equal(response.status, 303);
  const loc = new URL(response.headers.get('location'));
  return { client, verifier, code: loc.searchParams.get('code'), loc };
}

test('full authorization-code + PKCE flow issues a verifiable ES256 admin token', async () => {
  const s = await startServer();
  try {
    const { client, verifier, code, loc } = await fullFlow(s);
    assert.equal(loc.searchParams.get('state'), 'xyz');
    assert.equal(loc.searchParams.get('iss'), 'http://127.0.0.1:3000');

    const res = await token(s, { grant_type: 'authorization_code', code, code_verifier: verifier, client_id: client.client_id, redirect_uri: 'http://127.0.0.1:9999/callback', resource: RESOURCE });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('cache-control'), 'no-store');
    const t = await res.json();

    const jwks = await (await fetch(`${s.base}/oauth/jwks`)).json();
    const key = crypto.createPublicKey({ key: jwks.keys[0], format: 'jwk' });
    const claims = jwt.verify(t.access_token, key, { algorithms: ['ES256'], issuer: 'http://127.0.0.1:3000', audience: RESOURCE });
    assert.deepEqual(claims.roles, ['admin']);
    assert.equal(claims.scope, 'portfolio:admin');
    assert.equal(jwt.decode(t.access_token, { complete: true }).header.kid, 'k1');
  } finally { s.close(); }
});

test('authorization code is single-use', async () => {
  const s = await startServer();
  try {
    const { client, verifier, code } = await fullFlow(s);
    const body = { grant_type: 'authorization_code', code, code_verifier: verifier, client_id: client.client_id, redirect_uri: 'http://127.0.0.1:9999/callback', resource: RESOURCE };
    assert.equal((await token(s, body)).status, 200);
    const again = await token(s, body);
    assert.equal(again.status, 400);
    assert.equal((await again.json()).error, 'invalid_grant');
  } finally { s.close(); }
});

test('wrong PKCE verifier, redirect or resource are rejected', async () => {
  const s = await startServer();
  try {
    for (const override of [{ code_verifier: b64u(crypto.randomBytes(32)) }, { redirect_uri: 'http://127.0.0.1:1/other' }, { resource: 'http://evil.test/mcp' }]) {
      const { client, verifier, code } = await fullFlow(s);
      const r = await token(s, { grant_type: 'authorization_code', code, code_verifier: verifier, client_id: client.client_id, redirect_uri: 'http://127.0.0.1:9999/callback', resource: RESOURCE, ...override });
      assert.equal(r.status, 400, JSON.stringify(override));
    }
  } finally { s.close(); }
});

test('expired authorization code is rejected', async () => {
  const s = await startServer();
  try {
    const { client, verifier, code } = await fullFlow(s);
    s.clock.t += 61 * 1000;
    const r = await token(s, { grant_type: 'authorization_code', code, code_verifier: verifier, client_id: client.client_id, redirect_uri: 'http://127.0.0.1:9999/callback', resource: RESOURCE });
    assert.equal((await r.json()).error, 'invalid_grant');
  } finally { s.close(); }
});

test('authorize rejects missing/plain PKCE, unknown redirect and wrong resource', async () => {
  const s = await startServer();
  try {
    const { body: client } = await register(s);
    const { challenge } = pkce();
    const bad = [
      { code_challenge: undefined }, { code_challenge_method: 'plain' },
      { redirect_uri: 'http://127.0.0.1:9999/callback/../x' }, { resource: 'http://evil.test/mcp' }, { scope: 'admin' },
    ];
    for (const extra of bad) {
      const p = Object.fromEntries(Object.entries(authorizeParams(client.client_id, challenge, extra)).filter(([, v]) => v !== undefined));
      const r = await fetch(`${s.base}/oauth/authorize?${new URLSearchParams(p)}`);
      assert.equal(r.status, 400, JSON.stringify(extra));
      assert.ok(!(r.headers.get('set-cookie') || '').includes('oauth_csrf'));
    }
  } finally { s.close(); }
});

test('non-admin users cannot authorize and wrong passwords are re-prompted', async () => {
  const s = await startServer();
  try {
    const { body: client } = await register(s);
    const { challenge } = pkce();
    const params = authorizeParams(client.client_id, challenge);
    const editor = await signIn(s, params, { email: 'editor@example.com', password: 'correct horse' });
    assert.equal(editor.response.status, 403);
    assert.equal(s.dataAccess.db.codes.size, 0);

    const wrong = await signIn(s, params, { email: 'admin@example.com', password: 'nope' });
    assert.equal(wrong.response.status, 401);
    assert.equal(s.dataAccess.db.codes.size, 0);
  } finally { s.close(); }
});

test('authorize POST without a matching CSRF cookie is rejected', async () => {
  const s = await startServer();
  try {
    const { body: client } = await register(s);
    const { challenge } = pkce();
    const r = await fetch(`${s.base}/oauth/authorize`, {
      method: 'POST', redirect: 'manual', headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ ...authorizeParams(client.client_id, challenge), email: 'admin@example.com', password: 'correct horse', csrf: 'forged' }),
    });
    assert.equal(r.status, 400);
    assert.equal(s.dataAccess.db.codes.size, 0);
  } finally { s.close(); }
});

test('refresh rotates tokens and reuse of an old token revokes the family', async () => {
  const s = await startServer();
  try {
    const { client, verifier, code } = await fullFlow(s);
    const first = await (await token(s, { grant_type: 'authorization_code', code, code_verifier: verifier, client_id: client.client_id, redirect_uri: 'http://127.0.0.1:9999/callback', resource: RESOURCE })).json();

    const rotated = await token(s, { grant_type: 'refresh_token', refresh_token: first.refresh_token, client_id: client.client_id });
    assert.equal(rotated.status, 200);
    const second = await rotated.json();
    assert.notEqual(second.refresh_token, first.refresh_token);

    const reuse = await token(s, { grant_type: 'refresh_token', refresh_token: first.refresh_token, client_id: client.client_id });
    assert.equal(reuse.status, 400);
    const afterReuse = await token(s, { grant_type: 'refresh_token', refresh_token: second.refresh_token, client_id: client.client_id });
    assert.equal(afterReuse.status, 400, 'family must be revoked');

    const other = await register(s);
    const wrongClient = await token(s, { grant_type: 'refresh_token', refresh_token: second.refresh_token, client_id: other.body.client_id });
    assert.equal(wrongClient.status, 400);
  } finally { s.close(); }
});

test('OAuth access tokens are rejected by the existing core authenticate middleware', async () => {
  const s = await startServer();
  try {
    const { client, verifier, code } = await fullFlow(s);
    const t = await (await token(s, { grant_type: 'authorization_code', code, code_verifier: verifier, client_id: client.client_id, redirect_uri: 'http://127.0.0.1:9999/callback', resource: RESOURCE })).json();
    const authenticate = makeAuthenticate({ jwt, config: s.config, AuthenticationError, dataAccess: s.dataAccess });
    let status = 0;
    const res = { status(c) { status = c; return this; }, json() { return this; } };
    await authenticate({ headers: { authorization: `Bearer ${t.access_token}` } }, res, () => { status = 200; });
    assert.equal(status, 401);
  } finally { s.close(); }
});

test('token endpoint authenticates the client (secret post and basic) and rejects bad secrets', async () => {
  const s = await startServer();
  try {
    const { client, verifier, code } = await fullFlow(s);
    const body = { grant_type: 'authorization_code', code, code_verifier: verifier, client_id: client.client_id, redirect_uri: 'http://127.0.0.1:9999/callback', resource: RESOURCE };

    const wrong = await token(s, { ...body, client_secret: crypto.randomUUID() });
    assert.equal(wrong.status, 401);
    assert.equal((await wrong.json()).error, 'invalid_client');
    const missing = await fetch(`${s.base}/oauth/token`, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(body) });
    assert.equal(missing.status, 401);
    const unknown = await token(s, { ...body, client_id: crypto.randomUUID(), client_secret: 'x' });
    assert.equal(unknown.status, 401);
    // a failed client authentication must not burn the code
    const basic = Buffer.from(`${client.client_id}:${client.client_secret}`).toString('base64');
    const ok = await fetch(`${s.base}/oauth/token`, {
      method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded', authorization: `Basic ${basic}` },
      body: new URLSearchParams({ ...body, client_id: undefined }),
    });
    assert.equal(ok.status, 200);
  } finally { s.close(); }
});

test('inactive and unknown clients cannot start authorization; registration endpoint is gone', async () => {
  const s = await startServer();
  try {
    const { body: client } = await register(s, undefined, { isActive: false });
    const { challenge } = pkce();
    const r = await fetch(`${s.base}/oauth/authorize?${new URLSearchParams(authorizeParams(client.client_id, challenge))}`);
    assert.equal(r.status, 400);
    const reg = await fetch(`${s.base}/oauth/register`, { method: 'POST' });
    assert.notEqual(reg.status, 201);
    const m = await (await fetch(`${s.base}/.well-known/oauth-authorization-server`)).json();
    assert.equal(m.registration_endpoint, undefined);
  } finally { s.close(); }
});

test('OAuth fails closed (503) when unconfigured or misconfigured', async () => {
  for (const override of [{ signingPrivateKey: '' }, { issuer: 'http://auth.example.com' }, { signingPrivateKey: '-----BEGIN PRIVATE KEY-----\nnot-base64\n-----END PRIVATE KEY-----' }, { resourceUri: '' }]) {
    const s = await startServer(override);
    try {
      for (const path of ['/.well-known/oauth-authorization-server', '/oauth/jwks', '/oauth/authorize']) {
        assert.equal((await fetch(`${s.base}${path}`)).status, 503, `${path} ${JSON.stringify(override).slice(0, 40)}`);
      }
      // Root-mounted router must not block unrelated app routes.
      assert.equal((await fetch(`${s.base}/apis/core/auth/login`, { method: 'POST' })).status, 404);
    } finally { s.close(); }
  }
});

test('discovery metadata advertises S256-only PKCE and confidential clients', async () => {
  const s = await startServer();
  try {
    const m = await (await fetch(`${s.base}/.well-known/oauth-authorization-server`)).json();
    assert.deepEqual(m.code_challenge_methods_supported, ['S256']);
    assert.deepEqual(m.token_endpoint_auth_methods_supported, ['client_secret_basic', 'client_secret_post']);
    assert.equal(m.token_endpoint, 'http://127.0.0.1:3000/oauth/token');
  } finally { s.close(); }
});


// ---- internal service-to-service header ----

async function runMiddleware(s, headers, roles) {
  const authenticate = makeAuthenticate({ jwt, config: s.config, AuthenticationError, dataAccess: s.dataAccess });
  const authorize = makeAuthorize({ ForbiddenError })(roles);
  let status = 0;
  const req = { headers };
  const res = { status(c) { status = c; return this; }, json() { return this; } };
  await authenticate(req, res, () => authorize(req, res, () => { status = 200; }));
  return { status, auth: req.auth };
}

test('internal scope header grants the service role on content routes only', async () => {
  const s = await startServer();
  try {
    const content = await runMiddleware(s, { 'x-internal-scopes': 'portfolio:admin' }, ['admin', 'service']);
    assert.equal(content.status, 200);
    assert.deepEqual(content.auth.roles, ['service']);
    assert.ok(Number.isNaN(Number(content.auth.sub)), 'never looks like a user id');
    assert.equal((await runMiddleware(s, { 'x-internal-scopes': 'portfolio:admin' }, ['admin'])).status, 403,
      'users/roles/applications stay human-admin only');
  } finally { s.close(); }
});

test('internal header with unknown or empty scopes is rejected, even next to a valid bearer token', async () => {
  const s = await startServer();
  try {
    for (const value of ['', 'admin', 'portfolio:read', 'roles:admin']) {
      assert.equal((await runMiddleware(s, { 'x-internal-scopes': value }, ['admin', 'service'])).status, 401, value);
    }
    const hs = jwt.sign({ sub: '1', roles: ['admin'] }, s.config.auth.accessTokenSecret);
    const mixed = await runMiddleware(s, { 'x-internal-scopes': 'nope', authorization: `Bearer ${hs}` }, ['admin']);
    assert.equal(mixed.status, 401, 'a bad internal header is never silently ignored');
  } finally { s.close(); }
});

test('without the internal header, normal bearer authentication is unchanged', async () => {
  const s = await startServer();
  try {
    assert.equal((await runMiddleware(s, {}, ['admin', 'service'])).status, 401);
    const { client, verifier, code } = await fullFlow(s);
    const userTok = (await (await token(s, { grant_type: 'authorization_code', code, code_verifier: verifier, client_id: client.client_id, redirect_uri: 'http://127.0.0.1:9999/callback', resource: RESOURCE })).json()).access_token;
    assert.equal((await runMiddleware(s, { authorization: `Bearer ${userTok}` }, ['admin', 'service'])).status, 401,
      'MCP-audience OAuth tokens are not core tokens');
  } finally { s.close(); }
});

test('client_credentials grant is not offered', async () => {
  const s = await startServer();
  try {
    const { body: client } = await register(s);
    const r = await token(s, { grant_type: 'client_credentials', client_id: client.client_id });
    assert.equal((await r.json()).error, 'unsupported_grant_type');
  } finally { s.close(); }
});
