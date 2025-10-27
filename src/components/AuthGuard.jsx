import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './ui/Header';
import Sidebar from './ui/Sidebar';

const AuthGuard = ({ children }) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  const handleMenuToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header 
        onMenuToggle={handleMenuToggle}
        isMenuOpen={isSidebarOpen}
      />
      
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={handleSidebarClose}
      />
      
      {/* Main Content */}
      <main className="lg:ml-64 pt-16">
        <div className="min-h-[calc(100vh-4rem)]">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AuthGuard;