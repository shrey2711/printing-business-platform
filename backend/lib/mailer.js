// Transactional email via SMTP (Brevo/SES/…) or Resend, with branded,
// table-based HTML templates. No-ops safely when neither is configured.
import nodemailer from 'nodemailer';

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
const C = {
  navy: '#0b1f4d',   // deep brand navy for headings
  red: '#ED1C24',    // brand red  (C0 M100 Y100 K0)
  green: '#2f9e44',
  amber: '#e8590c',
  blue: '#1f8fd6',
  ink: '#2b323c',
  muted: '#6b7480',
  line: '#e4e9f2',
  bg: '#f4f6f8'
};

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
function header() {
  // `cid:` resolves to the inline attachment added in send(); email clients that
  // block remote images still show it. src falls back to the URL if not inlined.
  return `
  <tr><td align="center" style="background:#ffffff;padding:26px 28px 16px;text-align:center;">
    <a href="${SITE_URL}" style="text-decoration:none;">
      <img src="cid:${LOGO_CID}" alt="${BRAND}" width="207" height="47" style="display:block;width:207px;height:47px;border:0;outline:none;margin:0 auto;" />
    </a>
  </td></tr>
  <tr><td style="height:4px;line-height:4px;font-size:0;background:${C.red};">&nbsp;</td></tr>`;
}

function footer() {
  return `
  <tr><td style="background:${C.bg};padding:22px 28px;border-top:1px solid ${C.line};font-family:Arial,sans-serif;font-size:12px;color:${C.muted};line-height:1.7;">
    <strong style="color:${C.navy};font-size:13px;">${BRAND}</strong><br/>
    <a href="${CONTACT_PHONE_HREF}" style="color:${C.blue};text-decoration:none;font-weight:600;">${CONTACT_PHONE}</a> &nbsp;&middot;&nbsp;
    <a href="mailto:${CONTACT_EMAIL}" style="color:${C.blue};text-decoration:none;font-weight:600;">${CONTACT_EMAIL}</a><br/>
    <span style="color:#9aa3b0;">Questions? Call or reply to this email — we're happy to help.</span>
  </td></tr>`;
}

// Bulletproof, centered CTA button.
function button(url, label, color = C.red) {
  if (!url) return '';
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0;"><tr>
    <td style="background:${color};border-radius:8px;">
      <a href="${url}" style="display:inline-block;padding:13px 26px;font-family:Arial,sans-serif;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">${label}</a>
    </td>
  </tr></table>`;
}

// Horizontal 4-step progress tracker.
function progress(status) {
  if (status === 'canceled') {
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 4px;"><tr>
      <td style="background:#fdeef0;color:${C.red};font-family:Arial,sans-serif;font-size:13px;font-weight:700;padding:12px 14px;border-radius:8px;">This order was canceled.</td></tr></table>`;
  }
  const current = Math.max(0, STEPS.indexOf(status));
  const cells = STEPS.map((step, i) => {
    const done = i <= current;
    const dotBg = done ? C.green : '#e7ebf1';
    const dotColor = done ? '#ffffff' : '#98a2b3';
    const labelColor = done ? C.navy : C.muted;
    const mark = i < current ? '&#10003;' : String(i + 1);
    return `<td align="center" style="font-family:Arial,sans-serif;">
      <div style="width:26px;height:26px;line-height:26px;border-radius:50%;background:${dotBg};color:${dotColor};font-size:12px;font-weight:700;margin:0 auto;">${mark}</div>
      <div style="font-size:11px;color:${labelColor};padding-top:5px;">${STEP_LABEL[step]}</div>
    </td>`;
  }).join('<td style="height:3px;background:#e7ebf1;"></td>');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:14px 0 6px;"><tr>${cells}</tr></table>`;
}

// Order detail rows.
function detailsCard(order, { showAmount = true } = {}) {
  const rows = [];
  rows.push(['Order', shortId(order.id)]);
  rows.push(['Product', order.product || '—']);
  if (order.specs) rows.push(['Specs', order.specs]);
  rows.push(['Quantity', String(order.quantity || 1)]);
  if (showAmount) {
    const paid = ['paid', 'proof_ready', 'proof_approved', 'in_production', 'shipped'].includes(order.status);
    if (paid && order.amount_total != null) rows.push(['Total paid', money(order.amount_total, order.currency)]);
    else if (order.estimated_price) rows.push(['Estimated', order.estimated_price]);
  }
  if (order.tracking_number) rows.push(['Tracking', `${order.carrier ? order.carrier + ' ' : ''}${order.tracking_number}`]);

  const body = rows
    .map(
      ([k, v], i) => `<tr>
        <td style="padding:9px 0;font-family:Arial,sans-serif;font-size:14px;color:${C.muted};${i ? `border-top:1px solid ${C.line};` : ''}">${k}</td>
        <td align="right" style="padding:9px 0;font-family:Arial,sans-serif;font-size:14px;font-weight:600;color:${C.navy};${i ? `border-top:1px solid ${C.line};` : ''}">${v}</td>
      </tr>`
    )
    .join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fafbfc;border:1px solid ${C.line};border-radius:10px;padding:6px 16px;margin:8px 0;">${body}</table>`;
}

function shell(innerHtml, preheader = '') {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="margin:0;padding:0;background:${C.bg};">
    <span style="display:none;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;">${preheader}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg};padding:28px 12px;">
      <tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid ${C.line};">
          ${innerHtml}
        </table>
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;"><tr>
          <td align="center" style="padding:16px;font-family:Arial,sans-serif;font-size:11px;color:#9aa3b0;">© ${new Date().getFullYear()} ${BRAND} &bull; Complete trade show displays &amp; event branding &bull; US &amp; Canada</td>
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
  const accent = meta.color;
  const invoiceBlock = invoiceUrl
    ? `<p style="margin:14px 0 0;font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:${C.ink};">Your invoice is ready — pay securely online:</p>
       ${button(invoiceUrl, 'Pay your invoice', C.red)}`
    : '';
  const inner = `
    ${header()}
    <tr><td style="height:5px;background:${accent};"></td></tr>
    <tr><td style="padding:28px 28px 8px;">
      <div style="display:inline-block;background:${accent}1a;color:${accent};font-family:Arial,sans-serif;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;padding:5px 12px;border-radius:999px;">${STEP_LABEL[status] || 'Update'}</div>
      <h1 style="margin:14px 0 8px;font-family:Arial,sans-serif;font-size:22px;color:${C.navy};">${meta.heading}</h1>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:${C.ink};">${meta.body}</p>
      ${progress(status)}
      ${detailsCard(order)}
      ${invoiceBlock}
      ${invoiceUrl ? '' : button(appUrl ? `${appUrl}/account` : '', status === 'shipped' ? 'Track your order' : 'View your order', accent)}
    </td></tr>
    ${footer()}`;
  return shell(inner, meta.heading);
}

export async function sendOrderStatusEmail({ to, order, status, appUrl = DEFAULT_APP_URL }) {
  const meta = STATUS_META[status] || STATUS_META.submitted;
  return send({ to, subject: `Your ${BRAND} order ${shortId(order.id)} ${meta.subject}`, html: customerEmailHtml(order, status, appUrl) });
}

export async function sendOrderConfirmationEmail({ to, order, appUrl = DEFAULT_APP_URL, invoiceUrl }) {
  return send({ to, subject: `${BRAND} — order ${shortId(order.id)} received`, html: customerEmailHtml(order, 'submitted', appUrl, invoiceUrl) });
}

export function adminAlertHtml(order, customerEmail, appUrl) {
  const inner = `
    ${header()}
    <tr><td style="height:5px;background:${C.red};"></td></tr>
    <tr><td style="padding:26px 28px 8px;">
      <h1 style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:20px;color:${C.navy};">🖨️ New order ${shortId(order.id)}</h1>
      <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:14px;color:${C.muted};">A new order just came in — review the artwork and update its status.</p>
      ${detailsCard({ ...order, status: 'paid' })}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="padding:9px 0;font-family:Arial,sans-serif;font-size:14px;color:${C.muted};">Customer</td>
        <td align="right" style="padding:9px 0;font-family:Arial,sans-serif;font-size:14px;font-weight:600;color:${C.navy};">${customerEmail || '—'}</td>
      </tr></table>
      ${button(appUrl ? `${appUrl}/admin` : '', 'Open admin dashboard', C.navy)}
    </td></tr>
    ${footer()}`;
  return shell(inner, `New order ${shortId(order.id)}`);
}

export async function sendNewOrderAlert({ to, order, customerEmail, appUrl = DEFAULT_APP_URL }) {
  return send({
    to,
    subject: `New order ${shortId(order.id)} — ${order.product || ''}`,
    html: adminAlertHtml(order, customerEmail, appUrl)
  });
}

// --- Quote request emails -------------------------------------------------
const esc = (s) =>
  String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function quoteRows(pairs) {
  const rows = pairs.filter(([, v]) => v != null && String(v).trim() !== '');
  return rows
    .map(
      ([k, v], i) => `<tr>
        <td style="padding:9px 0;font-family:Arial,sans-serif;font-size:14px;color:${C.muted};${i ? `border-top:1px solid ${C.line};` : ''}">${esc(k)}</td>
        <td align="right" style="padding:9px 0;font-family:Arial,sans-serif;font-size:14px;font-weight:600;color:${C.navy};${i ? `border-top:1px solid ${C.line};` : ''}">${esc(v)}</td>
      </tr>`
    )
    .join('');
}

function quoteStaffHtml(q) {
  const table = quoteRows([
    ['Reference', q.reference], ['Name', q.name], ['Email', q.email], ['Phone', q.phone],
    // Address and country decide shipping cost and lead time, so they belong in
    // the notification rather than in a follow-up email asking for them.
    ['Address', q.address], ['Country', q.country],
    ['Product', q.product], ['Quantity', q.quantity], ['Specs', q.specs],
    ['Est. price', q.estimatedPrice], ['Notes', q.description], ['Artwork', q.fileName]
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
  const table = quoteRows([
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
