import axios from 'axios';

import { loadSession, persistSession } from './authStorage';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';

export const SESSION_EXPIRED_EVENT = 'capifit:session-expired';
export const ACCESS_TOKEN_UPDATED_EVENT = 'capifit:access-token-updated';

export const http = axios.create({
  baseURL,
  withCredentials: true,
});

let accessToken = null;
let refreshPromise = null;

const dispatchBrowserEvent = (eventName, detail) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(eventName, { detail }));
};

const emitSessionExpired = () => {
  dispatchBrowserEvent(SESSION_EXPIRED_EVENT);
};

const emitAccessTokenUpdated = (token) => {
  dispatchBrowserEvent(ACCESS_TOKEN_UPDATED_EVENT, { token });
};

export function setAccessToken(token) {
  accessToken = token;
  emitAccessTokenUpdated(token);
}

export function clearAccessToken() {
  accessToken = null;
  emitAccessTokenUpdated(null);
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
            const newToken = response.data.token;
            setAccessToken(newToken);

            try {
              const session = loadSession();
              if (session.user) {
                persistSession({ token: newToken, user: session.user });
              }
            } catch (storageError) {
              console.warn('Failed to persist refreshed session', storageError);
            }

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
