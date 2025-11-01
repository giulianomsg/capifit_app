import { http } from '../lib/httpClient';

const serializeParams = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (Array.isArray(value)) {
      if (value.length > 0) {
        searchParams.set(key, value.join(','));
      }
      return;
    }

    searchParams.set(key, value);
  });

  return searchParams.toString();
};

export async function listExercises({ search, category, muscleGroup, difficulty, page, perPage } = {}) {
  const params = {};
  if (search) params.search = search;
  if (category) params.category = category;
  if (muscleGroup) params.muscleGroup = muscleGroup;
  if (difficulty) params.difficulty = difficulty;
  if (page) params.page = page;
  if (perPage) params.perPage = perPage;

  const response = await http.get('/v1/exercises', {
    params,
    paramsSerializer: serializeParams,
  });

  return response.data;
}

export async function createExercise(payload) {
  const response = await http.post('/v1/exercises', payload);
  return response.data.exercise;
}

export async function updateExercise(id, payload) {
  const response = await http.patch(`/v1/exercises/${id}`, payload);
  return response.data.exercise;
}

export async function deleteExercise(id) {
  await http.delete(`/v1/exercises/${id}`);
}

export async function getExercise(id) {
  const response = await http.get(`/v1/exercises/${id}`);
  return response.data.exercise;
}
