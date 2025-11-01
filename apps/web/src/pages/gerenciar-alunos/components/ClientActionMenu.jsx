import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ClientActionMenu = ({ 
  client, 
  onAction = null, 
  variant = 'desktop',
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef?.current && !dropdownRef?.current?.contains(event?.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = (action) => {
    if (onAction) {
      onAction(action, client);
    }
    setIsOpen(false);
  };

  const actions = [
    {
      id: 'view',
      label: 'Ver Perfil',
      icon: 'Eye',
      description: 'Visualizar detalhes completos'
    },
    {
      id: 'message',
      label: 'Enviar Mensagem',
      icon: 'MessageSquare',
      description: 'Comunicar com cliente'
    },
    {
      id: 'progress',
      label: 'Ver Progresso',
      icon: 'TrendingUp',
      description: 'Acompanhar evolução'
    },
    {
      id: 'workout',
      label: 'Criar Treino',
      icon: 'Dumbbell',
      description: 'Novo programa de exercícios'
    },
    {
      id: 'assessment',
      label: 'Agendar Avaliação',
      icon: 'Calendar',
      description: 'Marcar avaliação física'
    },
    {
      id: 'edit',
      label: 'Editar Cliente',
      icon: 'Edit',
      description: 'Alterar informações'
    },
    {
      id: 'suspend',
      label: 'Suspender',
      icon: 'Pause',
      description: 'Pausar assinatura',
      variant: 'warning'
    },
    {
      id: 'delete',
      label: 'Remover',
      icon: 'Trash2',
      description: 'Excluir cliente',
      variant: 'destructive'
    }
  ];

  // Mobile variant - show quick actions as buttons
  if (variant === 'mobile') {
    const quickActions = actions?.slice(0, 3);
    
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {quickActions?.map((action) => (
          <Button
            key={action?.id}
            variant="ghost"
            size="icon"
            onClick={() => handleAction(action?.id)}
            className="w-8 h-8"
          >
            <Icon name={action?.icon} size={16} />
          </Button>
        ))}
        <div className="relative" ref={dropdownRef}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="w-8 h-8"
          >
            <Icon name="MoreVertical" size={16} />
          </Button>
          
          {isOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-popover border border-border rounded-lg elevation-2 py-1 z-50">
              {actions?.slice(3)?.map((action) => (
                <button
                  key={action?.id}
                  onClick={() => handleAction(action?.id)}
                  className={`
                    w-full flex items-center px-3 py-2 text-sm hover:bg-muted transition-colors
                    ${action?.variant === 'destructive' ? 'text-destructive' : 
                      action?.variant === 'warning' ? 'text-warning' : 'text-foreground'}
                  `}
                >
                  <Icon name={action?.icon} size={16} className="mr-3" />
                  {action?.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop variant - dropdown menu
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Icon name="MoreHorizontal" size={20} />
      </Button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-popover border border-border rounded-lg elevation-2 py-2 z-50">
          <div className="px-3 py-2 border-b border-border">
            <p className="text-sm font-medium text-foreground">{client?.nome}</p>
            <p className="text-xs text-muted-foreground">{client?.email}</p>
          </div>
          
          <div className="py-1">
            {actions?.map((action) => (
              <button
                key={action?.id}
                onClick={() => handleAction(action?.id)}
                className={`
                  w-full flex items-start px-3 py-2.5 text-left hover:bg-muted transition-colors
                  ${action?.variant === 'destructive' ? 'text-destructive' : 
                    action?.variant === 'warning' ? 'text-warning' : 'text-foreground'}
                `}
              >
                <Icon 
                  name={action?.icon} 
                  size={16} 
                  className="mr-3 mt-0.5 flex-shrink-0" 
                />
                <div>
                  <p className="text-sm font-medium">{action?.label}</p>
                  <p className="text-xs text-muted-foreground">{action?.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientActionMenu;