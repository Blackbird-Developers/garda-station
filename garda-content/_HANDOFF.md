# Handoff: Garda Station Solicitors build

**For:** the Claude Code session that will build this site
**From:** content and strategy work completed in a prior session
**Date:** 13 August 2026
**Status:** content drafted and machine-validated. **Not yet legally reviewed. Nothing here may be published until a Ferrys solicitor has signed it off.**

---

## 1. What this is

A dedicated Garda station property for **Ferrys Solicitors LLP**, branded **Garda Station Solicitors, a Ferrys Solicitors LLP service**, with **Tony Collier** (Partner, Criminal Defence) as the named lead.

**Commercial purpose:** capture people at the moment of arrest, or when asked to attend a Garda station, and convert them to a phone call. This is the highest-intent, highest-urgency search in criminal law.

**Why it exists:** a competing Dublin practice runs a dedicated Garda station site of roughly fifty pages covering counties, courts and offence types. Ferrys currently has no dedicated page at all, only a collapsed panel inside a larger criminal defence page. The gap is structural, not substantive. Ferrys is ahead on everything hard to build: six criminal defence solicitors against their one, five Dublin offices, since 1989, and Tony's Law Society Education Faculty and DSBA Criminal Law Committee roles.

**The one claim that carries the site:** their 24/7 promise runs through one mobile phone. Ferrys has a six-solicitor rota across five offices. Lead with that wherever availability is discussed.

---

## 2. What you have been given

```
garda-content/
├── _BRIEF.md          The content brief the writers worked to. Read it: the rules
│                      in sections 4, 5 and 6 also govern any new content you write.
├── _HANDOFF.md        This file.
├── _page-index.csv    All 54 pages: file, slug, type, title, h1, keyword, parent,
│                      hero image, schema type, word count. Use this to drive the build.
├── _sitemap.json      Same data plus internal_links arrays, as JSON.
├── core/        (9)   Homepage, rights, arrested, voluntary attendance, legal aid,
│                      out-of-hours, family member, contact, Tony Collier.
├── counties/   (26)   Every county in Ireland.
├── courts/      (6)   CCJ, District, Circuit Criminal, Central Criminal,
│                      Special Criminal, Children's Court.
├── offences/    (8)   Murder/manslaughter, sexual, drugs, fraud/theft, white collar,
│                      public order, assault, road traffic.
└── dublin/      (5)   One page per real Ferrys office.
```

**54 pages, roughly 40,800 words.** Every page carries YAML frontmatter, an urgent callout, a step list, 3 to 6 FAQs, and the standard disclaimer.

A **working design prototype** already exists at `../garda-station-site/`. It has 10 built HTML pages, a stylesheet, and generated imagery. **Use it as the design reference.** See section 5.

---

## 3. Frontmatter schema

Every `.md` file starts with this block. It is valid YAML and is your build contract.

| Key | Meaning |
|---|---|
| `slug` | URL slug. Matches the filename. Unique across all 54. |
| `title` | `<title>` tag. Under 60 chars. |
| `meta_description` | Meta description. 130 to 160 chars, contains a call to action. |
| `h1` | The single H1. Do not render `title` as the H1. |
| `page_type` | `core` \| `county` \| `court` \| `offence` \| `dublin-office` |
| `primary_keyword` | Main target term. |
| `secondary_keywords` | Array. |
| `parent` | Slug of the logical parent, for breadcrumbs and internal linking. |
| `internal_links` | Array of slugs this page should link to. All resolve. |
| `schema` | `LegalService` (48) \| `WebPage` (5) \| `Attorney` (1) |
| `hero_image` | One of seven available images. See section 5.3. |
| `legal_review_required` | Always `true`. Do not publish while true. |
| `hook` | *Optional.* A short question naming the reader's situation, rendered as the first `h2`, between the urgent callout and the first content section. |
| `hook_answer` | *Optional.* Two or three sentences answering it. Markdown allowed; `087 122 3080` is auto-linked. Ignored unless `hook` is set. |
| `reviewed_by` | *Optional.* Set to `tony-collier` once he has actually reviewed the page. Upgrades the byline from "led by" to "Reviewed by" and emits schema.org `reviewedBy`. Leave unset until true. |
| `reviewed_date` | *Optional.* ISO date, e.g. `2026-09-04`. Only read when `reviewed_by` is set; also emits `dateModified`. |
| `notes` | **Read these.** Flags for the reviewing solicitor and for you. |

### Body conventions

- Opening paragraph comes **before** any heading. Render it as a lede.
- `##` are sections, `###` are subsections and FAQ questions.
- **Urgent callout**, present on every page, formatted as a blockquote:
  ```
  > **If the Gardai are waiting**
  > Instruction ending with 087 122 3080.
  ```
  Render this as the styled `.urgent-box` component, not as a plain blockquote.
- **Step lists** are numbered lists. Render as the styled `.steps` component.
- **FAQs** sit under `## Common questions`, each `### Question?` plus answer. Render as accordions (`<details class="faq">` in the prototype).
- The final block after a `---` rule is the **disclaimer**. It is byte-identical on all 54 pages. Move it to a shared footer partial rather than repeating it in page content.

---

## 4. Site architecture

```
index (core)
├── your-rights · arrested · voluntary-attendance · legal-aid
├── weekend-out-of-hours · family-member-arrested · contact · tony-collier
├── courts/     6 pages, parent: index
├── offences/   8 pages, parent: index
└── nationwide  ← HUB PAGE, DOES NOT EXIST YET. See 4.1
    ├── counties/  26 pages, parent: nationwide
    └── garda-station-solicitor-dublin
        └── dublin/  5 office pages, parent: garda-station-solicitor-dublin
```

### 4.1 One page you need to create

All 26 county pages declare `parent: nationwide`. **That hub page has not been written.** Create `nationwide.md` as a county index: a short intro on nationwide coverage, honest framing on travel from Dublin, and a linked list of all 26 counties grouped by province (Leinster 12, Munster 6, Connacht 5, Ulster 3). Roughly 400 to 600 words. Follow the same rules.

### 4.2 Internal linking

`internal_links` in frontmatter is the minimum, not the maximum. Every link target resolves; there are no broken slugs. Additionally:

- Every county page should link up to `nationwide` and across to `your-rights`, `arrested` and `legal-aid`.
- Dublin office pages link up to `garda-station-solicitor-dublin`.
- Offence and court pages cross-link where a real relationship exists (road traffic ↔ District Court, murder ↔ Central Criminal Court).
- **Link back to the main site**: `ferrysolicitors.com/solicitor-services-dublin/criminal-defence/` and Tony's profile.

---

## 5. Design

### 5.1 Use the existing prototype
`../garda-station-site/` contains the agreed design: 10 built pages plus `assets/styles.css`. Take the CSS as-is. The visual language was derived from a reference the client approved (Legora), adapted for a law firm: cinematic full-bleed hero with a dark scrim, a deep green accent, letterspaced uppercase wordmark, generous whitespace, pill CTAs, but with **serif headlines** rather than sans, because it needs to read established rather than start-up.

There is also `../garda-station-site/standalone/` with CSS and images inlined. **That is a review artefact only. Do not ship it.** Base64 images cannot be cached.

### 5.2 The non-negotiable design rule
The reader is frightened, usually on a phone, often at night. **The phone number outranks the elegance.** Keep the sticky emergency bar, the mobile call bar, and click-to-call plus click-to-WhatsApp above the fold on every page. Do not let a redesign bury the number.

### 5.3 Imagery
**Replaced.** The eight AI-generated environmental shots are gone. Four real photographs now serve all 55 pages, each as `.webp` and `.jpg` in `assets/img/`:

`garda-station` (station exterior) · `garda-sign` (the blue lantern) · `garda-car` (marked traffic car) · `garda-members` (members on the street)

**Four photographs for 55 pages is thin**, and thinner than the eight it replaced. County heroes vary by province, which with four images yields three distinct county heroes across 26 pages rather than 26. Commissioning three or four more, in particular **a courthouse exterior** (the old `courts` shot had no replacement, and six court pages now carry a station photograph instead), would materially help.

`garda-members` reads as a detention. It is used only where that is literally the subject (`arrested`, `assault`) and is deliberately excluded from the county map; putting it across a tier would be sensational, which s4.4 of the brief rules out.

These are real photographs of real places, and two carry incidental members of the public at a distance. **Confirm licensing and usage rights before launch.**

**Resolved.** A real photograph of Tony Collier is now in place, supplied by the client and cropped to two derivatives:

`tony-collier` (600x800, 3:4) for the `.authority-photo` block · `tony-collier-avatar` (200x200) for the per-page byline

Both ship as `.webp` and `.jpg`. The prototype's *"Replace with a real photograph of Tony Collier"* placeholder is gone. The standing rule still applies: never substitute an AI-generated person on a law firm site. A photograph of the wider team is still outstanding.

### 5.4 Tony Collier as the named lead

`_BRIEF.md` s1 names Tony as the lead for this property, but the first static build
surfaced him only in body copy: no photograph anywhere, and 41 of 55 pages did not
mention him at all. The `.authority`, `.authority-photo` and `.creds` rules had been
sitting unused in `styles.css` since the prototype. Two components now use them.

**`topBandHtml()`** puts three things side by side directly under the hero: the
page's hook question, Tony's photograph with his credentials, and the urgent
callout. It replaced the earlier quiet byline strip, which put only a 46px
avatar on the page and buried the callout below it.

The point is that his face is what the reader lands on. Someone deciding at 3am
whether there is a real solicitor behind a 24 hour number should not have to
scroll to find out.

Narrow screens stack the columns by priority rather than source order:
recognise (the question), act (the callout), then trust (the portrait). A 3/4
portrait at full width would push the callout off the screen, which on this
site is the one thing that must never happen, so below 900px it becomes a
horizontal card.

His own page gets a two column variant without the portrait, since the full
authority block already sits above it.

**`authorityHtml()`** renders the full photo-and-credentials block. It now
appears only on his own page; the homepage version was removed once the band
carried his photograph on every page, rather than showing it twice.

Wording is limited to what is true at build time. The byline says Tony *leads* the
practice; it does not claim he reviewed the page. See `reviewed_by` in section 3 for
the upgrade path.

Two claims on his live firm profile are deliberately not reproduced anywhere, because
`_BRIEF.md` s4.1 bars comparative and superlative claims: *"one of Ireland's most
experienced criminal defence solicitors"* and *"defending some of the biggest cases in
the history of the Irish State"*. Note that both still appear in the legacy prototype
HTML under `garda-station-site/`, which is not the build output but is checked in.

In JSON-LD he is one `Person`/`Attorney` node with a stable `@id`, repeated on all 55
pages so the entity consolidates. `LegalService` pages reference him as `employee`;
`WebPage` pages as `about`.

**Word counts. Every page type now has pages over the s6.2 bands, and the whole
county tier is over.** The county pages had been written to sit just inside 650,
so a hook of roughly 45 words tips all 26 of them. 20 pages that were inside
their band before the hooks are now outside it.

| Tier | Pages | Over band | Worst overrun |
|---|---|---|---|
| core | 10 | 8 | +165 |
| offence | 8 | 8 | +122 |
| county | 26 | 26 | +70 |
| court | 6 | 6 | +68 |
| dublin-office | 5 | 4 | +13 |

This is a decision for review rather than something to absorb silently. The
overruns are 5 to 15 per cent and the added copy is substantive, not padding,
so nothing was cut pre-emptively. If the bands are to hold, the county hook
answers are the place to trim: they run about 45 words and would need to come
down to roughly 25.

