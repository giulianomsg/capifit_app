import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import StatsCard from './components/StatsCard';
import ActivityFeed from './components/ActivityFeed';
import PerformanceChart from './components/PerformanceChart';
import QuickActions from './components/QuickActions';
import UpcomingSchedule from './components/UpcomingSchedule';
import AchievementNotifications from './components/AchievementNotifications';

const DashboardPrincipal = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  const userRole = useMemo(() => {
    if (!user?.roles?.length) {
      return 'trainer';
    }
    if (user.roles.includes('trainer')) {
      return 'trainer';
    }
    if (user.roles.includes('client')) {
      return 'client';
    }
    return user.roles[0];
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const trainerStats = [
    {
      title: 'Alunos Ativos',
      value: '24',
      subtitle: '3 novos esta semana',
      icon: 'Users',
      color: 'bg-primary',
      trend: { type: 'up', value: '+12.5%' },
      actionLabel: 'Gerenciar alunos',
      onActionClick: () => navigate('/gerenciar-alunos'),
    },
    {
      title: 'Avaliações Físicas',
      value: '18',
      subtitle: '5 agendadas hoje',
      icon: 'Activity',
      color: 'bg-secondary',
      trend: { type: 'up', value: '+8.3%' },
      actionLabel: 'Ver avaliações',
      onActionClick: () => navigate('/physical-assessment-system'),
    },
    {
      title: 'Mensagens',
      value: '12',
      subtitle: '3 não lidas',
      icon: 'MessageSquare',
      color: 'bg-accent',
      trend: { type: 'down', value: '-2' },
      actionLabel: 'Abrir chat',
      onActionClick: () => navigate('/chat-communication-hub'),
    },
    {
      title: 'Receita Mensal',
      value: 'R$ 8.450',
      subtitle: 'Meta: R$ 10.000',
      icon: 'DollarSign',
      color: 'bg-success',
      trend: { type: 'up', value: '+18.3%' },
      actionLabel: 'Ver relatórios',
      onActionClick: () => navigate('/relatorios'),
    },
  ];

  const clientStats = [
    {
      title: 'Próximo Treino',
      value: 'Peito e Tríceps',
      subtitle: 'Hoje às 18:00',
      icon: 'Clock',
      color: 'bg-primary',
      actionLabel: 'Ver treino completo',
      onActionClick: () => navigate('/meu-treino'),
    },
    {
      title: 'Progresso Semanal',
      value: '5/6',
      subtitle: 'Treinos completados',
      icon: 'TrendingUp',
      color: 'bg-success',
      trend: { type: 'up', value: '83%' },
      actionLabel: 'Ver progresso',
      onActionClick: () => navigate('/progresso'),
    },
    {
      title: 'Plano Alimentar',
      value: '1.847 kcal',
      subtitle: 'Consumidas hoje',
      icon: 'Apple',
      color: 'bg-accent',
      trend: { type: 'neutral', value: '92%' },
      actionLabel: 'Ver plano completo',
      onActionClick: () => navigate('/nutrition-management'),
    },
    {
      title: 'Mensagens',
      value: '3',
      subtitle: '1 não lida',
      icon: 'MessageCircle',
      color: 'bg-secondary',
      trend: { type: 'neutral', value: '1 nova' },
      actionLabel: 'Abrir chat',
      onActionClick: () => navigate('/chat-communication-hub'),
    },
  ];

  const stats = userRole === 'client' ? clientStats : trainerStats;

  return (
    <div className="space-y-8 p-6 lg:p-10">
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Olá, {user?.name ?? 'profissional fitness'} 👋</h1>
          <p className="text-muted-foreground">{currentTime.toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' })}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" iconName="Plus" onClick={() => navigate('/criar-treinos')}>
            Novo plano de treino
          </Button>
          <Button variant="outline" iconName="Calendar" onClick={() => navigate('/physical-assessment-system')}>
            Agendar avaliação
          </Button>
          <Button iconName="FileText" onClick={() => navigate('/relatorios')}>
            Relatórios avançados
          </Button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <PerformanceChart role={userRole} />
        </div>
        <div className="space-y-6">
          <QuickActions role={userRole} onNavigate={navigate} />
          <UpcomingSchedule role={userRole} />
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityFeed role={userRole} />
        </div>
        <AchievementNotifications role={userRole} />
      </section>
    </div>
  );
};

export default DashboardPrincipal;
