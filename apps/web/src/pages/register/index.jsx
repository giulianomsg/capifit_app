import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

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
  const { register: registerAccount } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState('');
  const [formData, setFormData] = useState({});
  const [selectedPlan, setSelectedPlan] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedMarketing, setAcceptedMarketing] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState('');

  const totalSteps = 5;

  const steps = [
    { id: 1, title: 'Tipo de Conta', description: 'Escolha seu perfil' },
    { id: 2, title: 'Dados Pessoais', description: 'Informações básicas' },
    { id: 3, title: selectedRole === 'trainer' ? 'Credenciais' : 'Objetivos', description: 'Informações complementares' },
    { id: 4, title: 'Plano', description: 'Escolha sua assinatura' },
    { id: 5, title: 'Finalizar', description: 'Termos e confirmação' },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors?.[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
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
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
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
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep((prev) => prev + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmissionError('');

    if (!validateStep(currentStep)) {
      return;
    }

    setIsLoading(true);

    try {
      await registerAccount({
        name: formData.nome,
        email: formData.email,
        password: formData.senha,
        roles: [selectedRole],
      });
      navigate('/dashboard-principal');
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.errors?.formErrors?.join(' ') ||
        'Erro ao criar conta. Tente novamente.';
      setSubmissionError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <RoleSelector
            selectedRole={selectedRole}
            onRoleSelect={setSelectedRole}
            error={errors.role}
          />
        );
      case 2:
        return (
          <PersonalInfoForm
            formData={formData}
            onChange={handleInputChange}
            errors={errors}
          />
        );
      case 3:
        return selectedRole === 'trainer' ? (
          <TrainerCredentialsForm
            formData={formData}
            onChange={handleInputChange}
            errors={errors}
          />
        ) : (
          <ClientGoalsForm
            formData={formData}
            onChange={handleInputChange}
            errors={errors}
          />
        );
      case 4:
        return (
          <SubscriptionPlanSelector
            selectedPlan={selectedPlan}
            onSelectPlan={setSelectedPlan}
            error={errors.plan}
          />
        );
      case 5:
        return (
          <TermsAndPrivacy
            acceptedTerms={acceptedTerms}
            acceptedPrivacy={acceptedPrivacy}
            acceptedMarketing={acceptedMarketing}
            onTermsChange={setAcceptedTerms}
            onPrivacyChange={setAcceptedPrivacy}
            onMarketingChange={setAcceptedMarketing}
            error={errors}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-secondary text-white p-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full" />
            <div className="absolute bottom-32 right-16 w-24 h-24 bg-white rounded-full" />
            <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white rounded-full" />
          </div>

          <div className="relative z-10 flex flex-col justify-between h-full max-w-xl">
            <div>
              <Link to="/" className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">🦫</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold">CapiFit</h1>
                  <p className="text-white/80 text-sm">Fitness Inteligente para Personal Trainers</p>
                </div>
              </Link>

              <div className="mt-12 space-y-6">
                <h2 className="text-4xl font-bold leading-tight">
                  Construa jornadas fitness excepcionais com tecnologia e dados inteligentes
                </h2>
                <p className="text-white/90 text-lg leading-relaxed">
                  Acompanhe seus clientes com métricas precisas, crie treinos personalizados e entregue planos nutricionais
                  completos em uma única plataforma.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: 'TrendingUp', value: '92%', label: 'Aumento na retenção de alunos' },
                { icon: 'Clock', value: '18h', label: 'Economia mensal em tarefas administrativas' },
                { icon: 'ShieldCheck', value: '100%', label: 'Conformidade com LGPD' },
                { icon: 'Sparkles', value: '+40', label: 'Templates personalizáveis' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <Icon name={stat.icon} size={20} />
                    <div>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      <p className="text-sm text-white/80">{stat.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 lg:w-1/2 p-6 lg:p-12">
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="lg:hidden flex items-center justify-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">🦫</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">CapiFit</h1>
                <p className="text-muted-foreground text-sm">Fitness Inteligente</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Crie sua conta</h2>
                <p className="text-muted-foreground mt-1">Complete as etapas para começar a gerenciar seus clientes</p>
              </div>
              <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} steps={steps} />
            </div>

            {submissionError && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Icon name="AlertCircle" size={16} className="text-destructive" />
                  <p className="text-sm text-destructive font-medium">{submissionError}</p>
                </div>
              </div>
            )}

            <div className="bg-card border border-border rounded-2xl p-8 shadow-sm space-y-8">
              {renderStepContent()}

              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  Já possui uma conta?{' '}
                  <Link to="/login" className="text-primary hover:text-primary/80 font-medium">
                    Entrar
                  </Link>
                </div>

                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1 || isLoading}>
                    Voltar
                  </Button>
                  <Button onClick={handleNext} loading={isLoading} disabled={isLoading}>
                    {currentStep === totalSteps ? 'Concluir cadastro' : 'Continuar'}
                  </Button>
                </div>
              </div>
            </div>

            <OAuthButtons disabled />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
