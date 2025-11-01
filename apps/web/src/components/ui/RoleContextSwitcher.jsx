import React, { useState } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const RoleContextSwitcher = ({ 
  currentRole = 'trainer',
  availableRoles = [],
  onRoleChange = null,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Default available roles
  const defaultRoles = [
    {
      id: 'trainer',
      name: 'Personal Trainer',
      description: 'Gerenciar clientes e treinos',
      icon: 'Dumbbell',
      color: 'bg-primary'
    },
    {
      id: 'client',
      name: 'Cliente',
      description: 'Visualizar meus treinos',
      icon: 'User',
      color: 'bg-secondary'
    },
    {
      id: 'admin',
      name: 'Administrador',
      description: 'Gerenciar plataforma',
      icon: 'Shield',
      color: 'bg-accent'
    }
  ];

  const roles = availableRoles?.length > 0 ? availableRoles : defaultRoles;
  const current = roles?.find(role => role?.id === currentRole) || roles?.[0];

  const handleRoleChange = (roleId) => {
    if (onRoleChange) {
      onRoleChange(roleId);
    }
    setIsOpen(false);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  // Don't render if only one role available
  if (roles?.length <= 1) {
    return (
      <div className={`px-4 py-3 ${className}`}>
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 ${current?.color} rounded-lg flex items-center justify-center`}>
            <Icon name={current?.icon} size={16} color="white" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{current?.name}</p>
            <p className="text-xs text-muted-foreground">{current?.description}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Current Role Display */}
      <Button
        variant="ghost"
        onClick={handleToggle}
        className="w-full justify-start px-4 py-3 h-auto"
      >
        <div className="flex items-center space-x-3 flex-1">
          <div className={`w-8 h-8 ${current?.color} rounded-lg flex items-center justify-center`}>
            <Icon name={current?.icon} size={16} color="white" />
          </div>
          <div className="text-left flex-1">
            <p className="text-sm font-medium text-foreground">{current?.name}</p>
            <p className="text-xs text-muted-foreground">{current?.description}</p>
          </div>
          <Icon 
            name="ChevronDown" 
            size={16} 
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </Button>
      {/* Role Selector Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute left-4 right-4 top-full mt-2 bg-popover border border-border rounded-lg elevation-2 py-2 z-50 animate-fade-in">
            <div className="px-3 py-2 border-b border-border">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Alternar Contexto
              </p>
            </div>
            
            <div className="py-1">
              {roles?.map((role) => (
                <button
                  key={role?.id}
                  onClick={() => handleRoleChange(role?.id)}
                  className={`
                    w-full flex items-center px-3 py-2.5 text-left hover:bg-muted transition-colors
                    ${role?.id === currentRole ? 'bg-primary/10' : ''}
                  `}
                >
                  <div className={`w-8 h-8 ${role?.color} rounded-lg flex items-center justify-center mr-3`}>
                    <Icon name={role?.icon} size={16} color="white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">
                        {role?.name}
                      </p>
                      {role?.id === currentRole && (
                        <Icon name="Check" size={14} className="text-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {role?.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="border-t border-border pt-1">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors"
              >
                <Icon name="Settings" size={14} className="mr-3" />
                Gerenciar Permissões
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RoleContextSwitcher;