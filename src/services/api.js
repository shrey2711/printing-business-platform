import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

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
