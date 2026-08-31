# Content Brief: Garda Station Solicitors

**Read this in full before writing. Every page you write must comply with it.**

---

## 1. The property

**Brand:** Garda Station Solicitors, a Ferrys Solicitors LLP service
**Named lead:** Tony Collier, Partner, Criminal Defence
**Purpose:** capture people at the moment they are arrested, or asked to attend a Garda station, and convert them to a phone call.

**Reader state:** frightened, often at night, usually on a phone, frequently never arrested before. They may be the accused, or a parent or partner acting for them. Write for that person. Calm, direct, practical. Never sensational, never chummy, never salesy.

---

## 2. Verified facts (use these; do not invent others)

| Fact | Value |
|---|---|
| 24-hour number | 087 122 3080 |
| Office number | (01) 677 9408 |
| WhatsApp | https://wa.me/353871223080 |
| Email | info@ferrysolicitors.com |
| Firm | Ferrys Solicitors LLP, established 1989 |
| Criminal defence team | 6 solicitors: Tony Collier, Fiona D'Arcy, Holly Laher, Katie Kavanagh, Michael McNieve, Cordina Serbanescu |
| Tony Collier | Partner. Member, Law Society of Ireland Education Faculty. Member, DSBA Criminal Law Committee. Appears in District, Circuit Criminal, Central Criminal and Special Criminal Courts. |

**Five Dublin offices (the ONLY offices; do not invent others):**

- Ormond Quay: Inn Chambers, 15 Ormond Quay Upper, Dublin 7, D07 YK6A, (01) 677 9408
- Rialto: 443 South Circular Road, Rialto, Dublin 8, D08 F6X9, (01) 454 4275
- Artane: Malahide Road / Kilmore Road Corner, Artane, Dublin 5, D05 TP28, (01) 832 7849
- Ballyfermot: 345 Ballyfermot Road, Ballyfermot, Dublin 10, D10 YF21, (01) 626 9475
- Ballymun: Santry Cross, Dublin 11, D11 T925, (01) 960 2047

---

## 3. Positioning: the one claim that matters

A competing sole practitioner promises nationwide 24/7 cover from one mobile phone. Ferrys fields **six criminal defence solicitors across five Dublin offices**, so round-the-clock cover is a **rota**, not one person's availability. Lead with this wherever out-of-hours or availability is discussed.

Secondary strengths: 35+ years since 1989; Tony's Law Society Education Faculty and DSBA roles (he teaches this area, not just practises it); genuine depth across all criminal courts.

---

## 4. HARD RULES. Breaking any of these makes the page unusable.

### 4.1 Regulatory (Law Society of Ireland advertising rules)
- **Never name, reference or allude to any competing firm or solicitor.** Not once, anywhere.
- **No comparative claims.** Never "better than", "the best", "Ireland's leading", "number one", "top-rated".
- **No outcome guarantees or predictions.** Never "we will get your case dismissed", "we win", "high success rate", "proven results".
- **No claims of specialist accreditation** the firm does not hold.
- Content about changing solicitors must be framed as **neutral information about a client's right to choose their own representation**, never as an inducement to leave another firm.
- Do not invent testimonials, reviews, case studies, statistics or success rates.

### 4.2 Legal accuracy
- The firm's solicitors will review every page before publication. Your job is accurate general information, not legal advice.
- **Keep statutory detail general.** Say that maximum detention periods depend on the legislation a person is held under and can sometimes be extended. **Do not cite specific section numbers, Act names, or specific hour limits.** A placeholder note is provided in the frontmatter for the reviewing solicitor.
- Right to silence: state it exists, and that in certain limited circumstances a court may be permitted to draw inferences from a failure to answer, which is exactly why the decision needs legal advice first. Do not attempt to specify when.
- Never state or imply that legal advice guarantees release or a better outcome.
- Every page must carry the standard disclaimer (see 6.4).

### 4.3 Honesty about coverage
Ferrys has **five offices, all in Dublin**. For pages about counties outside Dublin:
- **Never imply a local office, local branch, or local presence.** There isn't one.
- Correct framing: the firm acts for clients nationwide and will travel for serious matters; for anything urgent, call and we will tell you honestly whether we can attend in time, or help you find someone who can.
- That honesty is a feature. Use it. It is more trustworthy than a fake local claim, and it protects the firm.
- Do not claim stations "have our details on file" unless it is Dublin, and even then keep it general.

### 4.4 Style
- **British/Irish English** throughout: organised, recognised, defence, apologise, whilst is acceptable but sparing.
- **NO EM DASHES.** None. Use commas, colons, semicolons, brackets, or split the sentence. This is a hard rule and will be checked automatically.
- "Gardai" (no fada needed in body copy), "An Garda Siochana", "Garda station", "member in charge".
- Second person ("you"), active voice, short paragraphs (2 to 4 sentences).
- No exclamation marks. No emoji. No rhetorical questions stacked for effect.
- Do not use the words: cutting-edge, world-class, passionate, dedicated team, unrivalled, bespoke, tailored solutions.

---

## 5. Anti-thin-content rule (the most important instruction here)

The competitor's county pages are near-identical boilerplate with a place name swapped in. **That is their biggest weakness and we are not copying it.**

Every page you write must be **at least 60% unique** against its siblings. Achieve that with genuinely page-specific substance:

- **County pages:** name the real principal Garda stations in that county, name the District Court district(s) and courthouse town(s), and address the practical reality of attendance and travel from Dublin honestly.
- **Court pages:** what that court actually deals with, what happens on the day, where it sits, what a person should expect and bring.
- **Offence pages:** what the offence involves in general terms, what typically happens at the Garda station stage, what the process looks like afterwards, and the specific anxieties attached to that offence (employment, vetting, travel, reputation, family).
- **Dublin office pages:** the actual stations that office realistically covers, the real address and number, and local travel context.

If you cannot make a page genuinely useful and distinct, say so in the frontmatter `notes` field rather than padding it.

---

## 6. Output format

One Markdown file per page. Filename: kebab-case slug, `.md`.

### 6.1 Frontmatter (YAML, required on every file)

```yaml
---
slug: garda-station-solicitor-cork
title: "Garda Station Solicitors in Cork | 24 Hour Legal Advice"   # under 60 chars where possible
meta_description: "..."                                            # 140 to 155 chars, includes a call to action
h1: "Garda station solicitors in Cork"
page_type: county            # core | county | court | offence | dublin-office
primary_keyword: "garda station solicitor cork"
secondary_keywords: ["...", "...", "..."]
parent: nationwide           # slug of the logical parent page
internal_links:              # slugs this page should link to
  - your-rights
  - legal-aid
schema: LegalService         # LegalService | FAQPage-not-used | Attorney | WebPage
hero_image: hero-dublin      # hero-dublin | courts | consultation-room | law-library | night-street | georgian-door | corridor
legal_review_required: true
notes: "Anything the reviewing solicitor or the developer needs to know."
---
```

### 6.2 Body structure

- Start with a short, direct opening paragraph. No heading before it.
- Then `##` sections. Use `###` only where genuinely nested.
- Include one **urgent callout** block, formatted exactly as:

```
> **If the Gardai are waiting**
> Short, practical instruction ending with the number 087 122 3080.
```

- Include a **step list** where the page describes a process.
- Include **3 to 6 FAQs** at the end under `## Common questions`, each as `### Question?` followed by the answer. These map to accordions in the build.
- Word count: core pages 700 to 1100; county pages 450 to 650; court pages 500 to 750; offence pages 550 to 800; Dublin office pages 450 to 650.

### 6.3 Calls to action
Reference the number as `087 122 3080`. The developer will wire the `tel:` and WhatsApp links, so write them as plain text or standard markdown links to `tel:+353871223080`.

### 6.4 Required footer block
End every file with exactly this, under a `---` rule:

```
---

*This page provides general information about the law in Ireland. It is not legal advice and should not be relied on as legal advice for any particular situation. No solicitor/client relationship, duty of care or liability of any nature arises between you and Ferrys Solicitors LLP unless and until you have received a written letter of engagement confirming our appointment as your solicitors.*

*In contentious business a solicitor may not calculate fees or other charges as a percentage or proportion of any award or settlement.*
```

---

## 7. Before you finish

Self-check every file:

1. Zero em dashes.
2. No competitor named or alluded to.
3. No superlatives, no outcome promises.
4. No invented offices, statistics, reviews or case studies.
5. No specific statutory citations or hour limits.
6. Frontmatter complete and valid YAML.
7. Genuinely distinct from its sibling pages.
8. Disclaimer block present and exact.
