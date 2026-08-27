// Static info / trust pages (About, Artwork Guidelines, Shipping, Returns,
// Warranty, Privacy, Terms). Shared by the React InfoPage component and the
// prerenderer so crawlable HTML matches the app.
//
// RULE: no invented policy. Shipping/Returns/Warranty carry only facts that are
// actually true today (real production times, custom-print nature, contact) and
// are clearly marked as being finalised — they are stubs until the owner
// provides real terms. About / Artwork / Privacy / Terms describe the real
// business and stack.
//
// A block is { h?, p?, list?, links? }: h => <h2>, p => <p>, list => <ul>,
// links => a row of internal links ([{ label, to }]).

import { brand } from '../config/brand.js';

export const PAGES = [
  {
    slug: 'about',
    nav: 'About',
    title: 'About Apex — Trade Show Displays',
    description:
      'Apex Trade Show is a complete trade show display supplier serving the US and Canada — custom canopy tents, banner stands, backdrops, table covers and flags.',
    blocks: [
      { p: 'Apex Trade Show is a complete trade show display and event branding supplier serving the United States and Canada. We print your brand across a full booth — custom canopy tents, retractable and X-stand banner stands, step & repeat backdrops and table covers — with a free artwork proof on every order.' },
      { h: 'What we do', p: 'We help businesses, vendors, teams and event organisers show up looking professional. From one supplier you can order every branded piece of a trade show booth and have it all match, instead of piecing it together from several vendors. Canopies, banner stands, backdrops, table covers and flags all configure for instant online pricing; larger custom display types (SEG modular kits, tension fabric and pop-up displays) are quoted per order.' },
      { h: 'Why order from Apex', list: [
        'One supplier for the whole booth — canopy, banners, backdrop, table cover and flags, all printed to match from a single logo file.',
        'Instant online pricing on most products, so you see the cost as you configure size, walls and finishing — no waiting on a quote for standard items.',
        'A free artwork proof on every order — nothing prints until you approve it in writing, which protects you from surprises.',
        'Dye-sublimation printing that bonds ink into the fabric, so colours stay sharp and won’t crack, peel or fade with repeated event use.',
        'Made to order and shipped across the US and Canada, priced in USD or CAD.',
        'An in-house design service if you don’t have a print-ready file — send your logo and direction and we build the artwork.'
      ] },
      { links: [
        { label: 'Trade Show Displays', to: '/trade-show-displays' },
        { label: 'Custom Canopies', to: '/custom-canopies' },
        { label: 'Banner Stands', to: '/banner-stands' },
        { label: 'Backdrops', to: '/backdrops' },
        { label: 'Table Covers', to: '/table-covers' }
      ] },
      { h: 'Custom canopy tents — where we built our name', p: 'Canopies remain our most popular category and where Apex started. We print pop-up tents in 10×10, 10×15 and 10×20 with full or half printed walls and instant online pricing. Dye sublimation bonds the ink into 600D polyester over a heavy-duty aluminium hex frame, so colours stay sharp and will not crack, peel or fade with repeated outdoor use.' },
      { links: [{ label: 'Shop custom canopy tents', to: '/custom-canopies' }] },
      { h: 'The rest of your booth', p: 'Alongside canopies we print the displays that finish a professional booth: standard and deluxe retractable banner stands and lightweight X-stands for aisles and counters, large-format step & repeat backdrops for event photography, and pleated or stretch table covers. Send your logo once and we coordinate the whole set on-brand.' },
      { links: [
        { label: 'Banner Stands', to: '/banner-stands' },
        { label: 'Backdrops', to: '/backdrops' },
        { label: 'Table Covers', to: '/table-covers' }
      ] },
      { h: 'How we work', list: [
        'Configure any canopy, banner stand, backdrop or table cover for instant online pricing — or request a quote for bulk and non-standard orders.',
        'Upload your artwork or logo, or add our design service.',
        'Approve the free visual proof we send — nothing prints until you say yes.',
        'We print with dye sublimation and ship across the US and Canada.'
      ] },
      { h: 'Where we ship', p: 'Apex ships custom trade show displays across the United States and Canada. We are online-only — there is no storefront to visit — so you order, approve your proof, and receive your booth wherever your event is.' },
      { h: 'Contact', p: 'Questions before you order? Email or call us — see the Contact page for details and hours.' }
    ]
  },
  {
    slug: 'artwork-guidelines',
    nav: 'Artwork Guidelines',
    title: 'Artwork Guidelines for Trade Show Displays',
    description:
      'How to prepare artwork for custom printed trade show displays — accepted file types, resolution, colour and the free proof process.',
    blocks: [
      { p: 'Good print starts with good artwork. These guidelines cover the files we accept and how to prepare them so your canopy tent, banner, backdrop or table cover prints crisp and on-colour. Not sure about your file? Send it anyway — we check every file at no charge and send a free proof before printing.' },
      { h: 'Accepted file formats', list: [
        'Vector (preferred): print-ready PDF, AI or EPS — these scale to any display size with no loss of quality.',
        'Raster: high-resolution PNG or JPG. Supply the largest, highest-resolution version you have.'
      ] },
      { h: 'Resolution & scale', p: 'Trade show graphics print large, so low-resolution images can look soft when scaled up. Vector artwork is best for logos and text. For photos or raster art, provide the highest resolution available. Our team flags anything that may not hold up before it prints.' },
      { h: 'Colour', p: 'Printing is full-colour dye sublimation. Solid brand colours, gradients, photos and full-bleed backgrounds all print. If exact brand-colour matching matters, tell us in your order notes and we will confirm on the proof.' },
      { h: 'What you can print', p: 'The printable area depends on the product — a canopy tent prints on the top, valance and walls; banner stands, backdrops and table covers print across the full graphic. Each product page lists the print surfaces and finished sizes for that item.' },
      { h: 'No print-ready file?', p: 'Add our design service at checkout and we build the artwork for you from your logo and direction.' },
      { h: 'The proof', p: 'Every order includes a free visual proof for your approval. Nothing goes to production until you say yes.' },
      { links: [{ label: 'How the free artwork proof works', to: '/free-artwork-proof' }] }
    ]
  },
  {
    slug: 'free-artwork-proof',
    nav: 'Free Artwork Proof',
    title: 'Free Artwork Proof — How It Works',
    description:
      'Every Apex order includes a free artwork proof — see how proof-and-approval works: upload artwork, review the digital proof, approve in writing, then we print.',
    blocks: [
      { p: 'Every Apex Trade Show order — canopy tent, banner stand, backdrop or table cover — includes a free digital artwork proof. It is your chance to see exactly how your artwork will print before anything goes to production. Nothing is printed until you approve the proof in writing, at no extra charge.' },
      { h: 'How the free proof process works', list: [
        'Configure your product (size, options and quantity) and place your order or request a quote.',
        'Upload your print-ready artwork or logo — or add our design service and we build the artwork for you.',
        'Our team prepares and checks your artwork and lays it out on the product.',
        'We email you a digital proof showing how it will print.',
        'You review the proof carefully and reply with any changes.',
        'You give written approval — we only take written approval as final, never verbal.',
        'Production begins, and your standard production time starts from that approval.'
      ] },
      { h: 'What to check on your proof', p: 'Look over the proof closely before approving. On the proof, check:' },
      { h: '', list: [
        'Logo — the correct, current version, sharp and not stretched.',
        'Spelling — company name, taglines, phone numbers, web and email addresses.',
        'Colours — brand colours look right (tell us in notes if you need close matching).',
        'Positioning — logos and text sit where you expect on each surface.',
        'Seams — how artwork crosses panel seams on canopies and backdrops.',
        'Orientation — nothing is upside-down or mirrored.',
        'Wall placement — for canopies, artwork on the correct full or half walls.'
      ] },
      { h: 'Why approval is in writing', p: 'Written approval protects you: it confirms the exact file that goes to print, so what you receive matches what you signed off. Reprint turnaround, when needed, is measured from your written proof approval.' },
      { h: 'Production time', p: 'Standard production is 6–8 business days after you approve your proof; a 2–3 day rush is available. Shipping/transit time is additional and depends on your destination.' },
      { h: 'Ready to start?', p: 'Configure a product for instant pricing, upload your artwork, and we will send your free proof.' },
      { links: [
        { label: 'Shop all products', to: '/products' },
        { label: 'Artwork Guidelines', to: '/artwork-guidelines' },
        { label: 'Request a quote', to: '/quote' }
      ] }
    ]
  },
  {
    slug: 'shipping',
    nav: 'Shipping',
    title: 'Shipping & Delivery Times',
    description:
      'How Apex ships trade show displays across the US and Canada — production vs transit time, how your delivery date is calculated, and how rush really works.',
    blocks: [
      { p: 'We ship custom printed trade show displays — canopy tents, retractable and X-stand banner stands, step & repeat backdrops, table covers, banners and flags — across the United States and Canada. Everything is made to order: nothing is printed or shipped until you approve your free artwork proof.' },
      { h: 'Your delivery date has two parts', p: 'Because each item is printed for you, the day it arrives is made up of two separate stages — production time (printing and finishing your order) and transit time (the courier moving it from our facility to your address). Your total time to delivery is production time plus transit time. The two are separate, so it helps to plan around both.' },
      { h: 'How to estimate your arrival date', list: [
        'Start from the day you approve your proof in writing — production time is measured from approval, not from when you place the order.',
        'Add the production time shown on the product page (see below).',
        'Add transit time for the courier to reach your destination.',
        'That gives your estimated arrival. Ordering early and approving your proof quickly is the surest way to hit an event date.'
      ] },
      { h: 'Production time', p: 'Production time depends on the product, and each product page shows its own turnaround. Canopy tents and table covers are 6–8 business days standard, with a 2–3 business day rush option at checkout. Banners, banner stands, backdrops, flags and other displays show their individual lead time on the product page. Production time is counted in business days and starts when you approve your proof.' },
      { h: 'Transit time', p: 'Transit time is added after production and depends on where your order ships — a nearby destination arrives sooner than a cross-country or cross-border one. Transit time is not the same as production time: it is the courier’s delivery window once your finished order leaves our facility. When your order ships, you’ll receive tracking so you can follow it to your door.' },
      { h: 'Rush is faster production — not faster shipping', p: 'A rush option speeds up production (for example, 2–3 business days instead of 6–8 on canopy tents and table covers). It does not shorten courier transit time. If your event is close, rush production gets your order printed sooner, but you still need to allow for the courier to deliver — so factor transit into a tight deadline as well.' },
      { h: 'Where we ship', p: 'We ship across the United States and Canada, to your business, venue or hotel address. Apex is online-only — there is no storefront or will-call pickup — so every order is shipped to the address you provide at checkout. Canopy pricing is available in USD or CAD.' },
      { h: 'Shipping cost and a delivery estimate', p: 'Shipping cost depends on the destination, size and weight of your order. If you’d like a delivery estimate — production plus transit — to a specific city or by a specific event date before you order, contact us with your address and in-hands date and we’ll confirm what’s achievable.' },
      { h: 'When your order arrives', p: 'Check your order on delivery. If anything is damaged in transit or not right, tell us within five (5) business days so we can help — see our Returns, Refunds & Reprints page for how that works.' },
      { links: [
        { label: 'Returns, Refunds & Reprints', to: '/returns' },
        { label: 'How the free artwork proof works', to: '/free-artwork-proof' },
        { label: 'Request a delivery estimate', to: '/quote' }
      ] }
    ]
  },
  {
    slug: 'returns',
    nav: 'Returns',
    title: 'Returns, Refunds & Reprints',
    description:
      'How Apex Trade Show handles problems with a custom printed order — report within 5 business days, how defect claims work, rush charges, and how reprints are handled.',
    blocks: [
      { p: 'We want your order to arrive right. Because every item is custom printed to order from a proof you approve, returns work differently than they would for a stock item — there is nothing generic to resend. If something is wrong with your order, tell us within five (5) business days of delivery and we will sort it out.' },
      { h: 'After you approve your proof', p: 'Your order goes into production the moment you approve your proof. From that point the order cannot be cancelled, and it is not refundable — production has already started on a one-off, made-for-you item.' },
      { h: 'If something is wrong with your order', list: [
        `Contact us within five (5) business days of delivery — email ${brand.email} or call ${brand.phone}.`,
        'We log your issue and open a claim for your reference while we work out the best fix.',
        'We will usually ask for a few photos showing the problem so we can see what happened.',
        'If we need the item back to inspect it, we will arrange that with you within a reasonable time. If the fault is confirmed to be ours, we cover your return shipping.'
      ] },
      { h: 'Rush charges', p: 'Rush printing and rush shipping fees are not refundable unless the item is defective or the courier could not deliver it.' },
      { h: 'Reprints', p: 'When a reprint is the right fix, we decide between a refund or a rework and set the turnaround and shipping based on current production capacity. Reprint turnaround starts from your written proof approval — we only take written approval as final, never verbal.' },
      { h: 'A note on colour', p: 'Screen and printed colours can vary slightly. A proof is produced differently from the final press print, so it will not match the finished item exactly — if precise colour matters, tell us in your order notes and we will confirm on the proof.' },
      { h: 'Questions', p: `Reach us any time at ${brand.email} or ${brand.phone}.` }
    ]
  },
  {
    slug: 'warranty',
    nav: 'Warranty',
    title: 'Warranty',
    stub: true,
    description:
      'Apex Trade Show displays are built for repeated event use — aluminium hardware and dye-sublimated graphics. Full warranty terms are being finalised — contact us with any concern.',
    blocks: [
      { p: 'Our displays are built for repeated event use. Canopy tents use heavy-duty aluminium hex frames and dye-sublimated 600D polyester tops; banner stands and backdrops use aluminium hardware with replaceable dye-sublimated printed graphics.' },
      { h: 'Our full warranty terms are being finalised', p: 'The written warranty terms for this store are still being finalised. If you have a concern about a frame, hardware or print defect, contact us and we will help.' }
    ]
  },
  {
    slug: 'privacy',
    nav: 'Privacy',
    title: 'Privacy Policy',
    description:
      'How Apex Trade Show handles your information — what we collect to fulfil orders, the services we use (Stripe, Supabase), and how to reach us with privacy questions.',
    blocks: [
      { p: 'This page explains, in plain language, what information Apex Trade Show collects and why. It is a summary of our real practices — contact us with any privacy question.' },
      { h: 'What we collect', list: [
        'Account details: the email address you register with.',
        'Order details: the products you configure, your artwork files and any notes you add.',
        'Payment details: processed by our payment provider (Stripe). We do not store full card numbers.'
      ] },
      { h: 'Services we use', list: [
        'Stripe — to process payments and invoices securely.',
        'Supabase — to store your account, orders and uploaded artwork.',
        'Email — to send order confirmations, proofs and invoice links.'
      ] },
      { h: 'How we use it', p: 'We use your information only to price, produce, deliver and support your orders, and to contact you about them. We do not sell your personal information.' },
      { h: 'Contact', p: 'To ask about your data or request its deletion, contact us using the details on the Contact page.' }
    ]
  },
  {
    slug: 'terms',
    nav: 'Terms',
    title: 'Terms and Conditions',
    description:
      'The terms for using apextradeshow.com and ordering custom printed displays — your artwork and rights, proof approval, cancellation, and how we handle problems.',
    blocks: [
      { p: 'These terms cover using apextradeshow.com and ordering custom printed canopy tents from Apex Trade Show. By using the site or placing an order, you agree to them. We may update the site and these terms from time to time; the version posted here is the one that applies, and continuing to use the site means you accept it.' },
      { h: 'Your artwork and your rights', p: 'You are responsible for the artwork you send us. By placing an order you confirm that you own it or have permission to print it — including logos, images, fonts and any other third-party material — and you authorise us to print it on your tent. Please don’t send anything unlawful or offensive, or anything that infringes someone else’s trademark, copyright, privacy or publicity rights. We may decline or stop an order that breaks this.' },
      { h: 'Approving your proof', p: 'Every order includes a free proof, and nothing is printed until you approve it. We only accept written approval — never verbal. Approving your proof means you have checked the spelling, layout, artwork and colours; we are not responsible for mistakes that were present in artwork you approved, so please review it carefully.' },
      { h: 'Cancellation', p: 'Because your tent is made to order, production begins as soon as you approve your proof. After approval an order cannot be cancelled and is not refundable.' },
      { h: 'If something goes wrong', p: 'If there is a problem with your order, we will make it right. See the Returns page for how to report an issue (within five business days of delivery), how defect claims work, and how refunds and reprints are handled.' },
      { h: 'A note on colour', p: 'A proof is produced differently from the final press print, so screen and printed colours can vary slightly and a proof will not match the finished tent exactly.' },
      { h: 'Pricing and payment', p: 'Prices show on the product pages and update live as you configure your tent. You can view pricing in USD or CAD, and payment is handled securely by Stripe. Prices and product details can change without notice.' },
      { h: 'Our site content', p: 'The text, images, layouts and designs on apextradeshow.com belong to Apex Trade Show or its licensors and are provided for browsing the site and placing orders — not for copying, redistribution or any other use.' },
      { h: 'Responsibility', p: 'You agree to cover Apex Trade Show against any claim, loss or cost that arises from the artwork you supplied or from your misuse of the site — for example, a third-party claim over material you asked us to print.' },
      { h: 'Right to refuse', p: 'We may decline service or an order at our discretion.' },
      { h: 'Contact', p: `Questions about these terms? Email ${brand.email} or call ${brand.phone}.` }
    ]
  }
];

export const getPage = (slug) => PAGES.find((p) => p.slug === slug) || null;
