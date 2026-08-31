// QA pass over dist/: every internal href must resolve to a built page,
// and staging output must carry the noindex meta.
'use strict';
const fs = require('fs');
const path = require('path');
const DIST = path.join(__dirname, 'dist');

let pages = 0;
const bad = [];
const noindexMissing = [];
const walk = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) {
      pages++;
      const h = fs.readFileSync(p, 'utf8');
      for (const m of h.matchAll(/href="(\/[a-z0-9-]+\/?)"/g)) {
        const slug = m[1].replace(/\/$/, '');
        if (slug === '/assets') continue;
        if (!fs.existsSync(path.join(DIST, slug, 'index.html'))) bad.push(path.relative(DIST, p) + ' -> ' + m[1]);
      }
      if (!h.includes('noindex')) noindexMissing.push(path.relative(DIST, p));
    }
  }
};
walk(DIST);
console.log(`pages: ${pages}`);
console.log(bad.length ? 'BROKEN LINKS:\n  ' + bad.join('\n  ') : 'all internal hrefs resolve');
console.log(noindexMissing.length ? 'NOINDEX MISSING:\n  ' + noindexMissing.join('\n  ') : 'noindex present on all pages (staging)');
