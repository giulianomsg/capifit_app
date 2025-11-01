import { http } from '../lib/httpClient';

export async function getAssessmentOverview(params = {}) {
  const response = await http.get('/v1/assessments/overview', { params });
  return response.data;
}

export async function listAssessmentClients(params = {}) {
  const response = await http.get('/v1/assessments/clients', { params });
  return response.data.clients ?? [];
}

export async function listAssessmentTemplates(params = {}) {
  const response = await http.get('/v1/assessments/templates', { params });
  return response.data.templates ?? [];
}

export async function listAssessmentHistory(params = {}) {
  const response = await http.get('/v1/assessments/history', { params });
  return response.data.history ?? [];
}

export async function createAssessment(payload) {
  const response = await http.post('/v1/assessments', payload);
  return response.data.assessment;
}

export async function updateAssessment(assessmentId, payload) {
  const response = await http.patch(`/v1/assessments/${assessmentId}`, payload);
  return response.data.assessment;
}

export async function listMeasurements(clientId, params = {}) {
  const response = await http.get(`/v1/assessments/clients/${clientId}/measurements`, { params });
  return response.data.measurements ?? [];
}

export async function createMeasurement(clientId, payload) {
  const response = await http.post(`/v1/assessments/clients/${clientId}/measurements`, payload);
  return response.data.measurement;
}

export async function listProgressPhotos(clientId) {
  const response = await http.get(`/v1/assessments/clients/${clientId}/photos`);
  return response.data.photos ?? [];
}

export async function uploadProgressPhoto(clientId, payload) {
  const formData = new FormData();
  if (payload.file) {
    formData.append('file', payload.file);
  }
  if (payload.assessmentId) {
    formData.append('assessmentId', payload.assessmentId);
  }
  if (payload.capturedAt) {
    formData.append('capturedAt', payload.capturedAt);
  }

  const response = await http.post(`/v1/assessments/clients/${clientId}/photos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data.photo;
}

export async function listAssessmentAttachments(clientId) {
  const response = await http.get(`/v1/assessments/clients/${clientId}/exams`);
  return response.data.attachments ?? [];
}

export async function uploadAssessmentAttachment(clientId, payload) {
  const formData = new FormData();
  if (payload.file) {
    formData.append('file', payload.file);
  }
  if (payload.assessmentId) {
    formData.append('assessmentId', payload.assessmentId);
  }

  const response = await http.post(`/v1/assessments/clients/${clientId}/exams`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data.attachment;
}
