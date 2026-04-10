import apiClient from './client';

export const authApi = {
  async getProviders() {
    const response = await apiClient.get('/auth/providers');
    return response.data.data;
  },

  async getCurrentUser() {
    const response = await apiClient.get('/auth/me');
    return response.data.data;
  },

  async login(payload) {
    const response = await apiClient.post('/auth/login', payload);
    return response.data.data;
  },

  async signup(payload) {
    const response = await apiClient.post('/auth/signup', payload);
    return response.data.data;
  },

  async logout() {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },
};
