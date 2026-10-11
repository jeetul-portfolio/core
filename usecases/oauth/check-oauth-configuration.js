const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

// Returns a reason string when OAuth is not safely configured, otherwise null.
function makeCheckOAuthConfigurationUsecase({ settings, signingKey, signingKeyError }) {
  const isLoopbackUrl = (url) => url.protocol === 'http:' && LOOPBACK_HOSTS.has(url.hostname);

  return function checkOAuthConfigurationUsecase() {
    const missing = [
      ['OAUTH_ISSUER', settings.issuer],
      ['OAUTH_RESOURCE_URI', settings.resourceUri],
      ['OAUTH_SIGNING_PRIVATE_KEY', settings.signingPrivateKey],
      ['OAUTH_KEY_ID', settings.keyId],
    ].filter(([, value]) => !value).map(([name]) => name);
    if (missing.length > 0) {
      return `missing ${missing.join(', ')}`;
    }

    for (const [name, value] of [['OAUTH_ISSUER', settings.issuer], ['OAUTH_RESOURCE_URI', settings.resourceUri]]) {
      let url;
      try {
        url = new URL(value);
      } catch {
        return `${name} is not a valid URL`;
      }
      if (url.protocol !== 'https:' && !isLoopbackUrl(url)) {
        return `${name} must be https (http only for loopback)`;
      }
    }

    if (signingKeyError || !signingKey) {
      return 'OAUTH_SIGNING_PRIVATE_KEY is not a usable seed or PEM private key';
    }
    if (signingKey.asymmetricKeyType !== 'ec' || signingKey.asymmetricKeyDetails?.namedCurve !== 'prime256v1') {
      return 'OAUTH_SIGNING_PRIVATE_KEY must be an EC P-256 key';
    }

    return null;
  };
}

module.exports = makeCheckOAuthConfigurationUsecase;
