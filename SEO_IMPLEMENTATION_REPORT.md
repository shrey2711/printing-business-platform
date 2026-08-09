# SEO Implementation Report — Apex Trade Show

Canonical site: **https://www.apextradeshow.com/** (WWW is canonical.)

## Product & indexing (done)
- Product pages render a real **Specifications** list (Size, Fabric, Frame, all option groups) — no empty `Materials:`/`Sizes:` labels, any pricing model.
- Commercial titles: `10x10 Custom Canopy Tent With Logo | Apex Trade Show` (prerender + SPA + meta description).
- Valid **Product + BreadcrumbList + FAQPage** JSON-LD per product; FAQPage guarded when no FAQs. Removed invalid `makesOffer` stubs from the homepage Store schema.
- Image SEO: descriptive ALT (`10x10 custom printed canopy tent with N printed walls`), `width/height`, `decoding=async`, WebP, lazy.
- Canonical/OG/sitemap/schema URLs all **www**; zero non-www absolute URLs in the build.

## Location pages
- **10 priority states** (CA, TX, FL, NY, AZ, NV, WA, IL, GA, NC) — unique factual content, indexed, in sitemap.
- **15 priority cities** (LA, San Diego, SF, Houston, Dallas, Austin, Miami, Orlando, NYC, Phoenix, Las Vegas, Seattle, Chicago, Atlanta, Charlotte) — unique content, indexed, in sitemap.
- All other states/provinces and non-priority cities: **noindex, follow** (templated) and excluded from the sitemap.

## Buying guides
Six commercial guides published at `/blog/*`: what-size, 10x10-vs-15-vs-20, wall-options, artwork-prep, buying-guide, cost. All accurate to the live catalog.

---

## LLMS / AI Discovery

- **llms.txt:** created/updated at **https://www.apextradeshow.com/llms.txt** — HTTP **200**, `Content-Type: text/plain; charset=utf-8`, no HTML wrapper, no JS, no auth.
- **Curated URLs:** **15** (not a sitemap dump) — 3 product pages + products listing, 6 buying guides, contact, quote, blog, locations, home.
- **Sections:** H1 + blockquote summary, Custom Canopy Tents, Customization and Artwork, Buying Guides, Company, Optional, "For AI assistants".
- **Broken links:** checked — all 15 return **200**.
- **Canonical hostname:** verified all links use **https://www.apextradeshow.com** (no non-www leak).
- **Content:** factual only — no "#1", "best", "fastest"; no invented specs, shipping/production times beyond the real 6-8 / 2-3 days, no warehouses/offices/ratings/certifications.
- **llms-full.txt:** **intentionally omitted.** The site's high-value content is small (3 products + 6 guides) and already fully covered by the concise llms.txt + sitemap + Product/FAQ schema. A consolidated llms-full.txt would duplicate content without material benefit. Revisit if the catalog/guide library grows substantially.

### robots.txt / AI-crawler review
Current policy (explicit): a default `User-agent: *` group plus an explicit group for AI crawlers, both `Allow: /` with `/account`, `/admin`, `/order` disallowed.

| Crawler | Status | Meaning |
|---|---|---|
| Googlebot | Allowed | Google Search indexing |
| Bingbot | Allowed | Bing / Copilot indexing |
| GPTBot | Allowed | OpenAI training/crawl |
| ChatGPT-User | Allowed | ChatGPT live browsing on user request |
| ClaudeBot | Allowed | Anthropic crawl |
| Claude-User | Allowed | Claude live browsing on user request |
| PerplexityBot | Allowed | Perplexity indexing |
| Applebot | Allowed | Apple / Siri |
| Google-Extended | Allowed | Use of content for Google AI/Gemini (not crawling) |

- **Permitted:** all of the above on public pages.
- **Blocked:** `/account`, `/admin`, `/order` for every crawler (private/transactional).
- **Recommendation:** current open policy is best for AI discoverability (the stated goal). If the business ever wants to opt out of AI *training* while keeping search/answer visibility, set `GPTBot` and `Google-Extended` groups to `Disallow: /` — that is a business decision, not made automatically.

---

## Entity consistency
Business name, description, canonical URL and contact are consistent across: homepage `<title>`/Store JSON-LD, `llms.txt`, product pages, OG metadata, and the mailer. A capable AI can answer "what is Apex Trade Show / what does it sell / does it print logos / what sizes / how to contact" from normal HTML, not only llms.txt.

## Remaining owner decisions / actions
1. **Bare-domain DNS:** `apextradeshow.com` (non-www) must 301 → www (Vercel + DNS). Only real technical gap.
2. **GSC:** re-submit/refresh the sitemap (it grew: priority states, cities, guides).
3. **AI training opt-out:** decide whether to keep Google-Extended/GPTBot allowed (currently allowed).
4. **Phone:** now `+1 672-514-7587`. **Email:** `info@apextradeshow.com`.
5. Optional: About/Shipping/Returns/Warranty pages don't exist — add later if you want them in llms.txt Company section.
