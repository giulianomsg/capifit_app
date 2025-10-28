import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import { useAuth } from '../../hooks/useAuth';
import DatabaseService from '../../lib/database';

const fallbackMenus = [
  { label: 'Dashboard', path: '/dashboard-principal', icon: 'LayoutDashboard' },
  { label: 'Perfil', path: '/perfil-do-personal', icon: 'User' },
  { label: 'Alunos', path: '/gerenciar-alunos', icon: 'Users' },
  { label: 'Treinos', path: '/criar-treinos', icon: 'Dumbbell' },
  { label: 'Mensagens', path: '/chat-communication-hub', icon: 'MessageSquare' },
];

const Sidebar = ({ isOpen = false, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expandedSections, setExpandedSections] = useState({});
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [menuItems, setMenuItems] = useState(fallbackMenus);
  const [loadingMenus, setLoadingMenus] = useState(false);

  const isAuthPage = ['/login', '/register', '/']?.includes(location?.pathname);

  if (isAuthPage) {
    return null;
  }

  useEffect(() => {
    let isMounted = true;

    const loadMenus = async () => {
      setLoadingMenus(true);
      try {
        const { data, error } = await DatabaseService.getMenus();
        if (error) {
          console.warn('Menu fetch error:', error);
        }
        if (isMounted && Array.isArray(data) && data.length) {
          setMenuItems(data);
        }
      } catch (error) {
        console.error('Menu load failed:', error);
      } finally {
        if (isMounted) {
          setLoadingMenus(false);
        }
      }
    };

    loadMenus();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const isActiveRoute = (path) => {
    return location?.pathname === path;
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
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
          fixed top-0 left-0 z-50 h-full bg-card border-r border-border
          transform transition-all duration-300 ease-in-out
          lg:translate-x-0 lg:z-30
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isCollapsed ? 'w-16' : 'w-64'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🦫</span>
              </div>
              <span className="text-lg font-semibold text-foreground">
                CapiFit
              </span>
            </div>
          )}
          
          {isCollapsed && (
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-lg">🦫</span>
            </div>
          )}
          
          {/* Collapse Toggle - Desktop Only */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="hidden lg:flex"
          >
            <Icon name={isCollapsed ? "ChevronRight" : "ChevronLeft"} size={16} />
          </Button>

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
        {!isCollapsed && (
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                <Icon name="User" size={12} color="white" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {user?.full_name || user?.email || 'Usuário CapiFit'}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user?.role || 'trainer'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {(loadingMenus ? fallbackMenus : menuItems)?.map((item) => (
            <div key={item?.path} className="relative group">
              <button
                onClick={() => handleNavigation(item?.path)}
                className={`
                  w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-3'} py-2.5 text-sm font-medium rounded-lg
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
                  className={`${isCollapsed ? '' : 'mr-3'} flex-shrink-0`}
                />
                
                {!isCollapsed && (
                  <>
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
                  </>
                )}
              </button>

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="
                  absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground
                  text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 
                  group-hover:visible transition-all duration-200 z-50 whitespace-nowrap
                  top-1/2 transform -translate-y-1/2
                ">
                  {item?.label}
                  {item?.badge && (
                    <span className="ml-1 px-1 py-0.5 text-xs bg-accent text-accent-foreground rounded">
                      {item?.badge}
                    </span>
                  )}
                  <div className="absolute right-full top-1/2 transform -translate-y-1/2 
                    border-4 border-transparent border-r-popover"></div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Quick Actions */}
        {!isCollapsed && (
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
        )}

        {/* Footer */}
        {!isCollapsed && (
          <div className="px-4 py-3 border-t border-border">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>v2.1.0</span>
              <span>© 2025 CapiFit</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;