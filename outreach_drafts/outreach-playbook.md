# Apex Trade Show — Link-Building Playbook (v2, Oct 2026)

Results so far: ~200 cold emails → 6 positive replies (~3%), 3 paid-placement offers, 10 bounces, 0 live links.
This playbook fixes the three causes: deliverability, a weak offer, and no follow-ups.

---

## Phase 1 — Foundations (this week)

### 1A. Email deliverability (DNS check + live mail-tester.com test, 12 Oct 2026)

**mail-tester.com score: 10/10.** SPF pass, DKIM pass (selector `privateemail`, d=apextradeshow.com), DMARC pass, not blocklisted. Authentication is set up correctly.

So the Microsoft 365 "550 5.4.1 access denied" rejections are a **reputation and volume** problem, not a DNS problem: a young domain on a shared sending IP (jellyfish.systems) sending ~100 similar emails a day. The fix is lower volume, more personal emails, and a better From name.

| Check | Current | Status | Action |
|---|---|---|---|
| SPF | `v=spf1 include:spf.privateemail.com ~all` | Pass | If Brevo campaigns use your domain as Return-Path, add `include:spf.brevo.com`. Otherwise leave as is. |
| DKIM (Private Email) | selector `privateemail` | Pass | Nothing. |
| DKIM (Brevo) | `brevo1/brevo2._domainkey` CNAMEs | Present | Nothing. |
| DMARC | `v=DMARC1; p=none; rua=mailto:rua@dmarc.brevo.com` | Valid, monitoring only | Safe to tighten now that alignment passes: `v=DMARC1; p=quarantine; pct=25; rua=mailto:rua@dmarc.brevo.com; adkim=r; aspf=r`. Raise `pct` to 100 after 2 clean weeks of reports. |
| Message format | Composer had **bold** switched on, so the whole test body was bold HTML | Fix | Turn bold off in the composer before sending. Plain-looking text reads as personal email. |
| MX | privateemail (10) + Cloudflare routes (20/36/46) | Mixed | If Cloudflare Email Routing isn't used, delete the three `route*.mx.cloudflare.net` MX records. |
| Footer | "Sent securely from Private Email" | **Fixed 12 Oct** | Replaced by signature: *Manish Bhatia / Apex Trade Show \| apextradeshow.com / +1 672-514-7587*. |
| Display name | `marketing` | Weak | Change to **Manish Bhatia** (Settings → Profile → Display name). Recipients see "marketing" today. |

Sending rules from now on:
- Max **25 new cold emails/day**, ramping +5/day per week, follow-ups on top.
- Every email is personalised in the first line (a fact from their page). No identical bodies.
- Plain text, at most one link (only the resource page), no attachments on first touch.
- Run a mail-tester.com test after DNS changes; target ≥ 9/10 before resuming volume.
- Optional, recommended: a separate cold-outreach domain (e.g. `apextradeshowhq.com`) with its own mailbox, warmed for 2–3 weeks, so the main domain's reputation is protected.

### 1B. Fix the offer: give them something worth linking to

**Why the old pitch failed:** "Please list us as a supplier" only helps us. Organizers, associations and editors link to **useful, neutral resources**, not vendors. Our only good hook (the tent-weights guide) lived inside emails, with nothing on the site to link to.

**Build these on apextradeshow.com (repo: new route `/resources/tent-weight-rules`, linked from /resources):**

1. **"Canopy Tent Rules for Vendors: 2026 Guide"** (the linkable asset)
   - Original data: rules from the ~100 event, market, festival and art-fair vendor pages we already read (weights per leg, stake bans, fire-retardant rules, white-top rules, wall rules), each **cited and linked to the source event**.
   - Summary table by event type: farmers markets (24–25 lb typical minimum), craft shows (~40 lb), large art fairs (45–60 lb or 100 lb per 10x10), food vendors (NFPA 701 tops).
   - Vendor-neutral. Product mentions only in a small footer box.
2. **Printable one-page vendor checklist** (PDF) that market managers can hand to vendors.
3. **Tent weight calculator** (size + walls + expected wind → suggested weight per leg, with a "check your event's rule" note).
4. **Embed/share snippet**: a short "Tent weight rules for vendors" box with a link, so associations can paste it into vendor packets.

This gives every pitch a reason to link: *"your event is cited"* or *"here's a free resource for your vendors"*.

### 1C. The new pitch: principles

- **Lead with them, not us.** First line = something specific from their page.
- **One clear, low-effort ask** ("would you consider linking it from your vendor info page?").
- **Give before asking** (they're cited, or they get a free checklist PDF).
- **Short:** 70–110 words, 3 short paragraphs.
- **Subject lines that sound like a person:** "Quick question about your vendor rules", "{Event} is cited in our tent guide".
- No product list in the first email. Apex appears in the signature only.

### 1D. Templates

**T1 — "You're cited" (events, markets, festivals in the guide)**
> Subject: {Event} is cited in our vendor tent guide
>
> Hi {Name},
>
> We just published a free guide to canopy rules at markets and craft shows, and {Event}'s requirement of {rule, e.g. 40 lb per leg, no stakes on pavement} is one of the cited examples (with a link back to your vendor page).
>
> If it's useful for your vendors, you're welcome to link to it from your vendor info page: {URL}. And if we got any detail wrong, tell me and I'll fix it.
>
> Thanks for the clear rules, they helped.

**T2 — Free resource (associations, market networks, craft guilds)**
> Subject: Free vendor tent checklist for {Org} members
>
> Hi {Name},
>
> {Org} supports a lot of market vendors, and windy-day tent problems seem to come up every season. We put together a free, vendor-neutral guide and a one-page printable checklist (weights per leg, stake rules, wind plan): {URL}.
>
> Feel free to share it, put it in a vendor packet, or link it from your resources page. Happy to tailor a version for {Org} if that helps.

**T3 — Editorial / guest post (publications with write-for-us programs)**
> Subject: Pitch: what event organizers actually require of vendor tents
>
> Hi {Name},
>
> I read {specific recent article}. A data-driven piece your readers might find useful: we reviewed {N} published vendor rule sets and found {one concrete finding, e.g. "over half ban stakes on pavement, and art fairs ask for up to 60 lb per leg"}.
>
> I can write a ~800-word, non-promotional piece around that data for {Publication}, following your guidelines. Would that be of interest?

**T4 — Warm-lead re-pitch (people who already replied)**
> Subject: The tent guide is now live
>
> Hi {Name}, thanks again for {what they did}. The guide we discussed is now a page you can link to directly: {URL}. It includes a printable checklist for vendors. If it's helpful, a link from {their resources page} would let your vendors find it all year.

**T5 — Customer link ask (past customers)**
> Subject: Your new tent looked great at {event}
>
> Hi {Name}, thanks again for ordering with us. If you have a "partners" or "about" page, would you be open to crediting Apex Trade Show for your tent ({URL})? We'd be happy to feature your booth photo in our customer gallery with a link back to you.

### 1E. Follow-up sequence (tracked in the Responses tab)

| Step | When | What |
|---|---|---|
| Email 1 | Day 0 | T1–T5 |
| Follow-up 1 | Day 4 (business days) | Reply in the same thread. One sentence plus one new piece of value. |
| Follow-up 2 | Day 10 | Short "closing the loop" message. |
| Stop | After FU2 | Mark "No response". Never more than 2 follow-ups. |

Rules: always reply in the original thread, stop immediately on any reply (including auto-replies with a new contact, so switch to that contact), and never follow up on bounces.

**FU1 template**
> Hi {Name}, just floating this back up in case it got buried. We've since added {printable checklist / a section on {their category}}. Would it be useful for your vendors? {URL}

**FU2 template**
> Hi {Name}, I'll close the loop here so I don't clutter your inbox. If the tent guide is ever useful for your vendors, it's free to link or share: {URL}. Thanks for your time.

**Follow-ups owed on the ~170 existing sends:** send FU1 only to the **warm or high-value** segment (associations, editors, guilds, about 60), after the guide page is live, using T4-style wording with the URL. Skip one-off event organizers that already went quiet.

---

## Phase 2 — Execution plan (weeks 1–4)

| Week | Task | Owner | Deliverable / target |
|---|---|---|---|
| 1 | Set display name to "Manish Bhatia"; optional DMARC → p=quarantine pct=25 (mail-tester already 10/10) | You | Done |
| 1 | Build `/resources/tent-weight-rules` page + data file of cited rules + checklist PDF + calculator | Claude (repo) → you approve → deploy | Live URL |
| 1 | Self-serve listings: Google Business Profile, Bing Places, Exhibit City News directory (free), EventPlanning.com, TheCraftMap supplier directory, Yelp, BBB (free profile), industry directories | Claude fills, you approve any account creation and verification | 8–10 live profile links |
| 2 | "You're cited" outreach (T1) to the ~100 cited events (25/day) | Claude | Target 8–15% reply, 5–10 links |
| 2 | Warm-lead re-pitch (T4): Farmers Market Coalition, Arkansas Craft Guild, Wedding Planner Magazine, BCAFM, MIFMA etc. | Claude | 3–5 links |
| 2 | Customer link asks (T5) | You share list → Claude drafts | 5+ links |
| 2–4 | Journalist queries (Phase 3), daily | Claude drafts → you approve | 1–3 media mentions/month |
| 3 | Association outreach (T2) with checklist PDF to ~60 state/provincial bodies (re-pitch existing threads) | Claude | 5+ resource-page links |
| 3 | Editorial pitches (T3) with the data angle to trade press (TSNN, Exhibitor, Event Marketer, InTents, Sunshine Artist, PRINTING United) | Claude | 1–2 accepted pieces |
| 3–4 | Follow-ups FU1/FU2 on all week-2/3 sends | Claude | Done |
| 4 | Optional: 2–3 small local sponsorships ($100–300 or a donated tent) at markets/races that list sponsors | You (budget) | 2–3 sponsor links |
| Weekly | Review: replies, links won, bounces; cut channels below 3% reply | Claude → summary to you | Weekly report |

**KPIs for month 1:** 20+ new referring domains (directories + customers + citations), 10%+ reply rate on T1/T2, 0 hard bounces from bad addresses (verify before sending).

**Decisions needed from you:**
1. Change the display name to "Manish Bhatia", and optionally tighten DMARC (exact record above). DKIM/SPF already pass.
2. OK to build and deploy the guide page.
3. OK to create the free directory profiles (some need phone or postcard verification by you).
4. Customer list for T5.
5. Sponsorship budget (optional). Recommendation: skip paid guest posts (HikeSphere $10, Event Study $30, Love & Lavender $190–220).

---

## Phase 3 — Journalist queries (approved)

Sources: SourceBottle request emails (already arriving in the inbox) and Connectively (account exists under marketing@).

Workflow:
1. Daily, Claude scans new requests and keeps only relevant ones (events, trade shows, small business marketing, printing, retail pop-ups, outdoor markets, branding).
2. Claude drafts a reply: 3–5 sentences answering exactly what was asked, one concrete tip or figure, credentials line ("Manish Bhatia, Apex Trade Show, a custom canopy and trade show display maker shipping across the US and Canada"), website link.
3. Drafts go to you for approval in chat. Nothing is submitted without a yes.
4. Approved answers are submitted before the deadline. Wins are logged in the Responses tab.
