import React from 'react';
import { User, Target, AlertTriangle, Heart, Activity } from 'lucide-react';

const ClientInfoSidebar = ({ client }) => {
  if (!client) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Selecione um Cliente
          </h3>
          <p className="text-sm text-gray-500">
            Escolha um cliente para criar o plano alimentar
          </p>
        </div>
      </div>
    );
  }

  const calculateBMI = () => {
    if (!client?.weight || !client?.height) return null;
    const heightInMeters = client?.height / 100;
    return (client?.weight / (heightInMeters * heightInMeters))?.toFixed(1);
  };

  const getBMICategory = (bmi) => {
    if (!bmi) return null;
    if (bmi < 18.5) return { category: 'Abaixo do peso', color: 'text-blue-600' };
    if (bmi < 25) return { category: 'Peso normal', color: 'text-green-600' };
    if (bmi < 30) return { category: 'Sobrepeso', color: 'text-yellow-600' };
    return { category: 'Obesidade', color: 'text-red-600' };
  };

  const bmi = calculateBMI();
  const bmiCategory = getBMICategory(bmi);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <User className="w-5 h-5 text-blue-600" />
        Informações do Cliente
      </h3>
      {/* Client Basic Info */}
      <div className="space-y-4 mb-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
            {client?.name?.split(' ')?.map(n => n?.[0])?.join('')?.substring(0, 2)}
          </div>
          <h4 className="font-semibold text-gray-900">{client?.name}</h4>
          <p className="text-sm text-gray-500">{client?.email}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Idade</p>
            <p className="text-lg font-semibold text-gray-900">{client?.age}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Peso</p>
            <p className="text-lg font-semibold text-gray-900">{client?.weight} kg</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Altura</p>
            <p className="text-lg font-semibold text-gray-900">{client?.height} cm</p>
          </div>
          {bmi && (
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">IMC</p>
              <p className={`text-lg font-semibold ${bmiCategory?.color || 'text-gray-900'}`}>
                {bmi}
              </p>
            </div>
          )}
        </div>

        {bmiCategory && (
          <div className="text-center">
            <span className={`text-sm font-medium ${bmiCategory?.color}`}>
              {bmiCategory?.category}
            </span>
          </div>
        )}
      </div>
      {/* Activity Level and Goal */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
          <Activity className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-gray-900">Nível de Atividade</p>
            <p className="text-sm text-gray-600">{client?.activity}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
          <Target className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-sm font-medium text-gray-900">Objetivo</p>
            <p className="text-sm text-gray-600">{client?.goal}</p>
          </div>
        </div>
      </div>
      {/* Dietary Restrictions */}
      {client?.restrictions && client?.restrictions?.length > 0 && (
        <div className="mb-6">
          <h5 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Restrições Alimentares
          </h5>
          <div className="space-y-2">
            {client?.restrictions?.map((restriction, index) => (
              <div key={index} className="px-3 py-2 bg-amber-50 text-amber-800 rounded-lg text-sm">
                {restriction}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Preferences */}
      {client?.preferences && client?.preferences?.length > 0 && (
        <div>
          <h5 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-600" />
            Preferências
          </h5>
          <div className="space-y-2">
            {client?.preferences?.map((preference, index) => (
              <div key={index} className="px-3 py-2 bg-pink-50 text-pink-800 rounded-lg text-sm">
                {preference}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientInfoSidebar;