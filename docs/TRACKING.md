# Conversion tracking (GA4 + GTM) — task #123yxuagbeb

**Status: the site-side data layer is DONE.** `assets/js/tracking.js` pushes
every event below on every page. What remains is container-side wiring, which
needs two things from Art:

1. A **GTM container** for the site → gives `GTM-XXXXXXX`, passed to the build
   as `GTM_ID=GTM-XXXXXXX`. Without it events still queue in `dataLayer`, so
   the wiring can be tested any time.
2. A **GA4 property** for the site (or the decision to use an existing Ferrys
   property with a new stream).

## Events pushed by the site

| event | fires on | params |
|---|---|---|
| `call_click` | any `tel:` link | `phone_number`, `cta_position` |
| `whatsapp_click` | any `wa.me` link | `cta_position` |
| `form_submit` | callback form submit | — |
| `form_success` | return from lead.php with `?sent=1` | — |
| `form_error` | return with `?err=…` | `error_code` |
| `faq_open` | a FAQ accordion opens | `faq_question` |
| `scroll_depth` | 25 / 50 / 75 / 90 %, once each | `depth_percent` |

Every event also carries: `page_type`, `page_slug`, `hour_of_day` (0–23),
`daypart` (`night` 22:00–05:59 / `morning` / `afternoon` / `evening`),
`out_of_hours` (true outside Mon–Fri 09:00–17:30, same rule as lead.php).
The time dimension is the point: out-of-hours call volume is the leading
indicator that validates the rota and the paid dayparting strategy.

`cta_position` values: `emergency_bar`, `hero`, `mobile_bar`, `cta_band`,
`urgent_box`, `footer`, `body`.

## GTM wiring (once the container exists)

1. **Variables**: Data Layer Variables for each param above
   (`phone_number`, `cta_position`, `page_type`, `page_slug`, `hour_of_day`,
   `daypart`, `out_of_hours`, `faq_question`, `depth_percent`, `error_code`).
2. **Triggers**: Custom Event trigger per event name in the table.
3. **Tags**: one GA4 Configuration tag (the measurement ID), plus one GA4
   Event tag per event, forwarding the params. Register the params as custom
   dimensions in GA4 admin (event-scoped): `cta_position`, `daypart`,
   `out_of_hours`, `page_type`, `hour_of_day`.
4. **Key events**: mark `call_click`, `whatsapp_click`, `form_success` as key
   events in GA4. (`form_submit` stays a plain event; `form_success` is the
   server-confirmed one.)
5. **Search Console**: link the GA4 property to GSC once the domain is
   verified (task #123yxuagbed).

## Consent Mode v2 (EU/DMA)

The site currently sets **no cookies and loads no third-party scripts** until
GTM is added. When GTM+GA4 go live, either:

- run GA4 in **cookieless pings** via Consent Mode v2 defaults
  (`analytics_storage: denied` until consent), which keeps modelled
  conversions flowing without a banner blocking a distressed 3am visitor, or
- add a consent banner (heavier; conflicts with the "phone number outranks
  elegance" rule — prefer the first option unless the DPO says otherwise).

Set the default consent state in GTM (Consent Initialization trigger) BEFORE
the GA4 config tag fires. Verify in GA4 DebugView that `call_click` arrives
with `daypart` populated with consent denied and granted both.

## Pre-launch baseline

Before flipping to production, capture the current state so improvement is
provable: GSC impressions/clicks for the garda-related queries on
ferrysolicitors.com, plus call volume numbers from the firm if available.

## Verification checklist (done when)

- [ ] All events visible in GA4 DebugView from a staging session
- [ ] `call_click` fires from emergency bar, hero, mobile bar, cta band, body
- [ ] `form_success` fires after a real end-to-end submission
- [ ] Consent Mode v2 verified (events flow in denied state as modelled pings)
- [ ] GA4 ↔ Search Console linked
- [ ] Baseline captured
