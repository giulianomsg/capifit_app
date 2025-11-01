import React from 'react';
import { Bell, X, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import Icon from '../../../components/AppIcon';


const NotificationAlert = ({ onClose }) => {
  const notifications = [
    {
      id: 1,
      type: 'success',
      message: 'João Santos completou 100% do plano alimentar de hoje',
      time: '5 min atrás',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 2,
      type: 'warning',
      message: 'Ana Costa não registrou nenhuma refeição há 2 dias',
      time: '1 hora atrás',
      icon: AlertCircle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
    {
      id: 3,
      type: 'info',
      message: 'Lembrete: Revisar plano alimentar de Maria Silva (vence amanhã)',
      time: '2 horas atrás',
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" />
          Notificações Recentes
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-2">
        {notifications?.map((notification) => {
          const Icon = notification?.icon;
          
          return (
            <div
              key={notification?.id}
              className={`p-3 rounded-lg ${notification?.bgColor} border border-opacity-20 ${notification?.color?.replace('text-', 'border-')}`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-4 h-4 ${notification?.color} mt-0.5 flex-shrink-0`} />
                <div className="flex-1">
                  <p className="text-sm text-gray-900 mb-1">
                    {notification?.message}
                  </p>
                  <p className="text-xs text-gray-500">
                    {notification?.time}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationAlert;