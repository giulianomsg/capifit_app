import axios from 'axios';

const api = axios.create({
  baseURL: import.meta?.env?.VITE_API_URL || '/api/v1'
});

export const fetchTrainerClientProfiles = async ({ page = 1, pageSize = 10, search = '' } = {}) => {
  const response = await api.get('/trainer-client-profiles', {
    params: { page, pageSize, search }
  });
  return response.data;
};

export const createTrainerClientProfile = async (payload) => {
  const response = await api.post('/trainer-client-profiles', payload);
  return response.data;
};

export const updateTrainerClientProfile = async (id, payload) => {
  const response = await api.put(`/trainer-client-profiles/${id}`, payload);
  return response.data;
};

export const deleteTrainerClientProfile = async (id) => {
  await api.delete(`/trainer-client-profiles/${id}`);
  return id;
};

export default api;
