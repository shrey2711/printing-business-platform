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
// A block is { h?, p?, list? }: h => <h2>, p => <p>, list => <ul>.

export const PAGES = [
  {
    slug: 'about',
    nav: 'About',
    title: 'About Apex Trade Show',
    description:
      'Apex Trade Show makes custom printed pop-up canopy tents for businesses, vendors, teams and event organisers across the US and Canada, with instant online pricing and a free artwork proof.',
    blocks: [
      { p: 'Apex Trade Show is an online maker of custom printed pop-up canopy tents. We print your logo or full-colour artwork onto pop-up canopy tents in three sizes — 10×10, 10×15 and 10×20 — with up to three printed walls, and ship them across the United States and Canada.' },
      { h: 'What we do', p: 'We focus on doing one thing well: branded canopy tents. You configure the size, walls, print coverage, delivery speed and quantity on the product page and see the price update live — no quote forms or waiting on a sales rep. Every order includes a free visual proof, and nothing goes to production until you approve it.' },
      { h: 'How your tent is printed', p: 'Tents are printed with dye sublimation on 600D polyester over a heavy-duty aluminium hex frame. Dye sublimation bonds the ink into the fabric, so colours stay sharp and will not crack, peel or fade with repeated outdoor use.' },
      { h: 'How ordering works', list: [
        'Pick a size and configure walls, print and delivery — the price updates as you go.',
        'Upload your artwork or logo, or add our design service.',
        'Approve the free proof we send you.',
        'We print and ship it across the US or Canada.'
      ] },
      { h: 'Contact', p: 'Questions before you order? Email or call us — see the Contact page for details and hours.' }
    ]
  },
  {
    slug: 'artwork-guidelines',
    nav: 'Artwork Guidelines',
    title: 'Artwork Guidelines for Custom Canopy Tents',
    description:
      'How to prepare artwork for a custom printed canopy tent — accepted file types, resolution, colour, the print surfaces available, and the free proof process.',
    blocks: [
      { p: 'Good print starts with good artwork. These guidelines cover the files we accept and how to prepare them so your canopy prints crisp and on-colour. Not sure about your file? Send it anyway — we check every file at no charge and send a free proof before printing.' },
      { h: 'Accepted file formats', list: [
        'Vector (preferred): print-ready PDF, AI or EPS — these scale to tent size with no loss of quality.',
        'Raster: high-resolution PNG or JPG. Supply the largest, highest-resolution version you have.'
      ] },
      { h: 'Resolution & scale', p: 'Because a canopy is large, low-resolution images can look soft when scaled up. Vector artwork is best for logos and text. For photos or raster art, provide the highest resolution available. Our team flags anything that may not hold up before it prints.' },
      { h: 'Colour', p: 'Printing is full-colour dye sublimation. Solid brand colours, gradients, photos and full-bleed backgrounds all print. If exact brand-colour matching matters, tell us in your order notes and we will confirm on the proof.' },
      { h: 'What you can print', list: [
        'Canopy top — the roof panels.',
        'Valance — the hanging border, ideal for your business name.',
        'Walls — full or half height; each wall is its own printable surface.'
      ] },
      { h: 'No print-ready file?', p: 'Add our design service at checkout and we build the artwork for you from your logo and direction.' },
      { h: 'The proof', p: 'Every order includes a free visual proof for your approval. Nothing goes to production until you say yes.' }
    ]
  },
  {
    slug: 'shipping',
    nav: 'Shipping',
    title: 'Shipping',
    stub: true,
    description:
      'Apex Trade Show ships custom printed canopy tents across the US and Canada after proof approval. Full shipping details are being finalised — contact us for a delivery estimate.',
    blocks: [
      { p: 'We ship custom printed canopy tents across the United States and Canada. Production starts after you approve your free proof.' },
      { h: 'Production time', list: [
        'Standard production: 6–8 business days after proof approval.',
        'Rush production: 2–3 business days (available as an option at checkout).'
      ] },
      { h: 'Delivery', p: 'Full shipping details — carriers, transit times and costs by destination — are being finalised. For a delivery estimate to your city before you order, please contact us and we will confirm.' }
    ]
  },
  {
    slug: 'returns',
    nav: 'Returns',
    title: 'Returns',
    stub: true,
    description:
      'Custom printed canopy tents are made to order. Our full returns policy is being finalised — contact us with any issue and we will make it right.',
    blocks: [
      { p: 'Every canopy tent is custom printed to order from artwork you approve, so returns work differently than for off-the-shelf goods.' },
      { h: 'Our full returns policy is being finalised', p: 'We are still finalising the written returns and exchange policy for this store. In the meantime, if anything is wrong with your order — a print defect, damage in transit, or an error on our side — contact us right away and we will make it right.' }
    ]
  },
  {
    slug: 'warranty',
    nav: 'Warranty',
    title: 'Warranty',
    stub: true,
    description:
      'Apex Trade Show canopy tents are built from heavy-duty aluminium frames and dye-sublimated fabric. Full warranty terms are being finalised — contact us with any concern.',
    blocks: [
      { p: 'Our canopy tents use heavy-duty aluminium hex frames and dye-sublimated 600D polyester tops built for repeated outdoor use.' },
      { h: 'Our full warranty terms are being finalised', p: 'The written warranty terms for this store are still being finalised. If you have a concern about a frame or print defect, contact us and we will help.' }
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
    title: 'Terms of Service',
    description:
      'The basic terms for ordering custom printed canopy tents from Apex Trade Show — pricing, proof approval, custom-made goods and contact.',
    blocks: [
      { p: 'These are the basic terms for using this site and ordering from Apex Trade Show. Contact us if anything is unclear.' },
      { h: 'Pricing & payment', p: 'Prices are shown on the product pages and update live as you configure your tent. You can view pricing in USD or CAD; payment is processed securely through Stripe. Prices and product details may change without notice.' },
      { h: 'Custom-made goods', p: 'Canopy tents are printed to order from artwork you supply and approve. By approving your proof you confirm the artwork, spelling, colours and layout are correct for production.' },
      { h: 'Proof approval', p: 'Nothing is printed until you approve the free proof we send. Please review it carefully — production follows your approved proof.' },
      { h: 'Returns & warranty', p: 'See the Returns and Warranty pages. Those policies are being finalised; contact us with any issue in the meantime.' },
      { h: 'Contact', p: 'Questions about these terms? Reach us using the details on the Contact page.' }
    ]
  }
];

export const getPage = (slug) => PAGES.find((p) => p.slug === slug) || null;
