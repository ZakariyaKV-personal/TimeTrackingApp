// commonleaveService.js
import api from './api';

const BASE_URL = '/api/commonleave';

const commonleaveService = {
  getAllLeaves: async (domain) => {
    const response = await api.get(`${BASE_URL}/${domain}`);
    return response.data;
  },

  createLeave: async (leaveData) => {
    const response = await api.post(BASE_URL, leaveData);
    return response.data;
  },

  updateLeave: async (id, leaveData) => {
    const response = await api.put(`${BASE_URL}/${id}`, leaveData);
    return response.data;
  },

  deleteLeave: async (id) => {
    const response = await api.delete(`${BASE_URL}/${id}`);
    return response.data;
  },
};

export default commonleaveService;
