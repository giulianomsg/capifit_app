import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthGuard = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se o usuário está autenticado usando a chave correta
    const isAuthenticated = localStorage.getItem('capifit_isAuthenticated');
    const userRole = localStorage.getItem('capifit_userRole');
    
    if (!isAuthenticated || isAuthenticated !== 'true') {
      // Redirecionar para login se não estiver autenticado
      navigate('/login');
      return;
    }

    // Log para debug
    console.log('CapiFit Auth Check:', { isAuthenticated, userRole });
  }, [navigate]);

  // Verificar autenticação antes de renderizar
  const isAuthenticated = localStorage.getItem('capifit_isAuthenticated');
  
  if (!isAuthenticated || isAuthenticated !== 'true') {
    return null; // Não renderizar nada enquanto redireciona
  }

  return children;
};

export default AuthGuard;