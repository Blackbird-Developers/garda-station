/**
 * Garda Station Solicitors - static site generator.
 *
 * Content: garda-content/**.md (YAML frontmatter + markdown, per _HANDOFF.md §3).
 * Design: the approved prototype at garda-station-site/ (Art, 31 Aug 2026).
 *   - assets/styles.css is the prototype stylesheet, taken AS-IS (task #123yxuagbdw)
 *   - the markup below mirrors the prototype pages' structure verbatim
 *     (emergency-bar, header.site/.brand, hero + hero-assurance, .crumb,
 *      .wrap.prose, .urgent-box, .steps, details.faq, .cta-band, footer.site,
 *      .mobile-call) - compare with garda-station-site/your-rights.html
 *
 * Body conventions handled here:
 *  - opening paragraph before any heading  -> hero .lede
 *  - "> **If the Gardai are waiting**"     -> .urgent-box component
 *  - numbered lists                        -> .steps component
 *  - "## Common questions" + "### Q?"      -> <details class="faq"> accordions
 *  - final block after last ---            -> stripped; rendered once in footer
 *
 * Domain is a placeholder until Art's domain decision (handoff §6). STAGING=1
 * (default) adds noindex + robots Disallow; build with STAGING=0 at launch.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { marked } = require('marked');

const ROOT = __dirname;
const CONTENT = path.join(ROOT, 'garda-content');
const DIST = path.join(ROOT, 'dist');
const STAGING = process.env.STAGING !== '0';

const SITE = {
  domain: 'https://www.gardastationsolicitors.example', // PLACEHOLDER, see handoff §6
  tel24: '087 122 3080',
  tel24Href: 'tel:+353871223080',
  telOffice: '(01) 677 9408',
  telOfficeHref: 'tel:+35316779408',
  whatsapp: 'https://wa.me/353871223080',
  email: 'info@ferrysolicitors.com',
};

/* ---------------------------------------------------------------- collect */

function collectPages() {
  const files = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.md') && !e.name.startsWith('_')) files.push(p);
    }
  };
  walk(CONTENT);
  return files.map(parsePage);
}

function parsePage(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) throw new Error(`No frontmatter in ${file}`);
  const fm = yaml.load(m[1]);
  let body = m[2].trim();

  // Strip the shared disclaimer (everything after the last horizontal rule);
  // it renders once, in .footer-bottom, exactly as the prototype does.
  const cut = body.lastIndexOf('\n---\n');
  if (cut === -1 || !body.slice(cut).includes('letter of engagement')) {
    throw new Error(`Disclaimer block not found in ${file}`);
  }
  body = body.slice(0, cut).trim();

  return { file, fm, body, wordCount: body.split(/\s+/).length };
}

/* ------------------------------------------------------------- transforms */

function extractUrgent(body) {
  const re = /(?:^> \*\*If the Gardai are waiting\*\*\r?\n(?:^>.*(?:\r?\n|$))+)/m;
  const m = body.match(re);
  if (!m) return [body, null];
  return [body.replace(re, '\n'), m[0]];
}

function extractLede(body) {
  const idx = body.search(/^#{1,6} /m);
  const head = (idx === -1 ? body : body.slice(0, idx)).trim();
  const rest = idx === -1 ? '' : body.slice(idx);
  const paras = head.split(/\r?\n\r?\n/).filter(Boolean);
  const lede = paras.shift() || '';
  return [lede, (paras.join('\n\n') + '\n\n' + rest).trim()];
}

function extractFaqs(body) {
  const re = /^## Common questions\s*$/m;
  const m = body.match(re);
  if (!m) return [body, ''];
  const start = m.index;
  const after = body.slice(start + m[0].length);
  const next = after.search(/^## /m);
  const section = next === -1 ? after : after.slice(0, next);
  const remainder = body.slice(0, start) + (next === -1 ? '' : after.slice(next));

  const items = [];
  const qre = /^### (.+?)\s*$/gm;
  let q, prev = null;
  while ((q = qre.exec(section)) !== null) {
    if (prev) prev.answer = section.slice(prev.end, q.index).trim();
    prev = { question: q[1], end: q.index + q[0].length };
    items.push(prev);
  }
  if (prev) prev.answer = section.slice(prev.end).trim();

  const faqHtml = items.length
    ? `<h2>Common questions</h2>
${items.map((i) => `<details class="faq">
  <summary>${inlineMd(i.question)}</summary>
  <div class="faq-body">${postProcess(marked.parse(i.answer))}</div>
</details>`).join('\n')}`
    : '';
  return [remainder.trim(), faqHtml];
}

function inlineMd(s) {
  return marked.parseInline(s);
}

function postProcess(html) {
  html = html.replace(/<ol>/g, '<ol class="steps">');
  html = html.replace(/href="\/([a-z0-9-]+)"/g, 'href="/$1/"');
  html = html.replace(/(?<!>)087 122 3080(?![^<]*<\/a>)/g,
    `<a href="${SITE.tel24Href}" data-cta="call"><strong>087 122 3080</strong></a>`);
  return html;
}

function urgentBoxHtml(calloutMd) {
  if (!calloutMd) return '';
  const inner = calloutMd.replace(/^> ?/gm, '').replace(/\*\*If the Gardai are waiting\*\*\s*/, '');
  return `<div class="urgent-box">
  <h3>If the Gardai are waiting</h3>
  ${postProcess(marked.parse(inner.trim()))}
</div>`;
}

/* ---------------------------------------------------------------- layout */

function breadcrumbs(page, bySlug) {
  const chain = [];
  let cur = page.fm;
  const guard = new Set();
  while (cur && cur.parent && !guard.has(cur.parent)) {
    guard.add(cur.parent);
    const p = bySlug[cur.parent];
    if (!p) break;
    chain.unshift(p.fm);
    cur = p.fm;
  }
  if (page.fm.slug !== 'index' && !chain.some((f) => f.slug === 'index')) {
    const home = bySlug['index'];
    if (home) chain.unshift(home.fm);
  }
  return chain;
}

function crumbHtml(chain, page) {
  if (page.fm.slug === 'index') return '';
  const parts = chain.map((fm) =>
    `<a href="${urlFor(fm.slug)}">${fm.slug === 'index' ? 'Home' : escapeHtml(shortName(fm))}</a>`);
  parts.push(escapeHtml(shortName(page.fm)));
  return `<div class="wrap"><p class="crumb">${parts.join(' &rsaquo; ')}</p></div>`;
}

function shortName(fm) {
  return fm.h1.length <= 40 ? fm.h1 : fm.title.replace(/\s*\|.*$/, '');
}

function urlFor(slug) {
  return slug === 'index' ? '/' : `/${slug}/`;
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function heroMediaStyle(heroImage) {
  return `background-image:image-set(url('/assets/img/${heroImage}.webp') type('image/webp'), url('/assets/img/${heroImage}.jpg') type('image/jpeg'))`;
}

function jsonLd(page, chain) {
  const url = SITE.domain + urlFor(page.fm.slug);
  const graphs = [];
  if (page.fm.schema === 'LegalService') {
    const g = {
      '@type': 'LegalService',
      '@id': url + '#service',
      name: page.fm.h1,
      parentOrganization: { '@type': 'Organization', name: 'Ferrys Solicitors LLP' },
      telephone: '+353871223080',
      email: SITE.email,
      areaServed: { '@type': 'Country', name: 'Ireland' },
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
        opens: '00:00', closes: '23:59',
      },
      url,
    };
    if (page.fm.page_type === 'county') {
      const county = page.fm.slug.replace('garda-station-solicitor-', '');
      g.areaServed = { '@type': 'AdministrativeArea', name: `County ${county.charAt(0).toUpperCase() + county.slice(1)}` };
    }
    graphs.push(g);
  } else if (page.fm.schema === 'Attorney') {
    graphs.push({
      '@type': 'Attorney',
      '@id': url + '#attorney',
      name: 'Tony Collier',
      jobTitle: 'Partner, Criminal Defence',
      worksFor: { '@type': 'Organization', name: 'Ferrys Solicitors LLP' },
      memberOf: [
        { '@type': 'Organization', name: 'Law Society of Ireland Education Faculty' },
        { '@type': 'Organization', name: 'DSBA Criminal Law Committee' },
      ],
      telephone: '+353871223080',
      url,
    });
  } else {
    graphs.push({ '@type': 'WebPage', '@id': url, url, name: page.fm.title, description: page.fm.meta_description });
  }
  if (chain.length) {
    graphs.push({
      '@type': 'BreadcrumbList',
      itemListElement: chain.concat([page.fm]).map((fm, i) => ({
        '@type': 'ListItem', position: i + 1, name: fm.slug === 'index' ? 'Home' : shortName(fm),
        item: SITE.domain + urlFor(fm.slug),
      })),
    });
  }
  return `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graphs })}</script>`;
}

// Nav mirrors the prototype header, plus Nationwide (the county tier did not
// exist when the prototype's 10 pages were built).
const NAV = [
  ['index', 'Home'],
  ['your-rights', 'Your rights'],
  ['arrested', "If you're arrested"],
  ['voluntary-attendance', 'Voluntary attendance'],
  ['legal-aid', 'Legal aid'],
  ['nationwide', 'Nationwide'],
  ['tony-collier', 'Our team'],
  ['contact', 'Contact'],
];

function renderPage(page, bySlug) {
  const chain = breadcrumbs(page, bySlug);
  let body = page.body;
  const [b1, calloutMd] = extractUrgent(body);
  const [lede, b2] = extractLede(b1);
  const [b3, faqHtml] = extractFaqs(b2);
  const contentHtml = postProcess(marked.parse(b3));
  const isHome = page.fm.slug === 'index';
  const robots = STAGING
    ? '<meta name="robots" content="noindex, nofollow">'
    : '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">';

  return `<!DOCTYPE html>
<html lang="en-IE">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(page.fm.title)}</title>
<meta name="description" content="${escapeHtml(page.fm.meta_description)}">
${robots}
<link rel="canonical" href="${SITE.domain}${urlFor(page.fm.slug)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${escapeHtml(page.fm.title)}">
<meta property="og:description" content="${escapeHtml(page.fm.meta_description)}">
<meta property="og:locale" content="en_IE">
<meta property="og:image" content="/assets/img/${page.fm.hero_image}.jpg">
<meta name="theme-color" content="#0a1a2b">
<link rel="preload" as="image" href="/assets/img/${page.fm.hero_image}.webp">
<link rel="stylesheet" href="/assets/styles.css">
${jsonLd(page, chain)}
</head>
<body>

<div class="emergency-bar">
  <span class="pulse"></span> Arrested or asked to attend a Garda station? Call
  <a href="${SITE.tel24Href}" data-cta="call"><strong>087 122 3080</strong></a> &mdash; 24 hours, 7 days
</div>

<header class="site">
  <div class="wrap header-inner">
    <a class="brand" href="/">
      <span class="brand-mark">GS</span>
      <span class="brand-text">
        <span class="brand-name">Garda Station Solicitors</span>
        <span class="brand-sub">A Ferrys Solicitors LLP service</span>
      </span>
    </a>
    <nav class="site" aria-label="Main">
      <ul>
        ${NAV.map(([s, label]) => `<li><a href="${urlFor(s)}"${page.fm.slug === s ? ' aria-current="page"' : ''}>${label}</a></li>`).join('\n        ')}
      </ul>
    </nav>
  </div>
</header>
<section class="hero${isHome ? '' : ' hero-compact'}">
  <div class="hero-media" style="${heroMediaStyle(page.fm.hero_image)}"></div>
  <div class="wrap">
    <h1>${inlineMd(page.fm.h1)}</h1>
    <p class="lede">${postProcess(inlineMd(lede))}</p>
    <div class="hero-actions">
      <a class="btn btn-call btn-lg" href="${SITE.tel24Href}" data-cta="call">Call 087 122 3080</a>
      <a class="btn btn-outline btn-lg" href="${SITE.whatsapp}" data-cta="whatsapp">WhatsApp us</a>
    </div>
    <div class="hero-assurance">
      <span>Answered 24 hours a day</span><span>Six criminal defence solicitors</span>
      <span>Five Dublin offices</span><span>Legal aid if eligible</span>
    </div>
  </div>
</section>
${crumbHtml(chain, page)}

<section>
  <div class="wrap prose">
${urgentBoxHtml(calloutMd)}
${contentHtml}
${faqHtml}
  </div>
</section>

<section class="cta-band">
  <div class="cta-media" style="${heroMediaStyle('night-street')}"></div>
  <div class="wrap">
    <h2>Talk to a solicitor before you talk to the Gardai.</h2>
    <p>One call, at any hour. If you qualify for legal aid it costs you nothing &mdash;
       and either way you will know exactly where you stand.</p>
    <div class="cta-actions">
      <a class="btn btn-call btn-lg" href="${SITE.tel24Href}" data-cta="call">087 122 3080</a>
      <a class="btn btn-outline btn-lg" href="${SITE.whatsapp}" data-cta="whatsapp">WhatsApp</a>
    </div>
  </div>
</section>

<footer class="site">
  <div class="wrap">
    <div class="footer-grid">
      <div>
        <h4>Garda Station Solicitors</h4>
        <p style="margin-top:0">A dedicated Garda station and criminal defence service of
          <a href="https://ferrysolicitors.com/">Ferrys Solicitors LLP</a>, led by Tony Collier.</p>
        <p><strong style="color:#fff">24 hours:</strong> <a href="${SITE.tel24Href}" data-cta="call">087 122 3080</a></p>
        <p><strong style="color:#fff">Office:</strong> <a href="${SITE.telOfficeHref}">(01) 677 9408</a></p>
      </div>
      <div>
        <h4>If you need help now</h4>
        <ul>
          <li><a href="/arrested/">If you have been arrested</a></li>
          <li><a href="/voluntary-attendance/">Asked to attend voluntarily</a></li>
          <li><a href="/family-member-arrested/">A family member is in custody</a></li>
          <li><a href="/weekend-out-of-hours/">Weekend &amp; out of hours</a></li>
        </ul>
      </div>
      <div>
        <h4>Know where you stand</h4>
        <ul>
          <li><a href="/your-rights/">Your rights in a Garda station</a></li>
          <li><a href="/legal-aid/">Garda station legal aid</a></li>
          <li><a href="/nationwide/">Nationwide coverage</a></li>
          <li><a href="/tony-collier/">Tony Collier &amp; the team</a></li>
          <li><a href="/contact/">Contact &amp; offices</a></li>
        </ul>
      </div>
      <div>
        <h4>Ferrys Solicitors LLP</h4>
        <ul>
          <li><a href="https://ferrysolicitors.com/">Main website</a></li>
          <li><a href="https://ferrysolicitors.com/solicitor-services-dublin/criminal-defence/">Criminal defence</a></li>
          <li><a href="https://ferrysolicitors.com/about-ferrys-solicitors-dublin/our-people-meet-the-team/">Our people</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>Garda Station Solicitors is a service of Ferrys Solicitors LLP, a firm regulated by the
         Law Society of Ireland. Registered office: Inn Chambers, 15 Ormond Quay Upper, Dublin 7, D07 YK6A.</p>
      <p>The information on this website is general information about the law in Ireland. It is not
         legal advice and should not be relied on as legal advice for any particular situation. No
         solicitor/client relationship, duty of care or liability of any nature arises between you and
         Ferrys Solicitors LLP unless and until you have received a written letter of engagement
         confirming our appointment as your solicitors.</p>
      <p>In contentious business a solicitor may not calculate fees or other charges as a percentage
         or proportion of any award or settlement.</p>
      <p>&copy; 2026 Ferrys Solicitors LLP. All rights reserved.</p>
    </div>
  </div>
</footer>

<div class="mobile-call">
  <a class="btn btn-call" href="${SITE.tel24Href}" data-cta="call">Call now</a>
  <a class="btn btn-whatsapp" href="${SITE.whatsapp}" data-cta="whatsapp">WhatsApp</a>
</div>

</body>
</html>
`;
}

/* ----------------------------------------------------------------- build */

function build() {
  const pages = collectPages();
  const bySlug = {};
  for (const p of pages) {
    if (bySlug[p.fm.slug]) throw new Error(`Duplicate slug: ${p.fm.slug}`);
    bySlug[p.fm.slug] = p;
  }

  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });
  fs.cpSync(path.join(ROOT, 'assets'), path.join(DIST, 'assets'), { recursive: true });

  const warnings = [];
  for (const p of pages) {
    for (const l of p.fm.internal_links || []) {
      if (!bySlug[l]) warnings.push(`${p.fm.slug}: internal_links target does not resolve: ${l}`);
    }
    if (!fs.existsSync(path.join(ROOT, 'assets', 'img', `${p.fm.hero_image}.webp`))) {
      warnings.push(`${p.fm.slug}: hero image missing: ${p.fm.hero_image}`);
    }
    const out = p.fm.slug === 'index' ? path.join(DIST, 'index.html') : path.join(DIST, p.fm.slug, 'index.html');
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, renderPage(p, bySlug));
  }

  const urls = pages.map((p) => `  <url><loc>${SITE.domain}${urlFor(p.fm.slug)}</loc></url>`).join('\n');
  fs.writeFileSync(path.join(DIST, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);

  fs.writeFileSync(path.join(DIST, 'robots.txt'),
    STAGING ? 'User-agent: *\nDisallow: /\n'
            : `User-agent: *\nAllow: /\nSitemap: ${SITE.domain}/sitemap.xml\n`);

  const csvEsc = (v) => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
  const csv = ['file,slug,page_type,title,h1,primary_keyword,parent,hero_image,schema,word_count']
    .concat(pages.map((p) => [
      path.relative(CONTENT, p.file).replace(/\\/g, '/'), p.fm.slug, p.fm.page_type, p.fm.title,
      p.fm.h1, p.fm.primary_keyword, p.fm.parent || '', p.fm.hero_image, p.fm.schema, p.wordCount,
    ].map(csvEsc).join(','))).join('\n');
  fs.writeFileSync(path.join(CONTENT, '_page-index.csv'), csv + '\n');
  fs.writeFileSync(path.join(CONTENT, '_sitemap.json'), JSON.stringify(
    pages.map((p) => ({
      file: path.relative(CONTENT, p.file).replace(/\\/g, '/'),
      slug: p.fm.slug, page_type: p.fm.page_type, title: p.fm.title, h1: p.fm.h1,
      primary_keyword: p.fm.primary_keyword, parent: p.fm.parent || null,
      internal_links: p.fm.internal_links || [], schema: p.fm.schema,
      hero_image: p.fm.hero_image, word_count: p.wordCount,
    })), null, 2) + '\n');

  console.log(`Built ${pages.length} pages -> dist/ (${STAGING ? 'STAGING: noindex + robots closed' : 'PRODUCTION'})`);
  if (warnings.length) {
    console.log('WARNINGS:');
    for (const w of warnings) console.log('  ' + w);
  }
}

build();
