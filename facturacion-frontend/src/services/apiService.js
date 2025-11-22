import api from '../api/axiosConfig';

export const authService = {
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },
  register: async (email, password) => {
    const { data } = await api.post('/auth/register', { email, password });
    return data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export const productService = {
  getAll: async () => {
    const { data } = await api.get('/products');
    return data;
  },
  create: async (productData) => {
    const { data } = await api.post('/products', productData);
    return data;
  },
  delete: async (id) => {
    await api.delete(`/products/${id}`);
  },
  update: async (id, productData) => {
    const { data } = await api.put(`/products/${id}`, productData);
    return data;
  }
};

export const invoiceService = {
  getAll: async () => {
    const { data } = await api.get('/invoices');
    return data;
  },

  getById: async (id) => {
    const { data } = await api.get(`/invoices/${id}`);
    return data;
  },
  
  create: async (invoiceData) => {
    // invoiceData debe coincidir con el body esperado en invoiceController.ts
    const { data } = await api.post('/invoices', invoiceData);
    return data;
  }
};

export const dashboardService = {
  getStats: async () => {
    const { data } = await api.get('/dashboard/stats');
    return data;
  }
};

export const externalService = {
  // Estos endpoints deben coincidir con tus rutas backend que usan externalApiController.ts
  getRuc: async (numero) => {
    const { data } = await api.get(`/external/ruc/${numero}`);
    return data;
  },
  getDni: async (numero) => {
    const { data } = await api.get(`/external/dni/${numero}`);
    return data;
  },
  getExchangeRate: async () => {
    const { data } = await api.get('/external/tipo-cambio');
    return data;
  }
};