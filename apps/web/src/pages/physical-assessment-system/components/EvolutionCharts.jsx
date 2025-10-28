import React, { useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const metrics = [
  { key: 'weightKg', label: 'Peso (kg)', color: '#3B82F6' },
  { key: 'bodyFat', label: '% Gordura', color: '#EF4444' },
  { key: 'muscleMass', label: 'Massa magra (kg)', color: '#22C55E' },
];

const EvolutionCharts = ({ selectedClient, measurements = [], onClientSelect }) => {
  const [activeMetric, setActiveMetric] = useState(metrics[0].key);

  const chartData = useMemo(() => {
    return [...measurements]
      .reverse()
      .map((record) => ({
        date: new Date(record.recordedAt).toLocaleDateString('pt-BR'),
        weightKg: record.weightKg ?? null,
        bodyFat: record.bodyFat ?? null,
        muscleMass: record.muscleMass ?? null,
      }))
      .filter((record) => record[activeMetric] !== null);
  }, [measurements, activeMetric]);

  const currentMetric = metrics.find((metric) => metric.key === activeMetric) ?? metrics[0];

  if (!selectedClient) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 text-center">
        <Icon name="BarChart2" size={48} className="text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground">Selecione um cliente</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Escolha um cliente para visualizar a evolução histórica de peso, percentual de gordura e massa magra.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Evolução corporal</h3>
          <p className="text-sm text-muted-foreground">
            Histórico das medições registradas para {selectedClient.name}.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => onClientSelect?.(null)}>
          Trocar cliente
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {metrics.map((metric) => (
          <Button
            key={metric.key}
            variant={activeMetric === metric.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveMetric(metric.key)}
          >
            {metric.label}
          </Button>
        ))}
      </div>

      {chartData.length ? (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.4)" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} width={40} />
              <Tooltip labelStyle={{ fontSize: 12 }} formatter={(value) => value ?? '—'} />
              <Area
                type="monotone"
                dataKey={currentMetric.key}
                name={currentMetric.label}
                stroke={currentMetric.color}
                fill={currentMetric.color}
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="border border-dashed border-border rounded-xl p-8 text-center">
          <Icon name="TrendingUp" size={36} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Ainda não há medições suficientes para exibir a evolução em {currentMetric.label.toLowerCase()}.
          </p>
        </div>
      )}
    </div>
  );
};

export default EvolutionCharts;
