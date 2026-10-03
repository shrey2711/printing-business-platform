// Minimal fetch client for /api. It keeps the axios-shaped surface the
// callers were written against — `{ data }` on success, and an Error carrying
// `response: { status, data }` on a non-2xx — without axios's ~13 KB in the
// entry bundle.
async function request(method, path, { params, body } = {}) {
  const qs = params && Object.keys(params).length ? `?${new URLSearchParams(params)}` : '';
  const init = { method };
  if (body instanceof FormData) {
    init.body = body;
  } else if (body !== undefined) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(body);
  }
  const res = await fetch(`/api${path}${qs}`, init);
  const text = await res.text();
  let data = text;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    /* non-JSON body: keep the text */
  }
  if (!res.ok) {
    const err = new Error(data?.error || `Request failed with status code ${res.status}`);
    err.response = { status: res.status, data };
    throw err;
  }
  return { data, status: res.status };
}

const api = {
  get: (path, opts) => request('GET', path, opts),
  post: (path, body) => request('POST', path, { body })
};

export const healthCheck = async () => api.get('/health');

export const getProducts = async (category) =>
  api.get('/products', { params: category ? { category } : {} }).then((r) => r.data.products);

export const getProduct = async (slug) =>
  api.get(`/products/${slug}`).then((r) => r.data.product);

// Returns { categories, navGroups }
export const getCategories = async () =>
  api.get('/categories').then((r) => r.data);

export const getPrice = async (config) =>
  api.post('/price', config).then((r) => r.data);

// A serverless request body caps out around 4.5MB, and print artwork runs far
// larger. Anything above this threshold is uploaded straight to storage with a
// signed URL and the quote carries only the path; smaller files still ride along
// as an attachment so the notification email has the artwork in it.
const DIRECT_UPLOAD_OVER = 4 * 1024 * 1024;

export const submitQuote = async (formData) => {
  const file = formData.get?.('file');

  if (file && file.size > DIRECT_UPLOAD_OVER) {
    const { data: slot } = await api.post('/quote/artwork-url', {
      filename: file.name,
      size: file.size
    });

    const put = await fetch(slot.signedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      body: file
    });
    if (!put.ok) throw new Error('Could not upload the artwork. Please try again, or email it to us.');

    // Send the path instead of the bytes.
    formData.delete('file');
    formData.append('artworkPath', slot.path);
  }

  return api.post('/quote', formData).then((r) => r.data);
};

// Brevo list subscription. The endpoint answers 200 for any well-formed address
// even if the provider is unreachable, so a rejected promise here means the
// request itself failed, not that the address was refused.
export const subscribeEmail = async ({ email, source, city }) =>
  api.post('/subscribe', { email, source, city }).then((r) => r.data);

// Reviews ------------------------------------------------------------------
export const getReviews = async (slug) =>
  api.get(`/reviews/${slug}`).then((r) => r.data).catch(() => ({ reviews: [], summary: { count: 0, average: null } }));

// Resolves to { state, product, suggestedName }; state is 'ok' | 'used' | 'expired' | 'missing'.
export const getReviewInvite = async (token) =>
  api.get(`/review-invites/${encodeURIComponent(token)}`)
    .then((r) => r.data)
    .catch((e) => ({ state: e.response?.data?.state || 'missing' }));

export const submitReview = async (token, review) =>
  api.post(`/review-invites/${encodeURIComponent(token)}`, review).then((r) => r.data);
