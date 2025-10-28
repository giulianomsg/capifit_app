import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';
import Icon from '../AppIcon';
import Button from './Button';

const Header = ({ onMenuToggle, isMenuOpen = false }) => {
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();

  const isAuthPage = ['/login', '/register', '/'].includes(location.pathname);

  if (isAuthPage) {
    return null;
  }

  const handleUserMenuToggle = () => {
    setShowUserMenu((prev) => !prev);
  };

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border h-16">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <div className="flex items-center lg:hidden">
          <Button variant="ghost" size="icon" onClick={onMenuToggle} className="mr-2">
            <Icon name={isMenuOpen ? 'X' : 'Menu'} size={24} />
          </Button>
        </div>

        <div className="hidden lg:flex items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">🦫</span>
            </div>
            <span className="text-xl font-semibold text-foreground">CapiFit</span>
          </div>
        </div>

        <div className="flex items-center lg:hidden">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">🦫</span>
            </div>
            <span className="text-lg font-semibold text-foreground">CapiFit</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative">
            <Icon name="Bell" size={20} />
          </Button>

          <div className="relative">
            <Button variant="ghost" onClick={handleUserMenuToggle} className="flex items-center space-x-2 px-3">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                <Icon name="User" size={16} color="white" />
              </div>
              <span className="hidden md:block text-sm font-medium text-foreground">
                {user?.name ?? 'Usuário'}
              </span>
              <Icon
                name="ChevronDown"
                size={16}
                className={`transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}
              />
            </Button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-popover border border-border rounded-lg elevation-2 py-2 z-50">
                <div className="px-4 py-2 border-b border-border">
                  <p className="text-sm font-medium text-foreground">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {user?.roles?.length ? user.roles[0].toUpperCase() : 'Conta'}
                  </p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => setShowUserMenu(false)}
                    className="w-full flex items-center px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <Icon name="User" size={16} className="mr-3" />
                    Meu Perfil
                  </button>

                  <button
                    onClick={() => setShowUserMenu(false)}
                    className="w-full flex items-center px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <Icon name="Settings" size={16} className="mr-3" />
                    Configurações
                  </button>

                  <button
                    onClick={() => setShowUserMenu(false)}
                    className="w-full flex items-center px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <Icon name="HelpCircle" size={16} className="mr-3" />
                    Ajuda
                  </button>
                </div>

                <div className="border-t border-border pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-sm text-destructive hover:bg-muted transition-colors"
                  >
                    <Icon name="LogOut" size={16} className="mr-3" />
                    Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showUserMenu && <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setShowUserMenu(false)} />}
    </header>
  );
};

export default Header;
