import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const RegisterPrompt = () => {
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const benefits = [
    {
      icon: 'Users',
      text: 'Gerencie seus clientes'
    },
    {
      icon: 'Dumbbell',
      text: 'Crie treinos personalizados'
    },
    {
      icon: 'BarChart3',
      text: 'Acompanhe o progresso'
    },
    {
      icon: 'MessageSquare',
      text: 'Comunicação direta'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-background text-muted-foreground">
            Novo por aqui?
          </span>
        </div>
      </div>
      {/* Benefits */}
      <div className="p-4 bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 rounded-lg">
        <h3 className="text-sm font-semibold text-foreground mb-3 text-center">
          Transforme sua carreira fitness
        </h3>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          {benefits?.map((benefit, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon name={benefit?.icon} size={12} className="text-primary" />
              </div>
              <span className="text-xs text-foreground">
                {benefit?.text}
              </span>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          fullWidth
          onClick={handleRegisterClick}
          iconName="UserPlus"
          iconPosition="left"
        >
          Criar Conta Gratuita
        </Button>
      </div>
      {/* Additional Info */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Já tem uma conta?{' '}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Faça login acima
          </button>
        </p>
      </div>
      {/* Contact Support */}
      <div className="text-center pt-2 border-t border-border">
        <p className="text-xs text-muted-foreground mb-2">
          Precisa de ajuda?
        </p>
        <div className="flex justify-center space-x-4">
          <button className="flex items-center space-x-1 text-xs text-primary hover:text-primary/80 transition-colors">
            <Icon name="Mail" size={12} />
            <span>Email</span>
          </button>
          <button className="flex items-center space-x-1 text-xs text-primary hover:text-primary/80 transition-colors">
            <Icon name="MessageCircle" size={12} />
            <span>Chat</span>
          </button>
          <button className="flex items-center space-x-1 text-xs text-primary hover:text-primary/80 transition-colors">
            <Icon name="Phone" size={12} />
            <span>Telefone</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPrompt;