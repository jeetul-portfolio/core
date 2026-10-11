const crypto = require('crypto');

const PEM_HEADER = '-----BEGIN';
// Domain-separation labels: changing them changes every derived key.
const HKDF_SALT = 'portfolio-core-oauth';
const HKDF_INFO = 'es256-signing-key-v1';

/**
 * Builds the ES256 (P-256) signing key from config. Accepts either a PEM private key or a
 * secret seed string (e.g. a UUID); a seed is stretched with HKDF-SHA256 into a P-256 scalar,
 * so the same seed always yields the same key pair.
 */
function resolveSigningKey(value) {
  const material = String(value || '');
  if (material.startsWith(PEM_HEADER)) {
    return crypto.createPrivateKey(material);
  }

  const d = Buffer.from(crypto.hkdfSync('sha256', material, HKDF_SALT, HKDF_INFO, 32));
  const ecdh = crypto.createECDH('prime256v1');
  ecdh.setPrivateKey(d);
  const publicPoint = ecdh.getPublicKey(null, 'uncompressed'); // 0x04 || x || y

  return crypto.createPrivateKey({
    format: 'jwk',
    key: {
      kty: 'EC',
      crv: 'P-256',
      d: d.toString('base64url'),
      x: publicPoint.subarray(1, 33).toString('base64url'),
      y: publicPoint.subarray(33, 65).toString('base64url'),
    },
  });
}

module.exports = { resolveSigningKey };
