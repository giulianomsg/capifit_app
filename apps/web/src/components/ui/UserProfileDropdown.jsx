import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const UserProfileDropdown = ({ user = null, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const defaultUser = {
    name: 'João Silva',
    role: 'Personal Trainer',
    avatar: null,
    email: 'joao.silva@fittrainer.com'
  };

  const currentUser = user || defaultUser;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef?.current && !dropdownRef?.current?.contains(event?.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleMenuClick = (action, path = null) => {
    setIsOpen(false);
    
    switch (action) {
      case 'profile': navigate('/perfil-do-personal');
        break;
      case 'settings': navigate('/configuracoes');
        break;
      case 'help':
        // Handle help action
        console.log('Help clicked');
        break;
      case 'logout':
        // Handle logout
        console.log('Logout clicked');
        navigate('/login');
        break;
      default:
        if (path) navigate(path);
    }
  };

  const menuItems = [
    {
      label: 'Meu Perfil',
      icon: 'User',
      action: 'profile',
      description: 'Gerenciar informações pessoais'
    },
    {
      label: 'Configurações',
      icon: 'Settings',
      action: 'settings',
      description: 'Preferências da conta'
    },
    {
      label: 'Ajuda',
      icon: 'HelpCircle',
      action: 'help',
      description: 'Suporte e documentação'
    }
  ];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <Button
        variant="ghost"
        onClick={handleToggle}
        className="flex items-center space-x-2 px-3 py-2 h-auto"
      >
        {/* Avatar */}
        <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center overflow-hidden">
          {currentUser?.avatar ? (
            <img 
              src={currentUser?.avatar} 
              alt={currentUser?.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Icon name="User" size={16} color="white" />
          )}
        </div>

        {/* User Info - Hidden on mobile */}
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-foreground leading-none">
            {currentUser?.name}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {currentUser?.role}
          </p>
        </div>

        {/* Chevron */}
        <Icon 
          name="ChevronDown" 
          size={16} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </Button>
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-popover border border-border rounded-lg elevation-2 py-2 z-50 animate-fade-in">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center overflow-hidden">
                {currentUser?.avatar ? (
                  <img 
                    src={currentUser?.avatar} 
                    alt={currentUser?.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Icon name="User" size={20} color="white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {currentUser?.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {currentUser?.email}
                </p>
                <p className="text-xs text-secondary font-medium">
                  {currentUser?.role}
                </p>
              </div>
            </div>
          </div>
          
          {/* Menu Items */}
          <div className="py-1">
            {menuItems?.map((item) => (
              <button
                key={item?.action}
                onClick={() => handleMenuClick(item?.action)}
                className="w-full flex items-center px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors group"
              >
                <Icon 
                  name={item?.icon} 
                  size={16} 
                  className="mr-3 text-muted-foreground group-hover:text-foreground transition-colors" 
                />
                <div className="flex-1 text-left">
                  <p className="font-medium">{item?.label}</p>
                  <p className="text-xs text-muted-foreground">{item?.description}</p>
                </div>
              </button>
            ))}
          </div>
          
          {/* Logout Section */}
          <div className="border-t border-border pt-1">
            <button
              onClick={() => handleMenuClick('logout')}
              className="w-full flex items-center px-4 py-2.5 text-sm text-destructive hover:bg-muted transition-colors group"
            >
              <Icon 
                name="LogOut" 
                size={16} 
                className="mr-3 group-hover:text-destructive transition-colors" 
              />
              <div className="flex-1 text-left">
                <p className="font-medium">Sair</p>
                <p className="text-xs text-muted-foreground">Encerrar sessão</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;