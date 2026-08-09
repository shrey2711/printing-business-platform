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

import { brand } from '../config/brand.js';

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
    title: 'Returns, Refunds & Reprints',
    description:
      'How Apex Trade Show handles problems with a custom canopy tent order — report within 5 business days, how defect claims work, rush charges, and how reprints are handled.',
    blocks: [
      { p: 'We want your canopy tent to arrive right. Because every tent is custom printed to order from a proof you approve, returns work differently than they would for a stock item — there is nothing generic to resend. If something is wrong with your order, tell us within five (5) business days of delivery and we will sort it out.' },
      { h: 'After you approve your proof', p: 'Your tent goes into production the moment you approve your proof. From that point the order cannot be cancelled, and it is not refundable — production has already started on a one-off, made-for-you item.' },
      { h: 'If something is wrong with your order', list: [
        `Contact us within five (5) business days of delivery — email ${brand.email} or call ${brand.phone}.`,
        'We log your issue and open a claim for your reference while we work out the best fix.',
        'We will usually ask for a few photos showing the problem so we can see what happened.',
        'If we need the tent back to inspect it, we will arrange that with you within a reasonable time. If the fault is confirmed to be ours, we cover your return shipping.'
      ] },
      { h: 'Rush charges', p: 'Rush printing and rush shipping fees are not refundable unless the tent is defective or the courier could not deliver it.' },
      { h: 'Reprints', p: 'When a reprint is the right fix, we decide between a refund or a rework and set the turnaround and shipping based on current production capacity. Reprint turnaround starts from your written proof approval — we only take written approval as final, never verbal.' },
      { h: 'A note on colour', p: 'Screen and printed colours can vary slightly. A proof is produced differently from the final press print, so it will not match the finished tent exactly — if precise colour matters, tell us in your order notes and we will confirm on the proof.' },
      { h: 'Questions', p: `Reach us any time at ${brand.email} or ${brand.phone}.` }
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
    title: 'Terms and Conditions',
    description:
      'The terms for using apextradeshow.com and ordering custom printed canopy tents — your artwork and rights, proof approval, cancellation, colour, and how we handle problems.',
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
