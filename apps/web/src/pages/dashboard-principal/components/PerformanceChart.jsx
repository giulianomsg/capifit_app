import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Icon from '../../../components/AppIcon';

const PerformanceChart = ({ 
  type = 'line', 
  data = [], 
  title, 
  dataKey, 
  color = '#1565C0',
  className = "" 
}) => {
  const renderChart = () => {
    if (type === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12, fill: '#757575' }}
              axisLine={{ stroke: '#E0E0E0' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#757575' }}
              axisLine={{ stroke: '#E0E0E0' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#FFFFFF', 
                border: '1px solid #E0E0E0',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12, fill: '#757575' }}
            axisLine={{ stroke: '#E0E0E0' }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#757575' }}
            axisLine={{ stroke: '#E0E0E0' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#FFFFFF', 
              border: '1px solid #E0E0E0',
              borderRadius: '8px',
              fontSize: '12px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color} 
            strokeWidth={3}
            dot={{ fill: color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className={`bg-card border border-border rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <Icon name="BarChart3" size={20} className="text-muted-foreground" />
      </div>
      {data?.length > 0 ? (
        <div className="w-full">
          {renderChart()}
        </div>
      ) : (
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <Icon name="BarChart3" size={32} className="mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Dados insuficientes para exibir gráfico
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceChart;