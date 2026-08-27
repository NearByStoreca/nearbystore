# NearbyStore — marketing site

The public site for the consumer app. Plain HTML, CSS and a small amount of
JavaScript — **no build step, no framework, no external network requests**.
Every asset is local, so the site works fully offline and can be dropped onto
any static host as-is.

Live at <https://nearbystore.ca> (the `CNAME` file sets the custom domain),
served by GitHub Pages straight from `main` at the repo root. Previously lived
in `website/` inside
[localized-retail-platform](https://github.com/sandyisgreat/localized-retail-platform).

```
.
├── index.html            # landing page: hero, flow, features, next, contact, FAQ
├── privacy.html          # privacy policy (PIPEDA + BC PIPA)
├── terms.html            # terms of service (governed by BC law)
├── thanks.html           # contact-form landing page (noindex)
├── 404.html              # branded not-found page
├── blog/
│   ├── index.html        # post listing
│   └── what-your-receipt-knows.html
├── styles.css            # design tokens + every component
├── script.js             # mobile nav, scroll reveal, footer year, contact form
├── robots.txt            # allow-all + sitemap pointer
├── sitemap.xml           # all five pages
├── assets/
│   ├── logo.svg          # brand mark — shopfront under a striped awning,
│   │                     #   signed with the N of NearbyStore
│   ├── favicon.ico       # 16/32/48, rasterized from logo.svg
│   ├── favicon-32.png
│   ├── apple-touch-icon.png
│   ├── og-image.png      # 1200×630 social share card
│   ├── app-preview.svg   # product UI illustrations, drawn to match the app
│   ├── spend-tracker.svg
│   └── price-history.svg
├── CNAME                 # custom domain for GitHub Pages (nearbystore.ca)
├── .nojekyll             # serve files as-is, skip the Jekyll build
└── README.md
```

## Run it locally

Any static file server works. From this directory:

```bash
python -m http.server 4000 --bind 127.0.0.1
```

Then open <http://localhost:4000>. A server is required rather than opening
`index.html` over `file://`, because several links are root-relative (`/`,
`/blog/`).

## Contact form

The form in `#contact` posts to [FormSubmit](https://formsubmit.co), which
emails the submission to **srp2784@gmail.com** and then redirects the visitor to
`thanks.html` on our own domain.

- **The destination is the endpoint**: `action="https://formsubmit.co/srp2784@gmail.com"`.
  Where mail goes is visible in the markup and independently verifiable. To
  change the recipient, change that address — there is no key or dashboard in
  the loop.
- **One-time activation.** The first submission to a new address triggers an
  "Activate Form" email to that address. Until someone clicks that link,
  FormSubmit accepts submissions but does not deliver them. If mail stops
  arriving after changing the address, this is why.
- The `_next` hidden field controls where the visitor lands afterwards. It must
  be an **absolute URL**, so it points at production; a local submit will
  redirect to the live `nearbystore.ca/thanks.html`.
- `_honey` is a hidden honeypot, `_captcha=false` skips the interstitial
  captcha page, and `_template=table` formats the notification email.
- **It is a plain browser form POST, deliberately not a `fetch`.** These
  endpoints return no `Access-Control-Allow-Origin` header, so a browser cannot
  read the response — but the POST still arrives and the email still sends. An
  AJAX version would therefore show a false "that didn't send" and invite the
  visitor to submit a duplicate.
- `script.js` adds inline validation on top: it sets `novalidate` at runtime
  (so no-JS visitors keep native browser validation), blocks submission and
  shows field-level errors when something is missing, and otherwise gets out of
  the way and lets the browser post the form. It also resets the form on
  `pageshow`, so returning to the page — by Back button, link or reload — never
  shows a half-filled form restored from the bfcache.

The whole flow works with JavaScript disabled.

**Hiding the address:** FormSubmit issues a random alias endpoint
(`https://formsubmit.co/<random-string>`) that delivers to the same inbox. Swap
it into the `action` once you have it if you would rather the address not sit in
page source. Previously this form used Web3Forms; it was replaced because a
Web3Forms access key binds delivery to whichever address created the key, which
made the destination impossible to verify from the code.

## Content rules

Two rules keep the site honest, and both matter more than they look:

1. **Only shipped features go in `#features`.** Anything not yet built lives in
   the `#next` section, under the "Not built yet" tag. Never promote a roadmap
   item into the feature grid before it ships.
2. **No invented data.** No fabricated prices, no made-up store names next to
   figures, no usage statistics we cannot source. The site previously carried
   illustrative price comparisons under real retailer trademarks; that is a
   legal exposure, not a design flourish. Don't reintroduce it.

## Adding a blog post

1. Copy `blog/what-your-receipt-knows.html` to `blog/<your-slug>.html`.
2. Update the `<title>`, description, canonical, OG tags, the `BlogPosting`
   JSON-LD block at the bottom, and the dates.
3. Add a `.post-card` entry at the top of the `.post-list` in `blog/index.html`.
4. Add a `<url>` entry to `sitemap.xml`.

## Regenerating the icons and share card

`assets/favicon.ico`, `favicon-32.png`, `apple-touch-icon.png` and
`og-image.png` are rasterized from `logo.svg` by a small Pillow script. It is
not checked in — the outputs are. If the brand mark or the headline changes,
regenerate them rather than editing the PNGs by hand.

## Changing the look

All colours, spacing, radii and the section rhythm are CSS custom properties in
the `:root` block at the top of `styles.css`. `--section-y` drives the vertical
whitespace of every section at once.

The green is split deliberately, and the split is an accessibility constraint,
not a preference:

- `--brand` (`#16a34a`) is for **decorative fills only** — bars, dots, tick
  marks, borders. White text on it is only 3.3:1, which fails WCAG AA.
- `--brand-dark` (`#136c34`) is the **text- and button-safe** green: at least
  4.5:1 against every surface in the palette, and 6.5:1 for white text on it.
  Buttons, links, eyebrows and the CTA band all use this.
- `--brand-darker` (`#0f5626`) is the hover/pressed state.

The page ground (`--bg`) is a soft green-tinted neutral rather than pure white,
so cards (`--card`, still `#fff`) read as a lifted layer. If you change any of
these, re-check contrast: every text/background pair currently clears 4.5:1.

The site deliberately uses the **system font stack** — no webfont, no Google
Fonts — so it makes zero external requests. Keep it that way unless there's a
strong reason not to.

## Deploying

**GitHub Pages**: Settings → Pages → source *Deploy from a branch*, branch
`main`, folder `/ (root)`. Every push to `main` republishes; no build step and
no workflow file. `.nojekyll` stops Pages from running the content through
Jekyll first.

Because it's a folder of static files, other hosts work too:

- **Netlify / Vercel / Cloudflare Pages** — point at the repo root, no build
  command, publish directory `.`.
- **S3 + CloudFront** — sync the folder, set `index.html` as the index document
  and `404.html` as the error document.

Absolute URLs (`https://nearbystore.ca/...`) appear in the canonical tags, OG
tags, `sitemap.xml` and `robots.txt`. Update those if the domain ever changes.

## Accessibility notes

The site ships with a skip link, visible focus rings, semantic landmarks and
headings, `aria-expanded` wired to the mobile menu, an `aria-live` status region
on the contact form, and a `prefers-reduced-motion` block that disables scroll
animation and smooth scrolling. The scroll-reveal effect is scoped to `.js`, so
content is fully visible if the script never loads. Keep all of that in place
when editing.
