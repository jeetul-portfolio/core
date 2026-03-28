const cheerio = require('cheerio');

const EXCERPT_LIMIT = 240;
const BLOCK_TAG_SELECTOR = 'p,div,section,article,aside,header,footer,main,nav,li,ul,ol,br,h1,h2,h3,h4,h5,h6,blockquote,pre,tr,td,th';

function buildExcerpt(input) {
  const html = String(input || '');
  const $ = cheerio.load(html);

  // Drop non-content nodes before extracting readable text for excerpt.
  $('script,style,noscript,template').remove();
  $(BLOCK_TAG_SELECTOR).append(' ');

  const plainText = $.root().text().replace(/\s+/g, ' ').trim();

  return plainText.slice(0, EXCERPT_LIMIT);
}

module.exports = {
  buildExcerpt,
  EXCERPT_LIMIT,
};