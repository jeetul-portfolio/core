const cheerio = require('cheerio');

const HASHTAG_PATTERN = /(?<![a-zA-Z0-9_])#([a-zA-Z][a-zA-Z0-9_-]*)/g;

// Hex color codes: pure hex chars at lengths 3, 4, 6, or 8 (e.g. #fff, #ffffff, #cbd5e1)
const HEX_COLOR_RE = /^[0-9a-f]{3}$|^[0-9a-f]{4}$|^[0-9a-f]{6}$|^[0-9a-f]{8}$/;

/**
 * Extracts #hashtag mentions from HTML or plain text content.
 * Returns a deduplicated array of tag names (without the # prefix),
 * normalized to lowercase. CSS hex color codes (#fff, #ffffff, etc.) are excluded.
 */
function extractHashtags(content) {
  if (!content || typeof content !== 'string') {
    return [];
  }

  let text = content;

  // If content looks like HTML, strip tags first to get plain text
  if (/<[a-z][\s\S]*>/i.test(content)) {
    const $ = cheerio.load(content);
    $('script, style, noscript, template').remove();
    text = $.text();
  }

  const found = new Set();
  let match;

  while ((match = HASHTAG_PATTERN.exec(text)) !== null) {
    const tag = match[1].toLowerCase().trim();
    if (tag && !HEX_COLOR_RE.test(tag)) {
      found.add(tag);
    }
  }

  // Reset regex lastIndex for next call (since it uses `g` flag)
  HASHTAG_PATTERN.lastIndex = 0;

  return Array.from(found);
}

module.exports = { extractHashtags };
