import api from './api';

export const contactRequestService = {
  async createContactRequest(data) {
    const response = await api.post('/contact-requests', data);
    return response.data;
  },

  async getIncomingRequests() {
    const response = await api.get('/contact-requests/incoming');
    return response.data;
  },

  async getOutgoingRequests() {
    const response = await api.get('/contact-requests/outgoing');
    return response.data;
  },

  async respondToRequest(id, action) {
    const response = await api.patch(`/contact-requests/${id}/respond`, { action });
    return response.data;
  },

  async cancelRequest(id) {
    const response = await api.patch(`/contact-requests/${id}/cancel`);
    return response.data;
  },
};

export default contactRequestService;
