import api from './api';

export const adminService = {
  async getDashboardStats() {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  async getUsers(params = {}) {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  async updateVerification(id, status, notes = '') {
    const response = await api.patch(`/admin/users/${id}/verification`, { status, notes });
    return response.data;
  },

  async updateUserStatus(id, status) {
    const response = await api.patch(`/admin/users/${id}/status`, { status });
    return response.data;
  },

  async getBloodRequests(params = {}) {
    const response = await api.get('/admin/blood-requests', { params });
    return response.data;
  },

  async updateBloodRequestStatus(id, status) {
    const response = await api.patch(`/admin/blood-requests/${id}/status`, { status });
    return response.data;
  },
};

export default adminService;
