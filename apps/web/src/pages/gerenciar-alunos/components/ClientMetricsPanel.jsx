import React, { useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const defaultMetrics = {
  totalClients: 0,
  activeClients: 0,
  pausedClients: 0,
  endedClients: 0,
  newThisMonth: 0,
  averageProgress: 0,
  subscriptionDistribution: [
    { name: 'Mensal', value: 0, color: 'var(--color-primary)' },
    { name: 'Trimestral', value: 0, color: 'var(--color-secondary)' },
    { name: 'Anual', value: 0, color: 'var(--color-accent)' },
    { name: 'Personalizado', value: 0, color: 'var(--color-warning)' },
  ],
  paymentStatus: {
    emDia: 0,
    pendente: 0,
    atrasado: 0,
  },
  activityLevels: {
    alto: 0,
    medio: 0,
    baixo: 0,
    inativo: 0,
  },
};

const ClientMetricsPanel = ({ metrics = null, className = '' }) => {
  const currentMetrics = metrics ?? defaultMetrics;

  const monthlyActivityData = useMemo(() => {
    return [
      { name: 'Ativos', value: currentMetrics.activeClients, color: 'var(--color-success)' },
      { name: 'Pausados', value: currentMetrics.pausedClients, color: 'var(--color-warning)' },
      { name: 'Encerrados', value: currentMetrics.endedClients, color: 'var(--color-destructive)' },
    ];
  }, [currentMetrics.activeClients, currentMetrics.pausedClients, currentMetrics.endedClients]);

  const paymentData = useMemo(() => {
    return [
      { name: 'Em dia', value: currentMetrics.paymentStatus.emDia, color: 'var(--color-success)' },
      { name: 'Pendente', value: currentMetrics.paymentStatus.pendente, color: 'var(--color-warning)' },
      { name: 'Atrasado', value: currentMetrics.paymentStatus.atrasado, color: 'var(--color-destructive)' },
    ];
  }, [currentMetrics.paymentStatus]);

  const activityData = useMemo(() => {
    return [
      { label: 'Alto', value: currentMetrics.activityLevels.alto },
      { label: 'Médio', value: currentMetrics.activityLevels.medio },
      { label: 'Baixo', value: currentMetrics.activityLevels.baixo },
      { label: 'Inativo', value: currentMetrics.activityLevels.inativo },
    ];
  }, [currentMetrics.activityLevels]);

  const MetricCard = ({ title, value, subtitle, icon, color = 'primary' }) => (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-${color}/10 rounded-lg flex items-center justify-center`}>
          <Icon name={icon} size={24} className={`text-${color}`} />
        </div>
      </div>
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-1">{value}</h3>
        <p className="text-sm text-muted-foreground">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Clientes"
          value={currentMetrics.totalClients}
          subtitle={`Novos este mês: ${currentMetrics.newThisMonth}`}
          icon="Users"
          color="primary"
        />
        <MetricCard
          title="Clientes Ativos"
          value={currentMetrics.activeClients}
          subtitle={`Média de progresso: ${currentMetrics.averageProgress?.toFixed?.(1) ?? 0}%`}
          icon="Activity"
          color="success"
        />
        <MetricCard
          title="Clientes Pausados"
          value={currentMetrics.pausedClients}
          subtitle="Em acompanhamento"
          icon="PauseCircle"
          color="warning"
        />
        <MetricCard
          title="Clientes Encerrados"
          value={currentMetrics.endedClients}
          subtitle="Histórico recente"
          icon="Archive"
          color="destructive"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Status de relacionamento</h3>
            <span className="text-sm text-muted-foreground">Distribuição geral</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-popover)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {monthlyActivityData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Distribuição de Planos</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={currentMetrics.subscriptionDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {currentMetrics.subscriptionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-popover)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Status de Pagamento</h3>
          <div className="space-y-3">
            {paymentData.map((status) => (
              <div key={status.name} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{status.name}</span>
                <span className="text-sm font-medium text-foreground">{status.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Nível de Atividade</h3>
          <div className="grid grid-cols-2 gap-4">
            {activityData.map((item) => (
              <div key={item.label} className="rounded-lg border border-border p-4">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="text-xl font-semibold text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientMetricsPanel;
