const { resolveSigningKey } = require('../../utils/oauth-signing-key');

const SCOPE = 'portfolio:admin';
const ADMIN_ROLE = 'admin';

// Shared helpers and constants for the OAuth usecases.
function buildOAuthSupport({ config, crypto, now = () => Date.now() }) {
  const settings = config.oauth;
  const issuer = String(settings.issuer || '').replace(/\/+$/, '');

  let signingKey = null;
  let signingKeyError = null;
  try {
    signingKey = settings.signingPrivateKey ? resolveSigningKey(settings.signingPrivateKey) : null;
  } catch (error) {
    signingKeyError = error;
  }

  return {
    SCOPE,
    ADMIN_ROLE,
    settings,
    issuer,
    signingKey,
    signingKeyError,
    nowSec: () => Math.floor(now() / 1000),
    sha256: (value) => crypto.createHash('sha256').update(String(value)).digest('hex'),
    randomToken: () => crypto.randomBytes(32).toString('base64url'),
    safeEqual: (a, b) => {
      const x = Buffer.from(String(a));
      const y = Buffer.from(String(b));
      return x.length === y.length && crypto.timingSafeEqual(x, y);
    },
  };
}

module.exports = buildOAuthSupport;
