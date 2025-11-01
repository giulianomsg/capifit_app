import React from 'react';
import { PlusCircle, BookOpen, Users, BarChart3, MessageSquare, Copy } from 'lucide-react';
import Icon from '../../../components/AppIcon';


const QuickActionCards = () => {
  const quickActions = [
    {
      title: 'Criar Plano Alimentar',
      description: 'Desenvolva um novo plano personalizado',
      icon: PlusCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      action: () => {
        // Navigate to create meal plan
        window.location.href = '/create-meal-plan';
      }
    },
    {
      title: 'Biblioteca de Alimentos',
      description: 'Acesse o banco TACO e alimentos cadastrados',
      icon: BookOpen,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      action: () => {
        console.log('Navigate to food library');
      }
    },
    {
      title: 'Planos Ativos',
      description: 'Visualize todos os planos em andamento',
      icon: Users,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      action: () => {
        console.log('Navigate to active plans');
      }
    },
    {
      title: 'Relatórios Nutricionais',
      description: 'Gere relatórios de progresso e aderência',
      icon: BarChart3,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      action: () => {
        console.log('Navigate to reports');
      }
    },
    {
      title: 'Mensagens Nutricionais',
      description: 'Envie orientações e feedback aos clientes',
      icon: MessageSquare,
      color: 'bg-teal-500',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-600',
      action: () => {
        console.log('Navigate to nutrition messages');
      }
    },
    {
      title: 'Templates de Planos',
      description: 'Acesse e crie templates reutilizáveis',
      icon: Copy,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      action: () => {
        console.log('Navigate to plan templates');
      }
    }
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {quickActions?.map((action, index) => {
          const Icon = action?.icon;
          
          return (
            <div
              key={index}
              onClick={action?.action}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer group"
            >
              <div className={`${action?.bgColor} p-3 rounded-lg mb-3 group-hover:scale-110 transition-transform`}>
                <Icon className={`w-6 h-6 ${action?.textColor}`} />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-green-600 transition-colors">
                {action?.title}
              </h3>
              <p className="text-xs text-gray-500 leading-tight">
                {action?.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActionCards;