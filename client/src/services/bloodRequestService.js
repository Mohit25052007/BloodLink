import api from './api';

export const bloodRequestService = {
  async getRequests(params = {}) {
    const response = await api.get('/blood-requests', { params });
    return response.data;
  },

  async getMyRequests() {
    const response = await api.get('/blood-requests/my-requests');
    return response.data;
  },

  async getRequestById(id) {
    const response = await api.get(`/blood-requests/${id}`);
    return response.data;
  },

  async createRequest(data) {
    const response = await api.post('/blood-requests', data);
    return response.data;
  },

  async updateRequest(id, data) {
    const response = await api.patch(`/blood-requests/${id}`, data);
    return response.data;
  },

  async updateStatus(id, status) {
    const response = await api.patch(`/blood-requests/${id}/status`, { status });
    return response.data;
  },

  async deleteRequest(id) {
    const response = await api.delete(`/blood-requests/${id}`);
    return response.data;
  },
};

export default bloodRequestService;
