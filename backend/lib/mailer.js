// Transactional email via Resend (https://resend.com). Uses the REST API with
// global fetch — no SDK dependency. No-ops safely when RESEND_API_KEY is unset.

const RESEND_API_KEY = process.env.RESEND_API_KEY;
// EMAIL_FROM must use a domain you've verified in Resend. For quick testing,
// Resend allows "onboarding@resend.dev" (only delivers to your own account email).
const EMAIL_FROM = process.env.EMAIL_FROM || 'PrintUSA <onboarding@resend.dev>';
const BRAND = process.env.BRAND_NAME || 'PrintUSA';

const STATUS_COPY = {
  submitted: {
    subject: 'received',
    heading: "We've received your order",
    body: "Thanks for your order! Our team is reviewing your details and artwork. We'll let you know as soon as it moves into production."
  },
  paid: {
    subject: 'paid — thank you!',
    heading: 'Payment received — thank you!',
    body: 'Your payment has been confirmed. Your order is now queued and will move into production shortly.'
  },
  in_production: {
    subject: 'is now in production',
    heading: 'Your order is in production',
    body: 'Good news — our team has started printing your order. We\'ll email you again the moment it ships.'
  },
  shipped: {
    subject: 'has shipped',
    heading: 'Your order is on its way! 🚚',
    body: 'Your order has shipped and is on its way to you. Thanks for choosing us!'
  },
  cancelled: {
    subject: 'has been cancelled',
    heading: 'Your order has been cancelled',
    body: 'Your order has been cancelled. If this was unexpected or you have any questions, just reply to this email.'
  }
};

function shortId(id) {
  return `#${String(id).slice(0, 8)}`;
}

function statusEmailHtml(order, status) {
  const copy = STATUS_COPY[status] || STATUS_COPY.submitted;
  const pretty = String(status).replace('_', ' ');
  return `
  <div style="font-family:Segoe UI,Arial,sans-serif;max-width:560px;margin:0 auto;color:#16233b">
    <div style="background:#16233b;padding:20px 24px;border-radius:8px 8px 0 0">
      <span style="color:#fff;font-size:20px;font-weight:800">Print<span style="color:#c8102e">USA</span></span>
    </div>
    <div style="border:1px solid #e4e9f2;border-top:none;border-radius:0 0 8px 8px;padding:24px">
      <h1 style="font-size:20px;margin:0 0 12px">${copy.heading}</h1>
      <p style="color:#5d6b82;line-height:1.55;margin:0 0 20px">${copy.body}</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px">
        <tr><td style="color:#6b7480;padding:6px 0">Order</td><td style="text-align:right;font-weight:600">${shortId(order.id)}</td></tr>
        <tr><td style="color:#6b7480;padding:6px 0">Product</td><td style="text-align:right;font-weight:600">${order.product || ''}</td></tr>
        ${order.specs ? `<tr><td style="color:#6b7480;padding:6px 0">Specs</td><td style="text-align:right">${order.specs}</td></tr>` : ''}
        <tr><td style="color:#6b7480;padding:6px 0">Status</td>
          <td style="text-align:right"><span style="background:#eaf1fd;color:#1878b6;padding:4px 10px;border-radius:999px;font-weight:700;text-transform:capitalize">${pretty}</span></td></tr>
      </table>
      <p style="color:#98a2b3;font-size:12px;margin:0">You're receiving this because you placed an order with ${BRAND}.</p>
    </div>
  </div>`;
}

// Low-level send helper.
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
    if (!res.ok) return { sent: false, reason: (await res.text()).slice(0, 200) };
    return { sent: true };
  } catch (e) {
    return { sent: false, reason: e.message };
  }
}

export async function sendOrderStatusEmail({ to, order, status }) {
  const copy = STATUS_COPY[status] || STATUS_COPY.submitted;
  return send({
    to,
    subject: `Your ${BRAND} order ${shortId(order.id)} ${copy.subject}`,
    html: statusEmailHtml(order, status)
  });
}

// Confirmation to the customer right after they place an order.
export async function sendOrderConfirmationEmail({ to, order }) {
  return send({
    to,
    subject: `${BRAND} — order ${shortId(order.id)} received`,
    html: statusEmailHtml(order, 'submitted')
  });
}

// Internal alert to staff whenever a new order comes in.
export async function sendNewOrderAlert({ to, order, customerEmail }) {
  const html = `
  <div style="font-family:Segoe UI,Arial,sans-serif;max-width:560px;margin:0 auto;color:#16233b">
    <h2 style="margin:0 0 12px">🖨️ New order ${shortId(order.id)}</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="color:#6b7480;padding:6px 0">Customer</td><td style="text-align:right;font-weight:600">${customerEmail || '—'}</td></tr>
      <tr><td style="color:#6b7480;padding:6px 0">Product</td><td style="text-align:right;font-weight:600">${order.product || ''}</td></tr>
      ${order.specs ? `<tr><td style="color:#6b7480;padding:6px 0">Specs</td><td style="text-align:right">${order.specs}</td></tr>` : ''}
      <tr><td style="color:#6b7480;padding:6px 0">Qty</td><td style="text-align:right">${order.quantity || 1}</td></tr>
      <tr><td style="color:#6b7480;padding:6px 0">Est. price</td><td style="text-align:right;font-weight:600">${order.estimated_price || '—'}</td></tr>
    </table>
    <p style="color:#98a2b3;font-size:12px;margin-top:16px">Open the admin dashboard to review artwork and update status.</p>
  </div>`;
  return send({ to, subject: `New order ${shortId(order.id)} — ${order.product || ''}`, html });
}
