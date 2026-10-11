const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');
const { resolveSigningKey } = require('../utils/oauth-signing-key');

test('a seed derives a stable P-256 key usable for ES256', () => {
  const seed = '00000000-0000-4000-8000-000000000000';
  const a = resolveSigningKey(seed);
  const b = resolveSigningKey(seed);
  assert.equal(a.asymmetricKeyType, 'ec');
  assert.equal(a.asymmetricKeyDetails.namedCurve, 'prime256v1');
  assert.deepEqual(crypto.createPublicKey(a).export({ format: 'jwk' }), crypto.createPublicKey(b).export({ format: 'jwk' }));

  const token = jwt.sign({ sub: '1' }, a, { algorithm: 'ES256' });
  const publicJwk = crypto.createPublicKey(a).export({ format: 'jwk' });
  assert.equal(jwt.verify(token, crypto.createPublicKey({ key: publicJwk, format: 'jwk' }), { algorithms: ['ES256'] }).sub, '1');
});

test('different seeds give different keys; PEM keys still work', () => {
  const jwkOf = (k) => JSON.stringify(crypto.createPublicKey(k).export({ format: 'jwk' }));
  assert.notEqual(jwkOf(resolveSigningKey('seed-a')), jwkOf(resolveSigningKey('seed-b')));
  const pem = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' }).privateKey.export({ type: 'pkcs8', format: 'pem' });
  assert.equal(resolveSigningKey(pem).asymmetricKeyDetails.namedCurve, 'prime256v1');
});

test('the default config seed enables OAuth', () => {
  const config = require('../config');
  const oauth = require('../usecases/oauth')({ dataAccess: {}, config, jwt, bcrypt: {}, crypto, logger: { warn() {} } });
  assert.equal(oauth.isEnabled(), true, oauth.getConfigurationProblem());
  assert.equal(oauth.getJwks().keys[0].kid, config.oauth.keyId);
});
