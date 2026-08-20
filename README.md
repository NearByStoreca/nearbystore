# Marketing site

A standalone static landing page for the consumer app. Plain HTML, CSS and a
small amount of JavaScript — **no build step, no framework, no external network
requests**. Every asset is local, so it works fully offline and can be dropped
onto any static host as-is.

Live at <https://nearbystore.ca> (the `CNAME` file sets that custom domain;
<https://nearbystoreca.github.io/nearbystore/> redirects to it), served by
GitHub Pages straight from `main` at the repo root. Previously lived in
`website/` inside
[localized-retail-platform](https://github.com/sandyisgreat/localized-retail-platform).

```
.
├── index.html          # all page content
├── styles.css          # design tokens + layout
├── script.js           # mobile nav, scroll reveal, footer year
├── assets/
│   ├── logo.svg        # brand mark / favicon — shopfront under a striped
│   │                   #   awning, signed with the N of NearBuyStore
│   ├── app-preview.svg # PLACEHOLDER phone screenshot
│   └── og-image.svg    # PLACEHOLDER social share image
├── CNAME               # custom domain for GitHub Pages (nearbystore.ca)
├── .nojekyll           # serve files as-is, skip the Jekyll build
└── README.md
```

## Run it locally

Any static file server works. From this directory:

```bash
python -m http.server 4000 --bind 127.0.0.1
```

Then open <http://localhost:4000>.

Opening `index.html` directly via `file://` also mostly works, but a server is
recommended so relative asset paths behave exactly as they will in production.

## What's a placeholder

Everything below is intentionally temporary — swap it out before launch.

| Placeholder | Where |
|---|---|
| App screenshot | `assets/app-preview.svg` |
| Social preview image | `assets/og-image.svg` |
| Store badge artwork | Generic buttons, **not** the official Apple/Google badges. Download the real ones from each vendor; both have branding rules you must follow. |
| Prices in the comparison cards | `index.html` — illustrative figures, labelled as such on the page |
| Items in the grocery-list concept | `index.html` — illustrative, labelled as such on the page |
| Company / legal / social links | Footer, currently `href="#"` |
| Contact email `hello@example.com` | Footer |

To rename the product, search `index.html` for `NearBuyStore` (it appears in the
title, meta tags, nav, and footer) plus the `aria-label` on the logo link, and
`og-image.svg`.

## What is not yet released

Neither mobile app has shipped. The hero "store badges" are deliberately inert
`<span>` elements styled with `.store-badge.is-soon` — dashed, dimmed and
labelled *Coming soon to…* — rather than `<a href="#">`, so nothing on the page
can be mistaken for a working download. When the apps go live, swap those spans
back to anchors, drop the `is-soon` class, and update the `#get` badge note, the
nav CTA, the CTA band and the first FAQ entry.

Unshipped **features** live only in the `#roadmap` section (cross-store price
comparison, and the grocery list), each inside a dashed `.roadmap-frame` with an
explicit "not a live feature" tag. Keep new roadmap items there rather than in
the `#features` grid.

## Changing the look

All colours, spacing and radii are CSS custom properties in the `:root` block at
the top of `styles.css`. Change `--brand` and the buttons, links, highlights,
step markers and CTA gradient all follow.

## Deploying

**GitHub Pages** is what's live today: Settings → Pages → source *Deploy from a
branch*, branch `main`, folder `/ (root)`. Every push to `main` republishes; no
build step and no workflow file involved. `.nojekyll` is what stops Pages from
running the content through Jekyll first.

Because it's just a folder of static files, other hosts work too:

- **Netlify / Vercel / Cloudflare Pages** — point at the repo root, no build
  command, publish directory `.`.
- **S3 + CloudFront** — sync the folder, set `index.html` as the index document.

Every path in `index.html` is relative, so the site is safe to serve from a
subpath (as Pages does here, under `/nearbystore/`) or from a domain root.
One exception if you care about social previews: `og:image` is relative, and
scrapers need an absolute URL — make it fully-qualified before launch.

Before going live, consider adding: a real favicon set (`.ico` / PNG sizes),
raster fallbacks of the OG image (some social scrapers won't render SVG — a
1200×630 PNG is the safe choice), analytics if wanted, and a `robots.txt` and
`sitemap.xml`.

## Accessibility notes

The page ships with a skip link, visible focus rings, semantic landmarks and
headings, `aria-expanded` wired to the mobile menu, and a
`prefers-reduced-motion` block that disables scroll animation and smooth
scrolling. Keep those in place when editing.
