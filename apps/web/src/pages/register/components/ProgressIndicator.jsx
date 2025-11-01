import React from 'react';
import Icon from '../../../components/AppIcon';

const ProgressIndicator = ({ 
  currentStep, 
  totalSteps, 
  steps = [],
  className = "" 
}) => {
  const defaultSteps = [
    { id: 1, title: 'Tipo de Conta', description: 'Escolha seu perfil' },
    { id: 2, title: 'Dados Pessoais', description: 'Informações básicas' },
    { id: 3, title: 'Credenciais', description: 'Qualificações profissionais' },
    { id: 4, title: 'Plano', description: 'Escolha sua assinatura' },
    { id: 5, title: 'Finalizar', description: 'Termos e confirmação' }
  ];

  const stepList = steps?.length > 0 ? steps : defaultSteps?.slice(0, totalSteps);
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className={`${className}`}>
      {/* Progress Bar */}
      <div className="relative mb-8">
        <div className="flex items-center justify-between">
          {stepList?.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            const isUpcoming = stepNumber > currentStep;

            return (
              <div key={step?.id} className="flex flex-col items-center relative z-10">
                {/* Step Circle */}
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                    transition-all duration-300 mb-2
                    ${isCompleted 
                      ? 'bg-primary text-primary-foreground shadow-md' 
                      : isCurrent 
                        ? 'bg-primary text-primary-foreground shadow-lg ring-4 ring-primary/20' 
                        : 'bg-muted text-muted-foreground border-2 border-border'
                    }
                  `}
                >
                  {isCompleted ? (
                    <Icon name="Check" size={16} />
                  ) : (
                    stepNumber
                  )}
                </div>
                {/* Step Info - Hidden on mobile */}
                <div className="text-center hidden md:block">
                  <p className={`
                    text-xs font-medium mb-1
                    ${isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}
                  `}>
                    {step?.title}
                  </p>
                  <p className="text-xs text-muted-foreground max-w-20">
                    {step?.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-border -z-10">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
      {/* Mobile Step Info */}
      <div className="md:hidden text-center mb-6">
        <p className="text-sm font-semibold text-primary mb-1">
          {stepList?.[currentStep - 1]?.title}
        </p>
        <p className="text-xs text-muted-foreground">
          {stepList?.[currentStep - 1]?.description}
        </p>
      </div>
      {/* Step Counter */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Etapa {currentStep} de {totalSteps}
        </span>
        <span>
          {Math.round(progressPercentage)}% concluído
        </span>
      </div>
    </div>
  );
};

export default ProgressIndicator;