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

export async function listWorkouts(params = {}) {
  const response = await http.get('/v1/workouts', {
    params,
    paramsSerializer: serializeParams,
  });

  return response.data;
}

export async function createWorkout(payload) {
  const response = await http.post('/v1/workouts', payload);
  return response.data.workout;
}

export async function getWorkout(id) {
  const response = await http.get(`/v1/workouts/${id}`);
  return response.data.workout;
}

export async function updateWorkout(id, payload) {
  const response = await http.patch(`/v1/workouts/${id}`, payload);
  return response.data.workout;
}

export async function deleteWorkout(id) {
  await http.delete(`/v1/workouts/${id}`);
}

export async function registerSession(workoutId, payload) {
  const response = await http.post(`/v1/workouts/${workoutId}/sessions`, payload);
  return response.data.session;
}

export async function listSessions(workoutId) {
  const response = await http.get(`/v1/workouts/${workoutId}/sessions`);
  return response.data.sessions;
}

export async function getWorkoutSummary(params = {}) {
  const response = await http.get('/v1/workouts/summary', {
    params,
    paramsSerializer: serializeParams,
  });

  return response.data;
}
