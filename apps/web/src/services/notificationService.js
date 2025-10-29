import { http } from '../lib/httpClient';

export async function fetchNotifications(params) {
  const response = await http.get('/v1/notifications', { params });
  return response.data;
}

export async function markNotificationsAsRead(ids) {
  const response = await http.post('/v1/notifications/mark-read', { ids });
  return response.data;
}

export async function deleteNotifications(ids) {
  const response = await http.delete('/v1/notifications', { data: { ids } });
  return response.data;
}

export async function fetchNotificationPreferences() {
  const response = await http.get('/v1/notifications/preferences');
  return response.data;
}

export async function updateNotificationPreferences(payload) {
  const response = await http.put('/v1/notifications/preferences', payload);
  return response.data;
}
