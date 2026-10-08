// Static info / trust pages (About, Artwork Guidelines, Shipping, Returns,
// Warranty, Privacy, Terms). Shared by the React InfoPage component and the
// prerenderer so crawlable HTML matches the app.
//
// RULE: no invented policy. Shipping/Returns/Warranty carry only facts that are
// actually true today (real production times, custom-print nature, contact) and
// the terms the owner has set (src/data/warranty.js: 5-year frames, 1 year on
// everything else, 1-year reprint guarantee, no refunds, transit damage reported
// within 3 days is reshipped). A page without real terms stays a `stub`. About / Artwork / Privacy / Terms describe the real
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
      { h: 'What we do', p: 'We help businesses, vendors, teams and event organizers show up looking professional. From one supplier you can order every branded piece of a trade show booth and have it all match, instead of piecing it together from several vendors. Canopies, banner stands, backdrops, table covers and flags all configure for instant online pricing; larger custom display types (SEG modular kits, tension fabric and pop-up displays) are quoted per order.' },
      { h: 'Why order from Apex', list: [
        'One supplier for the whole booth — canopy, banners, backdrop, table cover and flags, all printed to match from a single logo file.',
        'Instant online pricing on most products, so you see the cost as you configure size, walls and finishing — no waiting on a quote for standard items.',
        'A free artwork proof on every order — nothing prints until you approve it in writing, which protects you from surprises.',
        'Dye-sublimation printing that bonds ink into the fabric, so colors stay sharp and won’t crack, peel or fade with repeated event use.',
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
      { h: 'Custom canopy tents — where we built our name', p: 'Canopies remain our most popular category and where Apex started. We print pop-up tents in 10×10, 10×15 and 10×20 with full or half printed walls and instant online pricing. Dye sublimation bonds the ink into 600D polyester over a heavy-duty aluminum hex frame, so colors stay sharp and will not crack, peel or fade with repeated outdoor use.' },
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
      'How to prepare artwork for custom printed trade show displays — accepted file types, resolution, color and the free proof process.',
    blocks: [
      { p: 'Good print starts with good artwork. These guidelines cover the files we accept and how to prepare them so your canopy tent, banner, backdrop or table cover prints crisp and on-color. Not sure about your file? Send it anyway — we check every file at no charge and send a free proof before printing.' },
      { h: 'Accepted file formats', list: [
        'PDF or JPEG only. A PDF must be a single page — one artwork per file.',
        'Maximum file size 300MB.',
        'Working files (AI, EPS, PSD, INDD) need exporting first — export to PDF with fonts outlined.',
        'You can also email artwork to us if you would rather not upload it.'
      ] },
      { h: 'Color', list: [
        'Build in CMYK. Convert Pantone and other spot colors to CMYK before sending — an unconverted spot color prints as whatever it converts to, which may not be the shade you expect.',
        'Printing is full-color dye sublimation: solid brand colors, gradients, photos and full-bleed backgrounds all print.',
        'If exact brand-color matching matters, say so in your order notes and we will confirm on the proof.'
      ] },
      { h: 'Resolution', p: '150dpi at the finished size is ample for large format. Trade show graphics are viewed from a distance, so higher resolution mostly adds file size rather than visible quality. Below 150dpi, raster images can look soft once scaled up — we flag anything that may not hold before it prints.' },
      { h: 'Size, bleed and crop marks', list: [
        'Build artwork to the size you ordered. Scaled artwork is detected and fitted automatically, but building to size gives the most predictable result.',
        'Do not add bleed, and do not include crop marks — they are not needed for these products and end up printed or trimmed into.',
        'Convert live fonts to outlines so text cannot reflow or substitute.',
        'Use the provided design template for your product where one exists.'
      ] },
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
        'Colors — brand colors look right (tell us in notes if you need close matching).',
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
      { h: 'When your order arrives', p: 'Check your order on delivery. If anything is damaged in transit, tell us within three (3) days of delivery and we will reship it — see our Returns, Reprints & Reships page for how that works.' },
      { links: [
        { label: 'Returns, Reprints & Reships', to: '/returns' },
        { label: 'How the free artwork proof works', to: '/free-artwork-proof' },
        { label: 'Request a delivery estimate', to: '/quote' }
      ] }
    ]
  },
  {
    slug: 'returns',
    nav: 'Returns',
    title: 'Returns, Reprints & Reships',
    description:
      'Report transit damage within 3 days for a reship. Print defects get a free reprint for 1 year. How Apex handles problems with a custom printed order; no refunds.',
    blocks: [
      { p: 'We want your order to arrive right. Because every item is custom printed to order from a proof you approve, returns work differently than they would for a stock item — there is nothing generic to resend. If something is wrong, we fix it by reshipping or reprinting. We do not offer refunds.' },
      { h: 'After you approve your proof', p: 'Your order goes into production the moment you approve your proof. From that point the order cannot be canceled, and it is not refundable — production has already started on a one-off, made-for-you item.' },
      { h: 'Damaged in transit: tell us within 3 days', list: [
        `Contact us within three (3) days of delivery — email ${brand.email} or call ${brand.phone}.`,
        'Send your order number and a few photos of the damage, including the packaging.',
        'If the damage happened in transit, we reship the item.',
        'Damage reported after three days is not covered by the reship.'
      ] },
      { h: 'Print defects: a free reprint for 1 year', p: 'If an item has a printing defect — for example, wrong colors against the approved proof, banding or missing print — we reprint it at no charge. The reprint guarantee lasts one (1) year from delivery. Contact us with your order number and photos, and we may ask for the item back to inspect it.' },
      { h: 'What we do not do', p: 'We do not refund orders. The remedy for a confirmed problem is a reship or a reprint. Rush printing and rush shipping fees are not refundable.' },
      { h: 'Reprints', p: 'Reprint turnaround starts from your written proof approval — we only take written approval as final, never verbal. Production time and shipping for the reprint are confirmed when we accept the claim.' },
      { h: 'A note on color', p: 'Screen and printed colors can vary slightly. A proof is produced differently from the final press print, so it will not match the finished item exactly — if precise color matters, tell us in your order notes and we will confirm on the proof.' },
      { h: 'Frames and hardware', p: 'For a faulty frame or other hardware, see our Warranty page.' },
      { links: [{ label: 'Warranty', to: '/warranty' }] },
      { h: 'Questions', p: `Reach us any time at ${brand.email} or ${brand.phone}.` }
    ]
  },
  {
    slug: 'warranty',
    nav: 'Warranty',
    title: 'Limited Warranty',
    description:
      'Apex warranty: 5 years on frames, 1 year on everything else, a 1-year reprint guarantee for print defects, a reship for transit damage reported in 3 days.',
    blocks: [
      { p: 'Our displays are built for repeated event use. This page sets out what we warrant, for how long, and what we do when something is wrong. It is a limited warranty: it covers defects in materials and workmanship, not every kind of damage.' },
      { h: 'How long each part is covered', list: [
        'Frames — 5 years. This covers the frame of canopy tents, banner stands, tension fabric and step & repeat backdrops, SEG modular kits and A-frame signs.',
        'Everything else — 1 year. This covers printed graphics and fabrics, flags, signs, table covers and runners, lanyards, wristbands, print collateral, channel letters, and parts other than the frame, including LEDs and electrical components.',
        'We do not offer lifetime warranties.'
      ] },
      { h: 'Print defects: a free reprint for 1 year', p: 'If an item has a printing defect, we reprint it at no charge. The reprint guarantee lasts one (1) year from delivery. We do not offer refunds — a confirmed problem is fixed by a reprint or a reship.' },
      { h: 'Damaged in transit: tell us within 3 days', p: 'If an order arrives damaged, contact us within three (3) days of delivery with your order number and photos, and we reship it. Damage reported after three days is not covered by the reship.' },
      { h: 'What is not covered', list: [
        'Wind, storm and weather damage — canopies and signs should be staked, weighted or taken down in strong wind.',
        'Misuse, accidents and normal wear and tear.',
        'Fading from long exposure to sunlight.',
        'Mistakes in artwork that you approved on the proof.',
        'Changes or repairs made by anyone other than Apex.',
        'Installation and electrical hookup. Illuminated signs must be connected by a licensed electrician.'
      ] },
      { h: 'How to make a claim', list: [
        `Email ${brand.email} or call ${brand.phone}.`,
        'Give your order number and a few clear photos of the problem.',
        'We may ask for the item back to inspect it. If the fault is confirmed to be ours, we cover the return shipping.'
      ] },
      { p: 'This warranty gives you specific legal rights, and you may also have other rights that vary by state or province.' },
      { links: [
        { label: 'Returns, Reprints & Reships', to: '/returns' },
        { label: 'Shipping', to: '/shipping' }
      ] }
    ]
  },
  {
    slug: 'privacy',
    nav: 'Privacy',
    title: 'Privacy Policy',
    description:
      'How Apex handles your information — what we collect to fulfil orders, the services we use (Stripe, Supabase), and how to reach us with privacy questions.',
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
    title: 'Terms & Conditions',
    description:
      'Apex Trade Show Terms & Conditions — orders, quotations, payment, artwork and proof approval, cancellation, returns, shipping, liability and more.',
    blocks: [
      { p: 'Welcome to Apex Trade Show (“Apex Trade Show,” “Apex,” “we,” “us,” or “our”). These Terms & Conditions (“Terms”) govern your access to and use of the Apex Trade Show website, as well as your purchase of products and services through our website, quotations, proposals, email, telephone, or other sales channels.' },
      { p: 'Apex Trade Show provides trade-show, event, display, printing, fabrication, rental, installation, shipping, and related products and services.' },
      { p: 'By accessing our website, creating an account, requesting a quotation, placing an order, making a payment, approving artwork or a design, or otherwise engaging our services, you acknowledge that you have read, understood, and agreed to these Terms.' },
      { p: 'Apex Trade Show may update or modify these Terms from time to time by posting revised Terms on this website. Updated Terms will apply to transactions entered into after the revised Terms are posted, unless otherwise required by applicable law.' },

      { h: '1. Scope of Products & Services', p: 'Apex Trade Show may provide, without limitation:' },
      { list: [
        'Trade-show booths and exhibits', 'Custom booth design and fabrication', 'Modular and portable displays',
        'Backdrops and step-and-repeat displays', 'Custom canopies and tents', 'Banners and signage', 'Printed graphics',
        'Event displays and accessories', 'Tables, counters and furniture', 'Rental displays and equipment', 'Printing services',
        'Installation and dismantling', 'Shipping and delivery coordination', 'Trade-show logistics', 'Event and convention services',
        'Other custom products and services described in an applicable quotation or order'
      ] },
      { p: 'The specific products, quantities, specifications, materials, services, pricing and delivery requirements applicable to an order will be stated in the applicable product page, quotation, proposal, invoice, order confirmation, statement of work, or other written agreement.' },

      { h: '2. Website Use & Eligibility', p: 'You may use the Apex Trade Show website only for lawful purposes and in accordance with these Terms. You agree not to use the website or our services to:' },
      { list: [
        'Violate any applicable law or regulation', 'Infringe another person’s intellectual-property rights',
        'Upload malicious software or code', 'Interfere with website functionality or security',
        'Attempt unauthorized access to our systems', 'Collect or misuse another customer’s information',
        'Impersonate another person or business', 'Submit fraudulent or misleading information',
        'Use the website for unlawful, defamatory, threatening, obscene or otherwise prohibited activities'
      ] },
      { p: 'Apex Trade Show reserves the right to suspend or terminate access to the website or services where we reasonably believe these Terms have been violated.' },

      { h: '3. Customer Information & Accounts', p: 'Where an account is required or offered, customers agree to provide accurate, current and complete information. Customers are responsible for maintaining the confidentiality of their login credentials and for activity conducted through their account. Customers should promptly notify Apex Trade Show if they believe their account or credentials have been compromised. Apex Trade Show is not responsible for losses arising from unauthorized use of an account where such unauthorized use results from the customer’s failure to protect their credentials, except where otherwise required by applicable law.' },

      { h: '4. Electronic Communications', p: 'By communicating with Apex Trade Show electronically, including by email, website forms, online ordering systems or other electronic methods, you consent to receiving electronic communications relating to your orders, quotations, proofs, invoices, payments, shipping, installation, customer service and other transactions. Electronic communications may satisfy applicable requirements for communications to be provided in writing, except where applicable law requires another form. Customers are responsible for ensuring that their contact information remains accurate and current. Marketing communications will be handled in accordance with applicable privacy and electronic-marketing laws.' },

      { h: '5. Quotations & Pricing', p: 'Quotations are based on the information, specifications and requirements available to Apex Trade Show at the time the quotation is prepared. Unless otherwise stated:' },
      { list: [
        'Quotations are valid only for the period specified in the quotation.',
        'Prices may change if specifications, quantities, materials, artwork, design, shipping, installation or other requirements change.',
        'Additional work requested after quotation or approval may result in additional charges.',
        'Taxes and applicable government charges are additional unless specifically included.',
        'Trade-show venue, show-management, union, drayage, material-handling, electrical, internet, rigging, cleaning, security, storage, overtime, marshaling, permits and other third-party charges are excluded unless specifically stated in writing.'
      ] },
      { p: 'Apex Trade Show reserves the right to correct typographical, pricing, product-description or other errors. Where an error materially affects an order, Apex Trade Show may contact the customer to correct the order or cancel the affected order and refund amounts paid for the cancelled portion.' },

      { h: '6. Order Acceptance', p: 'An order becomes binding when: (1) Apex Trade Show accepts the order; and/or (2) the required deposit or payment has been received; and/or (3) the customer provides written authorization to proceed. Apex Trade Show reserves the right to require a deposit, partial payment or payment in full before production, procurement or service commencement. For custom projects, the applicable quotation, proposal, invoice and approved scope will form part of the agreement between the customer and Apex Trade Show.' },

      { h: '7. Payment Policy', p: 'Customers agree to pay all amounts according to the payment terms stated in the applicable quotation, invoice or order. For online orders, payment must be made using an available payment method accepted by Apex Trade Show or its payment processor. Payment processing may be performed by third-party payment providers. Apex Trade Show is not responsible for delays, errors, outages or unauthorized activity caused solely by third-party payment processors, financial institutions or payment networks. Apex Trade Show reserves the right to suspend production, shipment, installation or other services where payment is overdue. Unless otherwise agreed in writing, Apex Trade Show may require payment in full before shipment, delivery or installation.' },

      { h: '8. Payment Disputes & Chargebacks', p: 'Customers agree to contact Apex Trade Show promptly regarding legitimate billing or payment concerns and provide an opportunity to investigate and resolve the issue. Customers shall not initiate an improper, fraudulent or unauthorized chargeback for products or services that were properly ordered, approved, produced, delivered or performed. In the event of a payment dispute or chargeback, Apex Trade Show may provide relevant order records, invoices, approvals, communications, production records, delivery records and other documentation to the applicable payment processor or financial institution. Nothing in this section limits a customer’s rights under applicable consumer-protection or other applicable law.' },

      { h: '9. Standard E-Commerce Products', p: 'Standard e-commerce products are products offered through the website with predefined specifications, options or configurations. The applicable product page and order confirmation will govern the specifications of the purchased product. Product images shown on the website are intended for illustration. Minor differences in color, texture, finish, scale or appearance may occur due to manufacturing processes, materials, lighting and screen settings. Where a product is customized with customer artwork, text, dimensions or specifications, it may be treated as a Custom Product for purposes of cancellation and returns.' },

      { h: '10. Custom Products & Custom Quotations', p: 'Custom products and services include products or services specifically designed, configured, printed, fabricated, purchased, modified or produced for a customer. Examples include:' },
      { list: [
        'Custom trade-show booths', 'Custom exhibits', 'Custom canopies', 'Custom backdrops', 'Custom graphics',
        'Custom signage', 'Custom printing', 'Custom fabrication', 'Custom furniture or structures',
        'Custom rental configurations', 'Custom installation services'
      ] },
      { p: 'Because custom products may involve advance procurement of materials, design, fabrication, printing, labour and subcontractor commitments, they may not be eligible for cancellation or return once work has commenced.' },

      { h: '11. Design, Artwork & Proof Approval', p: 'Where Apex Trade Show provides designs, renderings, layouts, drawings, artwork or proofs, the customer is responsible for reviewing all details before approval. Customers must carefully verify dimensions, quantities, spelling, text, logos, images, colors, fonts, product specifications, graphic placement, booth configuration, structural details, delivery information and installation requirements. Written approval may be required before production begins. Once the customer approves a design, proof or specification in writing, Apex Trade Show may proceed with production based on the approved version. Apex Trade Show is not responsible for errors contained in customer-approved artwork, designs, proofs or specifications.' },

      { h: '12. Customer-Supplied Artwork', p: 'Customers retain ownership of artwork, logos, photographs, trademarks and other intellectual property they provide to Apex Trade Show. By submitting such materials, the customer represents and warrants that they have all necessary rights, licenses and permissions to reproduce and use the materials. The customer grants Apex Trade Show a non-exclusive, worldwide, royalty-free license to copy, reproduce, modify as reasonably necessary, print, manufacture, display and distribute the submitted materials solely as necessary to fulfill the customer’s order and provide the requested services. The customer remains solely responsible for obtaining permissions relating to third-party content.' },

      { h: '13. Intellectual Property', p: 'All original designs, concepts, layouts, renderings, templates, graphics, photographs, written materials, production methods and other intellectual property created by Apex Trade Show remain the property of Apex Trade Show unless otherwise agreed in writing. Payment for a finished product does not automatically transfer ownership of Apex Trade Show’s underlying design concepts, templates, production files or proprietary processes. Customer-owned trademarks, logos and other intellectual property remain the property of the customer or their respective owners.' },

      { h: '14. Design Proofing & Customer Errors', p: 'Apex Trade Show does not automatically proofread customer-supplied artwork for spelling, grammar, factual accuracy or other content errors. Customers are responsible for reviewing their artwork before submitting or approving it. If the customer elects to proceed without proof approval, Apex Trade Show will produce the order based on the files and specifications provided by the customer. Apex Trade Show is not responsible for errors that were present in customer-supplied or customer-approved materials.' },

      { h: '15. Color Matching', p: 'Customers acknowledge that colors displayed on computer monitors, phones, tablets and other devices may differ from the final printed product. Digital screens generally use RGB color systems, while printing processes use different color systems, inks and production methods. Accordingly, exact color matching between a screen, digital proof and final printed product cannot always be guaranteed. Minor color variations that result from normal production processes will not normally be considered manufacturing defects. Where exact color matching is critical, customers should discuss available color-matching options with Apex Trade Show before placing the order.' },

      { h: '16. Materials & Product Specifications', p: 'Apex Trade Show may use a variety of materials depending on the product, including fabrics, vinyl, PVC, mesh, plastics, aluminum, wood-based materials, acrylics, cardboard, hardware and other substrates. Customers are responsible for reviewing the product specifications and material information provided with the product or quotation. Unless otherwise stated in writing, Apex Trade Show guarantees that the product will be manufactured using the material or specification represented in the applicable product description or quotation. Minor variations in texture, finish, grain, thickness or appearance may occur between production batches.' },

      { h: '17. Production', p: 'Apex Trade Show may use its own production facilities, contractors, suppliers, manufacturers or specialized production partners to fulfill an order. The location or specific facility where an individual product is manufactured may vary depending on product requirements, availability, capacity and logistics. Apex Trade Show remains responsible for coordinating the products and services that it has agreed to provide to the customer.' },

      { h: '18. Production & Delivery Times', p: 'Any production or delivery dates provided by Apex Trade Show are estimates unless expressly guaranteed in writing. Production time generally begins after all required information, artwork, payment and final approvals have been received. Estimated delivery dates may be affected by:' },
      { list: [
        'Customer delays', 'Design revisions', 'Late approvals', 'Shipping delays', 'Carrier performance', 'Weather',
        'Customs', 'Supply-chain disruptions', 'Material availability', 'Venue restrictions', 'Show-management requirements',
        'Labour availability', 'Other circumstances outside Apex Trade Show’s reasonable control'
      ] },
      { p: 'For trade-show orders, customers are responsible for providing the event name, venue, booth number, move-in/move-out information and other relevant deadlines accurately and in a timely manner.' },

      { h: '19. Rush Orders', p: 'Rush or expedited orders may be accepted subject to production capacity. Additional rush production, expedited shipping, overtime, special handling or other charges may apply. Apex Trade Show will make reasonable efforts to accommodate urgent requirements but does not guarantee a requested deadline unless the deadline has been expressly confirmed in writing.' },

      { h: '20. Shipping & Delivery', p: 'Shipping charges are separate unless specifically included in the applicable quotation or product price. Where Apex Trade Show arranges shipping through a third-party carrier, delivery times are subject to carrier performance. Apex Trade Show is not responsible for carrier delays, missed delivery windows, lost shipments or damage caused by a carrier, except to the extent required by applicable law or where otherwise expressly agreed. Customers must provide accurate shipping information and promptly notify Apex Trade Show of any delivery issues. Customers should inspect shipments promptly upon receipt and document visible damage.' },

      { h: '21. Trade-Show & Venue Charges', p: 'Unless specifically included in writing, the customer is responsible for charges imposed by trade-show organizers, convention centres, venues, unions, general contractors or other third parties. Such charges may include:' },
      { list: [
        'Drayage', 'Material handling', 'Advance warehouse fees', 'Direct-to-show fees', 'Marshaling', 'Forklift services',
        'Electrical services', 'Internet', 'Rigging', 'Cleaning', 'Security', 'Storage', 'Overtime', 'Union labour',
        'Permits', 'Fire-retardant certification', 'Other venue or show-management services'
      ] },
      { p: 'Apex Trade Show is not responsible for charges that were not included in the agreed quotation.' },

      { h: '22. Installation & Dismantling', p: 'Installation and dismantling services are included only when expressly stated in the applicable quotation or agreement. Customers must provide accurate information regarding show dates, venue, booth number, booth size, move-in schedule, move-out schedule, venue requirements and show-management requirements. Customer-requested changes at the show site may result in additional charges. Installation schedules may be affected by venue access, union rules, material handling, labour availability and show-management requirements.' },

      { h: '23. Cancellation Policy', p: 'Cancellation rights depend on the nature and stage of the order.' },
      { p: 'Standard E-Commerce Products: Cancellation requests for standard products will be considered only if the order has not entered production or fulfillment. Once production, printing, customization or fulfillment has commenced, cancellation may not be possible.' },
      { p: 'Custom Products & Services: Custom orders may not be cancelled once design approval, production authorization, procurement, fabrication, printing, labour booking or other project work has commenced. If Apex Trade Show agrees to a cancellation after work has commenced, the customer may be responsible for all costs incurred up to the cancellation date, including:' },
      { list: [
        'Design fees', 'Materials', 'Labour', 'Printing', 'Fabrication', 'Subcontractor charges', 'Rental commitments',
        'Shipping', 'Storage', 'Installation costs', 'Other non-recoverable expenses'
      ] },
      { p: 'Deposits and payments may be non-refundable to the extent they relate to work already performed or costs already incurred.' },

      { h: '24. Returns, Reprints & Reships', p: 'Apex Trade Show aims to provide products free from manufacturing defects. Damage in transit must be reported within three (3) days of delivery, and we will reship the affected item. Printing defects are covered by a reprint guarantee for one (1) year from delivery, and defects in materials and workmanship by the limited warranty on our Warranty page (5 years on frames, 1 year on everything else). Customers may be required to provide photographs, videos or other information to assist with evaluation. Apex Trade Show may require defective products to be returned for inspection. Where Apex Trade Show determines that a product contains a defect attributable to Apex Trade Show, we will, at our discretion:' },
      { list: [
        'Repair the product', 'Replace the product', 'Reprint the affected product', 'Reship the affected product'
      ] },
      { p: 'Apex Trade Show does not offer refunds. Custom products are not returnable because the customer changes their mind, changes their requirements or is dissatisfied with customer-approved artwork or specifications.' },

      { h: '25. Manufacturing Defects', p: 'A manufacturing defect does not include:' },
      { list: [
        'Normal wear and tear', 'Improper use', 'Accidental damage', 'Damage caused after delivery', 'Customer modifications',
        'Failure to follow care instructions', 'Customer-supplied artwork errors', 'Customer-approved design errors',
        'Normal color variation', 'Variations inherent to the selected material', 'Damage caused by improper installation by others',
        'Damage caused by venue personnel or third parties'
      ] },
      { p: 'The determination of whether an issue constitutes a manufacturing defect will be made by Apex Trade Show based on reasonable inspection and available evidence, subject to applicable law.' },

      { h: '26. Product Suitability', p: 'Customers are responsible for determining whether a product is suitable for their intended application, environment, venue and use. Unless expressly stated in writing, Apex Trade Show does not guarantee that a product will satisfy a particular application, venue requirement, structural requirement or regulatory requirement. Customers should verify applicable venue, building, fire, electrical, safety, signage and other requirements before ordering.' },

      { h: '27. Safety & Regulatory Requirements', p: 'Customers are responsible for identifying and complying with applicable laws, regulations, venue requirements and safety standards relating to the intended use of products. Where a product is used as a safety sign, warning sign, regulatory sign or other compliance-related product, the customer is responsible for determining the appropriate wording, design, material, placement and applicable regulatory requirements. Apex Trade Show does not provide legal or regulatory advice unless expressly agreed in writing.' },

      { h: '28. Storage', p: 'Where Apex Trade Show agrees to store customer products, displays, graphics or other property, storage fees may apply. Customers are responsible for providing timely instructions for shipment, pickup, delivery or future use. Long-term storage may be subject to separate terms and charges.' },

      { h: '29. Customer Property', p: 'Where customers provide physical products, samples, equipment, artwork or other property to Apex Trade Show, customers remain responsible for maintaining appropriate insurance coverage unless otherwise agreed. Apex Trade Show will exercise reasonable care while such property is in our possession, subject to applicable law.' },

      { h: '30. Website Content & Copyright', p: 'The Apex Trade Show website contains content including photographs, graphics, designs, text, layouts, illustrations, logos, trademarks, software and other materials. Unless otherwise stated, such content is owned by or licensed to Apex Trade Show. Website content may not be copied, reproduced, distributed, modified, published or commercially exploited without prior written permission. Limited access to the website is provided solely for evaluating and purchasing Apex Trade Show products and services.' },

      { h: '31. Third-Party Services', p: 'Apex Trade Show may use third-party suppliers, carriers, payment processors, manufacturers, installers, venues and other service providers. Third-party services may be subject to their own terms and conditions. Apex Trade Show will make reasonable efforts to coordinate third-party services that are part of an order but is not responsible for failures caused solely by third parties beyond our reasonable control, except where otherwise required by applicable law.' },

      { h: '32. Disclaimer', p: 'To the maximum extent permitted by applicable law, the Apex Trade Show website and its content are provided on an “as available” basis. Apex Trade Show does not guarantee that the website will always be uninterrupted, error-free, secure or available. Information, images, product representations and estimated delivery dates on the website are provided for general information and may be updated or corrected from time to time. Product-specific commitments are governed by the applicable quotation, order confirmation or agreement.' },

      { h: '33. Limitation of Liability', p: 'To the maximum extent permitted by applicable law, Apex Trade Show shall not be liable for indirect, incidental, special, consequential or punitive damages, including loss of profits, loss of business, loss of opportunity, loss of goodwill or similar losses arising from the use of the website, products or services. Except where liability cannot legally be limited, Apex Trade Show’s total liability arising from a particular order or service shall not exceed the amount actually paid by the customer for the specific product or service giving rise to the claim. Nothing in these Terms is intended to exclude or limit liability that cannot legally be excluded or limited.' },

      { h: '34. Indemnification', p: 'The customer agrees to indemnify, defend and hold harmless Apex Trade Show, its owners, employees, contractors, affiliates, suppliers and service providers from claims, losses, liabilities, damages, costs and reasonable expenses arising from:' },
      { list: [
        'The customer’s breach of these Terms', 'Customer-supplied artwork or content', 'Unauthorized use of third-party intellectual property',
        'Customer’s products or promotional claims', 'Customer’s misuse of products', 'Customer’s violation of applicable laws or regulations',
        'Customer’s violation of venue or event requirements', 'Claims arising from materials or instructions supplied by the customer'
      ] },
      { p: 'This provision applies to the extent permitted by applicable law.' },

      { h: '35. Force Majeure', p: 'Apex Trade Show shall not be responsible for delay, failure or inability to perform caused by circumstances beyond our reasonable control, including acts of God, severe weather, fire, flood, natural disasters, epidemics or pandemics, war, terrorism, government actions, labour disputes, labour shortages, supply-chain disruptions, material shortages, transportation disruptions, customs delays, carrier delays, venue closures, show cancellation or postponement, power or internet failures, equipment failures, and other circumstances beyond our reasonable control. Apex Trade Show will make reasonable efforts to minimize the effects of such events.' },

      { h: '36. Suspension & Termination', p: 'Apex Trade Show may suspend or terminate access to its website or services where a customer violates these Terms, fails to make required payments, provides fraudulent information, uses the website unlawfully, attempts to interfere with our systems, engages in abusive or threatening conduct, or otherwise creates a material risk to Apex Trade Show or third parties. Termination does not affect rights or obligations that arose before termination.' },

      { h: '37. Taxes', p: 'Customers are responsible for applicable sales taxes, use taxes, duties, customs charges and other governmental fees unless expressly included in the applicable price or quotation. Where required by law, Apex Trade Show may collect applicable taxes at checkout or invoice.' },

      { h: '38. Privacy', p: 'Apex Trade Show’s collection and use of personal information is governed by our Privacy Policy. Customers should review the Privacy Policy for information regarding how personal information is collected, used, stored and protected.' },
      { links: [{ label: 'Privacy Policy', to: '/privacy' }] },

      { h: '39. Governing Law', p: 'These Terms shall be governed by the laws applicable to the Apex Trade Show contracting entity and the jurisdiction specified in the applicable quotation, invoice or written agreement. Where no separate jurisdiction is specified, the applicable governing law and venue shall be determined based on the legal entity contracting with the customer and applicable law.' },

      { h: '40. Dispute Resolution', p: 'Apex Trade Show encourages customers to first contact us directly to resolve any dispute or concern. If a dispute cannot be resolved informally, the parties may pursue the remedies available under applicable law. Nothing in these Terms prevents a customer from exercising rights that cannot lawfully be waived or restricted.' },

      { h: '41. Severability', p: 'If any provision of these Terms is determined to be invalid, void or unenforceable, that provision shall be interpreted or limited to the minimum extent necessary, and the remaining provisions shall continue in full force and effect to the extent permitted by law.' },

      { h: '42. Waiver', p: 'A failure or delay by Apex Trade Show to enforce any provision of these Terms shall not constitute a waiver of our right to enforce that provision or any other provision in the future.' },

      { h: '43. Entire Agreement', p: 'These Terms, together with the applicable quotation, proposal, invoice, order confirmation, statement of work and other written agreements expressly incorporated into the transaction, constitute the agreement between Apex Trade Show and the customer regarding the applicable products and services. If a separately signed written agreement conflicts with these Terms, the signed agreement will govern to the extent of the conflict.' },

      { h: '44. Survival', p: 'Any provisions that by their nature are intended to survive termination or completion of an order shall remain in effect, including provisions relating to payment obligations, intellectual property, customer representations, indemnification, limitation of liability, dispute resolution and other applicable obligations.' },

      { h: '45. Changes to These Terms', p: 'Apex Trade Show may update these Terms from time to time by posting an updated version on its website. Changes will generally apply to orders placed after the revised Terms become effective. The Terms applicable to an existing order will generally be those in effect when the order was accepted, unless otherwise required by law or agreed in writing.' },

      { h: '46. Contact Information', p: `Apex Trade Show — Website: apextradeshow.com · Email: ${brand.email} · Phone: ${brand.phone}.` }
    ]
  }
];

export const getPage = (slug) => PAGES.find((p) => p.slug === slug) || null;
