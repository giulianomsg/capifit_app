import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';

import { useAuth } from './AuthContext';
import {
  ACCESS_TOKEN_UPDATED_EVENT,
  SESSION_EXPIRED_EVENT,
  getAccessToken,
} from '../lib/httpClient';

const RealtimeContext = createContext({ socket: null });

export function RealtimeProvider({ children }) {
  const { status } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (status !== 'authenticated') {
      setSocket((existing) => {
        existing?.disconnect();
        return null;
      });
      return undefined;
    }

    const token = getAccessToken();
    if (!token) {
      return undefined;
    }

    const url = import.meta.env.VITE_WS_URL ?? 'http://localhost:3001';
    const path = import.meta.env.VITE_WS_PATH ?? '/socket.io';
    const instance = io(url, {
      path,
      transports: ['websocket'],
      auth: { token },
    });

    instance.on('connect_error', (error) => {
      console.error('Realtime connection error', error);
      if (error?.message && typeof window !== 'undefined') {
        if (error.message.toLowerCase().includes('auth')) {
          window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
        }
      }
    });

    instance.on('auth:error', (payload) => {
      console.error('Realtime authentication error', payload);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
      }
    });

    setSocket(instance);

    return () => {
      instance.disconnect();
    };
  }, [status]);

  useEffect(() => {
    if (!socket) {
      return undefined;
    }

    const handleTokenUpdate = (event) => {
      const nextToken = event?.detail?.token ?? getAccessToken();
      if (!nextToken) {
        socket.disconnect();
        return;
      }

      socket.auth = { ...(socket.auth ?? {}), token: nextToken };
      socket.emit('auth:refresh', { token: nextToken }, (response) => {
        if (!response || response.status !== 'ok') {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
          }
          socket.disconnect();
        }
      });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener(ACCESS_TOKEN_UPDATED_EVENT, handleTokenUpdate);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(ACCESS_TOKEN_UPDATED_EVENT, handleTokenUpdate);
      }
    };
  }, [socket]);

  const value = useMemo(
    () => ({ socket }),
    [socket],
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtime() {
  return useContext(RealtimeContext);
}
