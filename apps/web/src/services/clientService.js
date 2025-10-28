import { http } from '../lib/httpClient';

const paramsSerializer = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      if (value.length > 0) {
        searchParams.set(key, value.join(','));
      }
      return;
    }

    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value);
    }
  });

  return searchParams.toString();
};

export async function listClients({ search, subscription, paymentStatus, activityLevel } = {}) {
  const params = {};
  if (search) params.search = search;
  if (subscription) params.subscription = subscription;
  if (paymentStatus) params.paymentStatus = paymentStatus;
  if (activityLevel) params.activityLevel = activityLevel;

  const response = await http.get('/v1/clients', {
    params,
    paramsSerializer,
  });

  return response.data;
}

export async function createClient(payload, options = {}) {
  const response = await http.post('/v1/clients', payload, {
    params: options,
    paramsSerializer,
  });

  return response.data?.client;
}

export async function updateClient(assignmentId, payload) {
  const response = await http.patch(`/v1/clients/${assignmentId}`, payload);
  return response.data?.client;
}

export async function deleteClient(assignmentId) {
  await http.delete(`/v1/clients/${assignmentId}`);
}
