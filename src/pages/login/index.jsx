import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';

import LoginForm from './components/LoginForm';
import OAuthButtons from './components/OAuthButtons';
import TrustSignals from './components/TrustSignals';
import RegisterPrompt from './components/RegisterPrompt';

const LoginPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated with consistent key
    const isAuthenticated = localStorage.getItem('capifit_isAuthenticated');
    if (isAuthenticated === 'true') {
      navigate('/dashboard-principal');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5">
      <div className="flex min-h-screen">
        {/* Left Side - Branding & Features (Hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-secondary p-12 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full"></div>
            <div className="absolute bottom-32 right-16 w-24 h-24 bg-white rounded-full"></div>
            <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white rounded-full"></div>
          </div>

          <div className="relative z-10 flex flex-col justify-center max-w-md">
            {/* Logo */}
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                <span className="text-primary font-bold text-lg">🦫</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">CapiFit</h1>
                <p className="text-white/80 text-sm">Fitness Inteligente</p>
              </div>
            </div>

            {/* Hero Content */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold leading-tight">
                Transforme sua carreira como Personal Trainer
              </h2>
              <p className="text-white/90 text-lg leading-relaxed">
                Gerencie clientes, crie treinos personalizados e acompanhe resultados na plataforma fitness mais inteligente do Brasil.
              </p>

              {/* Features List */}
              <div className="space-y-4">
                {[
                  { icon: 'Users', text: 'Gestão completa de clientes' },
                  { icon: 'Dumbbell', text: 'Biblioteca de exercícios' },
                  { icon: 'BarChart3', text: 'Relatórios de progresso' },
                  { icon: 'MessageSquare', text: 'Comunicação integrada' }
                ]?.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <Icon name={feature?.icon} size={16} />
                    </div>
                    <span className="text-white/90">{feature?.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold">500+</div>
                <div className="text-white/70 text-sm">Personal Trainers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">2.5k+</div>
                <div className="text-white/70 text-sm">Clientes Ativos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">98%</div>
                <div className="text-white/70 text-sm">Satisfação</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md space-y-8">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">🦫</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">CapiFit</h1>
                  <p className="text-muted-foreground text-sm">Fitness Inteligente</p>
                </div>
              </div>
            </div>

            {/* Welcome Header */}
            <div className="text-center lg:text-left">
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                Bem-vindo de volta
              </h2>
              <p className="text-muted-foreground">
                Acesse sua conta para continuar gerenciando seus treinos e clientes
              </p>
            </div>

            {/* Login Form */}
            <div className="space-y-6">
              <LoginForm />
              <OAuthButtons />
            </div>

            {/* Trust Signals - Desktop Only */}
            <div className="hidden lg:block">
              <TrustSignals />
            </div>

            {/* Register Prompt */}
            <RegisterPrompt />

            {/* Footer */}
            <div className="text-center pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground">
                © {new Date()?.getFullYear()} CapiFit. Todos os direitos reservados.
              </p>
              <div className="flex justify-center space-x-4 mt-2">
                <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Termos de Uso
                </button>
                <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Política de Privacidade
                </button>
                <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Suporte
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Trust Signals - Bottom Sheet */}
      <div className="lg:hidden bg-card border-t border-border p-4">
        <div className="max-w-md mx-auto">
          <TrustSignals />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;