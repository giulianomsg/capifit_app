import React from 'react';
import Icon from '../../../components/AppIcon';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ClientMetricsPanel = ({ metrics = null, className = "" }) => {
  // Default metrics data
  const defaultMetrics = {
    totalClients: 47,
    activeClients: 42,
    newThisMonth: 8,
    churnRate: 5.2,
    averageRevenue: 189.50,
    totalRevenue: 8936.50,
    retentionRate: 94.8,
    engagementScore: 87.3,
    monthlyGrowth: [
      { month: 'Jan', clients: 32, revenue: 6048 },
      { month: 'Fev', clients: 35, revenue: 6615 },
      { month: 'Mar', clients: 38, revenue: 7182 },
      { month: 'Abr', clients: 41, revenue: 7749 },
      { month: 'Mai', clients: 44, revenue: 8316 },
      { month: 'Jun', clients: 47, revenue: 8936 }
    ],
    subscriptionDistribution: [
      { name: 'Mensal', value: 28, color: 'var(--color-primary)' },
      { name: 'Trimestral', value: 12, color: 'var(--color-secondary)' },
      { name: 'Anual', value: 7, color: 'var(--color-accent)' }
    ],
    paymentStatus: {
      emDia: 42,
      pendente: 3,
      atrasado: 2
    },
    activityLevels: {
      alto: 18,
      medio: 21,
      baixo: 6,
      inativo: 2
    }
  };

  const currentMetrics = metrics || defaultMetrics;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })?.format(value);
  };

  const formatPercentage = (value) => {
    return `${value?.toFixed(1)}%`;
  };

  const MetricCard = ({ title, value, subtitle, icon, trend, color = "primary" }) => (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-${color}/10 rounded-lg flex items-center justify-center`}>
          <Icon name={icon} size={24} className={`text-${color}`} />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-sm ${
            trend > 0 ? 'text-success' : trend < 0 ? 'text-destructive' : 'text-muted-foreground'
          }`}>
            <Icon 
              name={trend > 0 ? 'TrendingUp' : trend < 0 ? 'TrendingDown' : 'Minus'} 
              size={16} 
            />
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-1">{value}</h3>
        <p className="text-sm text-muted-foreground">{title}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Clientes"
          value={currentMetrics?.totalClients}
          subtitle={`${currentMetrics?.activeClients} ativos`}
          icon="Users"
          trend={12.5}
          color="primary"
        />
        
        <MetricCard
          title="Novos este Mês"
          value={currentMetrics?.newThisMonth}
          subtitle="Crescimento mensal"
          icon="UserPlus"
          trend={8.3}
          color="secondary"
        />
        
        <MetricCard
          title="Receita Média"
          value={formatCurrency(currentMetrics?.averageRevenue)}
          subtitle="Por cliente/mês"
          icon="DollarSign"
          trend={5.7}
          color="accent"
        />
        
        <MetricCard
          title="Taxa de Retenção"
          value={formatPercentage(currentMetrics?.retentionRate)}
          subtitle={`Churn: ${formatPercentage(currentMetrics?.churnRate)}`}
          icon="Target"
          trend={2.1}
          color="success"
        />
      </div>
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Growth Chart */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Crescimento Mensal</h3>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span className="text-muted-foreground">Clientes</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-secondary rounded-full"></div>
                <span className="text-muted-foreground">Receita</span>
              </div>
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentMetrics?.monthlyGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis 
                  dataKey="month" 
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--color-popover)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="clients" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subscription Distribution */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Distribuição de Planos</h3>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={currentMetrics?.subscriptionDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {currentMetrics?.subscriptionDistribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry?.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--color-popover)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex justify-center space-x-6 mt-4">
            {currentMetrics?.subscriptionDistribution?.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item?.color }}
                ></div>
                <span className="text-sm text-muted-foreground">
                  {item?.name} ({item?.value})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Status */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Status de Pagamento</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-success rounded-full"></div>
                <span className="text-sm text-foreground">Em Dia</span>
              </div>
              <span className="text-sm font-medium text-foreground">
                {currentMetrics?.paymentStatus?.emDia}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-warning rounded-full"></div>
                <span className="text-sm text-foreground">Pendente</span>
              </div>
              <span className="text-sm font-medium text-foreground">
                {currentMetrics?.paymentStatus?.pendente}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-destructive rounded-full"></div>
                <span className="text-sm text-foreground">Atrasado</span>
              </div>
              <span className="text-sm font-medium text-foreground">
                {currentMetrics?.paymentStatus?.atrasado}
              </span>
            </div>
          </div>
        </div>

        {/* Activity Levels */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Níveis de Atividade</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-success rounded-full"></div>
                <span className="text-sm text-foreground">Alto</span>
              </div>
              <span className="text-sm font-medium text-foreground">
                {currentMetrics?.activityLevels?.alto}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-warning rounded-full"></div>
                <span className="text-sm text-foreground">Médio</span>
              </div>
              <span className="text-sm font-medium text-foreground">
                {currentMetrics?.activityLevels?.medio}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-accent rounded-full"></div>
                <span className="text-sm text-foreground">Baixo</span>
              </div>
              <span className="text-sm font-medium text-foreground">
                {currentMetrics?.activityLevels?.baixo}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-destructive rounded-full"></div>
                <span className="text-sm text-foreground">Inativo</span>
              </div>
              <span className="text-sm font-medium text-foreground">
                {currentMetrics?.activityLevels?.inativo}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientMetricsPanel;