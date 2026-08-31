/**
 * QA pass over dist/ (task #123yxuagbef). Zero dependencies.
 *
 * Automates the crawl checklist so it can run on every build; Screaming Frog
 * over the staging URL stays as the final sign-off crawl.
 *
 * Checks per page:
 *   - internal hrefs resolve to built pages
 *   - EXACTLY ONE <title>, meta description, meta robots, canonical, <h1>
 *     (the main Ferrys site ships a stray duplicated head block across 31
 *     pages - this guards against inheriting that failure mode)
 *   - no duplicate titles or meta descriptions across the site
 *   - JSON-LD parses, and no page emits the same entity type twice
 *   - NAP discipline: only the approved tel: hrefs, no unformatted numbers
 *   - no placeholder text, no staging host references (production only)
 *   - staging build carries noindex everywhere; production carries it nowhere
 */
'use strict';

const fs = require('fs');
const path = require('path');
const DIST = path.join(__dirname, 'dist');

const APPROVED_TELS = new Set([
  '+353871223080', '+35316779408', // 24hr + main office
  '+35314544275', '+35318327849', '+35316269475', '+35319602047', // offices
]);
const PLACEHOLDERS = [/lorem/i, /\bTODO\b/, /to be supplied/i, /Replace with a real photograph/i, /XXXXX/];

const pages = [];
const walk = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) pages.push(p);
  }
};
walk(DIST);

const problems = [];
const titles = new Map();
const descs = new Map();
let staging = null;

for (const p of pages) {
  const rel = path.relative(DIST, p);
  const h = fs.readFileSync(p, 'utf8');
  const is404 = rel === '404.html';

  // -- broken internal links
  for (const m of h.matchAll(/href="(\/[a-z0-9-]+\/?)"/g)) {
    const slug = m[1].replace(/\/$/, '');
    if (slug === '/assets' || slug === '/lead.php') continue;
    if (!fs.existsSync(path.join(DIST, slug, 'index.html'))) problems.push(`${rel}: broken internal link ${m[1]}`);
  }

  // -- exactly-one head elements + one h1
  const counts = {
    title: (h.match(/<title>/g) || []).length,
    'meta description': (h.match(/<meta name="description"/g) || []).length,
    'meta robots': (h.match(/<meta name="robots"/g) || []).length,
    canonical: (h.match(/<link rel="canonical"/g) || []).length,
    h1: (h.match(/<h1[\s>]/g) || []).length,
  };
  for (const [what, n] of Object.entries(counts)) {
    const want = is404 && (what === 'canonical' || what === 'meta description') ? 0 : 1;
    if (n !== want) problems.push(`${rel}: expected ${want} ${what}, found ${n}`);
  }

  // -- title/description uniqueness
  if (!is404) {
    const t = (h.match(/<title>([\s\S]*?)<\/title>/) || [])[1];
    const d = (h.match(/<meta name="description" content="([^"]*)"/) || [])[1];
    if (t) { if (titles.has(t)) problems.push(`${rel}: duplicate title with ${titles.get(t)}`); else titles.set(t, rel); }
    if (d) { if (descs.has(d)) problems.push(`${rel}: duplicate meta description with ${descs.get(d)}`); else descs.set(d, rel); }
  }

  // -- structured data parses; no duplicate entity types on a page
  for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const data = JSON.parse(m[1]);
      const graphs = data['@graph'] || [data];
      const seen = new Set();
      for (const g of graphs) {
        if (seen.has(g['@type'])) problems.push(`${rel}: duplicate schema entity ${g['@type']}`);
        seen.add(g['@type']);
      }
    } catch (e) { problems.push(`${rel}: JSON-LD does not parse (${e.message})`); }
  }

  // -- NAP: only approved tel hrefs
  for (const m of h.matchAll(/href="tel:([^"]+)"/g)) {
    if (!APPROVED_TELS.has(m[1])) problems.push(`${rel}: unapproved tel href ${m[1]}`);
  }
  // visible number format drift (e.g. "0871223080" or "087-122-3080" in text)
  const text = h.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<!--[\s\S]*?-->/g, '').replace(/href="[^"]*"/g, '');
  for (const m of text.matchAll(/08[- ]?7[\d\- ]{7,}/g)) {
    const raw = m[0].trim().replace(/[\s-]+$/, '');
    if (raw !== '087 122 3080') problems.push(`${rel}: nonstandard 24hr number format "${raw}"`);
  }

  // -- placeholders
  for (const re of PLACEHOLDERS) {
    if (re.test(text)) problems.push(`${rel}: placeholder text matches ${re}`);
  }

  // -- staging vs production coherence (404.html is always noindex, so it
  //    neither sets nor checks the baseline)
  const noindex = h.includes('noindex');
  if (!is404) {
    if (staging === null) staging = noindex;
    if (noindex !== staging) problems.push(`${rel}: mixed staging/production head (noindex=${noindex})`);
  }
  if (!staging && !is404) {
    if (h.includes('gardastationsolicitors.example')) problems.push(`${rel}: PRODUCTION build still uses the placeholder domain`);
    if (/https?:\/\/[^"']*staging/i.test(h)) problems.push(`${rel}: staging host reference in production build`);
    if (!h.includes('googletagmanager.com')) problems.push(`${rel}: PRODUCTION build without GTM (set GTM_ID; tracking blocks launch)`);
  }
}

console.log(`pages: ${pages.length} (${staging ? 'staging' : 'production'} build)`);
if (problems.length) {
  console.log('PROBLEMS:');
  for (const w of problems) console.log('  ' + w);
  process.exit(1);
}
console.log('clean: links, head uniqueness, schema, NAP, placeholders all pass');
