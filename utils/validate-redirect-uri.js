const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

/** OAuth redirect URIs must be https (or http on loopback), with no fragment, credentials or wildcard. */
function isValidRedirectUri(raw) {
  let url;
  try {
    url = new URL(String(raw));
  } catch {
    return false;
  }

  const isHttps = url.protocol === 'https:';
  const isLoopbackHttp = url.protocol === 'http:' && LOOPBACK_HOSTS.has(url.hostname);

  return (isHttps || isLoopbackHttp) && !url.hash && !url.username && !url.password && !String(raw).includes('*');
}

module.exports = { isValidRedirectUri };
