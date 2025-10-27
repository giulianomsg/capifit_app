import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Icon from '../../../components/AppIcon';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const ProgressTracking = ({ selectedClient }) => {
  const [selectedMetric, setSelectedMetric] = useState('weight');
  const [timeRange, setTimeRange] = useState('6months');

  // Mock progress data
  const progressData = {
    weight: [
      { date: '2023-10', value: 78.5, label: 'Out 23' },
      { date: '2023-11', value: 77.2, label: 'Nov 23' },
      { date: '2023-12', value: 76.8, label: 'Dez 23' },
      { date: '2024-01', value: 75.5, label: 'Jan 24' },
      { date: '2024-02', value: 74.9, label: 'Fev 24' },
      { date: '2024-03', value: 74.2, label: 'Mar 24' }
    ],
    bodyFat: [
      { date: '2023-10', value: 22.5, label: 'Out 23' },
      { date: '2023-11', value: 21.8, label: 'Nov 23' },
      { date: '2023-12', value: 20.9, label: 'Dez 23' },
      { date: '2024-01', value: 19.8, label: 'Jan 24' },
      { date: '2024-02', value: 18.9, label: 'Fev 24' },
      { date: '2024-03', value: 18.2, label: 'Mar 24' }
    ],
    muscleMass: [
      { date: '2023-10', value: 45.2, label: 'Out 23' },
      { date: '2023-11', value: 45.8, label: 'Nov 23' },
      { date: '2023-12', value: 46.5, label: 'Dez 23' },
      { date: '2024-01', value: 47.1, label: 'Jan 24' },
      { date: '2024-02', value: 47.8, label: 'Fev 24' },
      { date: '2024-03', value: 48.3, label: 'Mar 24' }
    ]
  };

  // Circumference comparison data
  const circumferenceData = [
    { name: 'Cintura', before: 85, current: 78, change: -7 },
    { name: 'Quadril', before: 98, current: 95, change: -3 },
    { name: 'Peito', before: 95, current: 98, change: +3 },
    { name: 'Braço', before: 32, current: 35, change: +3 },
    { name: 'Coxa', before: 55, current: 58, change: +3 }
  ];

  const metrics = [
    { value: 'weight', label: 'Peso (kg)', icon: 'Scale', color: '#1565C0' },
    { value: 'bodyFat', label: '% Gordura', icon: 'Percent', color: '#D32F2F' },
    { value: 'muscleMass', label: 'Massa Muscular (kg)', icon: 'Zap', color: '#2E7D32' }
  ];

  const timeRanges = [
    { value: '3months', label: 'Últimos 3 meses' },
    { value: '6months', label: 'Últimos 6 meses' },
    { value: '1year', label: 'Último ano' },
    { value: 'all', label: 'Todos os registros' }
  ];

  if (!selectedClient) {
    return (
      <div className="p-8 text-center">
        <Icon name="TrendingUp" size={48} className="text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Selecione um cliente para ver o progresso</p>
      </div>
    );
  }

  const currentMetric = metrics?.find(m => m?.value === selectedMetric);
  const chartData = progressData?.[selectedMetric] || [];
  
  const latestValue = chartData?.[chartData?.length - 1]?.value;
  const previousValue = chartData?.[chartData?.length - 2]?.value;
  const change = latestValue && previousValue ? latestValue - previousValue : 0;
  const changePercent = previousValue ? ((change / previousValue) * 100) : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground">
            Evolução - {selectedClient?.name}
          </h3>
          <p className="text-muted-foreground">
            Acompanhe o progresso ao longo do tempo
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select
            value={timeRange}
            onValueChange={setTimeRange}
            options={timeRanges}
            placeholder="Período"
          />
          <Button variant="outline" iconName="Download" iconPosition="left">
            Exportar
          </Button>
        </div>
      </div>

      {/* Metric Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics?.map((metric) => (
          <button
            key={metric?.value}
            onClick={() => setSelectedMetric(metric?.value)}
            className={`
              p-4 rounded-lg border text-left transition-colors
              ${selectedMetric === metric?.value
                ? 'border-primary bg-primary/10' :'border-border hover:border-primary/50'
              }
            `}
          >
            <div className="flex items-center justify-between mb-2">
              <Icon 
                name={metric?.icon} 
                size={20} 
                style={{ color: selectedMetric === metric?.value ? metric?.color : undefined }}
              />
              {selectedMetric === metric?.value && (
                <Icon name="Check" size={16} className="text-primary" />
              )}
            </div>
            <h4 className="font-semibold text-foreground">{metric?.label}</h4>
            <p className="text-sm text-muted-foreground">
              {selectedMetric === metric?.value ? 'Selecionado' : 'Clique para ver'}
            </p>
          </button>
        ))}
      </div>

      {/* Progress Chart */}
      <div className="bg-muted/30 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="text-lg font-semibold text-foreground flex items-center">
              <Icon name={currentMetric?.icon} size={20} className="mr-2" style={{ color: currentMetric?.color }} />
              {currentMetric?.label}
            </h4>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-2xl font-bold text-foreground">
                {latestValue?.toFixed(1)}
              </span>
              {change !== 0 && (
                <span className={`text-sm flex items-center ${
                  change > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  <Icon 
                    name={change > 0 ? 'TrendingUp' : 'TrendingDown'} 
                    size={14} 
                    className="mr-1" 
                  />
                  {Math.abs(change)?.toFixed(1)} ({changePercent?.toFixed(1)}%)
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="label" 
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={currentMetric?.color}
                strokeWidth={3}
                dot={{ fill: currentMetric?.color, strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: currentMetric?.color, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Circumference Comparison */}
      <div className="bg-muted/30 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-foreground mb-6 flex items-center">
          <Icon name="Ruler" size={20} className="mr-2 text-primary" />
          Comparativo de Circunferências
        </h4>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            {circumferenceData?.map((item) => (
              <div key={item?.name} className="flex items-center justify-between p-3 bg-card rounded-lg">
                <div>
                  <span className="font-medium text-foreground">{item?.name}</span>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>Antes: {item?.before}cm</span>
                    <span>Atual: {item?.current}cm</span>
                  </div>
                </div>
                <div className={`text-right ${
                  item?.change > 0 ? 'text-green-600' : item?.change < 0 ? 'text-red-600' : 'text-muted-foreground'
                }`}>
                  <div className="font-semibold">
                    {item?.change > 0 ? '+' : ''}{item?.change}cm
                  </div>
                  <Icon 
                    name={item?.change > 0 ? 'TrendingUp' : item?.change < 0 ? 'TrendingDown' : 'Minus'} 
                    size={14}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={circumferenceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#64748b"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="before" fill="#94a3b8" name="Antes" />
                <Bar dataKey="current" fill="#1565C0" name="Atual" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracking;