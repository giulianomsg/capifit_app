import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const ProgressTracking = ({ clientData }) => {
  const [selectedMetric, setSelectedMetric] = useState('peso');
  const [timeRange, setTimeRange] = useState('6months');

  // Mock progress data
  const progressData = {
    peso: [
      { data: '2024-05', valor: 70, meta: 65 },
      { data: '2024-06', valor: 69.5, meta: 65 },
      { data: '2024-07', valor: 69, meta: 65 },
      { data: '2024-08', valor: 68.5, meta: 65 },
      { data: '2024-09', valor: 68.2, meta: 65 },
      { data: '2024-10', valor: 68, meta: 65 }
    ],
    medidas: [
      { data: '2024-05', cintura: 80, quadril: 95, bracos: 28 },
      { data: '2024-06', cintura: 79, quadril: 94, bracos: 28.5 },
      { data: '2024-07', cintura: 78, quadril: 93, bracos: 29 },
      { data: '2024-08', cintura: 77, quadril: 92, bracos: 29.5 },
      { data: '2024-09', cintura: 76, quadril: 91, bracos: 30 },
      { data: '2024-10', cintura: 75, quadril: 90, bracos: 30.5 }
    ],
    performance: [
      { data: '2024-05', forca: 65, resistencia: 70, flexibilidade: 60 },
      { data: '2024-06', forca: 68, resistencia: 72, flexibilidade: 62 },
      { data: '2024-07', forca: 70, resistencia: 75, flexibilidade: 65 },
      { data: '2024-08', forca: 73, resistencia: 77, flexibilidade: 67 },
      { data: '2024-09', forca: 75, resistencia: 80, flexibilidade: 70 },
      { data: '2024-10', forca: 78, resistencia: 82, flexibilidade: 72 }
    ]
  };

  const achievements = [
    {
      id: 1,
      titulo: 'Primeira Meta de Peso Alcançada',
      descricao: 'Perdeu os primeiros 2kg do objetivo',
      data: '2024-08-15',
      icone: 'Trophy',
      cor: 'text-yellow-600 bg-yellow-100'
    },
    {
      id: 2,
      titulo: 'Melhoria na Flexibilidade',
      descricao: 'Aumento de 20% na flexibilidade',
      data: '2024-09-20',
      icone: 'TrendingUp',
      cor: 'text-green-600 bg-green-100'
    },
    {
      id: 3,
      titulo: 'Consistência nos Treinos',
      descricao: '30 dias consecutivos de treino',
      data: '2024-10-01',
      icone: 'Calendar',
      cor: 'text-blue-600 bg-blue-100'
    }
  ];

  const currentStats = [
    {
      label: 'Peso Atual',
      value: `${clientData?.healthInfo?.peso} kg`,
      change: '-2kg',
      changeType: 'positive',
      icon: 'TrendingDown'
    },
    {
      label: 'IMC',
      value: clientData?.healthInfo?.imc,
      change: '-1.5',
      changeType: 'positive',
      icon: 'Activity'
    },
    {
      label: 'Massa Magra',
      value: '52.5 kg',
      change: '+2kg',
      changeType: 'positive',
      icon: 'TrendingUp'
    },
    {
      label: 'Gordura Corporal',
      value: '22.8%',
      change: '-3.2%',
      changeType: 'positive',
      icon: 'TrendingDown'
    }
  ];

  const getChartData = () => {
    return progressData?.[selectedMetric] || [];
  };

  const renderChart = () => {
    const data = getChartData();
    
    if (selectedMetric === 'peso') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="data" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="valor" 
              stroke="#8884d8" 
              strokeWidth={2}
              dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
              name="Peso Atual"
            />
            <Line 
              type="monotone" 
              dataKey="meta" 
              stroke="#82ca9d" 
              strokeDasharray="5 5"
              name="Meta"
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }
    
    if (selectedMetric === 'medidas') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="data" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="cintura" stroke="#8884d8" name="Cintura (cm)" />
            <Line type="monotone" dataKey="quadril" stroke="#82ca9d" name="Quadril (cm)" />
            <Line type="monotone" dataKey="bracos" stroke="#ffc658" name="Braços (cm)" />
          </LineChart>
        </ResponsiveContainer>
      );
    }
    
    if (selectedMetric === 'performance') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="data" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="forca" fill="#8884d8" name="Força (%)" />
            <Bar dataKey="resistencia" fill="#82ca9d" name="Resistência (%)" />
            <Bar dataKey="flexibilidade" fill="#ffc658" name="Flexibilidade (%)" />
          </BarChart>
        </ResponsiveContainer>
      );
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Acompanhamento de Progresso</h2>
        <Button
          variant="outline"
          iconName="Download"
          iconPosition="left"
        >
          Exportar Relatório
        </Button>
      </div>

      {/* Current Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {currentStats?.map((stat, index) => (
          <div key={index} className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{stat?.label}</span>
              <Icon name={stat?.icon} size={16} className="text-muted-foreground" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-foreground">{stat?.value}</span>
              <span 
                className={`text-sm font-medium ${
                  stat?.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stat?.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <Select
            label="Métrica"
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e?.target?.value)}
            options={[
              { value: 'peso', label: 'Peso' },
              { value: 'medidas', label: 'Medidas Corporais' },
              { value: 'performance', label: 'Performance' }
            ]}
          />
          
          <Select
            label="Período"
            value={timeRange}
            onChange={(e) => setTimeRange(e?.target?.value)}
            options={[
              { value: '3months', label: 'Últimos 3 meses' },
              { value: '6months', label: 'Últimos 6 meses' },
              { value: '12months', label: 'Último ano' }
            ]}
          />
        </div>
      </div>

      {/* Progress Chart */}
      <div className="bg-card rounded-lg border border-border p-6 mb-8">
        <h3 className="text-lg font-medium text-foreground mb-4">
          Evolução - {selectedMetric === 'peso' ? 'Peso' : selectedMetric === 'medidas' ? 'Medidas Corporais' : 'Performance'}
        </h3>
        {renderChart()}
      </div>

      {/* Achievements */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-medium text-foreground mb-4">Conquistas e Marcos</h3>
        <div className="space-y-4">
          {achievements?.map((achievement) => (
            <div key={achievement?.id} className="flex items-start space-x-4 p-4 bg-muted/30 rounded-lg">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${achievement?.cor}`}>
                <Icon name={achievement?.icone} size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-foreground">{achievement?.titulo}</h4>
                <p className="text-sm text-muted-foreground mb-1">{achievement?.descricao}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(achievement?.data)?.toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {achievements?.length === 0 && (
          <div className="text-center py-8">
            <Icon name="Trophy" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h4 className="text-lg font-medium text-foreground mb-2">Nenhuma conquista ainda</h4>
            <p className="text-muted-foreground">
              As conquistas aparecerão conforme o cliente alcança seus objetivos
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressTracking;