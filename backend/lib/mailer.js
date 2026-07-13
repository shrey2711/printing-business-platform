// Transactional email via Resend (https://resend.com) with branded, table-based
// HTML templates that render well across email clients. No-ops safely when
// RESEND_API_KEY is unset.

const RESEND_API_KEY = process.env.RESEND_API_KEY;
// EMAIL_FROM must use a domain you've verified in Resend. For quick testing,
// "onboarding@resend.dev" only delivers to your own Resend account email.
const EMAIL_FROM = process.env.EMAIL_FROM || 'PrintUSA <onboarding@resend.dev>';
const BRAND = process.env.BRAND_NAME || 'PrintUSA';
const DEFAULT_APP_URL = (process.env.PUBLIC_BASE_URL || '').replace(/\/$/, '');

// --- Brand palette --------------------------------------------------------
const C = {
  navy: '#16233b',
  red: '#c8102e',
  green: '#2f9e44',
  amber: '#e8590c',
  blue: '#1f8fd6',
  ink: '#2b323c',
  muted: '#6b7480',
  line: '#e4e9f2',
  bg: '#f4f6f8'
};

const STEPS = ['submitted', 'paid', 'in_production', 'shipped'];
const STEP_LABEL = { submitted: 'Submitted', paid: 'Paid', in_production: 'In production', shipped: 'Shipped' };

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
  cancelled: {
    color: C.red,
    subject: 'has been cancelled',
    heading: 'Your order has been cancelled',
    body: 'Your order has been cancelled. If this was unexpected or you have questions, just reply to this email.'
  }
};

const shortId = (id) => `#${String(id).slice(0, 8)}`;
const money = (n) => `$${Number(n).toFixed(2)}`;

// --- Building blocks ------------------------------------------------------
function header() {
  return `
  <tr><td style="background:${C.navy};padding:22px 28px;">
    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
      <td style="background:#0f1a2e;border-radius:8px;width:40px;height:40px;text-align:center;vertical-align:middle;color:#fff;font-family:Arial,sans-serif;font-weight:800;font-size:16px;">P2</td>
      <td style="padding-left:12px;font-family:Arial,sans-serif;font-weight:800;font-size:22px;color:#ffffff;">Print<span style="color:${C.red};">USA</span></td>
    </tr></table>
  </td></tr>`;
}

function footer() {
  return `
  <tr><td style="background:${C.bg};padding:20px 28px;border-top:1px solid ${C.line};font-family:Arial,sans-serif;font-size:12px;color:${C.muted};line-height:1.6;">
    <strong style="color:${C.navy};">${BRAND}</strong> — online wholesale printing, shipped nationwide.<br/>
    Questions? Reply to this email or contact sales@printusa.com.<br/>
    <span style="color:#9aa3b0;">You're receiving this because you placed an order with ${BRAND}.</span>
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
  if (status === 'cancelled') {
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 4px;"><tr>
      <td style="background:#fdeef0;color:${C.red};font-family:Arial,sans-serif;font-size:13px;font-weight:700;padding:12px 14px;border-radius:8px;">This order was cancelled.</td></tr></table>`;
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
    const paid = ['paid', 'in_production', 'shipped'].includes(order.status);
    if (paid && order.amount_total != null) rows.push(['Total paid', money(order.amount_total)]);
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
          <td align="center" style="padding:16px;font-family:Arial,sans-serif;font-size:11px;color:#9aa3b0;">© ${new Date().getFullYear()} ${BRAND} • Ships nationwide across the USA</td>
        </tr></table>
      </td></tr>
    </table>
  </body></html>`;
}

// --- Low-level send -------------------------------------------------------
async function send({ to, subject, html }) {
  if (!RESEND_API_KEY) return { sent: false, reason: 'email-not-configured' };
  const recipients = (Array.isArray(to) ? to : [to]).filter(Boolean);
  if (!recipients.length) return { sent: false, reason: 'no-recipient' };
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: EMAIL_FROM, to: recipients, subject, html })
    });
    if (!res.ok) return { sent: false, reason: (await res.text()).slice(0, 300) };
    return { sent: true };
  } catch (e) {
    return { sent: false, reason: e.message };
  }
}

// --- Public API -----------------------------------------------------------
function customerEmailHtml(order, status, appUrl) {
  const meta = STATUS_META[status] || STATUS_META.submitted;
  const accent = meta.color;
  const inner = `
    ${header()}
    <tr><td style="height:5px;background:${accent};"></td></tr>
    <tr><td style="padding:28px 28px 8px;">
      <div style="display:inline-block;background:${accent}1a;color:${accent};font-family:Arial,sans-serif;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;padding:5px 12px;border-radius:999px;">${STEP_LABEL[status] || 'Update'}</div>
      <h1 style="margin:14px 0 8px;font-family:Arial,sans-serif;font-size:22px;color:${C.navy};">${meta.heading}</h1>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:${C.ink};">${meta.body}</p>
      ${progress(status)}
      ${detailsCard(order)}
      ${button(appUrl ? `${appUrl}/account` : '', status === 'shipped' ? 'Track your order' : 'View your order', accent)}
    </td></tr>
    ${footer()}`;
  return shell(inner, meta.heading);
}

export async function sendOrderStatusEmail({ to, order, status, appUrl = DEFAULT_APP_URL }) {
  const meta = STATUS_META[status] || STATUS_META.submitted;
  return send({ to, subject: `Your ${BRAND} order ${shortId(order.id)} ${meta.subject}`, html: customerEmailHtml(order, status, appUrl) });
}

export async function sendOrderConfirmationEmail({ to, order, appUrl = DEFAULT_APP_URL }) {
  return send({ to, subject: `${BRAND} — order ${shortId(order.id)} received`, html: customerEmailHtml(order, 'submitted', appUrl) });
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

export { customerEmailHtml };
