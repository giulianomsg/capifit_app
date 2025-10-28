import React from 'react';
import { AlertTriangle, CheckCircle, TrendingUp, Users } from 'lucide-react';

const cardConfig = [
  { key: 'totalPlans', title: 'Planos ativos', icon: Users, color: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-600' },
  {
    key: 'averageCompliance',
    title: 'Aderência média',
    icon: TrendingUp,
    color: 'bg-green-500',
    bg: 'bg-green-50',
    text: 'text-green-600',
    suffix: '%',
  },
  {
    key: 'excellentPlans',
    title: 'Planos excelentes',
    icon: CheckCircle,
    color: 'bg-emerald-500',
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
  },
  {
    key: 'needsAttention',
    title: 'Precisam atenção',
    icon: AlertTriangle,
    color: 'bg-amber-500',
    bg: 'bg-amber-50',
    text: 'text-amber-600',
  },
];

const NutritionStatsCards = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cardConfig.map((card) => {
        const Icon = card.icon;
        const value = stats?.[card.key] ?? 0;
        return (
          <div key={card.key} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {value}
                  {card.suffix ? card.suffix : ''}
                </p>
              </div>
              <div className={`${card.bg} p-3 rounded-lg`}>
                <Icon className={`w-6 h-6 ${card.text}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NutritionStatsCards;
