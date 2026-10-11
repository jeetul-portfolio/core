const AUTHORIZE_FIELDS = [
  'response_type',
  'client_id',
  'redirect_uri',
  'code_challenge',
  'code_challenge_method',
  'scope',
  'state',
  'resource',
];

const escapeHtml = (value) => String(value ?? '').replace(
  /[&<>"']/g,
  (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])
);

function setNoStoreHeaders(res) {
  return res.set({
    'Cache-Control': 'no-store',
    Pragma: 'no-cache',
    'X-Frame-Options': 'DENY',
    'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'",
    'X-Content-Type-Options': 'nosniff',
  });
}

function renderPage({ title, body }) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title><style>body{font:16px system-ui;margin:0;display:grid;place-items:center;min-height:100vh;background:#111;color:#eee}
main{width:min(26rem,90vw);padding:2rem;background:#1b1b1b;border-radius:12px}label{display:block;margin:1rem 0 .25rem}
input{width:100%;box-sizing:border-box;padding:.6rem;border-radius:6px;border:1px solid #444;background:#111;color:#eee}
button{margin-top:1.5rem;width:100%;padding:.7rem;border:0;border-radius:6px;background:#7cf;font-weight:600}.err{color:#f88}code{word-break:break-all}</style></head>
<body><main>${body}</main></body></html>`;
}

function sendJsonError(res, error, logger) {
  setNoStoreHeaders(res);
  if (error.name === 'OAuthError') {
    if (error.error === 'invalid_client') {
      res.set('WWW-Authenticate', 'Basic realm="oauth"');
    }
    return res.status(error.httpStatusCode).json({ error: error.error, error_description: error.message });
  }
  logger.error('OAuth internal error:', error.message);
  return res.status(500).json({ error: 'server_error', error_description: 'Internal error' });
}

function sendHtmlError(res, error, logger) {
  setNoStoreHeaders(res);
  const isOAuthError = error.name === 'OAuthError';
  if (!isOAuthError) {
    logger.error('OAuth internal error:', error.message);
  }
  return res.status(isOAuthError ? error.httpStatusCode : 500).type('html').send(renderPage({
    title: 'Authorization error',
    body: `<h1>Authorization error</h1><p class="err">${escapeHtml(isOAuthError ? error.message : 'Internal error')}</p>`,
  }));
}

function renderAuthorizeForm(res, { request, params, csrf, error }) {
  setNoStoreHeaders(res);
  const hidden = AUTHORIZE_FIELDS
    .filter((field) => params[field] !== undefined)
    .map((field) => `<input type="hidden" name="${field}" value="${escapeHtml(params[field])}">`)
    .join('');
  const redirectHost = new URL(request.redirectUri).host;

  return res.status(error ? 401 : 200).type('html').send(renderPage({
    title: 'Authorize MCP access',
    body: `<h1>Authorize access</h1>
<p><strong>${escapeHtml(request.client.clientName)}</strong> wants admin access to your portfolio tools. It will be redirected to <code>${escapeHtml(redirectHost)}</code>.</p>
${error ? `<p class="err">${escapeHtml(error)}</p>` : ''}
<form method="post" action="/oauth/authorize" autocomplete="off">${hidden}<input type="hidden" name="csrf" value="${escapeHtml(csrf)}">
<label for="email">Admin email</label><input id="email" name="email" type="email" required autofocus>
<label for="password">Password</label><input id="password" name="password" type="password" required>
<button type="submit">Sign in and approve</button></form>`,
  }));
}

module.exports = {
  AUTHORIZE_FIELDS,
  setNoStoreHeaders,
  sendJsonError,
  sendHtmlError,
  renderAuthorizeForm,
};
