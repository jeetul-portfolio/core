const crypto = require('crypto');

// Format: scrypt$<salt>$<hash> (base64url). UUID secrets are high-entropy; scrypt keeps a DB leak useless anyway.
function hashSecret(secret) {
  const salt = crypto.randomBytes(16);
  return `scrypt$${salt.toString('base64url')}$${crypto.scryptSync(secret, salt, 64).toString('base64url')}`;
}

function verifySecret(secret, stored) {
  const [scheme, saltB64, hashB64] = String(stored || '').split('$');
  if (scheme !== 'scrypt' || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, 'base64url');
  const actual = crypto.scryptSync(String(secret), Buffer.from(saltB64, 'base64url'), expected.length);
  return crypto.timingSafeEqual(actual, expected);
}

module.exports = { hashSecret, verifySecret };
