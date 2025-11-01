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

export async function listUsers({ page, perPage, search, roles, statuses, includeDeleted } = {}) {
  const params = {};
  if (page) params.page = page;
  if (perPage) params.perPage = perPage;
  if (search) params.search = search;
  if (roles?.length) params.roles = roles;
  if (statuses?.length) params.statuses = statuses;
  if (includeDeleted) params.includeDeleted = includeDeleted;

  const response = await http.get('/v1/users', {
    params,
    paramsSerializer,
  });

  return response.data;
}

export async function getUser(userId) {
  const response = await http.get(`/v1/users/${userId}`);
  return response.data?.user;
}

export async function createUser(payload) {
  const response = await http.post('/v1/users', payload);
  return response.data?.user;
}

export async function updateUser(userId, payload) {
  const response = await http.patch(`/v1/users/${userId}`, payload);
  return response.data?.user;
}

export async function deleteUser(userId) {
  await http.delete(`/v1/users/${userId}`);
}

export async function uploadUserAvatar(userId, file) {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await http.patch(`/v1/users/${userId}/avatar`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data?.user;
}
