import React, { useState, useRef, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const NotificationIndicator = ({ 
  notifications = [], 
  className = "",
  maxVisible = 5,
  onNotificationClick = null,
  onMarkAsRead = null,
  onMarkAllAsRead = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Default notifications for demo
  const defaultNotifications = [
    {
      id: 1,
      type: 'message',
      title: 'Nova mensagem de Maria Santos',
      message: 'Olá! Tenho uma dúvida sobre o treino de hoje...',
      timestamp: '2 min atrás',
      read: false,
      avatar: null
    },
    {
      id: 2,
      type: 'subscription',
      title: 'Assinatura renovada',
      message: 'Carlos Silva renovou sua assinatura mensal',
      timestamp: '15 min atrás',
      read: false,
      avatar: null
    },
    {
      id: 3,
      type: 'achievement',
      title: 'Meta alcançada!',
      message: 'Ana Costa completou 30 dias consecutivos de treino',
      timestamp: '1 hora atrás',
      read: false,
      avatar: null
    },
    {
      id: 4,
      type: 'reminder',
      title: 'Lembrete de avaliação',
      message: 'Pedro Oliveira tem avaliação agendada para amanhã',
      timestamp: '2 horas atrás',
      read: true,
      avatar: null
    },
    {
      id: 5,
      type: 'system',
      title: 'Atualização do sistema',
      message: 'Nova versão disponível com melhorias de performance',
      timestamp: '1 dia atrás',
      read: true,
      avatar: null
    }
  ];

  const currentNotifications = notifications?.length > 0 ? notifications : defaultNotifications;
  const unreadCount = currentNotifications?.filter(n => !n?.read)?.length;
  const visibleNotifications = currentNotifications?.slice(0, maxVisible);

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

  const handleNotificationClick = (notification) => {
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
    
    if (!notification?.read && onMarkAsRead) {
      onMarkAsRead(notification?.id);
    }
  };

  const handleMarkAllAsRead = () => {
    if (onMarkAllAsRead) {
      onMarkAllAsRead();
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message':
        return 'MessageSquare';
      case 'subscription':
        return 'CreditCard';
      case 'achievement':
        return 'Trophy';
      case 'reminder':
        return 'Clock';
      case 'system':
        return 'Settings';
      default:
        return 'Bell';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'message':
        return 'text-primary';
      case 'subscription':
        return 'text-success';
      case 'achievement':
        return 'text-accent';
      case 'reminder':
        return 'text-warning';
      case 'system':
        return 'text-muted-foreground';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Notification Bell */}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleToggle}
        className="relative"
      >
        <Icon name="Bell" size={20} />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
            <span className="text-xs text-accent-foreground font-medium">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </Button>
      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-popover border border-border rounded-lg elevation-2 z-50 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">
              Notificações
            </h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs text-primary hover:text-primary"
              >
                Marcar todas como lidas
              </Button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {visibleNotifications?.length > 0 ? (
              <div className="py-1">
                {visibleNotifications?.map((notification) => (
                  <button
                    key={notification?.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`
                      w-full flex items-start px-4 py-3 text-left hover:bg-muted transition-colors
                      ${!notification?.read ? 'bg-primary/5' : ''}
                    `}
                  >
                    {/* Icon */}
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0
                      ${!notification?.read ? 'bg-primary/10' : 'bg-muted'}
                    `}>
                      <Icon 
                        name={getNotificationIcon(notification?.type)} 
                        size={14} 
                        className={getNotificationColor(notification?.type)}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <p className={`
                          text-sm font-medium truncate
                          ${!notification?.read ? 'text-foreground' : 'text-muted-foreground'}
                        `}>
                          {notification?.title}
                        </p>
                        {!notification?.read && (
                          <div className="w-2 h-2 bg-primary rounded-full ml-2 mt-1 flex-shrink-0" />
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification?.message}
                      </p>
                      
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification?.timestamp}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-4 py-8 text-center">
                <Icon name="Bell" size={32} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma notificação
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {currentNotifications?.length > maxVisible && (
            <div className="border-t border-border px-4 py-3">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-primary hover:text-primary"
              >
                Ver todas as notificações
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationIndicator;