// Fixed-window in-memory limiter. ponytail: per-process; use a shared store (Redis) if core runs >1 replica.
function makeRateLimiter({ windowMs, max, now = Date.now }) {
  const hits = new Map();
  return function rateLimit(req, res, next) {
    const t = now();
    const key = req.ip || 'unknown';
    const entry = hits.get(key);
    if (!entry || entry.resetAt <= t) {
      if (hits.size > 10000) hits.clear();
      hits.set(key, { count: 1, resetAt: t + windowMs });
      return next();
    }
    entry.count += 1;
    if (entry.count > max) {
      res.set('Retry-After', String(Math.ceil((entry.resetAt - t) / 1000)));
      return res.status(429).json({ error: 'temporarily_unavailable', error_description: 'Too many requests' });
    }
    return next();
  };
}

module.exports = makeRateLimiter;
