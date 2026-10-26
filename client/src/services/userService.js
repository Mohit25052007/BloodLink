import api from './api';

export const userService = {
  async getMyProfile() {
    const response = await api.get('/users/me');
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await api.patch('/users/me', profileData);
    return response.data;
  },

  async updateDonorProfile(donorData) {
    const response = await api.patch('/users/me/donor-profile', donorData);
    return response.data;
  },

  async searchDonors(params = {}) {
    const response = await api.get('/users/donors', { params });
    return response.data;
  },

  async getDonorById(id) {
    const response = await api.get(`/users/donors/${id}`);
    return response.data;
  },
};

export default userService;
