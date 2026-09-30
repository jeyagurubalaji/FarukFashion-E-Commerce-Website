import axios from 'axios';

const api = axios.create({
  // Use Vite env variable or fallback to the live Render backend
  baseURL: import.meta.env.VITE_API_URL || 'https://farukfashion-e-commerce-web.onrender.com/api',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ff_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ff_token');
      localStorage.removeItem('ff_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  resetPassword: (data) => api.post('/auth/reset-password', data)
};

export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  byCategory: (cat, params) => api.get(`/products/category/${cat}`, { params }),
  search: (q, params) => api.get('/products/search', { params: { q, ...params } }),
  featured: (params) => api.get('/products/featured', { params }),
  recommendations: () => api.get('/products/recommendations'),
  categories: () => api.get('/categories')
};

export const orderAPI = {
  create: (data) => api.post('/orders', data),
  verifyPayment: (data) => api.post('/orders/verify-payment', data),
  myOrders: (params) => api.get('/orders/my', { params }),
  get: (id) => api.get(`/orders/${id}`),
  requestReturn: (data) => api.post('/orders/return', data)
};

export const offerAPI = {
  banners: () => api.get('/offers/banners'),
  all: () => api.get('/offers')
};

export const contactAPI = {
  send: (data) => api.post('/contact', data),
  info: () => api.get('/contact/info')
};

export const adminAPI = {
  dashboard: () => api.get('/admin/dashboard'),
  products: (params) => api.get('/admin/products', { params }),
  createProduct: (data) => api.post('/admin/products', data),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => api.post(`/admin/products/${id}/delete`),
  deactivateProduct: (id) => api.put(`/admin/products/${id}/deactivate`),
  activateProduct: (id) => api.put(`/admin/products/${id}/activate`),
  updateStock: (id, data) => api.put(`/admin/products/${id}/stock`, data),
  lowStock: () => api.get('/admin/products/low-stock'),
  orders: (params) => api.get('/admin/orders', { params }),
  updateOrderStatus: (id, status) => api.put(`/admin/orders/${id}/status`, null, { params: { status } }),
  customers: (params) => api.get('/admin/customers', { params }),
  offers: () => api.get('/admin/offers'),
    createOffer: (data) => api.post('/admin/offers', data),
    updateOffer: (id, data) => api.put(`/admin/offers/${id}`, data),
    deleteOffer: (id) => api.post(`/admin/offers/${id}/delete`),
  updateOrder: (id, data) => api.put(`/admin/orders/${id}`, data),
    deleteOrder: (id) => api.post(`/admin/orders/${id}/delete`),
    updateCustomer: (id, data) => api.put(`/admin/customers/${id}`, data),
    deleteCustomer: (id) => api.post(`/admin/customers/${id}/delete`),
  logs: {
    login: (params) => api.get('/admin/logs/login', { params }),
    purchase: (params) => api.get('/admin/logs/purchase', { params }),
    returns: (params) => api.get('/admin/logs/returns', { params }),
    inventory: (params) => api.get('/admin/logs/inventory', { params })
  },
  uploadImage: (file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/admin/upload/image', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export default api;
