import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Sidebar = ({ isOpen = false, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState({});

  const isAuthPage = ['/login', '/register', '/']?.includes(location?.pathname);

  if (isAuthPage) {
    return null;
  }

  const menuItems = [
    {
      label: 'Dashboard',
      path: '/dashboard-principal',
      icon: 'LayoutDashboard',
      tooltip: 'Visão geral e métricas principais'
    },
    {
      label: 'Perfil',
      path: '/perfil-do-personal',
      icon: 'User',
      tooltip: 'Gerenciar perfil profissional'
    },
    {
      label: 'Alunos',
      path: '/gerenciar-alunos',
      icon: 'Users',
      tooltip: 'Gerenciar clientes e assinaturas',
      badge: 12
    },
    {
      label: 'Treinos',
      path: '/criar-treinos',
      icon: 'Dumbbell',
      tooltip: 'Criar e gerenciar treinos'
    },
    {
      label: 'Exercícios',
      path: '/exercise-library',
      icon: 'Book',
      tooltip: 'Biblioteca de exercícios'
    },
    {
      label: 'Nutrição',
      path: '/nutrition-management',
      icon: 'Apple',
      tooltip: 'Planejamento nutricional'
    },
    {
      label: 'Avaliações',
      path: '/physical-assessment-system',
      icon: 'FileText',
      tooltip: 'Acompanhamento e progresso'
    },
    {
      label: 'Mensagens',
      path: '/chat-communication-hub',
      icon: 'MessageSquare',
      tooltip: 'Comunicação com clientes',
      badge: 5
    },
    {
      label: 'Relatórios',
      path: '/relatorios',
      icon: 'BarChart3',
      tooltip: 'Analytics e relatórios'
    },
    {
      label: 'Configurações',
      path: '/configuracoes',
      icon: 'Settings',
      tooltip: 'Configurações da conta'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const isActiveRoute = (path) => {
    return location?.pathname === path;
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev?.[section]
    }));
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}
      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border
          transform transition-transform duration-300 ease-smooth
          lg:translate-x-0 lg:z-30
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">🦫</span>
            </div>
            <span className="text-lg font-semibold text-foreground">
              CapiFit
            </span>
          </div>
          
          {/* Close button for mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden"
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Role Context */}
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
              <Icon name="User" size={12} color="white" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Personal Trainer</p>
              <p className="text-xs text-muted-foreground">João Silva</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {menuItems?.map((item) => (
            <div key={item?.path} className="relative group">
              <button
                onClick={() => handleNavigation(item?.path)}
                className={`
                  w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg
                  transition-all duration-200 ease-micro
                  ${isActiveRoute(item?.path)
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-foreground hover:bg-muted hover:text-foreground'
                  }
                `}
              >
                <Icon 
                  name={item?.icon} 
                  size={18} 
                  className="mr-3 flex-shrink-0"
                />
                <span className="flex-1 text-left">{item?.label}</span>
                
                {/* Badge */}
                {item?.badge && (
                  <span className={`
                    ml-2 px-2 py-0.5 text-xs font-medium rounded-full
                    ${isActiveRoute(item?.path)
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-accent text-accent-foreground'
                    }
                  `}>
                    {item?.badge}
                  </span>
                )}
              </button>

              {/* Tooltip */}
              <div className="
                absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground
                text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 
                group-hover:visible transition-all duration-200 z-50 whitespace-nowrap
                top-1/2 transform -translate-y-1/2
              ">
                {item?.tooltip}
                <div className="absolute right-full top-1/2 transform -translate-y-1/2 
                  border-4 border-transparent border-r-popover"></div>
              </div>
            </div>
          ))}
        </nav>

        {/* Quick Actions */}
        <div className="p-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleNavigation('/criar-treinos')}
            className="w-full justify-start"
            iconName="Plus"
            iconPosition="left"
          >
            Novo Treino
          </Button>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>v2.1.0</span>
            <span>© 2025 CapiFit</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;