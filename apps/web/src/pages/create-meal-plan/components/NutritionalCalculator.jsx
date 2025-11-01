import React from 'react';
import { Calculator, Target, TrendingUp, TrendingDown } from 'lucide-react';

const NutritionalCalculator = ({ currentNutrition, goals }) => {
  const calculateProgress = (current, target) => {
    return target > 0 ? Math.round((current / target) * 100) : 0;
  };

  const getProgressStatus = (percentage) => {
    if (percentage < 80) return { status: 'baixo', color: 'text-red-600', bgColor: 'bg-red-100' };
    if (percentage < 100) return { status: 'adequado', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    if (percentage <= 120) return { status: 'ideal', color: 'text-green-600', bgColor: 'bg-green-100' };
    return { status: 'excessivo', color: 'text-orange-600', bgColor: 'bg-orange-100' };
  };

  const nutritionData = [
    {
      label: 'Calorias',
      current: Math.round(currentNutrition?.calories),
      target: goals?.calories,
      unit: 'kcal',
      icon: '🔥'
    },
    {
      label: 'Proteínas',
      current: Math.round(currentNutrition?.protein),
      target: goals?.protein,
      unit: 'g',
      icon: '🥩'
    },
    {
      label: 'Carboidratos',
      current: Math.round(currentNutrition?.carbs),
      target: goals?.carbs,
      unit: 'g',
      icon: '🌾'
    },
    {
      label: 'Gorduras',
      current: Math.round(currentNutrition?.fat),
      target: goals?.fat,
      unit: 'g',
      icon: '🥑'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Calculator className="w-5 h-5 text-blue-600" />
        Calculadora Nutricional
      </h3>
      <div className="space-y-4">
        {nutritionData?.map((item, index) => {
          const progress = calculateProgress(item?.current, item?.target);
          const status = getProgressStatus(progress);
          const remaining = item?.target - item?.current;

          return (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{item?.icon}</span>
                  <span className="font-medium text-gray-900">{item?.label}</span>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${status?.color} ${status?.bgColor}`}>
                  {progress}%
                </div>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">
                  {item?.current}/{item?.target} {item?.unit}
                </span>
                <span className={`text-sm font-medium flex items-center gap-1 ${
                  remaining > 0 ? 'text-blue-600' : 'text-red-600'
                }`}>
                  {remaining > 0 ? (
                    <>
                      <TrendingUp className="w-3 h-3" />
                      Faltam {remaining} {item?.unit}
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-3 h-3" />
                      Excesso de {Math.abs(remaining)} {item?.unit}
                    </>
                  )}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    progress < 80 ? 'bg-red-500' :
                    progress < 100 ? 'bg-yellow-500' :
                    progress <= 120 ? 'bg-green-500' : 'bg-orange-500'
                  }`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {/* Macronutrient Distribution */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Distribuição de Macros (%)
        </h4>
        
        <div className="space-y-2">
          {[
            { label: 'Proteínas', current: currentNutrition?.protein * 4, color: 'bg-red-500' },
            { label: 'Carboidratos', current: currentNutrition?.carbs * 4, color: 'bg-blue-500' },
            { label: 'Gorduras', current: currentNutrition?.fat * 9, color: 'bg-yellow-500' }
          ]?.map((macro, index) => {
            const percentage = currentNutrition?.calories > 0 
              ? Math.round((macro?.current / currentNutrition?.calories) * 100) 
              : 0;
              
            return (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{macro?.label}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${macro?.color}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8">
                    {percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Daily Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="bg-blue-50 rounded-lg p-3">
          <h4 className="font-medium text-blue-900 mb-2">Resumo do Dia</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-700">Calorias totais:</span>
              <span className="font-medium text-blue-900">
                {Math.round(currentNutrition?.calories)} kcal
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Meta diária:</span>
              <span className="font-medium text-blue-900">
                {goals?.calories} kcal
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionalCalculator;