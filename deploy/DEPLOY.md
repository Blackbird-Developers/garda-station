# Deploying Garda Station Solicitors (SiteGround)

Backend runbook for tasks #123yxuagbe8 (hosting) and the launch flip.
The site is fully static plus one PHP endpoint (`lead.php`).

## Build

```bash
npm install
npm run images     # regenerate responsive hero variants (only needed when images change)
npm run build      # STAGING build: noindex, closed robots, staging .htaccess
npm run qa         # link + head + schema + NAP + placeholder checks
```

Production build (only once the domain is decided and legal sign-off is in):

```bash
DOMAIN=https://www.the-real-domain.ie GTM_ID=GTM-XXXXXXX STAGING=0 npm run build
npm run qa
```

`DOMAIN` drives canonicals, og:image, schema URLs, sitemap and llms.txt.
Never ship a production build while the placeholder
`gardastationsolicitors.example` is still in it - `npm run qa` fails on it
unless the build is a staging one.

## Upload

Upload the CONTENTS of `dist/` to the SiteGround web root (Site Tools > File
Manager, or SFTP). `dist/.htaccess` is environment-specific and comes from
`deploy/htaccess-staging.conf` or `deploy/htaccess-production.conf` at build
time - do not hand-edit it on the server.

Then, on the server only:

1. Copy `lead-config.sample.php` to `lead-config.php` next to `lead.php` and
   fill in the real routing (on-call rota addresses - needed from Art).
   It is denied to web requests by .htaccess and is not in git.
2. Staging only: enable Basic Auth via Site Tools > Security > Protected URLs.

## SSL / DNS checklist (blocked on Art's domain decision)

- Scenario A (path on ferrysolicitors.com): no new DNS; the existing cert
  covers it. Confirm the path is excluded from any WordPress rewrite rules.
- Scenario B (standalone .ie): point A/AAAA at SiteGround, then Site Tools >
  Security > SSL Manager > Let's Encrypt, then enable HTTPS Enforce.
- Either way verify with: `curl -sI http://host/ | grep -i location` (301 to
  https), and check the cert CN is the real domain, NOT a SiteGround default.
  staging2 currently serves CN=example.com - that is the failure mode to avoid.
- Pick www vs bare host, enable the matching block in
  `htaccess-production.conf`, and pass the same host in `DOMAIN=`.

## Cache purge drill (do this on EVERY deploy)

Caching has masked correct fixes on this account before. After every upload:

1. Site Tools > Speed > Caching > Dynamic Cache > **Flush Cache**.
2. If the CDN is enabled: Site Tools > Speed > CDN > **Purge**.
3. Verify the deploy actually landed:
   `curl -s https://host/ | grep -o 'buildstamp-[0-9]*'` or spot-check the
   changed page in a private window.
4. Only then mark the deploy done.

## Post-launch (task #123yxuagbed)

1. Verify the property in Google Search Console and Bing Webmaster Tools.
2. Submit `https://host/sitemap.xml`.
3. Request indexing on the 9 core pages first.
4. If built on ferrysolicitors.com instead: fold the URLs into the existing
   sitemap index rather than running a second sitemap.
