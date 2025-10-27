import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import StatsCard from './components/StatsCard';
import ActivityFeed from './components/ActivityFeed';
import PerformanceChart from './components/PerformanceChart';
import QuickActions from './components/QuickActions';
import UpcomingSchedule from './components/UpcomingSchedule';
import AchievementNotifications from './components/AchievementNotifications';

const DashboardPrincipal = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('trainer');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Check if user is logged in - Fixed authentication consistency
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('capifit_isAuthenticated');
    if (!isLoggedIn || isLoggedIn !== 'true') {
      navigate('/login');
      return;
    }

    // Get user role for personalized experience
    const storedRole = localStorage.getItem('capifit_userRole');
    if (storedRole) {
      setUserRole(storedRole);
    }
  }, [navigate]);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Mock data for trainer dashboard - Updated for CapiFit
  const trainerStats = [
    {
      title: 'Alunos Ativos',
      value: '24',
      subtitle: '3 novos esta semana',
      icon: 'Users',
      color: 'bg-primary',
      trend: { type: 'up', value: '+12.5%' },
      actionLabel: 'Gerenciar alunos',
      onActionClick: () => navigate('/gerenciar-alunos')
    },
    {
      title: 'Avaliações Físicas',
      value: '18',
      subtitle: '5 agendadas hoje',
      icon: 'Activity',
      color: 'bg-secondary',
      trend: { type: 'up', value: '+8.3%' },
      actionLabel: 'Ver avaliações',
      onActionClick: () => navigate('/physical-assessment-system')
    },
    {
      title: 'Mensagens',
      value: '12',
      subtitle: '3 não lidas',
      icon: 'MessageSquare',
      color: 'bg-accent',
      trend: { type: 'down', value: '-2' },
      actionLabel: 'Abrir chat',
      onActionClick: () => navigate('/chat-communication-hub')
    },
    {
      title: 'Receita Mensal',
      value: 'R$ 8.450',
      subtitle: 'Meta: R$ 10.000',
      icon: 'DollarSign',
      color: 'bg-success',
      trend: { type: 'up', value: '+18.3%' },
      actionLabel: 'Ver relatórios',
      onActionClick: () => navigate('/relatorios')
    }
  ];

  // Mock data for client dashboard
  const clientStats = [
    {
      title: 'Próximo Treino',
      value: 'Peito e Tríceps',
      subtitle: 'Hoje às 18:00',
      icon: 'Clock',
      color: 'bg-primary',
      actionLabel: 'Ver treino completo',
      onActionClick: () => navigate('/meu-treino')
    },
    {
      title: 'Progresso Semanal',
      value: '5/6',
      subtitle: 'Treinos completados',
      icon: 'TrendingUp',
      color: 'bg-success',
      trend: { type: 'up', value: '83%' },
      actionLabel: 'Ver progresso',
      onActionClick: () => navigate('/progresso')
    },
    {
      title: 'Plano Alimentar',
      value: '1.847 kcal',
      subtitle: 'Consumidas hoje',
      icon: 'Apple',
      color: 'bg-accent',
      trend: { type: 'neutral', value: '92%' },
      actionLabel: 'Ver plano completo',
      onActionClick: () => navigate('/nutrition-management')
    },
    {
      title: 'Mensagens',
      value: '3',
      subtitle: '1 não lida',
      icon: 'MessageCircle',
      color: 'bg-secondary',
      actionLabel: 'Abrir chat',
      onActionClick: () => navigate('/chat-communication-hub')
    }
  ];

  // Mock activity data
  const recentActivities = [
    {
      id: 1,
      type: 'workout',
      title: 'Maria Santos completou treino',
      description: 'Treino de Pernas - 45 minutos',
      timestamp: '15 min atrás',
      badge: 'Novo'
    },
    {
      id: 2,
      type: 'message',
      title: 'Nova mensagem de Carlos Silva',
      description: 'Pergunta sobre exercício de agachamento',
      timestamp: '32 min atrás'
    },
    {
      id: 3,
      type: 'subscription',
      title: 'Assinatura renovada',
      description: 'Ana Costa - Plano Mensal',
      timestamp: '1 hora atrás'
    },
    {
      id: 4,
      type: 'assessment',
      title: 'Avaliação agendada',
      description: 'Pedro Oliveira - Amanhã 14:00',
      timestamp: '2 horas atrás'
    },
    {
      id: 5,
      type: 'achievement',
      title: 'Meta alcançada!',
      description: 'Júlia Santos - 30 dias consecutivos',
      timestamp: '3 horas atrás',
      badge: '🏆'
    }
  ];

  // Mock performance data
  const weeklyPerformanceData = [
    { name: 'Seg', value: 12 },
    { name: 'Ter', value: 19 },
    { name: 'Qua', value: 15 },
    { name: 'Qui', value: 22 },
    { name: 'Sex', value: 18 },
    { name: 'Sáb', value: 25 },
    { name: 'Dom', value: 14 }
  ];

  const monthlyRevenueData = [
    { name: 'Jan', value: 6500 },
    { name: 'Fev', value: 7200 },
    { name: 'Mar', value: 6800 },
    { name: 'Abr', value: 7800 },
    { name: 'Mai', value: 8200 },
    { name: 'Jun', value: 8450 }
  ];

  // Mock upcoming events
  const upcomingEvents = [
    {
      id: 1,
      type: 'workout',
      title: 'Treino com Maria Santos',
      client: 'Maria Santos',
      time: 'Hoje, 16:00',
      location: 'Academia Central',
      status: 'confirmed'
    },
    {
      id: 2,
      type: 'assessment',
      title: 'Avaliação Física',
      client: 'Carlos Silva',
      time: 'Amanhã, 09:00',
      location: 'Consultório',
      status: 'pending'
    },
    {
      id: 3,
      type: 'consultation',
      title: 'Consulta Nutricional',
      client: 'Ana Costa',
      time: 'Amanhã, 14:30',
      location: 'Online',
      status: 'confirmed'
    }
  ];

  // Mock achievements
  const recentAchievements = [
    {
      id: 1,
      type: 'streak',
      title: 'Sequência de 7 dias!',
      description: 'Você treinou todos os dias desta semana',
      earnedAt: 'Hoje',
      points: 50,
      isNew: true
    },
    {
      id: 2,
      type: 'milestone',
      title: '100 Treinos Completados',
      description: 'Parabéns pela dedicação e consistência!',
      earnedAt: 'Ontem',
      points: 100
    },
    {
      id: 3,
      type: 'goal',
      title: 'Meta de Peso Alcançada',
      description: 'Você atingiu seu objetivo de perder 5kg',
      earnedAt: '2 dias atrás',
      points: 75,
      progress: { current: 5, total: 5 }
    }
  ];

  const currentStats = userRole === 'trainer' ? trainerStats : clientStats;
  const greeting = currentTime?.getHours() < 12 ? 'Bom dia' : currentTime?.getHours() < 18 ? 'Boa tarde' : 'Boa noite';
  const userName = userRole === 'trainer' ? 'João Silva' : 'Maria Santos';

  return (
    <div className="bg-background">
      {/* Header Section - Updated for CapiFit */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🦫</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center">
                  {greeting}, {userName}! 👋
                </h1>
                <p className="text-muted-foreground mt-1">
                  Bem-vindo ao CapiFit - Sua plataforma fitness inteligente
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              {/* Logout Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  localStorage.removeItem('capifit_isAuthenticated');
                  localStorage.removeItem('capifit_userRole');
                  localStorage.removeItem('capifit_user_logged_in');
                  localStorage.removeItem('capifit_loginTime');
                  navigate('/login');
                }}
                iconName="LogOut"
                iconPosition="left"
              >
                Sair
              </Button>
              
              {/* Role Switcher for Demo */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUserRole(userRole === 'trainer' ? 'client' : 'trainer')}
                iconName="RefreshCw"
                iconPosition="left"
              >
                Ver como {userRole === 'trainer' ? 'Cliente' : 'Trainer'}
              </Button>
              
              <div className="text-sm text-muted-foreground">
                {currentTime?.toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {currentStats?.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat?.title}
              value={stat?.value}
              subtitle={stat?.subtitle}
              icon={stat?.icon}
              color={stat?.color}
              trend={stat?.trend}
              actionLabel={stat?.actionLabel}
              onActionClick={stat?.onActionClick}
            />
          ))}
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-6">
            {userRole === 'trainer' ? (
              <>
                <PerformanceChart
                  type="line"
                  title="Treinos Semanais"
                  data={weeklyPerformanceData}
                  dataKey="value"
                  color="#1565C0"
                />
                <PerformanceChart
                  type="bar"
                  title="Receita Mensal (R$)"
                  data={monthlyRevenueData}
                  dataKey="value"
                  color="#2E7D32"
                />
              </>
            ) : (
              <>
                <PerformanceChart
                  type="line"
                  title="Progresso Semanal"
                  data={weeklyPerformanceData}
                  dataKey="value"
                  color="#1565C0"
                />
                <AchievementNotifications achievements={recentAchievements} />
              </>
            )}
          </div>

          {/* Right Column - Activity & Schedule */}
          <div className="space-y-6">
            <ActivityFeed activities={recentActivities} />
            <UpcomingSchedule events={upcomingEvents} userRole={userRole} />
          </div>
        </div>

        {/* Bottom Section - Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <QuickActions userRole={userRole} />
          
          {/* Additional Info Panel */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                {userRole === 'trainer' ? 'Dicas para Trainers' : 'Motivação do Dia'}
              </h3>
              <Icon name="Lightbulb" size={20} className="text-muted-foreground" />
            </div>
            
            <div className="space-y-4">
              {userRole === 'trainer' ? (
                <>
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-sm font-medium text-foreground mb-2">
                      💡 Engajamento de Clientes
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Envie mensagens motivacionais regulares para manter seus alunos engajados e comprometidos com os treinos.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-success/5 rounded-lg border border-success/20">
                    <p className="text-sm font-medium text-foreground mb-2">
                      📊 Acompanhamento de Progresso
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Realize avaliações físicas mensais para documentar a evolução e ajustar os treinos conforme necessário.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
                    <p className="text-sm font-medium text-foreground mb-2">
                      🔥 Frase do Dia
                    </p>
                    <p className="text-xs text-muted-foreground italic">
                      "O sucesso é a soma de pequenos esforços repetidos dia após dia."
                    </p>
                  </div>
                  
                  <div className="p-4 bg-secondary/5 rounded-lg border border-secondary/20">
                    <p className="text-sm font-medium text-foreground mb-2">
                      🎯 Meta da Semana
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Complete 6 treinos esta semana para desbloquear a conquista "Semana Perfeita"!
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPrincipal;