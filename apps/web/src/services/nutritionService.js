import { http } from '../lib/httpClient';

export async function getNutritionOverview(params = {}) {
  const response = await http.get('/v1/nutrition/overview', { params });
  return response.data;
}

export async function getNutritionAnalytics(params = {}) {
  const response = await http.get('/v1/nutrition/analytics', { params });
  return response.data;
}

export async function listNutritionPlans(params = {}) {
  const response = await http.get('/v1/nutrition/plans', { params });
  return response.data.plans ?? [];
}

export async function createNutritionPlan(payload) {
  const response = await http.post('/v1/nutrition/plans', payload);
  return response.data.plan;
}

export async function listFoods(params = {}) {
  const response = await http.get('/v1/nutrition/foods', { params });
  return response.data.foods ?? [];
}

export async function createFood(payload) {
  const response = await http.post('/v1/nutrition/foods', payload);
  return response.data.food;
}

export async function listNutritionAttachments(planId) {
  const response = await http.get(`/v1/nutrition/plans/${planId}/attachments`);
  return response.data.attachments ?? [];
}

export async function uploadNutritionAttachment(planId, payload) {
  const formData = new FormData();
  if (payload.file) {
    formData.append('file', payload.file);
  }

  const response = await http.post(`/v1/nutrition/plans/${planId}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data.attachment;
}
