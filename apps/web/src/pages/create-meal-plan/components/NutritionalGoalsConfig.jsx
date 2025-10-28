import React, { useState } from 'react';
import { Target, Settings } from 'lucide-react';
import Button from '../../../components/ui/Button';

const NutritionalGoalsConfig = ({ goals, onGoalsChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempGoals, setTempGoals] = useState(goals);

  const goalTemplates = [
    {
      name: 'Perda de Peso',
      description: 'Déficit calórico moderado',
      goals: {
        calories: 1800,
        protein: 135,
        carbs: 180,
        fat: 60,
        mealDistribution: {
          cafe_da_manha: 25,
          lanche_manha: 10,
          almoco: 35,
          lanche_tarde: 10,
          jantar: 15,
          ceia: 5
        }
      }
    },
    {
      name: 'Ganho de Massa',
      description: 'Superávit calórico',
      goals: {
        calories: 2800,
        protein: 200,
        carbs: 350,
        fat: 93,
        mealDistribution: {
          cafe_da_manha: 20,
          lanche_manha: 15,
          almoco: 30,
          lanche_tarde: 15,
          jantar: 15,
          ceia: 5
        }
      }
    },
    {
      name: 'Manutenção',
      description: 'Manter peso atual',
      goals: {
        calories: 2200,
        protein: 165,
        carbs: 275,
        fat: 73,
        mealDistribution: {
          cafe_da_manha: 25,
          lanche_manha: 10,
          almoco: 35,
          lanche_tarde: 10,
          jantar: 15,
          ceia: 5
        }
      }
    }
  ];

  const handleSaveGoals = () => {
    onGoalsChange(tempGoals);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setTempGoals(goals);
    setIsEditing(false);
  };

  const applyTemplate = (template) => {
    setTempGoals(template?.goals);
    onGoalsChange(template?.goals);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Target className="w-5 h-5 text-green-600" />
          Metas Nutricionais
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          {isEditing ? 'Cancelar' : 'Editar'}
        </Button>
      </div>
      {/* Goal Templates */}
      {!isEditing && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Templates Rápidos</h4>
          <div className="space-y-2">
            {goalTemplates?.map((template, index) => (
              <button
                key={index}
                onClick={() => applyTemplate(template)}
                className="w-full text-left p-3 bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-300 rounded-lg transition-colors"
              >
                <div className="font-medium text-gray-900">{template?.name}</div>
                <div className="text-sm text-gray-600">{template?.description}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {template?.goals?.calories} kcal • {template?.goals?.protein}g proteína
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Goals Display/Edit */}
      <div className="space-y-4">
        {/* Macronutrient Goals */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Macronutrientes Diários
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Calorias (kcal)</label>
              {isEditing ? (
                <input
                  type="number"
                  value={tempGoals?.calories}
                  onChange={(e) => setTempGoals({...tempGoals, calories: Number(e?.target?.value)})}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm font-medium">
                  {goals?.calories}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 mb-1">Proteínas (g)</label>
              {isEditing ? (
                <input
                  type="number"
                  value={tempGoals?.protein}
                  onChange={(e) => setTempGoals({...tempGoals, protein: Number(e?.target?.value)})}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm font-medium">
                  {goals?.protein}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 mb-1">Carboidratos (g)</label>
              {isEditing ? (
                <input
                  type="number"
                  value={tempGoals?.carbs}
                  onChange={(e) => setTempGoals({...tempGoals, carbs: Number(e?.target?.value)})}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm font-medium">
                  {goals?.carbs}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 mb-1">Gorduras (g)</label>
              {isEditing ? (
                <input
                  type="number"
                  value={tempGoals?.fat}
                  onChange={(e) => setTempGoals({...tempGoals, fat: Number(e?.target?.value)})}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm font-medium">
                  {goals?.fat}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Meal Distribution */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Distribuição por Refeição (%)
          </h4>
          <div className="space-y-2">
            {[
              { id: 'cafe_da_manha', name: 'Café da Manhã' },
              { id: 'lanche_manha', name: 'Lanche da Manhã' },
              { id: 'almoco', name: 'Almoço' },
              { id: 'lanche_tarde', name: 'Lanche da Tarde' },
              { id: 'jantar', name: 'Jantar' },
              { id: 'ceia', name: 'Ceia' }
            ]?.map((meal) => (
              <div key={meal?.id} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{meal?.name}</span>
                {isEditing ? (
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={tempGoals?.mealDistribution?.[meal?.id] || 0}
                    onChange={(e) => setTempGoals({
                      ...tempGoals,
                      mealDistribution: {
                        ...tempGoals?.mealDistribution,
                        [meal?.id]: Number(e?.target?.value)
                      }
                    })}
                    className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <span className="text-sm font-medium">
                    {goals?.mealDistribution?.[meal?.id] || 0}%
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex gap-2 pt-4 border-t border-gray-200">
            <Button
              onClick={handleSaveGoals}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Salvar Metas
            </Button>
            <Button
              onClick={handleCancelEdit}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        )}
      </div>
      {/* Macro Percentages Display */}
      {!isEditing && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Distribuição de Macros
          </h4>
          <div className="space-y-2">
            {[
              { label: 'Proteínas', grams: goals?.protein, calories: goals?.protein * 4, color: 'bg-red-500' },
              { label: 'Carboidratos', grams: goals?.carbs, calories: goals?.carbs * 4, color: 'bg-blue-500' },
              { label: 'Gorduras', grams: goals?.fat, calories: goals?.fat * 9, color: 'bg-yellow-500' }
            ]?.map((macro, index) => {
              const percentage = Math.round((macro?.calories / goals?.calories) * 100);
              
              return (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{macro?.label}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-12 bg-gray-200 rounded-full h-2">
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
      )}
    </div>
  );
};

export default NutritionalGoalsConfig;