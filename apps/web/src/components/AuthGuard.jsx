import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';

const AuthGuard = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, status } = useAuth();

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Validando sessão...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

export default AuthGuard;
