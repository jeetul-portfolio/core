function makeGetJwksUsecase({ crypto, settings, signingKey }) {
  return function getJwksUsecase() {
    const publicJwk = crypto.createPublicKey(signingKey).export({ format: 'jwk' });

    return { keys: [{ ...publicJwk, kid: settings.keyId, alg: 'ES256', use: 'sig' }] };
  };
}

module.exports = makeGetJwksUsecase;
