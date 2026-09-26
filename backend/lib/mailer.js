// Transactional email via SMTP (Brevo/SES/…) or Resend, with branded,
// table-based HTML templates. No-ops safely when neither is configured.
import nodemailer from 'nodemailer';
import { trackingUrl, carrierName, isAggregateLink } from '../../src/lib/tracking.js';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
// EMAIL_FROM must use a domain you've verified in Resend. For quick testing,
// "onboarding@resend.dev" only delivers to your own Resend account email.
const EMAIL_FROM = process.env.EMAIL_FROM || 'Apex Trade Show <onboarding@resend.dev>';
const BRAND = process.env.BRAND_NAME || 'Apex Trade Show';
const SITE_URL = (process.env.PUBLIC_BASE_URL || 'https://www.apextradeshow.com').replace(/\/$/, '');
const DEFAULT_APP_URL = SITE_URL;
// PNG (not webp) so it renders in Outlook and every email client.
const LOGO_URL = `${SITE_URL}/images/logo.png`;
// Embed the logo inline (Content-ID) rather than hot-linking it, so it still
// renders when a client blocks remote images (the usual cause of a broken logo).
const LOGO_CID = 'apexlogo';
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'info@apextradeshow.com';
const CONTACT_PHONE = process.env.CONTACT_PHONE || '+1 672-514-7587';
const CONTACT_PHONE_HREF = `tel:${(process.env.CONTACT_PHONE_HREF || CONTACT_PHONE).replace(/[^+\d]/g, '')}`;
const CONTACT_HOURS = process.env.CONTACT_HOURS || 'Mon–Fri, 8am–6pm ET';

// --- Brand palette (official brand colors) -------------------------------
// Navy and red are the official brand colours, used exactly as given. The rest
// is support, deliberately narrow: one paper tint behind data, one hairline,
// and a status set that has to read as meaning rather than as decoration.
const C = {
  navy: '#0b1f4d',    // brand navy — the docket head, headings, primary action
  red: '#ED1C24',     // brand red (C0 M100 Y100 K0) — the rule under the logo
  ink: '#141b2e',     // body copy
  muted: '#69738a',   // labels and captions
  line: '#dfe4ee',    // hairlines
  stock: '#f7f9fc',   // the paper stock data sits on
  bg: '#eceff5',      // the desk the ticket sits on
  green: '#1a7a4a',
  greenBg: '#e8f5ee',
  amber: '#8a5200',
  amberBg: '#fff4e2',
  blue: '#1f6fd0',
  blueBg: '#e9f2fd'
};

// Two voices, and the whole design rests on keeping them apart.
//
// Sans is for anything written to a person. Mono is for anything read off a
// job ticket — order numbers, quantities, specifications, tracking, money. A
// print shop reads dockets in mono, and at a glance it stops data being
// mistaken for prose. Web fonts do not load in Outlook or Gmail's desktop
// client, so the personality has to come from the pairing and the structure,
// not from a typeface nobody will receive.
const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const MONO = "ui-monospace,SFMono-Regular,Menlo,Consolas,'Liberation Mono','Courier New',monospace";

// Defined here rather than beside the quote templates because every block
// below escapes what it renders. Order details come from a configurator and a
// checkout form, and they are interpolated straight into HTML.
const esc = (s) =>
  String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const STEPS = ['submitted', 'paid', 'proof_ready', 'proof_approved', 'in_production', 'shipped'];
const STEP_LABEL = {
  submitted: 'Submitted',
  paid: 'Paid',
  proof_ready: 'Proof sent',
  proof_approved: 'Approved',
  in_production: 'In production',
  shipped: 'Shipped'
};

const STATUS_META = {
  submitted: {
    color: C.blue,
    subject: 'received',
    heading: "We've received your order 🎉",
    body: "Thanks for your order! Our team is reviewing your details and artwork. We'll email you as soon as it moves forward."
  },
  paid: {
    color: C.green,
    subject: 'is paid — thank you!',
    heading: 'Payment received — thank you! ✅',
    body: "Your payment has been confirmed and your order is queued for production. We'll let you know when printing begins."
  },
  proof_ready: {
    color: C.amber,
    subject: '— your artwork proof is ready 📐',
    heading: 'Your artwork proof is ready to review',
    body:
      'We have prepared a visual proof of your canopy. Please check the spelling, colors and logo ' +
      'placement carefully, then approve it in your account. Nothing goes to production until you do.'
  },
  proof_approved: {
    color: C.blue,
    subject: '— proof approved ✅',
    heading: 'Thanks — your proof is approved',
    body: 'Your artwork is approved and your order is now queued for production.'
  },
  in_production: {
    color: C.amber,
    subject: 'is in production 🖨️',
    heading: 'Your order is in production',
    body: "Good news — our team has started printing your order. We'll email you the moment it ships."
  },
  shipped: {
    color: C.green,
    subject: 'has shipped 🚚',
    heading: 'Your order is on its way! 🚚',
    body: 'Your order has shipped and is heading to you. Thanks for choosing us!'
  },
  canceled: {
    color: C.red,
    subject: 'has been canceled',
    heading: 'Your order has been canceled',
    body: 'Your order has been canceled. If this was unexpected or you have questions, just reply to this email.'
  }
};

const shortId = (id) => `#${String(id).slice(0, 8)}`;
// `amount_total` is stored in the currency it was charged in, so label it
// explicitly rather than assuming dollars — CA$ and US$ both render as "$".
const money = (n, code = 'USD') => `${code} ${Number(n).toFixed(2)}`;

// Fetch the logo once and cache it, so send() can attach it inline (CID). If the
// fetch fails we fall back to the hot-linked URL, so the logo is never worse off.
let logoPromise = null;
function getLogoAttachment() {
  if (!logoPromise) {
    logoPromise = (async () => {
      try {
        const res = await fetch(LOGO_URL);
        if (!res.ok) return null;
        return { filename: 'logo.png', buffer: Buffer.from(await res.arrayBuffer()), cid: LOGO_CID, contentType: 'image/png' };
      } catch {
        return null;
      }
    })();
  }
  return logoPromise;
}

// --- Building blocks ------------------------------------------------------
// The layout is a print job ticket: a docket head saying what is being made, a
// band saying what is blocking it, and the specification set the way a print
// job is actually specified. Everything is a table, because that is the only
// layout primitive Outlook's Word rendering engine can be trusted with.

function header() {
  // `cid:` resolves to the inline attachment added in send(); email clients that
  // block remote images still show it. src falls back to the URL if not inlined.
  return `
  <tr><td align="center" style="background:#ffffff;padding:24px 28px 18px;text-align:center;">
    <a href="${SITE_URL}" style="text-decoration:none;">
      <img src="cid:${LOGO_CID}" alt="${BRAND}" width="207" height="47" style="display:block;width:207px;height:47px;border:0;outline:none;margin:0 auto;" />
    </a>
  </td></tr>
  <tr><td style="height:3px;line-height:3px;font-size:0;background:${C.red};">&nbsp;</td></tr>`;
}

function footer() {
  return `
  <tr><td class="gutter" style="background:${C.stock};padding:20px 28px;border-top:1px solid ${C.line};font-family:${SANS};font-size:12px;color:${C.muted};line-height:1.7;">
    <strong style="color:${C.navy};font-size:13px;">${BRAND}</strong><br/>
    <a href="${CONTACT_PHONE_HREF}" style="color:${C.navy};text-decoration:none;font-weight:600;">${CONTACT_PHONE}</a> &nbsp;&middot;&nbsp;
    <a href="mailto:${CONTACT_EMAIL}" style="color:${C.navy};text-decoration:none;font-weight:600;">${CONTACT_EMAIL}</a><br/>
    <span style="color:#8b94a6;">${CONTACT_HOURS} &middot; Reply to this email and a person will answer.</span>
  </td></tr>`;
}

// Bulletproof CTA button, left-aligned. Left rather than centred because it
// sits at the foot of a column of left-aligned facts, and a centred button in
// that column reads as an advert dropped into a document.
function button(url, label, color = C.navy) {
  if (!url) return '';
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0 4px;"><tr>
    <td style="background:${color};border-radius:6px;">
      <a href="${url}" style="display:inline-block;padding:13px 24px;font-family:${SANS};font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">${label}</a>
    </td>
  </tr></table>`;
}

// A small-caps rule that opens a section of the ticket.
function sectionLabel(text, topPad = 22) {
  return `<div style="font-family:${MONO};font-size:11px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:${C.muted};padding:${topPad}px 0 9px;">${esc(text)}</div>`;
}

// Horizontal progress tracker.
function progress(status) {
  if (status === 'canceled') {
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 2px;"><tr>
      <td style="background:#fdeef0;color:${C.red};font-family:${SANS};font-size:13px;font-weight:700;padding:12px 14px;border-radius:6px;">This order was canceled.</td></tr></table>`;
  }
  // Six labelled dots in one row cannot fit a phone. Each label sat under a
  // 26px cell, so "Proof sent" and "In production" wrapped and ran into their
  // neighbours — on a real device it rendered as "SubmittedPaid Proof sent
  // Approved In production Shipped" in a single unreadable clump.
  //
  // A segmented bar carries the same information and cannot collide: the step
  // is named once, in full, above segments that need no text of their own.
  const current = Math.max(0, STEPS.indexOf(status));
  const segments = STEPS.map((_, i) => {
    const done = i <= current;
    return `<td style="padding:0 2px;">
      <div style="height:5px;border-radius:2px;background:${done ? C.navy : '#dbe2ee'};font-size:0;line-height:0;">&nbsp;</div>
    </td>`;
  }).join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 2px;">
    <tr><td style="padding:0 0 8px;font-family:${MONO};font-size:11px;letter-spacing:1px;text-transform:uppercase;color:${C.muted};">
      Step ${current + 1}/${STEPS.length}
      <span style="color:${C.navy};font-weight:700;">&nbsp;&middot;&nbsp;${STEP_LABEL[STEPS[current]] || ''}</span>
      <span style="color:${C.muted};">&nbsp;&rarr;&nbsp;${current + 1 < STEPS.length ? STEP_LABEL[STEPS[current + 1]] : 'complete'}</span>
    </td></tr>
    <tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${segments}</tr></table></td></tr>
  </table>`;
}

// A date a customer can actually read, in the order they expect to see it.
function orderDate(order) {
  const raw = order.created_at || order.createdAt;
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// The docket head: what this email is about, stated before anything is said
// about it. Navy, so it reads as the ticket itself rather than as more page
// furniture, and the product is the largest thing in the email because the
// product is the subject — of the order, of the alert, and of the question the
// reader is about to ask.
function ticketHead(order, eyebrow) {
  const meta = [
    `Qty ${esc(order.quantity || 1)}`,
    orderDate(order) ? `Placed ${esc(orderDate(order))}` : null
  ].filter(Boolean).join(' &nbsp;&middot;&nbsp; ');
  return `
  <tr><td class="gutter" style="background:${C.navy};padding:22px 28px 24px;">
    <div style="font-family:${MONO};font-size:11px;font-weight:700;letter-spacing:1.7px;text-transform:uppercase;color:#93a7cd;padding-bottom:10px;">
      ${esc(eyebrow)} &nbsp;${shortId(order.id)}
    </div>
    <div class="head-title" style="font-family:${SANS};font-size:23px;line-height:1.25;font-weight:700;color:#ffffff;">${esc(order.product || 'Custom order')}</div>
    ${meta ? `<div style="font-family:${SANS};font-size:13px;color:#b3c2e2;padding-top:8px;">${meta}</div>` : ''}
  </td></tr>`;
}

// The one fact that decides what happens next, given a band of its own rather
// than a pill floating between paragraphs: the state on the left, the money on
// the right, both read in a single glance.
function statusBand({ tone, label, note, amount, amountNote }) {
  const tones = {
    green: [C.green, C.greenBg],
    amber: [C.amber, C.amberBg],
    blue: [C.blue, C.blueBg],
    red: [C.red, '#fdeef0']
  };
  const [fg, bg] = tones[tone] || tones.blue;
  return `
  <tr><td style="padding:0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${bg};border-left:4px solid ${fg};border-bottom:1px solid ${C.line};">
      <tr>
        <td class="gutter" style="padding:14px 12px 14px 24px;font-family:${MONO};font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${fg};">
          ${esc(label)}
          ${note ? `<div style="font-family:${SANS};font-size:12px;font-weight:400;letter-spacing:0;text-transform:none;color:${C.muted};padding-top:5px;">${esc(note)}</div>` : ''}
        </td>
        ${amount ? `<td align="right" class="gutter" style="padding:14px 24px 14px 8px;font-family:${MONO};font-size:18px;font-weight:700;color:${C.navy};white-space:nowrap;">
          ${esc(amount)}
          ${amountNote ? `<div style="font-family:${SANS};font-size:11px;font-weight:400;color:${C.muted};padding-top:5px;white-space:normal;">${esc(amountNote)}</div>` : ''}
        </td>` : ''}
      </tr>
    </table>
  </td></tr>`;
}

// The specification, set the way a print job is actually specified.
//
// The configurator packs every choice into one bullet-separated string, and
// each choice already has a "Label: value" shape. Splitting on the bullet and
// again on the first colon turns it into a real two-column spec. Right-aligned
// in a narrow cell it used to become an unreadable wall on a phone; as a flat
// bullet list it read as prose. Anything that does not split keeps its own
// full-width line rather than being forced into a column it does not fit.
function specTable(specs) {
  const parts = String(specs || '')
    .split('\u2022')
    .map((x) => x.trim())
    // The docket head already states the quantity. Left in, it arrives here
    // without a label and orphans as a full-width line under the spec.
    .filter((x) => x && !/^qty\b/i.test(x));
  if (!parts.length) return '';
  const rows = parts.map((part, i) => {
    const top = i ? `border-top:1px solid ${C.line};` : '';
    const m = part.match(/^([^:]{1,30}):\s*([\s\S]+)$/);
    if (!m) {
      return `<tr><td colspan="2" style="padding:7px 0;${top}font-family:${SANS};font-size:13px;line-height:1.5;color:${C.ink};">${esc(part)}</td></tr>`;
    }
    return `<tr>
      <td width="40%" style="padding:7px 14px 7px 0;${top}font-family:${SANS};font-size:13px;line-height:1.5;color:${C.muted};vertical-align:top;">${esc(m[1])}</td>
      <td style="padding:7px 0;${top}font-family:${MONO};font-size:13px;line-height:1.5;font-weight:600;color:${C.ink};">${esc(m[2])}</td>
    </tr>`;
  }).join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>`;
}

// A postal address set as a postal address, not as five key/value rows.
//
// Street, city, region, postcode and country arrived right-aligned in separate
// rows, which is not how anyone reads an address or copies one onto a label.
// The linking is deliberate too: iOS and Gmail detect addresses and phone
// numbers and restyle them as underlined blue whatever we do, so owning the
// link makes it useful — it opens the map — instead of merely ugly.
function addressBlock(order, customerEmail) {
  const addr = String(order.shipping_address || '').trim();
  const mapHref = `https://maps.google.com/?q=${encodeURIComponent(addr)}`;
  const link = (href, text, weight) =>
    `<a href="${href}" style="color:${C.navy};text-decoration:none;font-weight:${weight};">${esc(text)}</a>`;

  const addrLines = addr
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
    .map((line) => link(mapHref, line, 400))
    .join('<br/>');

  const country = order.shipping_country;
  const showCountry = country && !addr.toLowerCase().includes(String(country).toLowerCase());

  const contact = [
    order.customer_phone
      ? link(`tel:${String(order.customer_phone).replace(/[^+\d]/g, '')}`, order.customer_phone, 600)
      : '',
    customerEmail ? link(`mailto:${customerEmail}`, customerEmail, 600) : ''
  ].filter(Boolean).join(' &nbsp;&middot;&nbsp; ');

  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.stock};border:1px solid ${C.line};border-radius:8px;">
    <tr><td style="padding:16px 18px;">
      ${order.customer_name ? `<div style="font-family:${SANS};font-size:15px;font-weight:700;color:${C.navy};padding-bottom:5px;">${esc(order.customer_name)}</div>` : ''}
      ${addrLines ? `<div style="font-family:${SANS};font-size:14px;line-height:1.65;color:${C.ink};">${addrLines}</div>` : ''}
      ${showCountry ? `<div style="font-family:${SANS};font-size:14px;line-height:1.65;color:${C.ink};">${esc(country)}</div>` : ''}
      ${contact ? `<div style="font-family:${SANS};font-size:13px;line-height:1.6;color:${C.muted};padding-top:11px;margin-top:11px;border-top:1px solid ${C.line};">${contact}</div>` : ''}
    </td></tr>
  </table>`;
}

function shell(innerHtml, preheader = '') {
  return `<!doctype html><html lang="en"><head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <style>
    /* iOS and Gmail detect phone numbers, dates and addresses and restyle them
       as underlined blue links, overriding whatever the markup said. Where we
       have linked them ourselves this puts our own styling back. */
    a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important;font-size:inherit!important;font-family:inherit!important;font-weight:inherit!important;line-height:inherit!important;}
    /* Progressive enhancement only — the base padding already works on a
       phone, because Gmail strips this block in some contexts. */
    @media only screen and (max-width:620px){
      .gutter{padding-left:18px!important;padding-right:18px!important;}
      .head-title{font-size:20px!important;}
    }
  </style>
  </head>
  <body style="margin:0;padding:0;background:${C.bg};">
    <span data-preheader style="display:none;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;">${esc(preheader)}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg};padding:28px 12px;">
      <tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid ${C.line};">
          ${innerHtml}
        </table>
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;"><tr>
          <td align="center" style="padding:16px;font-family:${SANS};font-size:11px;line-height:1.6;color:#8b94a6;">&copy; ${new Date().getFullYear()} ${BRAND} &middot; Complete trade show displays &amp; event branding &middot; US &amp; Canada</td>
        </tr></table>
      </td></tr>
    </table>
  </body></html>`;
}

// --- Low-level send -------------------------------------------------------
// Generic SMTP (Brevo, SES, Mailgun, …) — set SMTP_HOST/PORT/USER/PASS. Falls
// back to the Resend HTTP API if SMTP isn't configured but RESEND_API_KEY is.
// Lazily created so the module loads even when nodemailer isn't needed.
let smtpTransport;
function getSmtp() {
  if (!process.env.SMTP_HOST) return null;
  if (smtpTransport) return smtpTransport;
  smtpTransport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465, // 465 = implicit TLS, 587 = STARTTLS
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  return smtpTransport;
}

// Plain-text version of an HTML email. A multipart/alternative message (text +
// HTML) reads as transactional to Gmail — HTML-only is a strong "bulk/marketing"
// signal that lands mail in the Promotions tab.
function htmlToText(html) {
  return String(html || '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    // The preheader is hidden in the HTML but tag-stripping brings it back, so
    // the plaintext version opened with a duplicate of the heading below it.
    .replace(/<span data-preheader[\s\S]*?<\/span>/gi, '')
    .replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, '$2 ($1)')
    .replace(/<\/(p|div|tr|h1|h2|h3|li|table)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&middot;/g, '·').replace(/&bull;/g, '•')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#10003;/g, '✓').replace(/&#9432;/g, '')
    .replace(/[ \t]+/g, ' ')
    .split('\n').map((l) => l.trim()).join('\n')
    .replace(/\n{3,}/g, '\n\n').trim();
}

async function send({ to, subject, html, text, attachments = [] }) {
  const recipients = (Array.isArray(to) ? to : [to]).filter(Boolean);
  if (!recipients.length) return { sent: false, reason: 'no-recipient' };

  const logo = await getLogoAttachment();
  const plain = text || htmlToText(html);

  // Preferred: SMTP (Brevo etc).
  const smtp = getSmtp();
  if (smtp) {
    try {
      await smtp.sendMail({
        from: EMAIL_FROM, to: recipients, subject, text: plain, html,
        attachments: [
          ...attachments.map((a) => ({ filename: a.filename, content: a.buffer })),
          ...(logo ? [{ filename: logo.filename, content: logo.buffer, cid: logo.cid, contentType: logo.contentType }] : [])
        ]
      });
      return { sent: true, via: 'smtp' };
    } catch (e) {
      return { sent: false, reason: e.message };
    }
  }

  // Fallback: Resend HTTP API.
  if (RESEND_API_KEY) {
    try {
      const body = { from: EMAIL_FROM, to: recipients, subject, text: plain, html };
      const resendAtt = [
        ...attachments.map((a) => ({ filename: a.filename, content: a.buffer.toString('base64') })),
        ...(logo ? [{ filename: logo.filename, content: logo.buffer.toString('base64'), content_id: logo.cid }] : [])
      ];
      if (resendAtt.length) body.attachments = resendAtt;
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) return { sent: false, reason: (await res.text()).slice(0, 300) };
      return { sent: true, via: 'resend' };
    } catch (e) {
      return { sent: false, reason: e.message };
    }
  }

  return { sent: false, reason: 'email-not-configured' };
}

// --- Public API -----------------------------------------------------------
function customerEmailHtml(order, status, appUrl, invoiceUrl) {
  const meta = STATUS_META[status] || STATUS_META.submitted;
  const tone = { submitted: 'blue', paid: 'green', proof_ready: 'amber', proof_approved: 'blue',
    in_production: 'amber', shipped: 'green', canceled: 'red' }[status] || 'blue';

  // What the band says about money depends on whether any has arrived. An
  // estimate is the quote before any discount and in the currency the customer
  // was browsing in, so it can differ sharply from what is actually charged —
  // a 99% code turns a CAD 227.61 estimate into USD 1.65. It is labelled as a
  // pre-discount quote rather than left to read as the amount owed.
  const settled = ['paid', 'proof_ready', 'proof_approved', 'in_production', 'shipped'].includes(order.status);
  const band = settled && order.amount_total != null
    ? { amount: money(order.amount_total, order.currency), amountNote: 'Paid' }
    : order.estimated_price
      ? { amount: String(order.estimated_price), amountNote: 'Estimated, before any discount' }
      : {};

  const invoiceBlock = invoiceUrl
    ? `${sectionLabel('Payment')}
       <p style="margin:0;font-family:${SANS};font-size:15px;line-height:1.6;color:${C.ink};">Your invoice is ready. You can pay it securely online.</p>
       ${button(invoiceUrl, 'Pay your invoice', C.red)}`
    : '';

  const spec = specTable(order.specs);
  const tracking = order.tracking_number ? trackingRow(order) : '';

  const inner = `
    ${header()}
    ${ticketHead(order, 'Order')}
    ${statusBand({ tone, label: STEP_LABEL[status] || 'Update', ...band })}
    <tr><td class="gutter" style="padding:26px 28px 6px;">
      <h1 style="margin:0 0 9px;font-family:${SANS};font-size:20px;line-height:1.3;color:${C.navy};">${meta.heading}</h1>
      <p style="margin:0 0 20px;font-family:${SANS};font-size:15px;line-height:1.65;color:${C.ink};">${meta.body}</p>
      ${progress(status)}
      ${spec ? sectionLabel('What you ordered') + spec : ''}
      ${tracking}
      ${invoiceBlock}
      ${invoiceUrl ? '' : button(appUrl ? `${appUrl}/account` : '', status === 'shipped' ? 'Track your order' : 'View your order', C.navy)}
    </td></tr>
    ${footer()}`;
  return shell(inner, meta.heading);
}

// The tracking number, and a link to it wherever the carrier is known. A
// tracking number with no link asks the customer to work out who has their
// parcel and find the right site.
function trackingRow(order) {
  const url = trackingUrl(order.carrier, order.tracking_number);
  const name = carrierName(order.carrier, order.tracking_number);
  return `${sectionLabel(name ? `${name} tracking` : 'Tracking')}
    <div style="font-family:${MONO};font-size:17px;font-weight:700;color:${C.navy};word-break:break-all;">
      ${url ? `<a href="${url}" style="color:${C.navy};text-decoration:none;">${esc(order.tracking_number)}</a>` : esc(order.tracking_number)}
    </div>`;
}

// Sent when a tracking number is added or changed without the status moving.
// Previously these edits were silent, so a parcel could be handed to a carrier
// and the customer never told.
export async function sendTrackingEmail({ to, order, appUrl = DEFAULT_APP_URL }) {
  if (!to || !order?.tracking_number) return { sent: false, reason: 'no recipient or tracking number' };
  return send({
    to,
    subject: `${BRAND} — tracking for order ${shortId(order.id)}`,
    html: trackingEmailHtml(order, appUrl)
  });
}

// Exported so the preview harness and the template tests can render it the
// same way the send path does, rather than re-implementing it and drifting.
export function trackingEmailHtml(order, appUrl = DEFAULT_APP_URL) {
  const url = trackingUrl(order.carrier, order.tracking_number);
  const name = carrierName(order.carrier, order.tracking_number);
  const spec = specTable(order.specs);
  const inner = `
    ${header()}
    ${ticketHead(order, 'Shipment')}
    ${statusBand({
      tone: 'green',
      label: 'Shipped',
      note: name ? `In transit with ${name}` : 'In transit'
    })}
    <tr><td class="gutter" style="padding:26px 28px 6px;">
      <h1 style="margin:0 0 9px;font-family:${SANS};font-size:20px;line-height:1.3;color:${C.navy};">Your order is on its way</h1>
      <p style="margin:0 0 4px;font-family:${SANS};font-size:15px;line-height:1.65;color:${C.ink};">
        ${name ? `Your parcel is with ${name}.` : 'Your parcel is on its way.'} Track it any time with the button below.
      </p>
      ${sectionLabel(name ? `${name} tracking number` : 'Tracking number', 18)}
      <div style="font-family:${MONO};font-size:19px;font-weight:700;color:${C.navy};word-break:break-all;">${esc(order.tracking_number)}</div>
      ${url ? button(url, 'Track your parcel', C.navy) : ''}
      ${/* Orders ship from China direct, so the first scan is days rather than
            hours and the carrier changes hands on arrival. Saying so up front
            saves the "my tracking hasn't moved" email three days later. */ ''}
      <p style="margin:14px 0 0;font-family:${SANS};font-size:13px;line-height:1.65;color:${C.muted};">
        Your order ships direct from our production facility, so tracking can take a few days to show
        its first scan, and it may go quiet in transit before customs clearance. It is normal for the
        parcel to be passed to a local carrier for final delivery${
          isAggregateLink(order.carrier, order.tracking_number)
            ? ' — the link above follows it across both.'
            : '.'
        }
      </p>
      ${spec ? sectionLabel('What is on its way') + spec : ''}
      <div style="padding-top:18px;"></div>
      <a href="${appUrl ? `${appUrl}/account` : '#'}" style="font-family:${SANS};font-size:14px;font-weight:600;color:${C.navy};text-decoration:none;border-bottom:2px solid ${C.line};padding-bottom:2px;">View your order &rarr;</a>
      <div style="padding-bottom:8px;"></div>
    </td></tr>
    ${footer()}`;
  return shell(inner, `Tracking for order ${shortId(order.id)}: ${order.tracking_number}`);
}

export async function sendReviewRequestEmail({ to, order, reviewUrl }) {
  if (!to || !reviewUrl) return { sent: false, reason: 'no recipient or review link' };
  return send({
    to,
    subject: `How did your ${order.product} turn out?`,
    html: reviewRequestEmailHtml(order, reviewUrl)
  });
}

export function reviewRequestEmailHtml(order, reviewUrl) {
  const first = (order.customer_name || '').trim().split(/\s+/)[0];
  const inner = `
    ${header()}
    ${ticketHead(order, 'Feedback')}
    <tr><td class="gutter" style="padding:26px 28px 6px;">
      <h1 style="margin:0 0 9px;font-family:${SANS};font-size:20px;line-height:1.3;color:${C.navy};">How did it turn out${first ? `, ${esc(first)}` : ''}?</h1>
      <p style="margin:0 0 4px;font-family:${SANS};font-size:15px;line-height:1.65;color:${C.ink};">
        Your ${esc(order.product)} should have arrived by now. If you have a minute, tell other exhibitors
        what it was like — the print, the setup, how it looked at your event. Honest reviews, good or bad,
        help us and help the next customer choose.
      </p>
      ${button(reviewUrl, 'Write a review', C.navy)}
      <p style="margin:14px 0 0;font-family:${SANS};font-size:13px;line-height:1.65;color:${C.muted};">
        This link is just for your order. If anything went wrong, reply to this email and we will make it right.
      </p>
      <div style="padding-bottom:8px;"></div>
    </td></tr>
    ${footer()}`;
  return shell(inner, `Tell us how your ${order.product} turned out`);
}

export async function sendOrderStatusEmail({ to, order, status, appUrl = DEFAULT_APP_URL }) {
  const meta = STATUS_META[status] || STATUS_META.submitted;
  return send({ to, subject: `Your ${BRAND} order ${shortId(order.id)} ${meta.subject}`, html: customerEmailHtml(order, status, appUrl) });
}

export async function sendOrderConfirmationEmail({ to, order, appUrl = DEFAULT_APP_URL, invoiceUrl }) {
  return send({ to, subject: `${BRAND} — order ${shortId(order.id)} received`, html: customerEmailHtml(order, 'submitted', appUrl, invoiceUrl) });
}

export function adminAlertHtml(order, customerEmail, appUrl) {
  // Whether money has actually arrived is the first thing staff need, and the
  // last thing that should be guessed at from a status word. It gets the band.
  const paid = ['paid', 'proof_ready', 'proof_approved', 'in_production', 'shipped'].includes(order.status);

  // This alert is sent the moment the order is placed, before the customer has
  // reached the payment page, so "awaiting payment" and the estimate are a
  // snapshot rather than the final word. Say so, instead of leaving staff to
  // wonder why a paid order arrived marked unpaid.
  const band = paid
    ? statusBand({
        tone: 'green',
        label: 'Paid',
        amount: order.amount_total != null ? money(order.amount_total, order.currency) : null,
        amountNote: order.amount_total != null ? 'Collected' : null
      })
    : statusBand({
        tone: 'amber',
        label: 'Awaiting payment',
        note: order.payment_choice === 'invoice_later'
          ? 'Customer asked to be invoiced'
          : 'Sent as the order was placed — they may be paying right now',
        amount: order.estimated_price ? String(order.estimated_price) : null,
        amountNote: order.estimated_price ? 'Estimated, before any discount' : null
      });

  const artwork = order.design_path
    ? 'Uploaded'
    : order.artwork_choice === 'email_later'
      ? 'Customer will email it'
      : order.artwork_choice === 'design_service'
        ? 'Design service'
        : 'None supplied';

  const spec = specTable(order.specs);

  const inner = `
    ${header()}
    ${ticketHead(order, 'Job ticket')}
    ${band}
    <tr><td class="gutter" style="padding:24px 28px 6px;">
      <p style="margin:0;font-family:${SANS};font-size:15px;line-height:1.6;color:${C.ink};">
        A new order came in. Review the artwork and move it along in the dashboard.
      </p>
      ${spec ? sectionLabel('Specification') + spec : ''}
      ${sectionLabel('Ship to')}
      ${addressBlock(order, customerEmail)}
      ${sectionLabel('Artwork')}
      ${/* One line, not a table. Payment and order status were in it too, and
            both are the band's whole job. Its artwork row also contradicted
            the specification above — "I'll upload my artwork" is what the
            customer configured, this is what they chose at checkout — and only
            this one tells staff whether they are waiting on a file. */ ''}
      <div style="font-family:${MONO};font-size:14px;font-weight:600;color:${C.ink};">${esc(artwork)}</div>
      ${button(appUrl ? `${appUrl}/admin` : '', 'Open admin dashboard', C.navy)}
      ${paid ? '' : `<p style="margin:10px 0 0;font-family:${SANS};font-size:12px;line-height:1.6;color:${C.muted};">
        A second email follows once payment clears, and the dashboard always shows the live status.
      </p>`}
    </td></tr>
    ${footer()}`;
  return shell(inner, `New order ${shortId(order.id)} — ${order.product || ''}`);
}

export async function sendNewOrderAlert({ to, order, customerEmail, appUrl = DEFAULT_APP_URL }) {
  return send({
    to,
    subject: `New order ${shortId(order.id)} — ${order.product || ''}`,
    html: adminAlertHtml(order, customerEmail, appUrl)
  });
}

// --- Quote request emails -------------------------------------------------
function factRows(pairs) {
  const rows = pairs.filter(([, v]) => v != null && String(v).trim() !== '');
  return rows
    .map(
      ([k, v], i) => `<tr>
        <td style="padding:9px 0;font-family:Arial,sans-serif;font-size:14px;color:${C.muted};${i ? `border-top:1px solid ${C.line};` : ''}">${esc(k)}</td>
        <td align="right" style="padding:9px 0;font-family:Arial,sans-serif;font-size:14px;font-weight:600;color:${C.navy};${i ? `border-top:1px solid ${C.line};` : ''}">${
          // Values are escaped. A { html } value is the one exception, for a row
          // that needs a link — and the caller is responsible for escaping the
          // pieces it builds that markup from.
          v && typeof v === 'object' && typeof v.html === 'string' ? v.html : esc(v)
        }</td>
      </tr>`
    )
    .join('');
}

function quoteStaffHtml(q) {
  const table = factRows([
    ['Reference', q.reference], ['Name', q.name], ['Email', q.email], ['Phone', q.phone],
    // Address and country decide shipping cost and lead time, so they belong in
    // the notification rather than in a follow-up email asking for them.
    ['Address', q.address], ['Country', q.country], ['Postal code', q.postal],
    ['Product', q.product], ['Quantity', q.quantity], ['Specs', q.specs],
    ['Est. price', q.estimatedPrice], ['Notes', q.description],
    // Small files ride along as an attachment; anything larger was uploaded
    // straight to storage and is linked instead.
    ['Artwork', q.artworkUrl
      ? { html: `<a href="${esc(q.artworkUrl)}">${esc(q.artworkName || 'Download artwork')}</a> (link valid 14 days)` }
      : q.fileName]
  ]);
  const inner = `
    ${header()}
    <tr><td style="padding:28px 28px 6px;">
      <h1 style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:21px;color:${C.navy};">New quote request${q.reference ? ` &middot; ${esc(q.reference)}` : ''}</h1>
      <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:${C.muted};">A new quote just came in through the website. Reply directly to <strong style="color:${C.navy};">${esc(q.email) || 'the customer'}</strong> to follow up${q.fileName ? ' — the customer\'s artwork is attached' : ''}.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fafbfc;border:1px solid ${C.line};border-radius:10px;padding:6px 16px;margin:10px 0;">${table}</table>
    </td></tr>
    ${footer()}`;
  return shell(inner, `New quote request from ${q.name || q.email || 'a customer'}`);
}

function quoteClientHtml(q) {
  const table = factRows([
    ['Reference', q.reference], ['Product', q.product], ['Quantity', q.quantity],
    ['Specs', q.specs], ['Artwork', q.fileName]
  ]);
  const firstName = q.name ? esc(String(q.name).trim().split(/\s+/)[0]) : '';
  const inner = `
    ${header()}
    <tr><td style="padding:30px 28px 6px;">
      <h1 style="margin:0 0 10px;font-family:Arial,sans-serif;font-size:23px;line-height:1.3;color:${C.navy};">Thanks${firstName ? `, ${firstName}` : ''} — we've got your request</h1>
      <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;line-height:1.65;color:${C.ink};">Thanks for reaching out to ${BRAND}. A member of our team is reviewing your request and will follow up shortly with pricing and a <strong>free artwork proof</strong>. Nothing goes to print until you approve it.</p>
      <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:${C.muted};">What you sent${q.reference ? ` &middot; ${esc(q.reference)}` : ''}</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fafbfc;border:1px solid ${C.line};border-radius:10px;padding:6px 16px;margin:0 0 6px;">${table}</table>
      <p style="margin:16px 0 0;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:${C.muted};">Need to change something or send more artwork? Just reply to this email.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0 0;background:#f4f8fc;border:1px solid ${C.line};border-radius:10px;">
        <tr><td style="padding:14px 16px;font-family:Arial,sans-serif;">
          <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:${C.navy};">Have a question in the meantime?</p>
          <p style="margin:0;font-size:15px;line-height:1.8;color:${C.ink};">
            📞 <a href="${CONTACT_PHONE_HREF}" style="color:${C.navy};text-decoration:none;font-weight:700;">${CONTACT_PHONE}</a>
            &nbsp;&middot;&nbsp;
            ✉️ <a href="mailto:${CONTACT_EMAIL}" style="color:${C.navy};text-decoration:none;font-weight:700;">${CONTACT_EMAIL}</a>
          </p>
          <p style="margin:4px 0 0;font-size:13px;color:${C.muted};">${CONTACT_HOURS} — we're happy to help.</p>
        </td></tr>
      </table>
    </td></tr>
    ${footer()}`;
  return shell(inner, `We've got your request${q.reference ? ` (${q.reference})` : ''} — our team will follow up shortly with pricing and a free proof.`);
}

// Sends the quote request to staff (with artwork attached) AND a copy to the
// customer. Best-effort: caller should not fail the request if email fails.
export async function sendQuoteRequest({ staffTo, quote, attachment }) {
  const attachments = attachment ? [attachment] : [];
  const staff = await send({
    to: staffTo,
    subject: `New quote request ${quote.reference || ''} — ${quote.product || ''}`.trim(),
    html: quoteStaffHtml(quote),
    attachments
  });
  const client = quote.email
    ? await send({
        to: quote.email,
        subject: `${BRAND} — we received your quote request${quote.reference ? ` ${quote.reference}` : ''}`,
        html: quoteClientHtml(quote)
      })
    : { sent: false, reason: 'no-client-email' };
  return { staff, client };
}

export { customerEmailHtml };
