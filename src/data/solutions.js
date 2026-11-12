// Segment guides for /solutions/:slug. Shared by SolutionPage.jsx and
// scripts/prerender.mjs. Facts in here are limited to product data, the size
// guides in canopy.js, published policy pages, and the tent-weight guide.
// Do not add certifications, pound ratings, wind speeds, or customer stories
// that those sources do not state.

// Inline links are [[/path|visible label]] so the React page and the
// prerendered HTML cannot drift. Labels stay short on purpose: a repeated
// five-word anchor would show up as shared text on every page that uses it.
export function splitRich(text) {
  const out = [];
  const re = /\[\[([^\]|]+)\|([^\]]+)\]\]/g;
  const s = String(text);
  let last = 0;
  let m;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push({ text: s.slice(last, m.index) });
    out.push({ to: m[1], label: m[2] });
    last = m.index + m[0].length;
  }
  if (last < s.length) out.push({ text: s.slice(last) });
  return out;
}

export const SOLUTIONS = [
  {
    slug: 'vendor-market-tents',
    title: 'Vendor & Market Tents',
    blurb: 'Weekend markets and craft fairs where the booth is the whole storefront.',
    guide: {
      metaDescription:
        'Custom printed vendor and market canopy tents — printed valance for your name, walls for weather and product display, quick setup for weekend markets.',
      eyebrow: 'Farmers markets and craft fairs',
      intro:
        'At a farmers market or craft fair your tent is your storefront. It has to read as your brand from across the lot, set up fast on a Saturday morning, and give you a clean surface to display product. A printed valance carrying your business name does more for walk-up traffic than any table sign.',
      primaryCta: { to: '/products/canopy-tent-10x10', label: 'Price a market 10×10' },
      photo: {
        src: '/images/tents/10x10-f1h1.webp',
        alt: 'Market layout preview: one full back wall plus one half side on a 10×10'
      },
      focusHeading: 'What a market stall actually needs',
      focus: [
        'Printed valance with your business name so shoppers spot you down the row.',
        'A back wall and one side wall to hang product, block wind and create a backdrop.',
        'Fast one- or two-person setup and teardown for weekly market days.',
        'A footprint that fits the 10×10 space most markets rent by the stall.'
      ],
      sections: [
        {
          h2: 'Which footprint fits a stall',
          paragraphs: [
            'Most organizers rent space by the stall, and that stall is the footprint the [[/sizes/10x10|10×10 size guide]] describes: 100 square feet, 2–3 staff, one 6 ft table across the front or two 6 ft tables in an L. Price the [[/products/canopy-tent-10x10|10×10 canopy]] first. Its complete set is $835 and includes the printed top, the aluminum frame and a carry bag. The printed top alone is $510, for a frame you already own and that the product page calls compatible. One printed wall on this size is $275. At three or more tents the set price on the rate card falls to $799 each.',
            'When you have already paid for a wider front, or two tables and a browser will not fit in 100 square feet, move to the [[/sizes/10x15|10×15 size guide]] and the [[/products/canopy-tent-10x15|10×15 canopy]]. That frame is 150 square feet, and the extra five feet are width. Its complete set is $1,375, the top alone is $545, and each wall is $365. A 200 square foot [[/products/canopy-tent-10x20|10×20 canopy]] ($1,635 for the set) belongs only at a market that has actually assigned you a double pitch. The [[/blog/10x10-vs-10x15-vs-10x20-custom-canopy-tents|size comparison]] lines the three footprints up together, including the 3+ column.'
          ]
        },
        {
          h2: 'Walls, the valance, and the table underneath',
          paragraphs: [
            'The photo on this page is the stall layout: a full back wall to pin goods on, one half-height side wall as a wind break, and the front left open. The [[/blog/custom-canopy-tent-wall-options-explained|wall options guide]] is the rule — any mix, three walls maximum, full and half the same price on a given size. Put the business name on the valance. The [[/blog/print-coverage-explained|print coverage guide]] treats the roof, the skirt and each wall as separate surfaces, so you can print the name without paying for every panel.',
            'Under the roof, a [[/products/pleated-table-covers|pleated table cover]] hides bins. It is a closed-back throw in 4, 6 or 8 ft, at $199, $215 and $255, dye-sublimated on polyester the product page describes as machine washable. A [[/products/stretch-table-covers|stretch table cover]] is the taut fit instead of a drape: 6 ft at $285 or 8 ft at $345, also closed-back. [[/blog/pleated-vs-stretch-table-cover|Pleated versus stretch]] is the comparison, and [[/blog/6ft-vs-8ft-table-cover|table length]] is worth reading before you guess which table the market will hand you. A logo strip down the middle, rather than a full throw, is the [[/products/custom-table-runner|table runner]]: quoted, 72 inches on a 6 ft table or 96 inches on an 8 ft table. No price is published for it.'
          ]
        },
        {
          h2: 'Being seen from the end of the row',
          paragraphs: [
            'A flag stands beside the stall, not under the roof. Feather shapes run 9, 10.5 and 14 ft. The [[/products/teardrop-flag|teardrop flag]] is the shorter profile — 7, 9 and 11.2 ft — and its page describes that shape as the one that holds an outline in wind. Graphic-only flags start at $140; the pole-and-base package is a separate column. With hardware, the spike is included, a cross base adds $31, a metal plate adds $35, and a water bag adds $20. A spike does not go into pavement, which is what a lot of downtown markets are. Use a weighted base there. Silhouettes are compared in the [[/blog/feather-angled-vs-convex-vs-teardrop-flags|flag shape guide]].'
          ]
        },
        {
          h2: 'Weights, the proof, and the Saturday clock',
          paragraphs: [
            'How many pounds go on each leg is the market’s rule, not a number we print. Several of those rules also ban stakes on pavement. The [[/resources/tent-weight-rules|tent weight guide]] is the collection of what organizers actually published. On the canopy configurator, a sandbag set of four — one per leg — is $50. That add-on does not publish a pound rating, so do not assume the bag meets a “40 lb” line in a vendor packet.',
            'Standard production for this canopy is 6–8 business days after you approve the proof in writing, and the 2–3 business day rush adds 50 percent. Transit and the shipping charge are extra. There is no free-freight offer. [[/shipping|How shipping is calculated]] separates the two clocks, and the [[/free-artwork-proof|free proof steps]] are what start the production clock — nothing prints before that written approval. If the file is not ready, design help is a flat $35. File prep sits in the [[/blog/how-to-prepare-artwork-for-a-custom-canopy-tent|artwork prep guide]] and the [[/artwork-guidelines|artwork guidelines]].'
          ]
        }
      ],
      faqHeading: 'Market tent questions',
      faqs: [
        {
          q: 'Is a 10×10 the right tent for a single market stall?',
          a: 'For one stall, yes. The 10×10 size guide calls 100 square feet the space most markets assign, with 2–3 staff and either one 6 ft table or an L of two. Price the 10×10 canopy, and only move to the 10×15 when you have paid for a wider front or you are already crowding that table layout.'
        },
        {
          q: 'Can I reorder just the printed top for the frame I already take to the market?',
          a: 'Yes. On the canopy page choose Printed Canopy Top Only. For the 10×10 that column is $510 and does not include a frame or a carry bag. Use the product page to confirm your current frame is one the top is meant to fit.'
        },
        {
          q: 'Do the sandbags meet my market’s weight rule?',
          a: 'We cannot say. The configurator sells a set of four sandbags for $50, one per leg, and does not state a weight in pounds. Read your market’s packet, and use the tent weight guide to see how other events write the same kind of rule. Do not plan on stakes where the packet forbids them — they are not in the canopy kit anyway.'
        },
        {
          q: 'The top got damp on the way home. Can I bag it?',
          a: 'Not while it is damp. The setup and care guide says to let a canopy top dry fully before it goes in the bag, because packing moisture in is how mildew starts, and to wipe the top with a damp cloth rather than a pressure washer. Machine washing is described for the table covers, not for the canopy top.'
        }
      ],
      relatedHeading: 'When the event is not a market row',
      relatedLead:
        'The same three sizes are configured differently for other jobs. Expo pavement is covered under [[/solutions/trade-show-tents|Trade Show Tents]], a bench and a parking row under [[/solutions/sports-team-tents|Sports & Tailgate Tents]], a service window under [[/solutions/food-truck-tents|Food Truck & Concession Tents]], a campus welcome table under [[/solutions/church-school-tents|Church & School Tents]], and a crew area under [[/solutions/job-site-tents|Job Site & Safety Tents]]. Pick the guide that matches the event you are actually running.'
    }
  },
  {
    slug: 'trade-show-tents',
    title: 'Trade Show Tents',
    blurb: 'Outdoor expo space that has to match your indoor booth branding.',
    guide: {
      metaDescription:
        'Custom printed trade show canopy tents — full-color branding to match your indoor booth, printed back walls, and 10×20 double-booth options.',
      eyebrow: 'Outdoor exhibitor space',
      intro:
        'Outdoor expo space has to look as considered as your indoor booth. A printed canopy top, valance and back wall turn open pavement into a branded booth that photographs well and holds its own next to other exhibitors. Color consistency with your indoor graphics matters — dye-sublimation prints hold brand colors cleanly.',
      primaryCta: { to: '/products/canopy-tent-10x20', label: 'Price a double-booth 10×20' },
      photo: {
        src: '/images/tents/10x20-back.webp',
        alt: 'Exhibitor layout preview: a single full rear wall on a 10×20'
      },
      focusHeading: 'What an outdoor exhibitor booth has to do',
      focus: [
        'Full-color top, valance and back wall for a finished exhibitor backdrop.',
        'Brand colors that match your indoor booth and printed collateral.',
        'A 10×20 to fill a double-booth allocation, or a 10×10 for a single space.',
        'A professional, weather-ready setup for multi-day outdoor shows.'
      ],
      sections: [
        {
          h2: 'Match the frame to the space on the contract',
          paragraphs: [
            'A single outdoor space lines up with the [[/sizes/10x10|10×10 size guide]]: 100 square feet, the pitch most expos sell as one booth. Configure the [[/products/canopy-tent-10x10|10×10 canopy]] when that is the square on your floor plan. When the contract is two adjacent spaces in one line, the frame is the [[/products/canopy-tent-10x20|10×20 canopy]] at 200 square feet. The [[/sizes/10x20|10×20 size guide]] is explicit that those two spaces need to sit in a single 20 ft run, not back to back. The in-between footprint is the [[/products/canopy-tent-10x15|10×15 canopy]] at 150 square feet, for a booth-and-a-half where a demo sits beside the product instead of behind it.',
            'Complete-set prices on those three pages are $835, $1,375 and $1,635. Tops alone — no frame, no carry bag — are $510, $545 and $915. Printed walls are $275 apiece on the smallest frame and $365 apiece on the two larger ones. Ordering three or more sets uses the lower column: $799, $1,250 and $1,445. The [[/blog/trade-show-display-cost|display cost guide]] is the wider price picture if the booth is more than a canopy.'
          ]
        },
        {
          h2: 'The back wall is the photograph',
          paragraphs: [
            'Print one full-height wall across the back. That is the surface behind people in booth photos. Half-height walls at the sides frame the opening without sealing the aisle. Both heights cost the same per wall, and the cap is three walls in total. The [[/blog/custom-canopy-tent-wall-options-explained|full-versus-half explanation]] lists the combinations. A [[/products/stretch-table-covers|stretch table cover]] gives the counter a fitted face: 6 ft at $285 or 8 ft at $345, closed back, on the stretch polyester that page calls machine washable. Confirm the show table before you print — [[/blog/6ft-vs-8ft-table-cover|6 ft or 8 ft]] is the usual fork.',
            'A [[/products/standard-retractable-banner|standard retractable banner]] is a separate graphic for the aisle or the indoor hall: 33 by 81 inches at $145, or 47 by 81 inches at $299, with a replaceable print. Those graphics are 81 inches tall. The 10×10 size guide publishes roughly 6.5 to 7 ft of clearance under the valance, so compare the two numbers before you plan to stand that banner inside a 10×10. A [[/products/step-and-repeat-backdrop|step and repeat backdrop]] is its own photo wall — 120 by 96 inches on an adjustable frame — and 96 inches is taller than that published 10×10 clearance, so treat it as a station beside the canopy, not under it. Layout notes live in the [[/blog/trade-show-booth-design-guide|booth design guide]] and the [[/blog/trade-show-booth-checklist|booth checklist]].'
          ]
        },
        {
          h2: 'Color, the calendar, and what the warranty will not cover',
          paragraphs: [
            'Dye-sublimation on these canopies bonds the ink into a 600D polyester top, which is why a roof printed with your logo stays closer to the rest of the booth than a surface print would. It is not a promise that the fabric will match a vinyl banner exactly. The artwork guide notes that fabric and vinyl reproduce color differently, and the warranty excludes fading from long sun exposure. Judge the logo on the proof, not on a screen.',
            'Production starts when that proof is approved in writing: six to eight business days, or two to three business days if you take rush, which multiplies the order by 1.5. Courier time is additional, and the freight charge depends on the destination. [[/shipping|Shipping]] states both parts and does not describe freight as free. [[/returns|Returns]] states that custom orders are not refunded, that a transit-damage reship needs notice within 3 days, and that a print-defect reprint lasts 1 year. Frame defects are covered for 5 years and other parts for 1 year; wind and storm damage are excluded. Read the [[/warranty|warranty page]] before a multi-day outdoor show. A four-piece sandbag add-on is $50 and does not state a pound weight, so check the organizer — the [[/resources/tent-weight-rules|weight-rules roundup]] is how public events tend to write that line.'
          ]
        }
      ],
      faqHeading: 'Outdoor booth questions',
      faqs: [
        {
          q: 'Do I need a 10×20 if the show sold me two booths?',
          a: 'Only if the two spaces are adjacent and in one line. The 10×20 size guide says the frame needs a single 20 ft run, which is the footprint of two standard pitches. If the spaces are back to back, or you were sold one pitch, the 10×20 will not sit in the allocation. Confirm the map before you order the frame.'
        },
        {
          q: 'Will the canopy print match my indoor booth graphics?',
          a: 'The canopy top is dye-sublimated into 600D polyester, so the ink is in the fabric rather than sitting on it, and a repeat of your logo holds more consistently than a surface print. Fabric and vinyl still reproduce color differently. Flag any critical brand color in the order notes and check it on the proof. The warranty does not cover fading from long sun exposure.'
        },
        {
          q: 'Can I put a step and repeat under the canopy for photos?',
          a: 'Not under a 10×10, based on the sizes we publish. The step and repeat graphic is 120 by 96 inches. The 10×10 size guide lists roughly 6.5 to 7 ft of clearance under the valance, and 96 inches is taller than that. Use the backdrop as its own station. An 81 inch retractable banner is a closer call against that same clearance — measure, do not assume.'
        },
        {
          q: 'What happens if the outdoor show date moves inside the production window?',
          a: 'Rush shortens production to two or three business days and multiplies the order by 1.5. It does not shorten courier transit, and shipping is still charged. Once you approve the proof, returns says the order cannot be canceled and is not refundable, because production has started on a made-to-order item.'
        }
      ],
      relatedHeading: 'If this pavilion is not an expo booth',
      relatedLead:
        'A weekly stall is a different brief: [[/solutions/vendor-market-tents|Vendor & Market Tents]]. Sideline shade lives on [[/solutions/sports-team-tents|Sports & Tailgate Tents]]. A queue at a service window is written up at [[/solutions/food-truck-tents|Food Truck & Concession Tents]]. Registration on a campus lawn is handled at [[/solutions/church-school-tents|Church & School Tents]]. Marking a crew on a job is handled at [[/solutions/job-site-tents|Job Site & Safety Tents]]. Start there when the floor plan is not an expo booth.'
    }
  },
  {
    slug: 'sports-team-tents',
    title: 'Sports & Tailgate Tents',
    blurb: 'Team colors, shade for the bench, and something findable in a crowded lot.',
    guide: {
      metaDescription:
        'Custom printed sports and tailgate canopy tents — team colors and logo, sideline shade, crowd visibility, and a portable frame for weekly games.',
      eyebrow: 'Sidelines and tailgate lots',
      intro:
        'Team tents pull double duty: shade for the bench and gear on the sideline, and a landmark supporters can find in a packed tailgate lot. Printed in your team colors with the logo up top, it marks your spot from a distance and travels game to game without fuss.',
      primaryCta: { to: '/products/canopy-tent-10x10', label: 'See sideline pricing' },
      photo: {
        src: '/images/tents/10x10-none.webp',
        alt: 'Open sideline roof with no side panels, shown on a 10×10'
      },
      focusHeading: 'What a team tent is there for',
      focus: [
        'Colors and the mark high on the roof so the group is findable from the parking row.',
        'Shade over the bench, gear and water on hot game days.',
        'A frame that packs into the included carry bag between games.',
        'Weight on the legs so an open field does not take it.'
      ],
      sections: [
        {
          h2: 'A bench, a squad, or a hospitality spot',
          paragraphs: [
            'One bench and a pile of gear fit the 100 square foot frame. The [[/sizes/10x10|10×10 size guide]] is the capacity note — 2–3 staff, a single 6 ft table — and the [[/products/canopy-tent-10x10|10×10 canopy]] is the product when the sideline slot is a single pitch. Its listed complete-set figure is $835 before any wall. A larger squad, a spectator pocket or a hospitality table is the 150 square foot [[/products/canopy-tent-10x15|10×15 canopy]] or the 200 square foot [[/products/canopy-tent-10x20|10×20 canopy]]. The [[/sizes/10x20|10×20 size guide]] describes that footprint as room for 4–6 staff and three to four 6 ft tables, which is a team area rather than a sales counter.',
            'Leave the sides open. That is the usual sideline layout, and it is the preview on this page. Add one full back wall in team colors if you want a backdrop for photos, or a half wall to cut low sun. The wall cap and the price per wall live on the canopy page you open and in the [[/blog/custom-canopy-tent-wall-options-explained|wall choices guide]]. A full kit includes the printed top, an aluminum hex frame with telescopic legs, and a carry bag. If the club already owns a compatible frame, the top-only column is the cheaper one — $510 on the 10×10.'
          ]
        },
        {
          h2: 'A mark parents can see over the roofs',
          paragraphs: [
            'The canopy roof carries the logo at tent height. A flag carries it higher, and it has to stand outside the footprint, not underneath. An [[/products/feather-angled-flag|angled feather flag]] is the tall shape at 9, 10.5 or 14 ft, and its page says the forward top edge is what stays readable when the air is still. A [[/products/teardrop-flag|teardrop flag]] stays shorter — 7, 9 or 11.2 ft — and that page recommends the wrapped profile for an exposed field. Hardware includes a spike, which is the right base for grass. A parking lot is not grass: the cross base and the metal plate are the hard-surface choices on that page, listed at $31 and $35 over the spike, with water ballast at $20. Graphic-only flags, if the club already has a pole, start at $140. Shape notes are in the [[/blog/feather-angled-vs-convex-vs-teardrop-flags|flag shape guide]].'
          ]
        },
        {
          h2: 'Wind on an open field',
          paragraphs: [
            'An open pitch is where an unweighted frame tips. Add the four-bag weight option, priced at $50 on the canopy page, and still read the league’s own sheet. Our bags do not carry a published pound weight. The [[/resources/tent-weight-rules|published weight rules]] are drawn from markets and festivals, so use them as a picture of how organizers write the rule, not as your league’s number. Stakes are not in the canopy kit. Whether a field allows them is the venue’s call.',
            'The [[/warranty|limited warranty]] covers defects: five years on frames, one year on everything else. It does not cover wind, storms, or fading from long exposure to sunlight, and it tells you to weight, stake or take the canopy down in strong wind. Packing and drying sit in the [[/blog/trade-show-display-setup-and-care-guide|display care guide]]: the top has to be dry before it goes back in the carry bag. Production time is printed on the product page you configure. It is not transit, and freight is calculated at checkout rather than waived — [[/shipping|shipping]] is the page that separates those clocks. There is no refund after you approve a proof; [[/returns|returns]] is where that is stated.'
          ]
        }
      ],
      faqHeading: 'Sideline and tailgate questions',
      faqs: [
        {
          q: 'Should a team tent have walls?',
          a: 'Usually no. An open roof keeps airflow on a hot sideline and lets players move through. Add a single full back wall if you want team colors behind photos, or a half wall against low sun. You can still order up to three printed walls, full or half, but a closed box fights the way a bench is used.'
        },
        {
          q: 'Which flag belongs next to the tent, not under it?',
          a: 'Either shape stands outside the footprint. Pick the angled feather, up to 14 ft, when you need height in a still parking lot. Pick the teardrop, up to 11.2 ft, when the field is exposed and you want the graphic to hold its outline. Use the included spike on grass. On pavement, add the cross base or the metal plate from the flag page.'
        },
        {
          q: 'Does the warranty cover a tent that blows over at a tournament?',
          a: 'No. Wind, storm and weather damage are excluded. The warranty covers defects in materials and workmanship — five years on the frame, one year on the rest — and it says to weight the legs or take the canopy down in strong wind. A sandbag set is $50 for four and does not list a pound rating, so follow the venue’s number.'
        },
        {
          q: 'Can parents who already own a frame order only the printed team top?',
          a: 'Yes. Printed Canopy Top Only is a separate column on each size. On the 10×10 it is $510 and includes the graphic without the aluminum frame or the carry bag. Check the product page before you assume an older frame is the compatible one that column is cut for.'
        }
      ],
      relatedHeading: 'If it is not a sideline',
      relatedLead:
        'Selling from the tent, rather than shading a bench, is the subject of [[/solutions/vendor-market-tents|Vendor & Market Tents]]. An exhibitor pavilion is covered by [[/solutions/trade-show-tents|Trade Show Tents]]. Handing food across a counter is covered by [[/solutions/food-truck-tents|Food Truck & Concession Tents]]. A school field day shares some of the shade problem; see [[/solutions/church-school-tents|Church & School Tents]]. A work crew belongs on [[/solutions/job-site-tents|Job Site & Safety Tents]].'
    }
  },
  {
    slug: 'food-truck-tents',
    title: 'Food Truck & Concession Tents',
    blurb: 'Menu on the valance, shade over the queue.',
    guide: {
      metaDescription:
        'Custom printed food and concession canopy tents — menu and pricing on the printed valance, shade over the queue, and an open layout for a service window.',
      eyebrow: 'Concession lines and service windows',
      intro:
        'For food and concession, the tent works your line for you. Print your menu and pricing on the valance so the queue reads it while they wait, keep customers and staff out of the sun, and leave the front open as a service window. It also sets up and breaks down fast between events.',
      primaryCta: { to: '/products/canopy-tent-10x15', label: 'Price a 10×15 service tent' },
      photo: {
        src: '/images/tents/10x15-back.webp',
        alt: 'Service-window layout: rear wall only on a 10×15, front left open'
      },
      focusHeading: 'What a service tent has to handle',
      focus: [
        'Menu and pricing printed on the valance, visible to the whole queue.',
        'Shade over the service window, prep space and any seating.',
        'An open front for service, with a back wall to hide prep and stock.',
        'Wipeable printed fabric and a quick setup between events.'
      ],
      sections: [
        {
          h2: 'A window, a prep line, or shade over the queue',
          paragraphs: [
            'A single window and one work table is a 100 square foot problem. Use the [[/sizes/10x10|10×10 size guide]] and the [[/products/canopy-tent-10x10|10×10 canopy]] for that. The moment you need prep beside the window, a second server, or shade over people waiting, look at 150 square feet on the [[/products/canopy-tent-10x15|10×15 canopy]] or 200 square feet on the [[/products/canopy-tent-10x20|10×20 canopy]]. The 10×15 size guide already names food and concession service with a queue under cover as one of its uses. The 10×20 is a double pitch — buy that space from the organizer before you buy the frame.',
            'Keep the public side open. Put one full wall behind the line so stock is out of the photo. That is the preview on this page. A half wall blocks a server’s reach, so add one only where you are not handing trays across it. How many walls you may combine — three total, full or half, same price either way — is on the canopy page and in the [[/blog/custom-canopy-tent-wall-options-explained|wall options write-up]]. Dollar amounts differ by size: $275 a wall on the 10×10, $365 a wall on the 10×15 and the 10×20.'
          ]
        },
        {
          h2: 'Where the menu goes, and where it should not',
          paragraphs: [
            'Guests read the valance while they wait, so item names and prices belong on that skirt, with the roof carrying the brand. The [[/blog/print-coverage-explained|print coverage guide]] treats those as different surfaces. You do not have to print every panel.',
            'A [[/products/pleated-table-covers|pleated table cover]] on the condiment or cashier table hides jugs. It comes in 4, 6 and 8 ft, closed on the back, and its own page is the one that calls the fabric machine washable — the useful property after a spill. A separate menu board, hung on the organizer’s frame or fence rather than on this tent, is a [[/products/13oz-vinyl-banner|13oz vinyl banner]]: waterproof scrim, rated indoor and outdoor, hem and brass grommets included, made to the inch, priced by the square foot. We do not sell a banner rail for the canopy, so do not plan on clipping that banner to the leg.'
          ]
        },
        {
          h2: 'Cooking, venting, permits, and fire rules',
          paragraphs: [
            'Cooking, open flame, fryers, ventilation, and whether any tent may stand over a food-truck window are decided by the local fire authority and by the event organizer. Confirm both before you design the booth or promise a covered cook line. This is general guidance, not a reading of your city’s code.',
            'Our canopy specifications list a 600D polyester top and dye-sublimated print. They do not list a flame-retardant treatment or any named fire standard. The [[/resources/tent-weight-rules|vendor weight roundup]] notes that food vendors are often asked for flame-retardant fabric — commonly NFPA 701 — and an extinguisher. That sentence describes organizer rules collected for the guide. It is not a certification of this tent. If the packet requires a rated fabric, do not assume this canopy qualifies. We also do not sell a vented cooking top or a grease-rated canopy.',
            'Weights are a separate question from fire rules. The same guide shows markets and festivals requiring a weight on every leg, and the canopy page offers four sandbags for $50 with no pound figure printed. Use the number in the organizer’s packet. Stakes are not included, and many street events forbid them.'
          ]
        },
        {
          h2: 'Dates, spills, and the proof',
          paragraphs: [
            'Festival dates do not move. The canopy page shows a standard production window and a rush window; choosing rush lifts the goods price by half and does not speed the carrier. [[/shipping|Shipping]] explains that arrival is production plus transit, and that the charge depends on destination, size and weight. [[/returns|Returns]] explains there is no refund, including after the proof is approved, because the item is already in production. Every order includes a free proof — [[/free-artwork-proof|how the proof works]] — and laying a menu out for you is a one-time $35 design option.',
            'Wipe food splashes with a damp cloth and mild soap, then let the fabric dry before it is bagged. That is the [[/blog/trade-show-display-setup-and-care-guide|display care guide]], which also warns that a damp top packed away is how odor and mildew start. Do not read the table cover’s machine-wash note as permission to machine-wash the canopy.'
          ]
        }
      ],
      faqHeading: 'Concession tent questions',
      faqs: [
        {
          q: 'Can I cook under this canopy?',
          a: 'Only if the local fire authority and the event organizer both say that setup is allowed. We do not publish a flame-retardant rating for the 600D polyester top, and we do not sell a vented cooking canopy. Many food events ask for a rated fabric and an extinguisher — the tent weight guide records that pattern, including NFPA 701 as a common ask. Treat that as their rule, not as a claim about this product.'
        },
        {
          q: 'What size covers a queue as well as the window?',
          a: 'The 10×10 covers a single service point. The 10×15 size guide is the one that names a concession queue under cover, at 150 square feet. The 10×20 is 200 square feet and needs a double space from the organizer. Keep the service side open and put the solid wall behind prep.'
        },
        {
          q: 'Can the menu live on the tent?',
          a: 'Yes, on the valance, which is the skirt guests read in line. Print item names and prices there and keep the roof for the brand. A 13oz vinyl banner is a separate outdoor menu board with grommets, priced by the square foot, and it hangs on a fence or a frame the venue provides — not on a rail we sell for this canopy.'
        },
        {
          q: 'Is the canopy fabric machine washable after a grease spill?',
          a: 'No. Machine washing is stated for the pleated and stretch table covers, not for the canopy top. The care guide says to wipe a canopy with a damp cloth and mild soap and to dry it fully before bagging. A damp top stored in the bag is how mildew starts.'
        }
      ],
      relatedHeading: 'If you are not running a service line',
      relatedLead:
        'A craft stall that happens to sell jars, rather than a hot line, belongs on [[/solutions/vendor-market-tents|Vendor & Market Tents]]. An outdoor exhibitor pavilion belongs on [[/solutions/trade-show-tents|Trade Show Tents]]. A team feed station has more in common with [[/solutions/sports-team-tents|Sports & Tailgate Tents]]. A bake sale on a church lawn belongs on [[/solutions/church-school-tents|Church & School Tents]]. A site lunch tent belongs on [[/solutions/job-site-tents|Job Site & Safety Tents]].'
    }
  },
  {
    slug: 'church-school-tents',
    title: 'Church & School Tents',
    blurb: 'Registration desks, fundraisers and open days.',
    guide: {
      metaDescription:
        'Custom printed church and school canopy tents — a branded landmark for registration, fundraisers and open days, with shade and easy setup for volunteers.',
      eyebrow: 'Congregations, campuses, open days',
      intro:
        'Churches and schools need a friendly, findable landmark for the events that fill the calendar — registration and welcome desks, fundraisers, sports days and open days. A tent printed with the organization name gives volunteers an obvious base and shade to work under, and it reappears at every event through the year.',
      primaryCta: { to: '/products/canopy-tent-10x10', label: 'See welcome-tent pricing' },
      photo: {
        src: '/images/tents/10x10-back.webp',
        alt: 'Welcome-desk layout: a single rear panel on the smaller frame'
      },
      focusHeading: 'What a volunteer crew needs from one tent',
      focus: [
        'The organization name large enough to pick the welcome point out of a crowded lawn.',
        'Shade for volunteers, registration desks and hand-out tables.',
        'Simple setup a rotating group of volunteers can manage.',
        'One durable tent that reuses across many events per year.'
      ],
      sections: [
        {
          h2: 'A welcome table, or the whole fundraiser',
          paragraphs: [
            'Registration is a 100 square foot job: a couple of volunteers and a 6 ft table. That is the [[/sizes/10x10|10×10 size guide]] and the [[/products/canopy-tent-10x10|10×10 canopy]], whose complete set lists at $835 before walls. Bake sales, open-day rows and anything with two tables need the width of the [[/products/canopy-tent-10x15|10×15 canopy]] (150 square feet, complete set $1,375) or the [[/products/canopy-tent-10x20|10×20 canopy]] (200 square feet, complete set $1,635). Pick the wider frame when games and a serving table have to share one roof, and read that size guide before you assume the lawn has the room.',
            'A full back wall gives the organization name a backdrop and some shade. Keep the front open so families walk up. Half side walls are for wind at an open day, not for hiding the table. Full versus half, and the three-wall limit, are explained in [[/blog/custom-canopy-tent-wall-options-explained|how full and half walls combine]]. A wall on the small frame is $275; on the two larger frames a wall is $365. If a parent group kept last year’s hardware, the graphic-only prices are $510, $545 and $915 — fabric only, no new frame and no bag — after you confirm the old frame is the one those pages call compatible.'
          ]
        },
        {
          h2: 'The table, the sign on the path, the banner by the desk',
          paragraphs: [
            'A [[/products/pleated-table-covers|pleated table cover]] in 4, 6 or 8 ft dresses the welcome table and closes the back so supply boxes stay unseen. The 4 ft starts at $199. If the table only needs a logo down the center, quote a [[/products/custom-table-runner|table runner]] — 72 inches for a 6 ft table, 96 inches for an 8 ft, widths from 14 to 30 inches — and read the [[/blog/table-runner-size-guide|runner size guide]] before you pick a width. The runner is quoted. No price or production time is published for it.',
            'An [[/products/a-frame-sign|A-frame sign]] stands on the path: a folding board read from both faces, panels in 18 by 24 inches or 24 by 36 inches, replaceable when the event name changes. It is quoted too, and the page says to bring it in during strong wind. A [[/products/standard-retractable-banner|standard retractable banner]] brands the desk from standing height, at $145 for 33 by 81 inches or $299 for 47 by 81 inches. Those graphics are 81 inches tall, so check the 10×10 size guide’s valance clearance before you stand one inside the frame rather than beside it.'
          ]
        },
        {
          h2: 'A different crew every event',
          paragraphs: [
            'Volunteers change. The [[/blog/trade-show-display-setup-and-care-guide|setup guide]] describes this kind of frame as a pop-up that expands in minutes and suggests a second person. We do not publish a tool list or a minute-by-minute canopy procedure beyond that guide, so point the crew at the guide rather than at folklore. Store the top dry, in the carry bag that ships with the complete set.',
            'Canopy rush and table-cover rush are not the same percentage. On canopies, the 2–3 business day option is half again the order. On pleated and stretch covers, rush is 15 percent. Both clocks are production only. Freight is not included and is not free; [[/shipping|shipping]] is where the charge is explained. [[/returns|Returns]] is where it says we do not offer refunds. A misspelled school name is something you catch on the free proof — [[/free-artwork-proof|the proof steps]] and the [[/artwork-guidelines|artwork guidelines]] — not something a refund will fix after approval.',
            'Outdoor open days still need weight on each leg. The add-on is four sandbags for $50, with no pound rating printed. If the venue has a minimum, it is the venue’s number. The [[/resources/tent-weight-rules|public-event weight notes]] show how festivals write that rule. Around families, wind damage is the case the [[/warranty|warranty]] will not pay: weather is excluded. The page states the term lengths for defects.'
          ]
        }
      ],
      faqHeading: 'School and church tent questions',
      faqs: [
        {
          q: 'What should we buy for registration and a once-a-year fundraiser?',
          a: 'Start with one 10×10 complete set if registration is a single table. Add the 10×15 or the 10×20 only when the fundraiser genuinely uses a wider front — two tables, or games plus a serving table. A back wall with the organization name is the useful print. Leave the front open.'
        },
        {
          q: 'Can a new group of volunteers put it up without a manual from us?',
          a: 'Point them at the setup and care guide. It describes the pop-up frame as expanding in minutes and recommends a second person. We do not publish a separate tool checklist for canopies. The complete set includes a carry bag; pack the top only once it is dry.'
        },
        {
          q: 'We already have a plain frame. Can you print just our name on a new top?',
          a: 'Yes, when the product page’s compatible-frame note matches the hardware you kept. The graphic-only column is the printed fabric without a frame or a bag: $510, $545 and $915 as the footprint grows from the smallest to the largest. Order walls with that top if the name should also sit on a backdrop.'
        },
        {
          q: 'Do we need a permit to put this on the lawn?',
          a: 'That is the school, the church, or the city — not a rule we can state from the product. Ask whoever controls the lawn, and ask the event organizer if the open day is on someone else’s property. The tent page will not tell you the local rule.'
        }
      ],
      relatedHeading: 'Nearby situations that are not a campus lawn',
      relatedLead:
        'For a Saturday craft row, open [[/solutions/vendor-market-tents|Vendor & Market Tents]]. For an outdoor expo booth, open [[/solutions/trade-show-tents|Trade Show Tents]]. The athletics field is its own page: [[/solutions/sports-team-tents|Sports & Tailgate Tents]]. A carnival concession window is its own page: [[/solutions/food-truck-tents|Food Truck & Concession Tents]]. A construction entrance is its own page: [[/solutions/job-site-tents|Job Site & Safety Tents]].'
    }
  },
  {
    slug: 'job-site-tents',
    title: 'Job Site & Safety Tents',
    blurb: 'Shade and a visible company mark on active sites.',
    guide: {
      metaDescription:
        'Custom printed job site and safety canopy tents — shade for breaks and briefings, a visible company mark on active sites, and weights for exposed ground.',
      eyebrow: 'Active work sites',
      intro:
        'On an active site a printed tent marks your crew\'s area, shades breaks, briefings and a first-aid or sign-in point, and carries the company name where clients and the public can see it. It needs to stand up to sun and wind day after day and anchor securely on open ground.',
      primaryCta: { to: '/products/canopy-tent-10x10', label: 'See site-tent pricing' },
      photo: {
        src: '/images/tents/10x10-full2.webp',
        alt: 'Crew layout: two solid panels, working face left open'
      },
      focusHeading: 'What the tent is doing on a site',
      focus: [
        'The company name readable across an active site, on the roof and the skirt.',
        'Shade for breaks, toolbox talks, sign-in and first-aid points.',
        'A sturdy frame for repeated daily setup on rough ground.',
        'Weights for exposed, windy ground. Stakes are not in the kit, and the site may ban them.'
      ],
      sections: [
        {
          h2: 'Sign-in shade, or a larger crew',
          paragraphs: [
            'A sign-in table or a first-aid point is the small frame: 100 square feet in the [[/sizes/10x10|10×10 size guide]], sold as the [[/products/canopy-tent-10x10|10×10 canopy]]. A briefing, a crew meal, or gear you need out of the sun is the [[/products/canopy-tent-10x15|10×15 canopy]] at 150 square feet or the [[/products/canopy-tent-10x20|10×20 canopy]] at 200 square feet. The 10×20 is a double-booth footprint. Do not drop it on a site pad that was measured for a single square.',
            'Put a full wall on the back and another on the windward side — the preview here is two full walls — and leave the working face open so people walk in carrying tools. The [[/blog/custom-canopy-tent-wall-options-explained|three-wall rule]] caps printed walls at three, in any full or half mix. That guide also says walls catch wind: in a gust, drop them, keep the roof, and leave weight on every leg. The frame spec, shared by all three sizes, is a heavy-duty aluminum hex with telescopic legs. The top spec is 600D polyester, dye-sublimated. Neither line is a wind speed, a fire rating, or a safety certification. Those are not in the product data.'
          ]
        },
        {
          h2: 'The name on the tent, and the name on the fence',
          paragraphs: [
            'Print the company name on the roof and the valance so it reads across the site. The [[/blog/print-coverage-explained|print coverage guide]] is how those surfaces differ, and you can print one without the other. For the fence itself, a [[/products/mesh-banner|mesh banner]] is the product listed for construction fence wraps and exposed outdoor sites: 10oz matte mesh, a 70/30 perforation so air passes instead of turning the sheet into a sail, hems and grommets included, made to size. A solid [[/products/13oz-vinyl-banner|13oz vinyl banner]] is the waterproof scrim when you want a block of color rather than a see-through wrap. The [[/blog/banner-materials-explained|banner materials guide]] compares the two. Both are priced by the square foot, not as a flat kit.',
            'Directional boards are [[/products/coroplast-signs|coroplast signs]]: 4mm sheet, cut from 6 by 6 inches up to 48 by 96, UV printed, with an optional 10 by 30 inch steel H-stake that is not included unless you add it. The page says to treat them as event and short-run signs, not permanent exterior signage, and it does not publish an outdoor lifespan. An [[/products/a-frame-sign|A-frame sign]] is the folding board for a site entrance, panels 18 by 24 or 24 by 36 inches, quoted with no published price and no published lead time. Tell the quote if it will stay out overnight.'
          ]
        },
        {
          h2: 'What we will not claim, and what the warranty excludes',
          paragraphs: [
            'Site safety rules, permits, and where a tent may stand belong to the site owner and the local authority. Ask them. This page will not invent an OSHA position, a wind rating, or a fire certificate, because the catalog does not state any of those.',
            'The [[/warranty|warranty]] excludes wind, storm and weather damage, misuse, normal wear, and fading from long sunlight. Defect coverage is a 5-year term on the frame and a 1-year term on everything else, plus a 1-year reprint for print defects and a reship when transit damage is reported inside 3 days. [[/returns|Returns]] is explicit that refunds are not offered. Wipe site dust off, let the fabric dry, then bag it. The procedure, including the warning against packing a damp top, is the [[/blog/trade-show-display-setup-and-care-guide|care write-up]].',
            'Sandbags are a $50 add-on for four pieces, one per leg, with no published weight per bag. On pavement, do not assume stakes are allowed; they are not part of this kit. The [[/resources/tent-weight-rules|weight-rule collection]] shows how public events specify pounds per leg. A job site may write a different number. Production time is the line on the canopy you configure, plus courier time. Where that product offers rush, rush shortens making the order, not the drive. [[/shipping|Shipping]] is the split, and the charge is calculated, not waived.'
          ]
        }
      ],
      faqHeading: 'Site tent questions',
      faqs: [
        {
          q: 'Is this canopy rated for wind, fire, or job-site safety rules?',
          a: 'No rating like that is published. The spec is a heavy-duty aluminum hex frame with telescopic legs and a 600D polyester top with dye-sublimated print. There is no wind speed, no flame-retardant standard, and no safety certification in the product data. Permits and site rules come from the site owner and the local authority. Ask them before you treat the tent as safety equipment.'
        },
        {
          q: 'What should we print, and what belongs on the fence instead?',
          a: 'Put the company name on the canopy roof and valance. For a construction fence, use the mesh banner — 10oz, 70/30 perforation — so wind can pass. Use 13oz vinyl when you want a solid waterproof sheet. Coroplast with an optional H-stake is the short-run directional board. None of those banners mount on the canopy; they are separate products.'
        },
        {
          q: 'Will warranty replace a tent the wind took on an open pad?',
          a: 'Weather damage is excluded, including wind and storms. The warranty pays for defects: 5 years on the frame, 1 year on graphics and other parts. Weight every leg, and take the canopy down when the site says the wind is too much. The $50 sandbag set does not list pounds, so match the site’s own number.'
        },
        {
          q: 'How early do we order for a dated project start?',
          a: 'Read the production line on the size you configure and add courier time. Rush, where the canopy offers it, shortens production only. Shipping cost depends on the address and is not included. Approve the proof in writing before the production clock starts, and do not expect a refund if the date slips after that approval.'
        }
      ],
      relatedHeading: 'If the ground is not a job site',
      relatedLead:
        'If the ground is a street market rather than a site, use [[/solutions/vendor-market-tents|Vendor & Market Tents]]. If it is an expo pavilion, use [[/solutions/trade-show-tents|Trade Show Tents]]. If it is a sports field, use [[/solutions/sports-team-tents|Sports & Tailgate Tents]]. If it is a food window, use [[/solutions/food-truck-tents|Food Truck & Concession Tents]]. If it is a school or church open day, use [[/solutions/church-school-tents|Church & School Tents]].'
    }
  }
];

export const getSolution = (slug) => SOLUTIONS.find((s) => s.slug === slug) || null;
