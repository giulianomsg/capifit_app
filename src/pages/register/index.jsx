import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

// Import all components
import RoleSelector from './components/RoleSelector';
import OAuthButtons from './components/OAuthButtons';
import PersonalInfoForm from './components/PersonalInfoForm';
import TrainerCredentialsForm from './components/TrainerCredentialsForm';
import ClientGoalsForm from './components/ClientGoalsForm';
import SubscriptionPlanSelector from './components/SubscriptionPlanSelector';
import TermsAndPrivacy from './components/TermsAndPrivacy';
import ProgressIndicator from './components/ProgressIndicator';

const Register = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState('');
  const [formData, setFormData] = useState({});
  const [selectedPlan, setSelectedPlan] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedMarketing, setAcceptedMarketing] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const totalSteps = selectedRole === 'trainer' ? 5 : 5;

  const steps = selectedRole === 'trainer' 
    ? [
        { id: 1, title: 'Tipo de Conta', description: 'Escolha seu perfil' },
        { id: 2, title: 'Dados Pessoais', description: 'Informações básicas' },
        { id: 3, title: 'Credenciais', description: 'Qualificações profissionais' },
        { id: 4, title: 'Plano', description: 'Escolha sua assinatura' },
        { id: 5, title: 'Finalizar', description: 'Termos e confirmação' }
      ]
    : [
        { id: 1, title: 'Tipo de Conta', description: 'Escolha seu perfil' },
        { id: 2, title: 'Dados Pessoais', description: 'Informações básicas' },
        { id: 3, title: 'Objetivos', description: 'Metas fitness' },
        { id: 4, title: 'Plano', description: 'Escolha sua assinatura' },
        { id: 5, title: 'Finalizar', description: 'Termos e confirmação' }
      ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleOAuthLogin = (provider) => {
    console.log(`OAuth login with ${provider}`);
    // Mock OAuth flow
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard-principal');
    }, 2000);
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!selectedRole) {
          newErrors.role = 'Selecione um tipo de conta';
        }
        break;

      case 2:
        if (!formData?.nome?.trim()) {
          newErrors.nome = 'Nome é obrigatório';
        }
        if (!formData?.email?.trim()) {
          newErrors.email = 'Email é obrigatório';
        } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
          newErrors.email = 'Email inválido';
        }
        if (!formData?.senha?.trim()) {
          newErrors.senha = 'Senha é obrigatória';
        } else if (formData?.senha?.length < 8) {
          newErrors.senha = 'Senha deve ter pelo menos 8 caracteres';
        }
        if (formData?.senha !== formData?.confirmarSenha) {
          newErrors.confirmarSenha = 'Senhas não coincidem';
        }
        if (!formData?.dataNascimento) {
          newErrors.dataNascimento = 'Data de nascimento é obrigatória';
        }
        break;

      case 3:
        if (selectedRole === 'trainer') {
          if (!formData?.cref?.trim()) {
            newErrors.cref = 'Número CREF é obrigatório';
          }
          if (!formData?.crefEstado?.trim()) {
            newErrors.crefEstado = 'Estado do CREF é obrigatório';
          }
          if (!formData?.instituicao?.trim()) {
            newErrors.instituicao = 'Instituição de ensino é obrigatória';
          }
          if (!formData?.curso?.trim()) {
            newErrors.curso = 'Curso é obrigatório';
          }
        } else {
          if (!formData?.objetivoPrincipal) {
            newErrors.objetivoPrincipal = 'Selecione seu objetivo principal';
          }
          if (!formData?.nivelExperiencia) {
            newErrors.nivelExperiencia = 'Selecione seu nível de experiência';
          }
          if (!formData?.frequenciaTreino) {
            newErrors.frequenciaTreino = 'Selecione a frequência de treino';
          }
        }
        break;

      case 4:
        if (!selectedPlan) {
          newErrors.plan = 'Selecione um plano';
        }
        break;

      case 5:
        if (!acceptedTerms) {
          newErrors.terms = 'Você deve aceitar os termos de uso';
        }
        if (!acceptedPrivacy) {
          newErrors.privacy = 'Você deve aceitar a política de privacidade';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      // Mock registration API call
      console.log('Registering user:', {
        role: selectedRole,
        formData,
        plan: selectedPlan,
        terms: acceptedTerms,
        privacy: acceptedPrivacy,
        marketing: acceptedMarketing
      });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Redirect based on role
      if (selectedRole === 'trainer') {
        navigate('/perfil-do-personal');
      } else {
        navigate('/dashboard-principal');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ submit: 'Erro ao criar conta. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <OAuthButtons onOAuthLogin={handleOAuthLogin} />
            <RoleSelector 
              selectedRole={selectedRole} 
              onRoleChange={setSelectedRole}
            />
            {errors?.role && (
              <p className="text-sm text-destructive text-center">{errors?.role}</p>
            )}
          </div>
        );

      case 2:
        return (
          <PersonalInfoForm
            formData={formData}
            onInputChange={handleInputChange}
            errors={errors}
          />
        );

      case 3:
        return selectedRole === 'trainer' ? (
          <TrainerCredentialsForm
            formData={formData}
            onInputChange={handleInputChange}
            errors={errors}
          />
        ) : (
          <ClientGoalsForm
            formData={formData}
            onInputChange={handleInputChange}
            errors={errors}
          />
        );

      case 4:
        return (
          <SubscriptionPlanSelector
            selectedPlan={selectedPlan}
            onPlanChange={setSelectedPlan}
            userRole={selectedRole}
          />
        );

      case 5:
        return (
          <div className="space-y-6">
            <TermsAndPrivacy
              acceptedTerms={acceptedTerms}
              acceptedPrivacy={acceptedPrivacy}
              acceptedMarketing={acceptedMarketing}
              onTermsChange={setAcceptedTerms}
              onPrivacyChange={setAcceptedPrivacy}
              onMarketingChange={setAcceptedMarketing}
              errors={errors}
            />
            {/* Registration Summary */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-3">Resumo do Cadastro</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo de conta:</span>
                  <span className="text-foreground font-medium">
                    {selectedRole === 'trainer' ? 'Personal Trainer' : 'Cliente'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nome:</span>
                  <span className="text-foreground font-medium">{formData?.nome}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="text-foreground font-medium">{formData?.email}</span>
                </div>
                {selectedPlan && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plano:</span>
                    <span className="text-foreground font-medium">
                      {selectedRole === 'trainer' ? selectedPlan?.replace('trainer_', '')?.replace('_', ' ')
                        : selectedPlan?.replace('client_', '')?.replace('_', ' ')
                      }
                    </span>
                  </div>
                )}
              </div>
            </div>
            {errors?.submit && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <p className="text-sm text-destructive text-center">{errors?.submit}</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="Dumbbell" size={20} color="white" />
              </div>
              <span className="text-xl font-bold text-foreground">FitTrainer Pro</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">Já tem uma conta?</span>
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Fazer Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
          {/* Progress Indicator */}
          <div className="px-6 py-6 border-b border-border bg-muted/30">
            <ProgressIndicator
              currentStep={currentStep}
              totalSteps={totalSteps}
              steps={steps}
            />
          </div>

          {/* Form Content */}
          <div className="px-6 py-8">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="px-6 py-4 border-t border-border bg-muted/30">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                iconName="ChevronLeft"
                iconPosition="left"
              >
                Voltar
              </Button>

              <div className="flex items-center space-x-3">
                {currentStep < totalSteps ? (
                  <Button
                    onClick={handleNext}
                    disabled={isLoading}
                    iconName="ChevronRight"
                    iconPosition="right"
                  >
                    Próximo
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    loading={isLoading}
                    disabled={!acceptedTerms || !acceptedPrivacy}
                    iconName="Check"
                    iconPosition="left"
                  >
                    {isLoading ? 'Criando Conta...' : 'Criar Conta'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Precisa de ajuda? Entre em contato conosco
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm">
            <a href="mailto:suporte@fittrainerpro.com" className="text-primary hover:underline">
              suporte@fittrainerpro.com
            </a>
            <span className="text-muted-foreground">•</span>
            <a href="tel:+5511999999999" className="text-primary hover:underline">
              (11) 99999-9999
            </a>
          </div>
        </div>
      </main>
      {/* Footer */}
      <footer className="bg-card border-t border-border mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>© {new Date()?.getFullYear()} FitTrainer Pro. Todos os direitos reservados.</span>
            <div className="flex items-center space-x-4">
              <Link to="/termos-de-uso" className="hover:text-foreground transition-colors">
                Termos de Uso
              </Link>
              <Link to="/politica-de-privacidade" className="hover:text-foreground transition-colors">
                Privacidade
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Register;