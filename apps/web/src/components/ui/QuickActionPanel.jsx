import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const QuickActionPanel = ({ 
  userRole = 'trainer',
  className = "",
  variant = 'desktop' // 'desktop' | 'mobile' | 'floating'
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  // Context-aware actions based on current page and role
  const getContextualActions = () => {
    const currentPath = location?.pathname;
    
    const baseActions = {
      trainer: [
        {
          id: 'create-workout',
          label: 'Novo Treino',
          icon: 'Plus',
          color: 'bg-primary',
          path: '/criar-treinos',
          description: 'Criar programa de exercícios'
        },
        {
          id: 'add-client',
          label: 'Adicionar Aluno',
          icon: 'UserPlus',
          color: 'bg-secondary',
          path: '/gerenciar-alunos',
          description: 'Cadastrar novo cliente'
        },
        {
          id: 'schedule-assessment',
          label: 'Agendar Avaliação',
          icon: 'Calendar',
          color: 'bg-accent',
          path: '/avaliacoes',
          description: 'Marcar avaliação física'
        },
        {
          id: 'send-message',
          label: 'Enviar Mensagem',
          icon: 'MessageSquare',
          color: 'bg-warning',
          path: '/mensagens',
          description: 'Comunicar com clientes'
        }
      ],
      client: [
        {
          id: 'view-workout',
          label: 'Meu Treino',
          icon: 'Dumbbell',
          color: 'bg-primary',
          path: '/meu-treino',
          description: 'Ver treino do dia'
        },
        {
          id: 'log-progress',
          label: 'Registrar Progresso',
          icon: 'TrendingUp',
          color: 'bg-success',
          path: '/progresso',
          description: 'Anotar resultados'
        },
        {
          id: 'contact-trainer',
          label: 'Falar com Trainer',
          icon: 'MessageCircle',
          color: 'bg-secondary',
          path: '/mensagens',
          description: 'Enviar mensagem'
        }
      ]
    };

    // Filter actions based on current page context
    let actions = baseActions?.[userRole] || baseActions?.trainer;
    
    // Remove current page action to avoid redundancy
    actions = actions?.filter(action => action?.path !== currentPath);
    
    return actions;
  };

  let actions = getContextualActions();

  const handleActionClick = (action) => {
    navigate(action?.path);
    setIsExpanded(false);
  };

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Desktop Card Layout
  if (variant === 'desktop') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {actions?.slice(0, 4)?.map((action) => (
          <button
            key={action?.id}
            onClick={() => handleActionClick(action)}
            className="group p-4 bg-card border border-border rounded-lg hover:shadow-md transition-all duration-200 text-left"
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className={`w-10 h-10 ${action?.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon name={action?.icon} size={20} color="white" />
              </div>
              <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                {action?.label}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {action?.description}
            </p>
          </button>
        ))}
      </div>
    );
  }

  // Mobile Bottom Sheet Layout
  if (variant === 'mobile') {
    return (
      <div className={`bg-card border-t border-border ${className}`}>
        <div className="px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Ações Rápidas
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {actions?.slice(0, 4)?.map((action) => (
              <button
                key={action?.id}
                onClick={() => handleActionClick(action)}
                className="flex flex-col items-center p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <div className={`w-8 h-8 ${action?.color} rounded-lg flex items-center justify-center mb-2`}>
                  <Icon name={action?.icon} size={16} color="white" />
                </div>
                <span className="text-xs font-medium text-foreground text-center">
                  {action?.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Floating Action Button
  if (variant === 'floating') {
    return (
      <div className={`fixed bottom-6 right-6 z-40 ${className}`}>
        {/* Expanded Actions */}
        {isExpanded && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/20 -z-10"
              onClick={() => setIsExpanded(false)}
            />
            
            {/* Action List */}
            <div className="absolute bottom-16 right-0 space-y-3 animate-fade-in">
              {actions?.slice(0, 3)?.map((action, index) => (
                <div
                  key={action?.id}
                  className="flex items-center space-x-3"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className="bg-popover text-popover-foreground px-3 py-2 rounded-lg text-sm font-medium shadow-lg whitespace-nowrap">
                    {action?.label}
                  </span>
                  <button
                    onClick={() => handleActionClick(action)}
                    className={`w-12 h-12 ${action?.color} rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform`}
                  >
                    <Icon name={action?.icon} size={20} color="white" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
        {/* Main FAB */}
        <Button
          size="icon"
          onClick={handleToggleExpanded}
          className={`w-14 h-14 rounded-full shadow-lg hover:scale-110 transition-all ${
            isExpanded ? 'bg-destructive hover:bg-destructive' : 'bg-primary hover:bg-primary'
          }`}
        >
          <Icon 
            name={isExpanded ? "X" : "Plus"} 
            size={24} 
            color="white"
            className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
          />
        </Button>
      </div>
    );
  }

  return null;
};

export default QuickActionPanel;