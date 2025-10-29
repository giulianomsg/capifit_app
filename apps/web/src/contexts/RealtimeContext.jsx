import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';

import { useAuth } from './AuthContext';
import { getAccessToken } from '../lib/httpClient';

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

    setSocket(instance);

    return () => {
      instance.disconnect();
    };
  }, [status]);

  const value = useMemo(
    () => ({ socket }),
    [socket],
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtime() {
  return useContext(RealtimeContext);
}
