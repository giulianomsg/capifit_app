import React from 'react';
import { TrendingUp, Utensils } from 'lucide-react';

const NutritionAnalytics = ({ data }) => {
  const { averageAdherence, mostUsedFoods, macroDistribution, weeklyProgress } = data || {};

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-green-600" />
        Análises Nutricionais
      </h3>
      {/* Average Adherence */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Aderência Média dos Clientes</span>
          <span className="text-2xl font-bold text-green-600">{averageAdherence}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full"
            style={{ width: `${averageAdherence}%` }}
          />
        </div>
      </div>
      {/* Most Used Foods */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Utensils className="w-4 h-4" />
          Alimentos Mais Utilizados
        </h4>
        <div className="space-y-2">
          {mostUsedFoods?.map((food, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm text-gray-700">{food?.name}</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-green-500 h-1.5 rounded-full"
                    style={{ width: `${(food?.usage / 50) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-8">{food?.usage}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Macro Distribution */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          Distribuição de Macronutrientes
        </h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">Proteínas</span>
            <div className="flex items-center gap-2">
              <div className="w-20 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{ width: `${(macroDistribution?.proteins / 50) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900 w-8">
                {macroDistribution?.proteins}%
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">Carboidratos</span>
            <div className="flex items-center gap-2">
              <div className="w-20 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${(macroDistribution?.carbs / 50) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900 w-8">
                {macroDistribution?.carbs}%
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">Gorduras</span>
            <div className="flex items-center gap-2">
              <div className="w-20 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: `${(macroDistribution?.fats / 50) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900 w-8">
                {macroDistribution?.fats}%
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Weekly Progress */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          Progresso Semanal
        </h4>
        <div className="flex justify-between items-end h-16 gap-1">
          {weeklyProgress?.map((day, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div
                className="w-full bg-green-500 rounded-t"
                style={{
                  height: `${(day?.adherence / 100) * 50}px`,
                  minHeight: '8px'
                }}
              />
              <span className="text-xs text-gray-500 mt-1">{day?.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NutritionAnalytics;