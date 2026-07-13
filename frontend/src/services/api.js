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
