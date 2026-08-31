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

export const submitQuote = async (formData) =>
  api.post('/quote', formData).then((r) => r.data);

// Brevo list subscription. The endpoint answers 200 for any well-formed address
// even if the provider is unreachable, so a rejected promise here means the
// request itself failed, not that the address was refused.
export const subscribeEmail = async ({ email, source, city }) =>
  api.post('/subscribe', { email, source, city }).then((r) => r.data);
