import { http } from '../lib/httpClient';

export async function listThreads(params = {}) {
  const response = await http.get('/v1/messaging/threads', { params });
  return response.data;
}

export async function createThread(payload) {
  const response = await http.post('/v1/messaging/threads', payload);
  return response.data;
}

export async function fetchThread(threadId) {
  const response = await http.get(`/v1/messaging/threads/${threadId}`);
  return response.data;
}

export async function sendThreadMessage(threadId, payload) {
  const response = await http.post(`/v1/messaging/threads/${threadId}/messages`, payload);
  return response.data;
}

export async function markThreadAsRead(threadId, payload) {
  await http.post(`/v1/messaging/threads/${threadId}/read`, payload);
}
