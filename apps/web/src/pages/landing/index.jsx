import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">🦫</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">CapiFit</h1>
                <p className="text-xs text-muted-foreground">Fitness Inteligente</p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/login')}
              >
                Entrar
              </Button>
              <Button
                variant="default"
                onClick={() => navigate('/register')}
              >
                Cadastrar-se
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Hero Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary mb-8">
              <span className="mr-2">🚀</span>
              A plataforma fitness mais inteligente do Brasil
            </div>

            {/* Hero Title */}
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              Transforme sua carreira como
              <span className="text-primary block">Personal Trainer</span>
            </h1>

            {/* Hero Description */}
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              CapiFit é a plataforma completa para personal trainers gerenciarem clientes, 
              criarem treinos personalizados e acompanharem resultados de forma profissional e inteligente.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button
                size="lg"
                onClick={() => navigate('/register')}
                iconName="UserPlus"
                iconPosition="left"
              >
                Começar Gratuitamente
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/login')}
                iconName="LogIn"
                iconPosition="left"
              >
                Fazer Login
              </Button>
            </div>

            {/* Demo Credentials */}
            <div className="bg-card border border-border rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center justify-center">
                <Icon name="Key" size={16} className="mr-2 text-primary" />
                Credenciais de Demonstração
              </h3>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div>
                  <strong>Administrador:</strong> admin@capifit.com / admin123
                </div>
                <div>
                  <strong>Personal Trainer:</strong> joao.silva@capifit.com / trainer123
                </div>
                <div>
                  <strong>Cliente:</strong> maria.santos@gmail.com / client123
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Tudo que você precisa em uma plataforma
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Ferramentas profissionais para elevar sua carreira como personal trainer
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards */}
            {[
              {
                icon: 'Users',
                title: 'Gestão de Clientes',
                description: 'Gerencie todos os seus alunos em um só lugar com fichas completas e histórico detalhado.',
                color: 'bg-blue-500'
              },
              {
                icon: 'Dumbbell',
                title: 'Criação de Treinos',
                description: 'Biblioteca completa de exercícios para criar treinos personalizados e eficazes.',
                color: 'bg-green-500'
              },
              {
                icon: 'Activity',
                title: 'Avaliações Físicas',
                description: 'Sistema completo para acompanhar a evolução dos seus alunos com gráficos e relatórios.',
                color: 'bg-purple-500'
              },
              {
                icon: 'Apple',
                title: 'Nutrição Inteligente',
                description: 'Planos alimentares personalizados com base na tabela TACO e objetivos individuais.',
                color: 'bg-orange-500'
              },
              {
                icon: 'MessageSquare',
                title: 'Comunicação Direta',
                description: 'Chat integrado para manter contato direto com seus alunos e dar suporte constante.',
                color: 'bg-pink-500'
              },
              {
                icon: 'BarChart3',
                title: 'Relatórios Profissionais',
                description: 'Analytics completa para acompanhar seu negócio e o progresso dos seus clientes.',
                color: 'bg-indigo-500'
              }
            ]?.map((feature, index) => (
              <div key={index} className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className={`w-12 h-12 ${feature?.color} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon name={feature?.icon} size={24} color="white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature?.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature?.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">500+</div>
              <div className="text-muted-foreground">Personal Trainers</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">2.5k+</div>
              <div className="text-muted-foreground">Clientes Ativos</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">98%</div>
              <div className="text-muted-foreground">Satisfação</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Pronto para revolucionar sua carreira?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Junte-se a centenas de personal trainers que já transformaram seus negócios com o CapiFit.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate('/register')}
            iconName="Zap"
            iconPosition="left"
          >
            Começar Agora - É Grátis!
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">🦫</span>
              </div>
              <div>
                <h3 className="font-bold text-foreground">CapiFit</h3>
                <p className="text-xs text-muted-foreground">Fitness Inteligente</p>
              </div>
            </div>

            <div className="flex space-x-6 text-sm text-muted-foreground">
              <button className="hover:text-foreground transition-colors">Termos de Uso</button>
              <button className="hover:text-foreground transition-colors">Privacidade</button>
              <button className="hover:text-foreground transition-colors">Suporte</button>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © {new Date()?.getFullYear()} CapiFit. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;