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
const { execSync } = require('child_process');
const yaml = require('js-yaml');
const { marked } = require('marked');

const ROOT = __dirname;
const CONTENT = path.join(ROOT, 'garda-content');
const DIST = path.join(ROOT, 'dist');
const STAGING = process.env.STAGING !== '0';

const SITE = {
  // PLACEHOLDER until Art's domain decision (handoff §6); override at build
  // time with DOMAIN=https://... once decided - canonicals, og:image, schema
  // and sitemap all derive from it.
  domain: (process.env.DOMAIN || 'https://www.gardastationsolicitors.example').replace(/\/$/, ''),
  tel24: '087 122 3080',
  tel24Href: 'tel:+353871223080',
  telOffice: '(01) 677 9408',
  telOfficeHref: 'tel:+35316779408',
  whatsapp: 'https://wa.me/353871223080',
  email: 'info@ferrysolicitors.com',
};

// GTM container id (task #123yxuagbeb). Set GTM_ID=GTM-XXXXXXX at build time
// once Art creates the container; without it the dataLayer still queues events
// so nothing else changes at wiring time.
const GTM_ID = process.env.GTM_ID || '';

// The five real offices (source: approved prototype garda-station-site/contact.html,
// addresses verified against garda-content/core/contact.md). Keyed by page slug
// so dublin-office pages emit their own LegalService location (task #123yxuagbea).
const OFFICES = {
  'garda-station-solicitor-ormond-quay': {
    name: 'Ormond Quay Office',
    streetAddress: 'Inn Chambers, 15 Ormond Quay Upper',
    addressLocality: 'Dublin 7', postalCode: 'D07 YK6A', telephone: '+35316779408',
  },
  'garda-station-solicitor-rialto': {
    name: 'Rialto Office',
    streetAddress: '443 South Circular Road, Rialto',
    addressLocality: 'Dublin 8', postalCode: 'D08 F6X9', telephone: '+35314544275',
  },
  'garda-station-solicitor-artane': {
    name: 'Artane Office',
    streetAddress: 'Malahide Road / Kilmore Road Corner, Artane',
    addressLocality: 'Dublin 5', postalCode: 'D05 TP28', telephone: '+35318327849',
  },
  'garda-station-solicitor-ballyfermot': {
    name: 'Ballyfermot Office',
    streetAddress: '345 Ballyfermot Road, Ballyfermot',
    addressLocality: 'Dublin 10', postalCode: 'D10 YF21', telephone: '+35316269475',
  },
  'garda-station-solicitor-ballymun': {
    name: 'Ballymun Office',
    streetAddress: 'Santry Cross',
    addressLocality: 'Dublin 11', postalCode: 'D11 T925', telephone: '+35319602047',
  },
};

const PARENT_ORG = {
  '@type': 'LegalService',
  name: 'Ferrys Solicitors LLP',
  url: 'https://ferrysolicitors.com/',
  foundingDate: '1989',
};

function officePlace(o) {
  return {
    '@type': 'Place',
    name: o.name,
    address: {
      '@type': 'PostalAddress',
      streetAddress: o.streetAddress,
      addressLocality: o.addressLocality,
      postalCode: o.postalCode,
      addressCountry: 'IE',
    },
    telephone: o.telephone,
  };
}

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
  // Normalize CRLF: a Windows checkout (core.autocrlf=true) otherwise breaks
  // the '\n---\n' disclaimer cut and every ^-anchored transform below.
  const raw = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
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

// Callback request form (task #123yxuagbee), rendered on /contact/ only.
// Markup and copy mirror the approved prototype (garda-station-site/contact.html);
// backend additions: a real action (/lead.php), honeypot + timing fields
// (spam protection without a CAPTCHA), and status messages driven by the
// ?sent= / ?err= query params that lead.php redirects back with.
const FIELD_STYLE = 'width:100%;padding:13px;border:1px solid #dde3ea;border-radius:6px;font-size:16px';

function callbackFormHtml() {
  return `<section id="callback">
  <div class="wrap prose">
    <h2>Request a call back</h2>
    <p>If it is not an emergency, leave your details and we will come back to you. If it is an
       emergency, please phone.</p>
    <p id="lead-status" hidden role="status"></p>
    <form method="post" action="/lead.php" id="lead-form" style="max-width:560px">
      <p><label for="nm"><strong>Your name</strong></label><br>
        <input id="nm" name="name" type="text" required maxlength="120" autocomplete="name" style="${FIELD_STYLE}"></p>
      <p><label for="ph"><strong>Phone number</strong></label><br>
        <input id="ph" name="phone" type="tel" required maxlength="30" autocomplete="tel" style="${FIELD_STYLE}"></p>
      <p><label for="st"><strong>Garda station (if known)</strong></label><br>
        <input id="st" name="station" type="text" maxlength="120" style="${FIELD_STYLE}"></p>
      <p><label for="ms"><strong>Anything you want us to know</strong></label><br>
        <textarea id="ms" name="message" rows="4" maxlength="2000" style="${FIELD_STYLE}"></textarea></p>
      <p style="position:absolute;left:-9999px" aria-hidden="true">
        <label for="ws">Website</label>
        <input id="ws" name="website" type="text" tabindex="-1" autocomplete="off"></p>
      <input type="hidden" name="ts" id="lead-ts" value="">
      <p><button class="btn btn-solid btn-block" type="submit">Request a call back</button></p>
      <p style="font-size:14px;color:#667585">Submitting this form does not create a solicitor/client
         relationship. Please do not include detail about an allegation in this form &mdash; tell us on
         the phone instead.</p>
    </form>
  </div>
</section>`;
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

// Responsive hero delivery (task #123yxuagbec): images.js generates -960 and
// -1600 variants next to the originals. Fall back to the original file if a
// variant is missing so the build never emits a broken URL.
function heroVariant(name, size) {
  const v = `${name}-${size}`;
  return fs.existsSync(path.join(ROOT, 'assets', 'img', `${v}.webp`)) ? v : name;
}

function imageSetCss(name) {
  return `image-set(url('/assets/img/${name}.webp') type('image/webp'), url('/assets/img/${name}.jpg') type('image/jpeg'))`;
}

function heroMediaStyle(heroImage) {
  return `background-image:${imageSetCss(heroVariant(heroImage, 1600))}`;
}

// Inline style attributes win over stylesheet rules, so the small-viewport
// variant swap needs !important. Emitted per page in <head>.
function responsiveHeroStyle(hero) {
  const h960 = heroVariant(hero, 960);
  const cta960 = heroVariant('night-street', 960);
  return `<style>@media (max-width:960px){.hero-media{background-image:${imageSetCss(h960)}!important}.cta-media{background-image:${imageSetCss(cta960)}!important}}</style>`;
}

function gtmHead() {
  if (!GTM_ID) return '<!-- GTM: set GTM_ID=GTM-XXXXXXX at build time to enable (docs/TRACKING.md) -->';
  return `<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');</script>`;
}

function gtmBody() {
  if (!GTM_ID) return '';
  return `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`;
}

// Task #123yxuagbe2: 29 of 54 pages declare night-street, which reads as
// repetitive across the 26 county pages. The task allows "vary by province",
// so county pages that declare night-street get a province-keyed variant
// instead (frontmatter is untouched; this is presentation only).
const PROVINCE = {
  carlow: 'L', dublin: 'L', kildare: 'L', kilkenny: 'L', laois: 'L', longford: 'L',
  louth: 'L', meath: 'L', offaly: 'L', westmeath: 'L', wexford: 'L', wicklow: 'L',
  clare: 'M', cork: 'M', kerry: 'M', limerick: 'M', tipperary: 'M', waterford: 'M',
  galway: 'C', leitrim: 'C', mayo: 'C', roscommon: 'C', sligo: 'C',
  cavan: 'U', donegal: 'U', monaghan: 'U',
};
const PROVINCE_HERO = { L: 'night-street', M: 'corridor', C: 'georgian-door', U: 'hero-dublin-alt' };

function effectiveHero(fm) {
  if (fm.page_type === 'county' && fm.hero_image === 'night-street') {
    const county = fm.slug.replace('garda-station-solicitor-', '');
    const prov = PROVINCE[county];
    if (prov) return PROVINCE_HERO[prov];
  }
  return fm.hero_image;
}

function jsonLd(page, chain) {
  const url = SITE.domain + urlFor(page.fm.slug);
  const graphs = [];
  if (page.fm.schema === 'LegalService') {
    const g = {
      '@type': 'LegalService',
      '@id': url + '#service',
      name: page.fm.h1,
      parentOrganization: PARENT_ORG,
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
    // Per-office LegalService location with the real address and Eircode
    // (task #123yxuagbea); the contact page lists all five.
    if (page.fm.page_type === 'dublin-office' && OFFICES[page.fm.slug]) {
      g.location = officePlace(OFFICES[page.fm.slug]);
    } else if (page.fm.slug === 'contact') {
      g.location = Object.values(OFFICES).map(officePlace);
    }
    graphs.push(g);
  } else if (page.fm.schema === 'Attorney') {
    graphs.push({
      '@type': 'Attorney',
      '@id': url + '#attorney',
      name: 'Tony Collier',
      jobTitle: 'Partner, Criminal Defence',
      worksFor: PARENT_ORG,
      memberOf: [
        { '@type': 'Organization', name: 'Law Society of Ireland Education Faculty' },
        { '@type': 'Organization', name: 'DSBA Criminal Law Committee' },
      ],
      knowsAbout: [
        'Criminal defence', 'Garda station representation', 'Detention and questioning',
        'Garda station legal aid', 'Criminal legal aid', 'Youth justice and the Children’s Court',
      ],
      // sameAs (LinkedIn) deliberately omitted: no URL in content or handoff.
      // Needed from Art before launch - do not guess a profile URL.
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
// exist when the prototype's 10 pages were built) and the Children's Court
// (task #123yxuagbe3: "Give it prominence in navigation" - the one completely
// uncontested gap in the keyword map).
const NAV = [
  ['index', 'Home'],
  ['your-rights', 'Your rights'],
  ['arrested', "If you're arrested"],
  ['legal-aid', 'Legal aid'],
  ['childrens-court', "Children's Court"],
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
  const hero = effectiveHero(page.fm);
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
<meta property="og:image" content="${SITE.domain}/assets/img/${hero}.jpg">
<meta name="theme-color" content="#0a1a2b">
<link rel="preload" as="image" media="(max-width:960px)" href="/assets/img/${heroVariant(hero, 960)}.webp">
<link rel="preload" as="image" media="(min-width:961px)" href="/assets/img/${heroVariant(hero, 1600)}.webp">
<link rel="stylesheet" href="/assets/styles.css">
${responsiveHeroStyle(hero)}
${gtmHead()}
${jsonLd(page, chain)}
</head>
<body>
${gtmBody()}

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
  <div class="hero-media" style="${heroMediaStyle(hero)}"></div>
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
${page.fm.slug === 'contact' ? callbackFormHtml() : ''}
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

<script src="/assets/js/tracking.js" defer data-page-type="${page.fm.page_type}" data-page-slug="${page.fm.slug}"></script>
</body>
</html>
`;
}

/* ----------------------------------------------------------------- build */

// sitemap <lastmod> from each content file's last git commit (accurate even on
// a fresh clone, where file mtimes are all clone time). Untracked/dirty files
// fall back to mtime.
function contentLastMods() {
  const map = new Map();
  try {
    const log = execSync('git log --format=%cI --name-only -- garda-content',
      { cwd: ROOT, maxBuffer: 16 * 1024 * 1024 }).toString();
    let date = null;
    for (const line of log.split('\n')) {
      const l = line.trim();
      if (!l) continue;
      if (/^\d{4}-\d{2}-\d{2}T/.test(l)) date = l.slice(0, 10);
      else if (!map.has(l)) map.set(l, date);
    }
  } catch (_) { /* not a git checkout: mtime fallback below */ }
  return map;
}

function lastModFor(page, gitMods) {
  const rel = path.relative(ROOT, page.file).replace(/\\/g, '/');
  return gitMods.get(rel) ||
    fs.statSync(page.file).mtime.toISOString().slice(0, 10);
}

// robots.txt (task #123yxuagbed). AI crawlers are deliberately allowed: LLM
// citation is part of the strategy for the rights and legal aid clusters.
// The explicit user-agents document that intent; "*" already allows them.
function robotsTxt() {
  if (STAGING) return 'User-agent: *\nDisallow: /\n';
  const ai = ['GPTBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-Web', 'PerplexityBot', 'Google-Extended', 'CCBot'];
  return ['User-agent: *', 'Allow: /', '']
    .concat(ai.flatMap((a) => [`User-agent: ${a}`, 'Allow: /', '']))
    .concat([`Sitemap: ${SITE.domain}/sitemap.xml`, '']).join('\n');
}

// llms.txt: AI-discoverability index (task #123yxuagbed).
function llmsTxt(pages) {
  const byType = { core: 'Core guidance', court: 'Courts', offence: 'Offence types', county: 'Nationwide coverage by county', 'dublin-office': 'Dublin offices' };
  const lines = [
    '# Garda Station Solicitors',
    '',
    '> 24 hour Garda station and criminal defence solicitors in Ireland. A service of',
    '> Ferrys Solicitors LLP, Dublin, led by Tony Collier. Six criminal defence',
    '> solicitors, five Dublin offices, nationwide coverage. Call 087 122 3080 at any hour.',
    '',
    'General information about Irish criminal law and Garda station procedure. It is',
    'not legal advice for any particular situation.',
    '',
  ];
  for (const [type, label] of Object.entries(byType)) {
    const group = pages.filter((p) => p.fm.page_type === type);
    if (!group.length) continue;
    lines.push(`## ${label}`, '');
    for (const p of group) {
      lines.push(`- [${p.fm.title}](${SITE.domain}${urlFor(p.fm.slug)}): ${p.fm.meta_description}`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

// 404 with the emergency number on it (QA task #123yxuagbef requires it).
function notFoundHtml() {
  return `<!DOCTYPE html>
<html lang="en-IE">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Page not found | Garda Station Solicitors</title>
<meta name="robots" content="noindex">
<link rel="stylesheet" href="/assets/styles.css">
</head>
<body>
<div class="emergency-bar">
  <span class="pulse"></span> Arrested or asked to attend a Garda station? Call
  <a href="${SITE.tel24Href}" data-cta="call"><strong>087 122 3080</strong></a> &mdash; 24 hours, 7 days
</div>
<section class="hero hero-compact">
  <div class="hero-media" style="${heroMediaStyle('georgian-door')}"></div>
  <div class="wrap">
    <h1>That page could not be found</h1>
    <p class="lede">The page may have moved. If you need a solicitor now, call us on any hour of any day.</p>
    <div class="hero-actions">
      <a class="btn btn-call btn-lg" href="${SITE.tel24Href}" data-cta="call">Call 087 122 3080</a>
      <a class="btn btn-outline btn-lg" href="/">Go to the homepage</a>
    </div>
  </div>
</section>
<section><div class="wrap prose">
  <p>Useful places to start: <a href="/your-rights/">your rights in a Garda station</a>,
     <a href="/arrested/">if you have been arrested</a>, <a href="/legal-aid/">legal aid</a>,
     or <a href="/contact/">contact and offices</a>.</p>
</div></section>
</body>
</html>
`;
}

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

  const gitMods = contentLastMods();
  const urls = pages.map((p) =>
    `  <url><loc>${SITE.domain}${urlFor(p.fm.slug)}</loc><lastmod>${lastModFor(p, gitMods)}</lastmod></url>`).join('\n');
  fs.writeFileSync(path.join(DIST, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);

  fs.writeFileSync(path.join(DIST, 'robots.txt'), robotsTxt());
  if (!STAGING) fs.writeFileSync(path.join(DIST, 'llms.txt'), llmsTxt(pages));
  fs.writeFileSync(path.join(DIST, '404.html'), notFoundHtml());

  // Server-side pieces: the lead handler ships with the site; .htaccess is
  // environment-specific (deploy/, task #123yxuagbe8).
  const staticDir = path.join(ROOT, 'static');
  if (fs.existsSync(staticDir)) fs.cpSync(staticDir, DIST, { recursive: true });
  const htaccess = path.join(ROOT, 'deploy', STAGING ? 'htaccess-staging.conf' : 'htaccess-production.conf');
  if (fs.existsSync(htaccess)) fs.copyFileSync(htaccess, path.join(DIST, '.htaccess'));

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
