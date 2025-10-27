import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SubscriptionPlanSelector = ({ 
  selectedPlan, 
  onPlanChange, 
  userRole = 'client',
  className = "" 
}) => {
  const trainerPlans = [
    {
      id: 'trainer_basic',
      name: 'Básico',
      price: 29.90,
      period: 'mês',
      description: 'Ideal para personal trainers iniciantes',
      features: [
        'Até 10 alunos ativos',
        'Criação de treinos básicos',
        'Chat com alunos',
        'Relatórios simples',
        'Suporte por email'
      ],
      popular: false,
      color: 'border-border'
    },
    {
      id: 'trainer_pro',
      name: 'Profissional',
      price: 59.90,
      period: 'mês',
      description: 'Para personal trainers estabelecidos',
      features: [
        'Até 50 alunos ativos',
        'Treinos avançados com vídeos',
        'Planos alimentares',
        'Avaliações físicas completas',
        'Relatórios detalhados',
        'Suporte prioritário'
      ],
      popular: true,
      color: 'border-primary'
    },
    {
      id: 'trainer_premium',
      name: 'Premium',
      price: 99.90,
      period: 'mês',
      description: 'Para academias e grandes personal trainers',
      features: [
        'Alunos ilimitados',
        'Biblioteca completa de exercícios',
        'Integração com wearables',
        'White label disponível',
        'Analytics avançados',
        'Suporte 24/7'
      ],
      popular: false,
      color: 'border-accent'
    }
  ];

  const clientPlans = [
    {
      id: 'client_monthly',
      name: 'Mensal',
      price: 39.90,
      period: 'mês',
      description: 'Flexibilidade total',
      features: [
        'Acesso completo à plataforma',
        'Treinos personalizados',
        'Plano alimentar',
        'Chat com personal trainer',
        'Acompanhamento de progresso'
      ],
      popular: false,
      color: 'border-border'
    },
    {
      id: 'client_quarterly',
      name: 'Trimestral',
      price: 99.90,
      period: '3 meses',
      originalPrice: 119.70,
      description: 'Economia de 17%',
      features: [
        'Todos os recursos do plano mensal',
        'Avaliações físicas extras',
        'Suporte prioritário',
        'Desconto em renovações'
      ],
      popular: true,
      color: 'border-primary'
    },
    {
      id: 'client_annual',
      name: 'Anual',
      price: 359.90,
      period: 'ano',
      originalPrice: 478.80,
      description: 'Economia de 25%',
      features: [
        'Todos os recursos inclusos',
        'Consultas nutricionais extras',
        'Acesso a workshops exclusivos',
        'Garantia de satisfação',
        'Suporte VIP'
      ],
      popular: false,
      color: 'border-success'
    }
  ];

  const plans = userRole === 'trainer' ? trainerPlans : clientPlans;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })?.format(price);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Escolha seu Plano
        </h3>
        <p className="text-sm text-muted-foreground">
          {userRole === 'trainer' ?'Selecione o plano que melhor atende seu negócio' :'Comece sua jornada fitness hoje mesmo'
          }
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans?.map((plan) => (
          <div
            key={plan?.id}
            className={`
              relative bg-card border-2 rounded-xl p-6 cursor-pointer transition-all duration-200
              ${selectedPlan === plan?.id 
                ? `${plan?.color} shadow-lg scale-105` 
                : 'border-border hover:border-primary/50 hover:shadow-md'
              }
              ${plan?.popular ? 'ring-2 ring-primary/20' : ''}
            `}
            onClick={() => onPlanChange(plan?.id)}
          >
            {/* Popular Badge */}
            {plan?.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                  Mais Popular
                </span>
              </div>
            )}

            {/* Selection Indicator */}
            {selectedPlan === plan?.id && (
              <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <Icon name="Check" size={14} color="white" />
              </div>
            )}

            {/* Plan Header */}
            <div className="text-center mb-6">
              <h4 className="text-xl font-bold text-foreground mb-2">
                {plan?.name}
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                {plan?.description}
              </p>
              
              {/* Price */}
              <div className="mb-2">
                {plan?.originalPrice && (
                  <span className="text-sm text-muted-foreground line-through block">
                    {formatPrice(plan?.originalPrice)}
                  </span>
                )}
                <div className="flex items-baseline justify-center">
                  <span className="text-3xl font-bold text-foreground">
                    {formatPrice(plan?.price)}
                  </span>
                  <span className="text-sm text-muted-foreground ml-1">
                    /{plan?.period}
                  </span>
                </div>
              </div>

              {/* Savings Badge */}
              {plan?.originalPrice && (
                <div className="inline-flex items-center px-2 py-1 bg-success/10 text-success rounded-full text-xs font-medium">
                  <Icon name="TrendingDown" size={12} className="mr-1" />
                  Economize {Math.round((1 - plan?.price / plan?.originalPrice) * 100)}%
                </div>
              )}
            </div>

            {/* Features */}
            <div className="space-y-3 mb-6">
              {plan?.features?.map((feature, index) => (
                <div key={index} className="flex items-start text-sm">
                  <Icon name="Check" size={16} className="text-success mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>

            {/* Select Button */}
            <Button
              variant={selectedPlan === plan?.id ? "default" : "outline"}
              className="w-full"
              onClick={(e) => {
                e?.stopPropagation();
                onPlanChange(plan?.id);
              }}
            >
              {selectedPlan === plan?.id ? 'Selecionado' : 'Selecionar Plano'}
            </Button>
          </div>
        ))}
      </div>
      {/* Payment Methods */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center mb-4">
          <Icon name="CreditCard" size={20} className="text-primary mr-2" />
          <h4 className="font-semibold text-foreground">Métodos de Pagamento</h4>
        </div>
        
        <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Icon name="CreditCard" size={16} className="mr-1" />
            <span>Cartão de Crédito</span>
          </div>
          <div className="flex items-center">
            <Icon name="Smartphone" size={16} className="mr-1" />
            <span>PIX</span>
          </div>
          <div className="flex items-center">
            <Icon name="Building" size={16} className="mr-1" />
            <span>Boleto</span>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground text-center mt-2">
          Pagamentos processados com segurança via Mercado Pago, PayPal e PagSeguro
        </p>
      </div>
      {/* Money Back Guarantee */}
      <div className="text-center bg-success/5 border border-success/20 rounded-lg p-4">
        <div className="flex items-center justify-center mb-2">
          <Icon name="Shield" size={20} className="text-success mr-2" />
          <span className="font-semibold text-success">Garantia de 7 dias</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Não ficou satisfeito? Devolvemos 100% do seu dinheiro
        </p>
      </div>
    </div>
  );
};

export default SubscriptionPlanSelector;