import React from 'react';
import { Users, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';
import Icon from '../../../components/AppIcon';


const NutritionStatsCards = ({ plans }) => {
  // Calculate stats from plans data
  const totalPlans = plans?.length || 0;
  const averageCompliance = plans?.length 
    ? Math.round(plans?.reduce((sum, plan) => sum + plan?.compliance, 0) / plans?.length)
    : 0;
  const excellentPlans = plans?.filter(plan => plan?.compliance >= 90)?.length || 0;
  const needsAttention = plans?.filter(plan => plan?.compliance < 80)?.length || 0;

  const stats = [
    {
      title: 'Planos Ativos',
      value: totalPlans,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Aderência Média',
      value: `${averageCompliance}%`,
      icon: TrendingUp,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Planos Excelentes',
      value: excellentPlans,
      icon: CheckCircle,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600'
    },
    {
      title: 'Precisam Atenção',
      value: needsAttention,
      icon: AlertTriangle,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats?.map((stat, index) => {
        const Icon = stat?.icon;
        
        return (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {stat?.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stat?.value}
                </p>
              </div>
              <div className={`${stat?.bgColor} p-3 rounded-lg`}>
                <Icon className={`w-6 h-6 ${stat?.textColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NutritionStatsCards;