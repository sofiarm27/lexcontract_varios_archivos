const API_URL = 'http://127.0.0.1:8000';

const api = {
  async login(username, password) {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${API_URL}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Error al iniciar sesión');
    }

    return response.json();
  },

  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Sesión expirada');
    }

    // Handle 204 No Content correctly (don't call .json() on empty body)
    if (response.status === 204) {
      return null;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Error en la petición' }));
      // Handle Pydantic validation errors (detail is an array of objects)
      if (Array.isArray(errorData.detail)) {
        const messages = errorData.detail.map(err => err.msg || err.message || JSON.stringify(err));
        throw new Error(messages.join('. '));
      }
      throw new Error(errorData.detail || 'Error en la petición');
    }

    return response.json();
  },

  // Helper methods
  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },

  // Library Services
  getClausulas() {
    return this.get('/contracts/clausulas');
  },

  getPlantillas() {
    return this.get('/contracts/plantillas');
  },

  createClausula(data) {
    return this.post('/contracts/clausula', data);
  },

  createPlantilla(data) {
    return this.post('/contracts/plantilla', data);
  },

  updateClausula(id, data) {
    return this.put(`/contracts/clausula/${id}`, data);
  },

  updatePlantilla(id, data) {
    return this.put(`/contracts/plantilla/${id}`, data);
  },

  getContract(id) {
    return this.get(`/contracts/${id}`);
  },

  getAbogados() {
    return this.get('/users/abogados');
  },

  getClients() {
    return this.get('/clients/');
  },
};

export default api;
