import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Area, AreaChart } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const EvolutionCharts = ({ clients, selectedClient, onClientSelect, data, compact = false }) => {
  const [chartType, setChartType] = useState('weight');
  const [timeRange, setTimeRange] = useState('6months');
  const [chartStyle, setChartStyle] = useState('line');

  // Generate mock evolution data for charts
  const generateEvolutionData = (clientData) => {
    if (!clientData) return [];

    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentMonth = new Date()?.getMonth();
    
    return Array.from({ length: 12 }, (_, i) => {
      const monthIndex = (currentMonth - 11 + i + 12) % 12;
      const baseWeight = clientData?.weight || 70;
      const baseBodyFat = clientData?.bodyFat || 20;
      const baseMuscle = clientData?.muscleMass || 45;
      
      return {
        month: months?.[monthIndex],
        weight: baseWeight + (Math.random() - 0.5) * 4,
        bodyFat: Math.max(5, baseBodyFat + (Math.random() - 0.7) * 3),
        muscleMass: baseMuscle + (Math.random() - 0.3) * 2,
        bmi: (baseWeight / Math.pow(1.7, 2)) + (Math.random() - 0.5) * 2,
        measurements: {
          chest: 85 + (Math.random() - 0.5) * 5,
          waist: 70 + (Math.random() - 0.7) * 8,
          hip: 90 + (Math.random() - 0.5) * 4,
          bicep: 30 + (Math.random() - 0.3) * 3,
          thigh: 50 + (Math.random() - 0.5) * 4
        }
      };
    });
  };

  const chartConfigs = {
    weight: {
      title: 'Evolução do Peso',
      dataKey: 'weight',
      color: '#3B82F6',
      unit: 'kg',
      icon: 'Scale'
    },
    bodyFat: {
      title: 'Percentual de Gordura',
      dataKey: 'bodyFat',
      color: '#EF4444',
      unit: '%',
      icon: 'Activity'
    },
    muscleMass: {
      title: 'Massa Muscular',
      dataKey: 'muscleMass',
      color: '#10B981',
      unit: 'kg',
      icon: 'Zap'
    },
    bmi: {
      title: 'Índice de Massa Corporal',
      dataKey: 'bmi',
      color: '#8B5CF6',
      unit: '',
      icon: 'Calculator'
    }
  };

  const measurementConfigs = {
    chest: { title: 'Peito', color: '#F59E0B', unit: 'cm' },
    waist: { title: 'Cintura', color: '#EF4444', unit: 'cm' },
    hip: { title: 'Quadril', color: '#8B5CF6', unit: 'cm' },
    bicep: { title: 'Bíceps', color: '#10B981', unit: 'cm' },
    thigh: { title: 'Coxa', color: '#3B82F6', unit: 'cm' }
  };

  // If compact mode (for dashboard overview)
  if (compact && data) {
    const chartData = Object.entries(data)?.map(([key, values], index) => ({
      month: `Mês ${index + 1}`,
      [key]: values?.[values?.length - 1] // Latest value
    }));

    return (
      <div className="space-y-4">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="month" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="weight" 
              stroke="#3B82F6" 
              strokeWidth={2}
              dot={{ fill: '#3B82F6', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (!selectedClient && !compact) {
    return (
      <div className="space-y-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Selecionar Cliente
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients?.map((client) => (
              <div
                key={client?.id}
                onClick={() => onClientSelect?.(client)}
                className="p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                    <img
                      src={client?.avatar}
                      alt={client?.alt || `Foto de perfil de ${client?.name}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full bg-muted flex items-center justify-center" style={{ display: 'none' }}>
                      <Icon name="User" size={20} className="text-muted-foreground" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{client?.name}</p>
                    <p className="text-sm text-muted-foreground">Ver evolução</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const evolutionData = generateEvolutionData(selectedClient);
  const currentConfig = chartConfigs?.[chartType];

  return (
    <div className="space-y-6">
      {/* Client Header */}
      {!compact && (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-muted">
                <img
                  src={selectedClient?.avatar}
                  alt={selectedClient?.alt || `Foto de perfil de ${selectedClient?.name}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="w-full h-full bg-muted flex items-center justify-center" style={{ display: 'none' }}>
                  <Icon name="User" size={32} className="text-muted-foreground" />
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-bold text-foreground">{selectedClient?.name}</h2>
                <p className="text-muted-foreground">Análise de Evolução Corporal</p>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={() => onClientSelect?.(null)}
              iconName="ArrowLeft"
              iconPosition="left"
            >
              Voltar
            </Button>
          </div>
        </div>
      )}
      {/* Chart Controls */}
      {!compact && (
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex flex-wrap items-center gap-4">
            <Select
              value={chartType}
              onChange={setChartType}
              options={Object.entries(chartConfigs)?.map(([key, config]) => ({
                value: key,
                label: config?.title
              }))}
              className="w-48"
            />
            
            <Select
              value={chartStyle}
              onChange={setChartStyle}
              options={[
                { value: 'line', label: 'Linha' },
                { value: 'bar', label: 'Barras' },
                { value: 'area', label: 'Área' }
              ]}
              className="w-32"
            />
            
            <Select
              value={timeRange}
              onChange={setTimeRange}
              options={[
                { value: '3months', label: 'Últimos 3 meses' },
                { value: '6months', label: 'Últimos 6 meses' },
                { value: '12months', label: 'Último ano' },
                { value: 'all', label: 'Todo o período' }
              ]}
              className="w-48"
            />
          </div>
        </div>
      )}
      {/* Main Evolution Chart */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Icon name={currentConfig?.icon} className="text-primary" size={24} />
          <h3 className="text-lg font-semibold text-foreground">
            {currentConfig?.title}
          </h3>
        </div>
        
        <ResponsiveContainer width="100%" height={400}>
          {chartStyle === 'line' && (
            <LineChart data={evolutionData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                className="text-sm"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                className="text-sm"
                tick={{ fontSize: 12 }}
                label={{ 
                  value: currentConfig?.unit, 
                  angle: -90, 
                  position: 'insideLeft' 
                }}
              />
              <Tooltip 
                formatter={(value) => [
                  `${value?.toFixed(1)} ${currentConfig?.unit}`,
                  currentConfig?.title
                ]}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={currentConfig?.dataKey}
                stroke={currentConfig?.color}
                strokeWidth={3}
                dot={{ fill: currentConfig?.color, strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          )}
          
          {chartStyle === 'bar' && (
            <BarChart data={evolutionData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" className="text-sm" />
              <YAxis className="text-sm" />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey={currentConfig?.dataKey}
                fill={currentConfig?.color}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          )}
          
          {chartStyle === 'area' && (
            <AreaChart data={evolutionData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" className="text-sm" />
              <YAxis className="text-sm" />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone"
                dataKey={currentConfig?.dataKey}
                stroke={currentConfig?.color}
                fill={`${currentConfig?.color}40`}
                strokeWidth={2}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
      {/* Measurements Comparison Chart */}
      {!compact && (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Icon name="Ruler" className="text-secondary" size={24} />
            <h3 className="text-lg font-semibold text-foreground">
              Evolução das Medidas Corporais
            </h3>
          </div>
          
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={evolutionData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" className="text-sm" />
              <YAxis 
                className="text-sm"
                label={{ 
                  value: 'cm', 
                  angle: -90, 
                  position: 'insideLeft' 
                }}
              />
              <Tooltip />
              <Legend />
              
              {Object.entries(measurementConfigs)?.map(([key, config]) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={`measurements.${key}`}
                  stroke={config?.color}
                  strokeWidth={2}
                  name={config?.title}
                  dot={{ fill: config?.color, strokeWidth: 1, r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      {/* Progress Summary */}
      {!compact && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(chartConfigs)?.map(([key, config]) => {
            const latestValue = evolutionData?.[evolutionData?.length - 1]?.[config?.dataKey];
            const previousValue = evolutionData?.[evolutionData?.length - 2]?.[config?.dataKey];
            const change = latestValue && previousValue ? latestValue - previousValue : 0;
            const changePercent = previousValue ? ((change / previousValue) * 100)?.toFixed(1) : 0;
            
            return (
              <div key={key} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <Icon name={config?.icon} className="text-primary" size={20} />
                  <h4 className="font-medium text-foreground">{config?.title}</h4>
                </div>
                
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-foreground">
                    {latestValue?.toFixed(1)} {config?.unit}
                  </p>
                  
                  <div className="flex items-center space-x-1">
                    <Icon 
                      name={change >= 0 ? 'TrendingUp' : 'TrendingDown'}
                      size={14}
                      className={change >= 0 ? 'text-green-600' : 'text-red-600'}
                    />
                    <span className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(changePercent)}%
                    </span>
                    <span className="text-xs text-muted-foreground">vs mês anterior</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EvolutionCharts;