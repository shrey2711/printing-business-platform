// Transactional product + city landing pages.
//
// A second, deliberately different layer from the generic city pages at
// /trade-show-canopies/{city} and friends. Those are local landing pages: what
// exhibiting in that city is like, which venue, what to plan for. These are
// buying pages: one product group, real configurable products, live pricing and
// a route straight into checkout.
//
// The split has to be visible in the copy, not just the URL. Two pages aimed at
// the same phrase with interchangeable text are a doorway pair, and Google
// keeps one. So every `local` section below is written for that city AND that
// product — what the venue does to a canopy is not what it does to a table
// cover — and none of it is templated across cities.
//
// Never write "located in", "based in", or "our {city} warehouse/office/team".
// Apex has no premises in either city and test-location-quality.mjs fails the
// build on any phrasing that implies otherwise.

export const CITY_PRODUCT_PAGES = [
  // ---------------------------------------------------------------- CANOPIES
  {
    slug: 'custom-canopy-tents-los-angeles',
    citySlug: 'los-angeles',
    group: 'canopies',
    products: ['canopy-tent-10x10', 'canopy-tent-10x15', 'canopy-tent-10x20'],
    h1: 'Custom Canopy Tents in Los Angeles',
    title: 'Custom Canopy Tents Los Angeles',
    description:
      'Custom printed canopy tents for Los Angeles trade shows, festivals and outdoor activations. 10x10, 10x15 and 10x20 with up to three printed walls. Instant pricing.',
    primary: 'custom canopy tents Los Angeles',
    secondary: [
      'custom canopy tent Los Angeles', 'printed canopy tent Los Angeles',
      'custom printed canopy Los Angeles', 'canopy printing Los Angeles',
      'branded canopy tent Los Angeles', 'custom pop up tent Los Angeles',
      'trade show canopy tent Los Angeles'
    ],
    productIntro:
      "A printed canopy is the only display that creates a booth where there is no hall. It carries its own roof, its own walls and its own branding, so a bare pitch on tarmac becomes a stand with shade, a back wall to photograph against and somewhere for staff to work. That is why it appears at brand activations, sponsor villages, product sampling and consumer festivals as often as at trade shows — anywhere the venue gives you a marked square of ground and nothing else. Between the Los Angeles Convention Center downtown and the Anaheim Convention Center down the freeway, most of the Southern California event calendar has an outdoor component that needs exactly this.",
    intro:
      'Southern California runs outdoor events all year, which is why a canopy does more work in Los Angeles than it does almost anywhere else. Sponsor villages in the lots around the Los Angeles Convention Center, activations along the coast, street festivals and farmers markets all put your brand outdoors for a full day of sun. Configure a 10x10, 10x15 or 10x20 below, choose how many walls to print, and see the price as you build it.',
    local: [
      {
        h2: 'Sun is the design problem in Los Angeles, not rain',
        p: 'Most canopy guidance is written for wet climates. In LA the enemy is UV: a full day of direct sun on a saturated colour, repeated across a season of weekend events, is what fades a cheap canopy into a pastel version of your brand. These are dye sublimated, so the ink is bonded into the polyester rather than sitting on top of it, which is what lets a canopy survive a Southern California event calendar instead of one summer.'
      },
      {
        h2: 'Weight every leg, every time',
        p: 'Almost every LA venue that matters is hardstanding — convention centre lots, parking structures, closed streets, beachfront promenades. You cannot stake into any of them, and an unweighted canopy is the single most common failure at an outdoor event here. Order weights with the tent rather than hoping the venue lends you some, because most do not, and an afternoon onshore breeze is enough to move a 10x10 that is only held down by its own frame.'
      },
      {
        h2: 'What to print if you are exhibiting outside a hall',
        p: 'Canopies in a sponsor village are read from further away than a booth inside. Put the brand on the valance where it sits at eye level from the aisle, and keep the back wall for the thing you want photographed. If the same tent travels to consumer events as well as trade shows, print the back wall and leave the sides plain so the space works as either a closed booth or an open shade structure.'
      }
    ],
    faqs: [
      { q: 'Which canopy size fits a Los Angeles sponsor village pitch?', a: 'Most outdoor pitches sell as a 10x10, which is why it is the default. A 10x15 buys shade for a queue or a longer demo table, and a 10x20 covers a double pitch or lets you run product at one end and seating at the other. All three use the same frame and top, so the choice is footprint rather than quality.' },
      { q: 'Can I use a printed canopy at both indoor and outdoor LA events?', a: 'Yes. The frame is free standing and needs no rigging, so it works inside a hall as a branded island and outside as shade. Indoors you will usually drop the walls; outdoors you will usually want at least the back wall printed.' },
      { q: 'How far ahead should I order for an event in Los Angeles?', a: 'Order once your artwork is settled rather than once the event is close. Production runs to the schedule on the product page and transit is added on top by destination, so the honest planning figure is weeks rather than days, especially if you need a proof cycle.' }
    ]
  },
  {
    slug: 'custom-canopy-tents-chicago',
    citySlug: 'chicago',
    group: 'canopies',
    products: ['canopy-tent-10x10', 'canopy-tent-10x15', 'canopy-tent-10x20'],
    h1: 'Custom Canopy Tents in Chicago',
    title: 'Custom Canopy Tents Chicago',
    description:
      'Custom printed canopy tents for Chicago trade shows, festivals and outdoor events. 10x10, 10x15 and 10x20 with up to three printed walls. Instant online pricing.',
    primary: 'custom canopy tents Chicago',
    secondary: [
      'custom canopy tent Chicago', 'printed canopy tent Chicago',
      'custom printed canopy Chicago', 'canopy printing Chicago',
      'branded canopy tent Chicago', 'custom pop up tent Chicago',
      'trade show canopy tent Chicago'
    ],
    productIntro:
      "A canopy is a booth you bring with you. Where an exhibition hall supplies walls, lighting and a carpeted floor, an outdoor pitch supplies a rectangle of ground, and the canopy has to be all three. Printed on the top, the valance and up to three walls, it gives an outdoor stand the same branded presence an inline booth has indoors — which is why it turns up at festivals, sponsor activations and expo overflow space as much as at trade shows proper. In a market whose venues run from McCormick Place on the lakefront to the Donald E. Stephens Convention Center out at Rosemont, one canopy covers a lot of different events.",
    intro:
      'Chicago packs its outdoor calendar into a short, intense season. Between the summer street festivals, the lakefront events and the activations that spill outside McCormick Place, a branded canopy has a few months to earn its keep and then goes back in the case. Configure a 10x10, 10x15 or 10x20 below, pick your printed walls, and price it as you build.',
    local: [
      {
        h2: 'Wind off the lake is the constraint',
        p: 'Chicago earns its reputation on the lakefront and in the open ground east of McCormick Place, where there is nothing to break the wind coming off Lake Michigan. That changes how you rig rather than what you buy: weight every leg without exception, drop the walls when a gust front comes through, and treat a three walled canopy as a sail rather than a shelter. A canopy that fails here almost always fails because it was under-weighted, not because the frame was wrong.'
      },
      {
        h2: 'A short season means the print has to survive storage',
        p: 'A Chicago canopy typically works June to September and then sits in a case for eight months. Dye sublimation matters for that reason as much as for UV: the ink is bonded into the fibre, so a top that is packed damp and folded along the same creases every year does not crack or flake where a surface print would. Pack it dry, and it comes out of storage looking like it did in September.'
      },
      {
        h2: 'Outdoor space around the halls',
        p: 'McCormick Place is the largest convention centre in North America, and the outdoor activations attached to its bigger shows happen on hardstanding where staking is not an option. Order weights with the canopy. If the same tent is going to a summer street festival afterwards, print the back wall and one side rather than all three, so it still works as an open shade structure when you are not running a closed booth.'
      }
    ],
    faqs: [
      { q: 'What size canopy works for a Chicago street festival pitch?', a: 'Festival pitches are usually sold as a 10x10, and that is the size most organisers plan their layouts around. Take a 10x15 or 10x20 only when you have confirmed the pitch is wider, because an oversized canopy that will not fit the marked footprint is worse than a smaller one that does.' },
      { q: 'Will a printed canopy hold up to Chicago wind?', a: 'The frame is a heavy duty aluminium hex and the top is 600D polyester, but no canopy holds itself down. Every leg needs a weight, on every setup. In sustained wind, drop the walls first: the walls are what turn the frame into a sail.' },
      { q: 'Can I print a different design for a later Chicago event?', a: 'Yes. The printed top and walls are separate from the frame, so a new campaign is a reprint rather than a new canopy. The frame, legs and bag carry across years.' }
    ]
  },

  // ----------------------------------------------------------- BANNER STANDS
  {
    slug: 'retractable-banner-stands-los-angeles',
    citySlug: 'los-angeles',
    group: 'banner-stands',
    products: ['standard-retractable-banner', 'deluxe-retractable-banner', 'x-stand-banner'],
    h1: 'Retractable Banner Stands in Los Angeles',
    title: 'Retractable Banner Stands Los Angeles',
    description:
      'Custom retractable and roll-up banner stands for Los Angeles trade shows and events. Standard, deluxe and X-stand options, printed to order with instant pricing.',
    primary: 'retractable banner stands Los Angeles',
    secondary: [
      'roll up banner Los Angeles', 'roll up banner stands Los Angeles',
      'retractable banners Los Angeles', 'pull up banner Los Angeles',
      'custom retractable banner Los Angeles', 'retractable banner printing Los Angeles',
      'roll up banner printing Los Angeles'
    ],
    productIntro:
      "A retractable banner stand is the smallest thing that still reads as a professional exhibit. The graphic winds into its own weighted base, so there is nothing to assemble, nothing to rig and nothing to ship as freight — one case, one hand, up in under a minute. That is why it is the display teams buy first and use most: aisle presence at a trade show, a branded backdrop at a conference session, a lobby sign at a client office, a registration marker at an activation. For a market as spread out as greater Los Angeles, from the Convention Center downtown to events at the Anaheim Convention Center, it is the display that actually travels between all of them.",
    intro:
      'A retractable banner is the cheapest thing that still stops someone walking past, which is why it is usually the first display a team buys and the one that travels most. For Los Angeles events it has a second advantage: it collapses into a case that fits a car boot or checks as luggage, so the same stand covers a downtown convention, a client office in Century City and an activation in Santa Monica. Configure and price yours below.',
    local: [
      {
        h2: 'Built for a city that drives to its events',
        p: 'Los Angeles exhibitors move between venues far more than they set up once and stay. A retractable stand suits that: the graphic rolls into its own base, the base carries in one hand, and nothing needs assembly at the other end. If your week is a convention on Monday and a partner event on Thursday, this is the display that makes both without a crate or a drayage charge.'
      },
      {
        h2: 'Design for the aisle, not the desk',
        p: 'The mistake is designing a roll-up like a poster. The top third is what a person sees over a crowd at ten feet; the bottom third is often hidden behind a table or a queue. Put the offer and the brand in the top half, keep body copy to something readable at arm\'s length, and leave the lower quarter deliberately quiet.'
      },
      {
        h2: 'Which stand for which job',
        p: 'The standard retractable is the everyday aisle display and the one to buy if you are buying one. The deluxe adds a heavier base and chrome end caps, which reads as more considered in a lobby or a press setting — a real distinction at LA media events. The X-stand is the lightest and cheapest, and it is the right answer when you need six of something for a conference corridor rather than one of something for a booth.'
      }
    ],
    faqs: [
      { q: 'What size retractable banner should I order for a trade show booth?', a: 'The standard sizes are 33 inches and 47 inches wide at about 81 inches tall. A 33 inch stand sits neatly beside a table without crowding the aisle; a 47 inch reads from further down the hall and suits a wider booth frontage.' },
      { q: 'Can I replace the printed graphic later?', a: 'Yes. The graphic and the hardware are separate, so a new campaign is a reprint into the same base rather than a new stand. That is what makes a retractable cheaper over time than its first invoice suggests.' },
      { q: 'Is a roll-up banner the same thing as a retractable banner?', a: 'Yes — roll-up, pull-up and retractable all describe the same display: a printed graphic that winds into a weighted base and pulls up onto a pole. The names are regional rather than technical.' }
    ]
  },
  {
    slug: 'retractable-banner-stands-chicago',
    citySlug: 'chicago',
    group: 'banner-stands',
    products: ['standard-retractable-banner', 'deluxe-retractable-banner', 'x-stand-banner'],
    h1: 'Retractable Banner Stands in Chicago',
    title: 'Retractable Banner Stands Chicago',
    description:
      'Custom retractable and roll-up banner stands for Chicago trade shows and events. Standard, deluxe and X-stand options, printed to order with instant online pricing.',
    primary: 'retractable banner stands Chicago',
    secondary: [
      'roll up banner Chicago', 'roll up banner stands Chicago',
      'retractable banners Chicago', 'pull up banner Chicago',
      'custom retractable banner Chicago', 'retractable banner printing Chicago',
      'roll up banner printing Chicago'
    ],
    productIntro:
      "A retractable banner stand does the job of a small exhibit without any of the logistics. The printed graphic rolls into a weighted base, stands up in under a minute with no tools, and packs back into a shoulder case at the end of the day. For exhibitions and corporate events that means a display you carry in yourself rather than consign to freight — the difference between setting up when you arrive and waiting on a delivery window. It works as aisle presence in a McCormick Place hall, a speaker backdrop at a conference, or a wayfinding marker at a reception near the Donald E. Stephens Convention Center, which is why most teams own several and retire only the graphic.",
    intro:
      'At a McCormick Place show, anything that arrives on a pallet gets handled by the venue and billed accordingly. A retractable banner stand avoids that entirely: it travels as a case you carry in yourself, sets up in under a minute, and packs down at the end of the show without a crew. Configure and price yours below.',
    local: [
      {
        h2: 'The display that skips the loading dock',
        p: 'Drayage — the charge for moving your freight from the dock to your booth and back — is a real line item at large Chicago shows, and it is priced by weight and handling rather than by how useful the item is. A retractable stand in a shoulder case is hand-carriable, which means it usually bypasses that process altogether. For a small booth, two roll-ups you carry in can cost less to get onto the floor than one crated display.'
      },
      {
        h2: 'Sized for a big hall',
        p: 'McCormick Place halls are long, and sightlines are correspondingly long. A 33 inch stand works beside a table in a 10x10; at the end of a wide aisle a 47 inch reads considerably better. If the booth is deep, put the wider stand at the aisle line and the narrower one back by the meeting area rather than buying two of the same.'
      },
      {
        h2: 'Winter is hard on graphics in transit',
        p: 'A banner that travels through a Chicago January goes from freezing outside to a heated hall in minutes, and condensation forms on a cold graphic every time. Let a stand acclimatise in its case for an hour before you pull it up, and never roll a damp graphic away at the end of a show — that is what leaves marks along the wind line.'
      }
    ],
    faqs: [
      { q: 'Can I hand-carry a retractable banner into McCormick Place?', a: 'A retractable stand packs into a shoulder case that one person carries, which is the usual reason exhibitors choose it over a crated display. Confirm the current hand-carry rules with the show organiser, since they are set per event rather than by us.' },
      { q: 'Which stand suits a 10x10 booth?', a: 'One standard 33 inch retractable beside the table is the common setup, and it leaves the aisle clear. Add a second at the opposite corner rather than moving up a size if you want presence from both directions.' },
      { q: 'How quickly can a roll-up be set up on site?', a: 'Under a minute, with no tools. Stand the base, pull the graphic up to the top of the pole, and drop the support leg into the back of the base.' }
    ]
  },

  // ------------------------------------------------------------ TABLE COVERS
  {
    slug: 'custom-table-covers-los-angeles',
    citySlug: 'los-angeles',
    group: 'table-covers',
    products: ['pleated-table-covers', 'stretch-table-covers'],
    h1: 'Custom Table Covers in Los Angeles',
    title: 'Custom Table Covers Los Angeles',
    description:
      'Custom printed table covers and throws for Los Angeles trade shows and events. Pleated and fitted stretch styles, closed back, dye-sublimated. Instant pricing.',
    primary: 'custom table covers Los Angeles',
    secondary: [
      'trade show table covers Los Angeles', 'custom table cover printing Los Angeles',
      'printed table covers Los Angeles', 'branded table covers Los Angeles',
      'trade show tablecloth Los Angeles', 'custom table throws Los Angeles'
    ],
    productIntro:
      "A printed table cover is the highest-value square footage in any booth, because the table is already there. Venues rent you a bare trestle; the cover turns that into the front of your stand, at eye level for anyone walking the aisle, for a fraction of what any other branded surface costs. It also solves a problem nobody plans for: everything you brought has to live somewhere, and a closed-back cover turns the space under the table into storage the aisle cannot see. For trade shows, conferences, sampling tables and registration desks, it is the cheapest thing that makes a stand look finished.",
    intro:
      'Almost every booth has a table, and almost every venue rents you a bare one. A printed cover is the cheapest way to turn that rented table into brand space, and it packs flatter than anything else in the booth. Choose a draped pleated throw or a fitted stretch cover below and price it as you configure.',
    local: [
      {
        h2: 'Measure the rented table, not the booth',
        p: 'The Los Angeles Convention Center and the venues around it rent tables by length — 6 ft and 8 ft rectangular are the standard. Order the cover to the table, not to your booth width, and confirm what the show is actually supplying before you print. A fitted stretch cover cut for the wrong length will not go on at all, where a pleated throw is more forgiving of a few inches either way.'
      },
      {
        h2: 'Why closed back matters at a busy show',
        p: 'Both styles are closed on all four sides. That is not a cosmetic detail: it is where the cases, the boxes of literature and the bag someone left behind actually go. At a busy LA show your under-table space is storage by the second hour, and an open-backed cover puts all of it in the aisle\'s eyeline.'
      },
      {
        h2: 'One cover, a full season of events',
        p: 'Dye sublimation bonds the ink into the polyester rather than laying it on top, so a cover can be washed between shows without the colour cracking or lifting. For a team running the LA circuit — a convention downtown, a partner event on the Westside, a consumer show in Anaheim — that is what turns a table cover from a per-show expense into a season-long purchase.'
      }
    ],
    faqs: [
      { q: 'Pleated or stretch for a Los Angeles trade show booth?', a: 'A pleated throw drapes with rounded corners and reads as classic and formal; a fitted stretch cover pulls tight for a sharper, more modern face. Both are closed back and full colour. Pleated comes in 4, 6 and 8 ft, stretch in 6 and 8 ft.' },
      { q: 'Will the cover fit the table the venue supplies?', a: 'It will if you order to the table length the show is providing. Ask the organiser or exhibitor services what size table is in your package before you print, because a 6 ft cover on an 8 ft table is not recoverable on site.' },
      { q: 'Can a printed table cover be washed?', a: 'Yes. The polyester is dye sublimated and machine washable, which is what lets one cover work across a run of events rather than a single show.' }
    ]
  },
  {
    slug: 'custom-table-covers-chicago',
    citySlug: 'chicago',
    group: 'table-covers',
    products: ['pleated-table-covers', 'stretch-table-covers'],
    h1: 'Custom Table Covers in Chicago',
    title: 'Custom Table Covers Chicago',
    description:
      'Custom printed table covers and throws for Chicago trade shows and events. Pleated and fitted stretch styles, closed back and machine washable. Instant pricing.',
    primary: 'custom table covers Chicago',
    secondary: [
      'trade show table covers Chicago', 'custom table cover printing Chicago',
      'printed table covers Chicago', 'branded table covers Chicago',
      'trade show tablecloth Chicago', 'custom table throws Chicago'
    ],
    productIntro:
      "Every exhibition booth has a table and almost every venue supplies it bare. A printed cover turns that rented trestle into branded frontage at exactly the height people look, and it is the one display element that weighs nothing and folds into a corner of a case. For corporate events, association conferences and consumer shows it does double duty: brand surface at the front, hidden storage underneath for the cases and literature that otherwise sit in view. Dye sublimation means it washes between events rather than being replaced, so one cover lasts a season of shows.",
    intro:
      'A table cover is the highest return per dollar in a Chicago booth: it weighs almost nothing, folds into a corner of a case, and turns the venue\'s rented table into the front of your stand. Choose a draped pleated throw or a fitted stretch cover below and see the price as you configure it.',
    local: [
      {
        h2: 'It packs flat, which is the point at McCormick Place',
        p: 'On a show floor where freight is handled and billed by the venue, the things you can fold into a case are the things that do not appear on your drayage invoice. A table cover is the extreme case: full booth frontage, folded into something the size of a jacket. For a small stand it is often the only branded element that travels with you rather than ahead of you.'
      },
      {
        h2: 'Check the table size in your booth package',
        p: 'McCormick Place shows typically include a 6 ft or 8 ft rectangular table in the exhibitor package, but which one varies by show and by booth size. Confirm it with exhibitor services before printing. A fitted stretch cover is cut to a specific length and simply will not fit the wrong table; a pleated throw has more tolerance.'
      },
      {
        h2: 'Closed back, because the table is also your store room',
        p: 'Both styles close on all four sides. Over a multi-day Chicago show that under-table space fills with cases, coats and literature boxes, and a cover that only faces forward puts all of it in view from the aisle. Closed back is what keeps the booth looking the same on day three as it did on day one.'
      }
    ],
    faqs: [
      { q: 'What size table cover do Chicago show packages usually need?', a: '6 ft and 8 ft rectangular tables are the common inclusions. Confirm which is in your package with the show\'s exhibitor services before you print, since it varies by event and booth size.' },
      { q: 'Which is better for a corporate stand, pleated or stretch?', a: 'Stretch reads as more modern and sits tight to the table, which photographs well on a clean corporate stand. Pleated drapes and feels more traditional. Both are closed back and full colour, so it is a look rather than a quality decision.' },
      { q: 'Can I reuse the same cover across several Chicago shows?', a: 'That is the intent. The dye-sublimated polyester is wrinkle resistant and machine washable, so it packs, travels and washes between events without the print degrading.' }
    ]
  },

  // ---------------------------------------------------------- STEP AND REPEAT
  {
    slug: 'step-and-repeat-backdrop-los-angeles',
    citySlug: 'los-angeles',
    group: 'step-and-repeat',
    products: ['step-and-repeat-backdrop'],
    h1: 'Step & Repeat Backdrops in Los Angeles',
    title: 'Step & Repeat Backdrop Los Angeles',
    description:
      'Custom step and repeat backdrops for Los Angeles press events, premieres and activations. Repeating logo media walls on a portable adjustable frame. Instant pricing.',
    primary: 'step and repeat backdrop Los Angeles',
    secondary: [
      'step and repeat banner Los Angeles', 'step and repeat printing Los Angeles',
      'custom step and repeat Los Angeles', 'step and repeat backdrop printing Los Angeles',
      'logo backdrop Los Angeles', 'event backdrop Los Angeles'
    ],
    productIntro:
      "A step and repeat backdrop exists to survive a photograph. The logo tiles across the surface so that however the shot is framed or cropped — a full-length portrait, a tight headshot, a group of five — at least one complete mark is in the picture. That is the whole job, and it is why the format belongs at press events, premieres, award nights, product launches and influencer activations rather than in a booth. A single large logo is out of frame the moment someone stands in front of it; a repeating grid is the only layout that cannot be cropped out.",
    intro:
      'Los Angeles runs more photographed events than anywhere else in the country, and the step and repeat is the reason a brand survives the photograph. Premieres, press junkets, launches and influencer activations all end with a wall of tiled logos and someone standing in front of it. Configure your size and kit below and see the price as you build it.',
    local: [
      {
        h2: 'Design it for a cropped photograph',
        p: 'The logo grid is the entire design, and the thing that breaks it is scale. Too large and a tight portrait crop contains one and a half logos; too small and the brand is unreadable in anything but a full-width shot. Stagger the rows so a person standing centre never blocks a whole column, and keep the pattern away from the extreme edges where the frame wraps and the photograph gets cropped anyway.'
      },
      {
        h2: 'Leave room for the photographers',
        p: 'The most common LA mistake is a wall that no one can shoot properly. A 10 ft backdrop needs roughly 8 to 10 ft of clear floor in front of it for a photographer to step back far enough to frame a person against it. Check the ceiling too: at about 8 ft tall these clear most venues but not every low-ceilinged hotel suite or restaurant back room.'
      },
      {
        h2: 'One frame, many campaigns',
        p: 'The frame is adjustable and the printed graphic is separate, so a production company or agency running several events a year buys the hardware once and reprints per campaign. That is usually the deciding factor in LA, where the same team may need a different sponsor set every few weeks.'
      }
    ],
    faqs: [
      { q: 'What size step and repeat do I need for a Los Angeles press event?', a: 'The standard media wall is 8 ft x 8 ft or 10 ft x 8 ft, up to 120 inches by 96 inches. A 10 ft wall gives room for two or three people in frame; an 8 ft is for single portraits and tighter spaces.' },
      { q: 'How much space do I need in front of the backdrop?', a: 'Allow 8 to 10 ft of clear floor in front of a 10 ft wall. Photographers need to step back to frame a full-length shot, and a wall crammed against a walkway cannot be shot properly however good the print is.' },
      { q: 'Can I reprint the graphic for a different sponsor set?', a: 'Yes. The graphic is replaceable and the frame is reusable, so each new campaign is a reprint rather than a new backdrop.' }
    ]
  },
  {
    slug: 'step-and-repeat-backdrop-chicago',
    citySlug: 'chicago',
    group: 'step-and-repeat',
    products: ['step-and-repeat-backdrop'],
    h1: 'Step & Repeat Backdrops in Chicago',
    title: 'Step & Repeat Backdrop Chicago',
    description:
      'Custom step and repeat backdrops for Chicago events, galas and receptions. Repeating logo media walls on a portable adjustable frame. Instant pricing.',
    primary: 'step and repeat backdrop Chicago',
    secondary: [
      'step and repeat banner Chicago', 'step and repeat printing Chicago',
      'custom step and repeat Chicago', 'step and repeat backdrop printing Chicago',
      'logo backdrop Chicago', 'event backdrop Chicago'
    ],
    productIntro:
      "A step and repeat backdrop turns every photograph taken in front of it into brand coverage. The repeating grid means no crop can remove the logo, which is precisely what a single centred mark cannot promise once a person is standing there. For corporate events, association galas, sponsor receptions and awards nights it is the piece that makes a room's photography work for the people who funded it — and the reason sponsorship packages so often specify one. It goes up on an adjustable, tool-free frame, so a venue with no rigging and no crew is not an obstacle.",
    intro:
      'Chicago\'s photographed events lean corporate: association galas, awards nights, sponsor receptions and the hospitality suites attached to the big McCormick Place shows. In all of them the step and repeat is what puts the sponsor set into every photograph that leaves the room. Configure your size and kit below and price it as you build.',
    local: [
      {
        h2: 'Sponsor hierarchy is the hard part',
        p: 'A Chicago association event usually has a tiered sponsor list rather than a single brand, and that is a design problem before it is a print problem. Decide the hierarchy before you lay out the grid: a title sponsor repeated at full size with supporting marks at half is readable, while eight logos at equal weight tiled across a wall reads as none of them.'
      },
      {
        h2: 'Hotel ballrooms set your height',
        p: 'Much of the Chicago event calendar happens in hotel ballrooms and function rooms along and around Michigan Avenue rather than in purpose-built halls. At roughly 8 ft tall the frame clears most ballrooms comfortably, but low-ceilinged pre-function spaces and private dining rooms are worth measuring before you order rather than on the night.'
      },
      {
        h2: 'It travels as a case, not as freight',
        p: 'The frame is adjustable and tool free, and the whole wall packs into a case that goes in a car. For an event team running receptions in several venues across a week, that matters more than it sounds: nothing needs a dock, a crew or a handling charge to get into the room.'
      }
    ],
    faqs: [
      { q: 'What size step and repeat suits a Chicago ballroom event?', a: 'A 10 ft x 8 ft wall handles groups and gives photographers room to work; an 8 ft x 8 ft suits a tighter pre-function space. Both are within the 120 by 96 inch maximum.' },
      { q: 'How many sponsor logos can go on one backdrop?', a: 'Fewer than most events want. A tiered layout — one title mark repeated large, supporting marks smaller — stays readable in a cropped photograph, where an equal-weight grid of many logos does not.' },
      { q: 'Is the frame easy to set up without a crew?', a: 'Yes. It is adjustable and assembles without tools, and it packs into a case one or two people can carry into a venue.' }
    ]
  },

  // ------------------------------------------------------- TENSION FABRIC
  // Retargeted from the originally specified /trade-show-backdrops-{city},
  // which sat one character from the existing /trade-show-backdrops/{city} and
  // duplicated the step & repeat page above. The backdrops category holds
  // exactly two SKUs, so these two pages now map one product each.
  {
    slug: 'tension-fabric-display-los-angeles',
    citySlug: 'los-angeles',
    group: 'tension-fabric',
    products: ['straight-tension-fabric-display'],
    h1: 'Tension Fabric Displays in Los Angeles',
    title: 'Tension Fabric Display Los Angeles',
    description:
      'Straight tension fabric displays for Los Angeles trade shows — a seamless printed booth back wall on a lightweight aluminium frame. Instant online pricing.',
    primary: 'tension fabric display Los Angeles',
    secondary: [
      'fabric trade show backdrop Los Angeles', 'trade show booth backdrop Los Angeles',
      'custom trade show backdrop Los Angeles', 'seamless fabric display Los Angeles',
      'backdrop printing Los Angeles', 'exhibition backdrop Los Angeles'
    ],
    productIntro:
      "A tension fabric display is a booth back wall as one uninterrupted image. The printed fabric zips over an aluminium tube frame and pulls taut from both sides, which removes the two things that make a display look temporary: the seam down the middle and the hardware around the edge. For exhibitions and trade shows that matters because the back wall is the only surface a visitor sees from down the aisle, before they can read anything else. It is also the cheapest way to change what a booth says — the graphic unzips and a new one goes on the same frame.",
    intro:
      'Where a step and repeat tiles a logo for photographs, a tension fabric display is one seamless image across the back of your booth. The graphic zips over an aluminium tube frame like a pillowcase, which is what removes the seams and the hardware from the sightline. Configure yours below and price it as you build.',
    local: [
      {
        h2: 'One image, no seams, no visible hardware',
        p: 'A pillowcase graphic pulls tight over the frame from both sides, so there is no join down the middle and no visible frame at the edges. Against the printed-panel backdrops still common on LA show floors, that reads as a considerably more finished booth for the same footprint — which is the whole reason to specify fabric over a hard panel.'
      },
      {
        h2: 'It flies as luggage',
        p: 'The frame is aluminium tube and the graphic is fabric, so the entire back wall packs into a case a person checks on a flight. For teams travelling into Los Angeles for a single show, that is the difference between checked baggage and a freight booking with a delivery window.'
      },
      {
        h2: 'Washable, which matters over a season',
        p: 'The graphic comes off the frame and can be washed, so a wall that has been packed, unpacked and handled across a run of West Coast shows does not carry the marks of it. Reprint when the message changes rather than when the fabric gets tired.'
      }
    ],
    faqs: [
      { q: 'What sizes does the tension fabric display come in?', a: 'Straight walls run 8, 10 and 20 ft wide at roughly 8 ft tall, which maps onto the standard 10x10 and 10x20 booth footprints used at Los Angeles shows.' },
      { q: 'Tension fabric or step and repeat for my booth?', a: 'Choose tension fabric when the wall is the back of your booth and you want one seamless image. Choose step and repeat when the wall exists to be photographed, because the tiled logo is what survives a cropped shot.' },
      { q: 'Can I print both sides?', a: 'Double sided is available and is worth specifying when the back of the wall faces another aisle rather than a solid divider — otherwise you are printing a face nobody sees.' }
    ]
  },
  {
    slug: 'tension-fabric-display-chicago',
    citySlug: 'chicago',
    group: 'tension-fabric',
    products: ['straight-tension-fabric-display'],
    h1: 'Tension Fabric Displays in Chicago',
    title: 'Tension Fabric Display Chicago',
    description:
      'Straight tension fabric displays for Chicago trade shows — a seamless printed booth back wall on a lightweight aluminium frame. Instant online pricing.',
    primary: 'tension fabric display Chicago',
    secondary: [
      'fabric trade show backdrop Chicago', 'trade show booth backdrop Chicago',
      'custom trade show backdrop Chicago', 'seamless fabric display Chicago',
      'backdrop printing Chicago', 'exhibition backdrop Chicago'
    ],
    productIntro:
      "A tension fabric display gives a booth a full-width branded wall that weighs almost nothing. An aluminium tube frame pushes together without tools and a printed fabric skin zips over it, stretched tight so there is no seam and no visible frame — the difference between a stand that reads as built and one that reads as assembled. For exhibitions, conferences and corporate showcases it is the practical choice as much as the aesthetic one: it is the only full-size back wall a two-person team can carry in, put up and take down inside a session break.",
    intro:
      'A tension fabric display is a single seamless graphic stretched over an aluminium frame — the back wall of a booth without the seams, panels or visible hardware. For a McCormick Place stand it has a second argument in its favour: it weighs almost nothing and packs into a case. Configure yours below and see the price as you build.',
    local: [
      {
        h2: 'Weight is money on a Chicago show floor',
        p: 'Drayage at the large Chicago shows is charged by weight and handling. A tension fabric wall is aluminium tube and fabric, so a full 10 ft booth back wall packs into a case rather than onto a pallet. Against a hard panel system covering the same span, the difference shows up directly on the freight and handling invoice, every show, in both directions.'
      },
      {
        h2: 'Sized to the standard booth footprints',
        p: 'Straight walls come 8, 10 and 20 ft wide at roughly 8 ft tall, which maps cleanly onto the 10x10 and 10x20 inline booths that most McCormick Place shows sell. Order to the booth you have bought rather than the space you hope to have, since an oversized wall cannot be trimmed on site.'
      },
      {
        h2: 'Set up without a crew or a call',
        p: 'The frame pushes together without tools and the graphic zips over it, so two people put up a 10 ft wall in minutes. At a venue where installation labour is a scheduled, billable service, a display your own team can legitimately stand up is worth more than the print quality difference alone.'
      }
    ],
    faqs: [
      { q: 'Which width fits a 10x10 booth at a Chicago show?', a: 'The 10 ft straight wall is cut for a standard 10x10 inline booth. The 8 ft leaves space at the sides if you want the wall to read as an element rather than fill the frontage; the 20 ft is for a double booth.' },
      { q: 'How does it compare to a hard panel backdrop for freight?', a: 'A fabric wall on a tube frame packs into a case, where a hard panel system of the same span travels as freight. On a floor where handling is billed by weight, that is a recurring cost difference rather than a one-off.' },
      { q: 'Can the graphic be replaced without new hardware?', a: 'Yes. The fabric graphic unzips from the frame, so a rebrand or a new campaign is a reprint into hardware you already own.' }
    ]
  },

  // ----------------------------------------------------------------- BANNERS
  {
    slug: 'custom-banners-los-angeles',
    citySlug: 'los-angeles',
    group: 'banners',
    products: ['13oz-vinyl-banner', '18oz-blockout-banner', 'mesh-banner', 'fabric-banner-9oz-wrinkle-free'],
    h1: 'Custom Banners in Los Angeles',
    title: 'Custom Banners Los Angeles | Vinyl & Mesh',
    description:
      'Custom printed banners for Los Angeles events, storefronts and trade shows. 13oz vinyl, 18oz blockout, mesh and fabric, made to any size and priced by the sq ft.',
    primary: 'custom banners Los Angeles',
    secondary: [
      'banner printing Los Angeles', 'custom banner printing Los Angeles',
      'trade show banners Los Angeles', 'printed banners Los Angeles',
      'vinyl banners Los Angeles', 'event banners Los Angeles'
    ],
    productIntro:
      "A banner is the most flexible signage there is, because nothing about it is fixed — you choose the material, the size to the inch and how it hangs. That makes it the answer to problems other displays cannot solve: a 20-foot span above a booth, a fence line at an outdoor activation, a queue marker at a sampling event, a storefront promotion for a local business. Priced by the square foot rather than by format, it is usually the cheapest way to put a brand across a large surface, whether that is inside a convention hall or on a barrier outside it.",
    intro:
      'Banners are priced by the square foot and made to the inch, so the size is yours to choose rather than a stock format to work around. Enter your width and height on any of the four materials below and the price updates as you type. Which material you want depends almost entirely on where it is going to hang.',
    local: [
      {
        h2: 'Outdoors in Los Angeles, sun beats rain',
        p: 'A banner on a Southern California storefront or fence spends its life in direct UV rather than getting soaked. That pushes the decision toward the UV-stable inks used across all four materials, and toward 13oz scrim as the sensible default: indoor and outdoor rated, welded hem and grommets included, and priced to be replaced when the message changes rather than nursed for years.'
      },
      {
        h2: 'On a fence or a construction line, use mesh',
        p: 'Los Angeles has a lot of long fence lines — construction hoardings, event perimeters, lot boundaries. A solid banner on an exposed fence acts as a sail, and the failure is the fixing tearing out rather than the print wearing out. Mesh is perforated so roughly 30 percent of the surface is open, letting air through instead of loading the fixings. Tie off every grommet, not just the corners.'
      },
      {
        h2: 'Indoors and on camera, use fabric',
        p: 'Under the lighting rigs at an LA event or on a set, vinyl throws glare straight back into the lens. The 9oz polyester is dye sublimated for a matte finish that photographs cleanly, which is why it is worth the difference for anything that will appear in content rather than just be walked past.'
      }
    ],
    faqs: [
      { q: 'What size banner can I order?', a: 'Any size to the inch, up to 10 ft by 145 ft on vinyl — 9.5 ft wide if you add a pole pocket. Pricing is by the square foot, so you are not limited to stock formats.' },
      { q: 'Which banner material is right for an outdoor Los Angeles site?', a: '13oz scrim vinyl for most storefront and event use. Mesh where it is going on a fence or anywhere exposed to sustained wind. 18oz blockout when you need a true double-sided print with no show-through.' },
      { q: 'Are hems and grommets included?', a: 'Standard hems, white double stitched thread and No. 2 Stimpson brass grommets are included at no charge on vinyl and mesh, so the banner arrives ready to tie off.' }
    ]
  },
  {
    slug: 'custom-banners-chicago',
    citySlug: 'chicago',
    group: 'banners',
    products: ['13oz-vinyl-banner', '18oz-blockout-banner', 'mesh-banner', 'fabric-banner-9oz-wrinkle-free'],
    h1: 'Custom Banners in Chicago',
    title: 'Custom Banners Chicago | Vinyl & Mesh',
    description:
      'Custom printed banners for Chicago events, storefronts and trade shows. 13oz vinyl, 18oz blockout, mesh and fabric, made to any size with per-square-foot pricing.',
    primary: 'custom banners Chicago',
    secondary: [
      'banner printing Chicago', 'custom banner printing Chicago',
      'trade show banners Chicago', 'printed banners Chicago',
      'vinyl banners Chicago', 'event banners Chicago'
    ],
    productIntro:
      "A banner solves the signage problems that fixed-format displays cannot. You pick the material, the exact size and the way it attaches, which is why one product covers a booth header at an exhibition, a fence wrap at an outdoor event, a stage backdrop at a corporate function and a storefront promotion. Four materials cover the range: scrim vinyl for general use, blockout for true double-sided printing, mesh for anywhere the wind gets at it, and dye-sublimated fabric for indoor halls where lighting would glare off vinyl. Pricing is by the square foot, so the size is a decision rather than a constraint.",
    intro:
      'Banners are made to the inch and priced by the square foot, so you specify the space rather than pick from stock sizes. Enter a width and height on any of the four materials below and watch the price update. In Chicago the material decision is usually made by the weather rather than the budget.',
    local: [
      {
        h2: 'Wind is the deciding factor here',
        p: 'A solid banner on an exposed Chicago fence line or rooftop is a sail, and it will pull its own grommets out long before the print fails. Mesh exists for exactly this: a 70/30 perforation lets air through instead of loading the fixings. For anything going up outdoors between the lake and an open lot, mesh is the default rather than the upgrade.'
      },
      {
        h2: 'Freeze, thaw, and what it does to a fixing',
        p: 'A Chicago winter puts a banner through repeated freeze-thaw cycles, and the failure point is almost always the attachment rather than the material. Tie off every grommet rather than the four corners, use bungee or cable ties that give a little rather than rigid wire, and check the fixings after the first hard freeze.'
      },
      {
        h2: 'Inside the halls, weight and glare change the answer',
        p: 'For a banner hanging inside McCormick Place, wind is irrelevant and lighting is the problem. The 9oz dye-sublimated fabric reads matte under the hall rig where vinyl bounces the light back, and it folds into a case rather than shipping as a roll — which on a floor that bills by weight and handling is worth more than the material difference.'
      }
    ],
    faqs: [
      { q: 'Which banner material handles Chicago wind best?', a: 'Mesh. Its 70/30 perforation lets roughly 30 percent of the air through rather than loading the fixings, which is what tears grommets out of a solid banner on an exposed line.' },
      { q: 'What size banner can I order?', a: 'Any size to the inch, up to 10 ft by 145 ft single sided, or 9.5 ft wide with a pole pocket. Larger is produced by welding panels together and quoted on request.' },
      { q: 'Can I get a double-sided banner with no show-through?', a: 'Yes — that is what the 18oz blockout is for. An opaque layer between two PVC faces stops light passing through, so two different prints never ghost into each other.' }
    ]
  }
];

export const getCityProductPage = (slug) => CITY_PRODUCT_PAGES.find((p) => p.slug === slug) || null;
