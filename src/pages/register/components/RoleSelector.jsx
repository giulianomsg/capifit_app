import React from 'react';
import Icon from '../../../components/AppIcon';

const RoleSelector = ({ selectedRole, onRoleChange, className = "" }) => {
  const roles = [
    {
      id: 'trainer',
      name: 'Personal Trainer',
      description: 'Gerencie clientes, crie treinos personalizados e acompanhe o progresso',
      icon: 'Dumbbell',
      color: 'bg-primary',
      benefits: [
        'Gerenciar múltiplos clientes',
        'Criar planos de treino',
        'Acompanhar evolução',
        'Chat direto com alunos'
      ]
    },
    {
      id: 'client',
      name: 'Cliente',
      description: 'Acesse seus treinos, acompanhe seu progresso e converse com seu trainer',
      icon: 'User',
      color: 'bg-secondary',
      benefits: [
        'Treinos personalizados',
        'Planos alimentares',
        'Acompanhamento profissional',
        'Suporte especializado'
      ]
    }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Como você deseja usar o FitTrainer Pro?
        </h3>
        <p className="text-sm text-muted-foreground">
          Escolha o perfil que melhor se adequa às suas necessidades
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles?.map((role) => (
          <button
            key={role?.id}
            onClick={() => onRoleChange(role?.id)}
            className={`
              relative p-6 border-2 rounded-xl text-left transition-all duration-200
              ${selectedRole === role?.id
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-border bg-card hover:border-primary/50 hover:shadow-sm'
              }
            `}
          >
            {/* Selection Indicator */}
            {selectedRole === role?.id && (
              <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <Icon name="Check" size={14} color="white" />
              </div>
            )}

            {/* Role Icon */}
            <div className={`w-12 h-12 ${role?.color} rounded-lg flex items-center justify-center mb-4`}>
              <Icon name={role?.icon} size={24} color="white" />
            </div>

            {/* Role Info */}
            <h4 className="text-lg font-semibold text-foreground mb-2">
              {role?.name}
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              {role?.description}
            </p>

            {/* Benefits */}
            <div className="space-y-2">
              {role?.benefits?.map((benefit, index) => (
                <div key={index} className="flex items-center text-sm text-foreground">
                  <Icon name="Check" size={14} className="text-success mr-2 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RoleSelector;