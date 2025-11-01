import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickActions = ({ userRole = 'trainer', className = "" }) => {
  const navigate = useNavigate();

  const trainerActions = [
    {
      id: 'create-workout',
      label: 'Criar Treino',
      description: 'Desenvolver novo programa',
      icon: 'Plus',
      color: 'bg-primary',
      path: '/criar-treinos'
    },
    {
      id: 'manage-clients',
      label: 'Gerenciar Alunos',
      description: 'Visualizar clientes ativos',
      icon: 'Users',
      color: 'bg-secondary',
      path: '/gerenciar-alunos'
    },
    {
      id: 'view-messages',
      label: 'Mensagens',
      description: 'Comunicar com clientes',
      icon: 'MessageSquare',
      color: 'bg-accent',
      path: '/mensagens'
    },
    {
      id: 'create-nutrition',
      label: 'Plano Alimentar',
      description: 'Criar dieta personalizada',
      icon: 'Apple',
      color: 'bg-success',
      path: '/planos-alimentares'
    }
  ];

  const clientActions = [
    {
      id: 'view-workout',
      label: 'Meu Treino',
      description: 'Ver exercícios do dia',
      icon: 'Dumbbell',
      color: 'bg-primary',
      path: '/meu-treino'
    },
    {
      id: 'log-progress',
      label: 'Registrar Progresso',
      description: 'Anotar resultados',
      icon: 'TrendingUp',
      color: 'bg-success',
      path: '/progresso'
    },
    {
      id: 'nutrition-plan',
      label: 'Plano Alimentar',
      description: 'Ver refeições do dia',
      icon: 'Apple',
      color: 'bg-accent',
      path: '/plano-alimentar'
    },
    {
      id: 'contact-trainer',
      label: 'Falar com Trainer',
      description: 'Enviar mensagem',
      icon: 'MessageCircle',
      color: 'bg-secondary',
      path: '/mensagens'
    }
  ];

  const actions = userRole === 'trainer' ? trainerActions : clientActions;

  const handleActionClick = (path) => {
    navigate(path);
  };

  return (
    <div className={`bg-card border border-border rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Ações Rápidas</h3>
        <Icon name="Zap" size={20} className="text-muted-foreground" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions?.map((action) => (
          <Button
            key={action?.id}
            variant="ghost"
            onClick={() => handleActionClick(action?.path)}
            className="h-auto p-4 justify-start hover:bg-muted group"
          >
            <div className="flex items-center space-x-3 w-full">
              <div className={`w-10 h-10 ${action?.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon name={action?.icon} size={18} color="white" />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {action?.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {action?.description}
                </p>
              </div>
              <Icon name="ArrowRight" size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;