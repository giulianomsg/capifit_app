import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';

export const http = axios.create({
  baseURL,
  withCredentials: true,
});

let accessToken = null;
let refreshPromise = null;

const emitSessionExpired = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('capifit:session-expired'));
  }
};

export function setAccessToken(token) {
  accessToken = token;
}

export function clearAccessToken() {
  accessToken = null;
}

export function getAccessToken() {
  return accessToken;
}

http.interceptors.request.use((config) => {
  if (accessToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.skipAuth &&
      !originalRequest?.url?.includes('/auth/login') &&
      !originalRequest?.url?.includes('/auth/register')
    ) {
      originalRequest._retry = true;

      if (!refreshPromise) {
        refreshPromise = axios
          .post(
            `${baseURL}/v1/auth/refresh`,
            {},
            {
              withCredentials: true,
              headers: { Authorization: undefined },
            },
          )
          .then((response) => {
            setAccessToken(response.data.token);
            return response;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      try {
        const refreshResponse = await refreshPromise;
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.token}`;
        }
        return http(originalRequest);
      } catch (refreshError) {
        clearAccessToken();
        emitSessionExpired();
        throw refreshError;
      }
    }

    throw error;
  },
);
