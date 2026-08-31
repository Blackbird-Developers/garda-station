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
Seven images in `../garda-station-site/assets/img/`, each as `.webp` and `.jpg`:

`hero-dublin` · `courts` · `consultation-room` · `law-library` · `night-street` · `georgian-door` · `corridor`

Each page's `hero_image` names one. They are AI-generated environmental shots, deliberately containing **no people**. Distribution is uneven by design (29 pages use `night-street`), so consider generating two or three more environmental variants to reduce repetition across the 26 county pages.

**Resolved.** A real photograph of Tony Collier is now in place, supplied by the client and cropped to two derivatives:

`tony-collier` (600x800, 3:4) for the `.authority-photo` block · `tony-collier-avatar` (200x200) for the per-page byline

Both ship as `.webp` and `.jpg`. The prototype's *"Replace with a real photograph of Tony Collier"* placeholder is gone. The standing rule still applies: never substitute an AI-generated person on a law firm site. A photograph of the wider team is still outstanding.

### 5.4 Tony Collier as the named lead

`_BRIEF.md` s1 names Tony as the lead for this property, but the first static build
surfaced him only in body copy: no photograph anywhere, and 41 of 55 pages did not
mention him at all. The `.authority`, `.authority-photo` and `.creds` rules had been
sitting unused in `styles.css` since the prototype. Two components now use them.

**`bylineHtml()`** renders a compact strip (avatar, name, role, two memberships) at the
top of every page's prose, above the urgent callout. It is deliberately quiet: muted
type and a hairline rule, never a filled card, because nothing on this site should
compete with the emergency callout.

**`authorityHtml()`** renders the full photo-and-credentials block. It appears twice:
on the homepage as its own `section.alt` after the main prose, and at the top of his
own page in place of the byline.

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

**Word counts.** Naming him on the four offence pages that match his stated practice
areas pushed those pages past the `_BRIEF.md` s6.2 bands, as did the expanded detail on
his own page. Trim on review if you would rather hold the bands; the additions are
substantive rather than padding, so they were not cut pre-emptively.

| Page | Before | After | Band |
|---|---|---|---|
| `tony-collier` | 1056 | 1206 | 700 to 1100 |
| `road-traffic-offences` | 797 | 874 | 550 to 800 |
| `sexual-offences` | 830 | 858 | 550 to 800 (already over) |
| `fraud-and-theft` | 800 | 830 | 550 to 800 |
| `drugs-offences` | 800 | 829 | 550 to 800 |
| `index` | 1134 | 1115 | 700 to 1100 (was already over; de-duplication reduced it) |

---

## 6. Technical requirements

| Item | Requirement |
|---|---|
| **Canonicals** | Prototype uses `https://www.gardastationsolicitors.example/`. **Placeholder.** Domain not yet decided. |
| **Schema** | Build from the `schema` frontmatter key. `LegalService` needs `parentOrganization` pointing at Ferrys Solicitors LLP, `telephone`, `areaServed`, `openingHoursSpecification` (24/7). Tony's page uses `Attorney` with `memberOf` for the Law Society and DSBA. |
| **NAP** | 24hr **087 122 3080** · office **(01) 677 9408** · WhatsApp `https://wa.me/353871223080` · info@ferrysolicitors.com. Must be byte-consistent everywhere. Inconsistent NAP is a known weakness of the competitor; do not repeat it. |
| **Offices** | Five, all Dublin. Addresses and Eircodes are in `core/contact.md` and the five `dublin/` pages. **The firm has no offices outside Dublin.** |
| **Images** | Serve WebP with JPEG fallback via `image-set()`, as the prototype does. Lazy-load below the fold. |
| **Tracking** | Conversion tracking must exist **before launch**: GA4 key events for click-to-call, click-to-WhatsApp and form submits, segmented by page, with time-of-day recorded. Without it none of this is measurable. |
| **Sitemap + GSC** | Generate `sitemap.xml`, submit in Search Console, request indexing on the priority pages. |
| **Performance** | Target Good on all three Core Web Vitals. Hero images are the main risk. |

---

## 7. Rules that content must not break

These are compliance constraints, not style preferences. **If you write or edit any copy, they bind you too.** Full detail in `_BRIEF.md` section 4.

1. **No em dashes.** Anywhere. Validated to zero across all 54 files. Keep it that way.
2. **Never name or allude to a competing firm or solicitor.**
3. **No comparative or superlative claims.** No "best", "leading", "top-rated", "number one".
4. **No outcome guarantees or success rates.** No invented testimonials, reviews or case studies.
5. **No specific statutory citations**, section numbers, Act names, hour limits, penalty amounts or disqualification periods. Detention is described only as depending on the legislation a person is held under and sometimes extendable. This is deliberate: it needs a practitioner to add specifics.
6. **Never imply an office or local presence outside Dublin.** County pages are written honestly: the firm acts nationwide, will travel for serious matters, and will say plainly if it cannot attend in time. That honesty is a selling point and it protects the firm.
7. **British/Irish English.** "Gardai", "An Garda Siochana", "member in charge", "defence", "organised".
8. **Disclaimer** must appear on every page, unchanged.

---

## 8. Before launch: blockers

These are not optional.

- [ ] **Compliance sign-off from Tony Collier** on positioning and copy standards. Law Society advertising rules apply and his Education Faculty role raises his personal exposure.
- [ ] **Legal accuracy review** of all 54 pages by a Ferrys solicitor. Every file has `legal_review_required: true` and most carry specific queries in `notes`.
- [ ] **Verify the Garda station and courthouse lists.** Writers named only stations and courts they were confident existed and flagged the rest, but **every list needs checking against the current Courts Service and Garda listings.** Highest risk: Donegal (nine venues), Mayo, Cork county, Kerry peninsulas. District Court district numbers were deliberately omitted throughout.
- [ ] **Confirm the out-of-hours rota is genuinely staffed.** The site's central claim is a real 24/7 rota. Do not advertise cover that is not resourced.
- [x] **Real photograph of Tony Collier.** Done. A photograph of the wider team is still outstanding.
- [ ] **Tony's LinkedIn URL** for `sameAs` in his Person schema. His firm profile links to it but the URL was not supplied, so it has not been guessed. See the TODO in `tonyNode()` in `build.js`.
- [ ] **Decide whether he personally reviews pages.** If he does, set `reviewed_by: tony-collier` in that page's frontmatter (see section 3). Until then the byline makes no review claim.
- [ ] **Domain decision**, then update all canonicals.
- [ ] **Confirm ownership of `tonycolliersolicitor.ie`** (it exists but returns empty).
- [ ] **Conversion tracking live** before launch.

---

## 9. Suggested build order

1. Scaffold from `_page-index.csv`, wire the frontmatter into templates, port `styles.css`.
2. Build the 9 core pages first; they carry the proposition and the highest intent.
3. Write and build `nationwide.md`, then the 26 county pages beneath it.
4. Build courts, offences, then the 5 Dublin office pages.
5. Build the matching hub page for the main site at `ferrysolicitors.com/garda-station-solicitor/`. A prototype exists at `../garda-station-site/hub-page-for-ferrysolicitors-com.html`.
6. Schema, sitemap, tracking, Core Web Vitals.
7. Hold for legal sign-off. Then launch, then request indexing.

---

## 10. Things worth knowing

- **Word counts** run 596 to 1135 including headings. Core pages are longest, counties shortest by design.
- **Uniqueness was measured**, not assumed: county pages are 68 to 80 percent distinct from their nearest sibling, court pages roughly 93 percent. This matters. The competitor's near-identical county pages are their biggest liability under Google's doorway-page guidance, and copying that pattern would have imported the risk. Keep pages substantive if you extend the set.
- **30 links** originally pointed at a page called `what-happens-at-the-garda-station` that was never written. All have been repointed to `arrested`, which covers that ground. Do not recreate it as a separate thin page.
- **The Children's Court page is a genuine competitive gap.** The competitor has nothing on youth justice. Ferrys has real strength here. Give it prominence.
- **Do not chase a literal fifty-page count.** Fifty-four pages exist. If a page cannot be made genuinely useful, leave it out rather than padding.
