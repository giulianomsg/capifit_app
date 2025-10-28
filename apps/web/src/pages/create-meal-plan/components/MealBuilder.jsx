import React, { useState } from 'react';
import { Plus, Clock, Trash2, Edit, GripVertical } from 'lucide-react';
import Button from '../../../components/ui/Button';

const MealBuilder = ({ meal, foods, onRemoveFood, nutritionalGoals }) => {
  const [editingFood, setEditingFood] = useState(null);
  const [newQuantity, setNewQuantity] = useState('');

  const mealNames = {
    cafe_da_manha: 'Café da Manhã',
    lanche_manha: 'Lanche da Manhã',
    almoco: 'Almoço',
    lanche_tarde: 'Lanche da Tarde',
    jantar: 'Jantar',
    ceia: 'Ceia'
  };

  const mealIcons = {
    cafe_da_manha: '🌅',
    lanche_manha: '☕',
    almoco: '🍽️',
    lanche_tarde: '🥤',
    jantar: '🌙',
    ceia: '🌛'
  };

  const mealTimes = {
    cafe_da_manha: '07:00',
    lanche_manha: '10:00',
    almoco: '12:30',
    lanche_tarde: '15:30',
    jantar: '19:00',
    ceia: '21:30'
  };

  const calculateMealNutrition = () => {
    return foods?.reduce(
      (totals, food) => ({
        calories: totals?.calories + (food?.totalCalories || 0),
        protein: totals?.protein + (food?.totalProtein || 0),
        carbs: totals?.carbs + (food?.totalCarbs || 0),
        fat: totals?.fat + (food?.totalFat || 0)
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    ) || { calories: 0, protein: 0, carbs: 0, fat: 0 };
  };

  const getMealTarget = () => {
    const distribution = nutritionalGoals?.mealDistribution?.[meal] || 0;
    return {
      calories: Math.round((nutritionalGoals?.calories * distribution) / 100),
      protein: Math.round((nutritionalGoals?.protein * distribution) / 100),
      carbs: Math.round((nutritionalGoals?.carbs * distribution) / 100),
      fat: Math.round((nutritionalGoals?.fat * distribution) / 100)
    };
  };

  const mealNutrition = calculateMealNutrition();
  const mealTarget = getMealTarget();

  const handleQuantityChange = (foodId, newQty) => {
    // This would need to be implemented in the parent component
    console.log('Update food quantity:', foodId, newQty);
    setEditingFood(null);
    setNewQuantity('');
  };

  const getProgressColor = (current, target) => {
    const percentage = target > 0 ? (current / target) * 100 : 0;
    if (percentage < 80) return 'bg-red-500';
    if (percentage < 100) return 'bg-yellow-500';
    if (percentage <= 120) return 'bg-green-500';
    return 'bg-orange-500';
  };

  return (
    <div className="p-6">
      {/* Meal Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{mealIcons?.[meal]}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {mealNames?.[meal]}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{mealTimes?.[meal]}</span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-600">Meta da Refeição</div>
          <div className="text-lg font-semibold text-gray-900">
            {mealTarget?.calories} kcal
          </div>
        </div>
      </div>
      {/* Nutrition Progress */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Calorias</span>
            <span className="font-medium">
              {Math.round(mealNutrition?.calories)}/{mealTarget?.calories}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getProgressColor(mealNutrition?.calories, mealTarget?.calories)}`}
              style={{
                width: `${Math.min((mealNutrition?.calories / mealTarget?.calories) * 100, 100)}%`
              }}
            />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Proteína</span>
            <span className="font-medium">
              {Math.round(mealNutrition?.protein)}g/{mealTarget?.protein}g
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getProgressColor(mealNutrition?.protein, mealTarget?.protein)}`}
              style={{
                width: `${Math.min((mealNutrition?.protein / mealTarget?.protein) * 100, 100)}%`
              }}
            />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Carboidratos</span>
            <span className="font-medium">
              {Math.round(mealNutrition?.carbs)}g/{mealTarget?.carbs}g
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getProgressColor(mealNutrition?.carbs, mealTarget?.carbs)}`}
              style={{
                width: `${Math.min((mealNutrition?.carbs / mealTarget?.carbs) * 100, 100)}%`
              }}
            />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Gorduras</span>
            <span className="font-medium">
              {Math.round(mealNutrition?.fat)}g/{mealTarget?.fat}g
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getProgressColor(mealNutrition?.fat, mealTarget?.fat)}`}
              style={{
                width: `${Math.min((mealNutrition?.fat / mealTarget?.fat) * 100, 100)}%`
              }}
            />
          </div>
        </div>
      </div>
      {/* Food List */}
      <div className="space-y-3">
        {foods?.length > 0 ? (
          foods?.map((food, index) => (
            <div
              key={`${food?.id}-${index}`}
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="cursor-move">
                <GripVertical className="w-4 h-4 text-gray-400" />
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{food?.name}</h4>
                  <div className="flex items-center gap-2">
                    {editingFood === food?.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={newQuantity}
                          onChange={(e) => setNewQuantity(e?.target?.value)}
                          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                          placeholder={food?.quantity?.toString()}
                        />
                        <span className="text-sm text-gray-500">g</span>
                        <Button
                          size="sm"
                          onClick={() => handleQuantityChange(food?.id, newQuantity)}
                          className="px-2 py-1"
                        >
                          OK
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingFood(food?.id);
                          setNewQuantity(food?.quantity?.toString() || '');
                        }}
                        className="flex items-center gap-1 px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
                      >
                        <Edit className="w-3 h-3" />
                        {food?.quantity}g
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Calorias:</span>
                    <span className="font-medium">{Math.round(food?.totalCalories || 0)} kcal</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Proteína:</span>
                    <span className="font-medium">{Math.round(food?.totalProtein || 0)}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Carboidrato:</span>
                    <span className="font-medium">{Math.round(food?.totalCarbs || 0)}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gordura:</span>
                    <span className="font-medium">{Math.round(food?.totalFat || 0)}g</span>
                  </div>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRemoveFood(food?.id, meal)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-4xl mb-3">{mealIcons?.[meal]}</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {mealNames?.[meal]} vazio
            </h4>
            <p className="text-gray-500 mb-4">
              Adicione alimentos para montar esta refeição
            </p>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Adicionar Primeiro Alimento
            </Button>
          </div>
        )}
      </div>
      {/* Meal Notes */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Observações da Refeição
        </label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          rows={3}
          placeholder="Adicione instruções especiais, horários alternativos ou observações sobre esta refeição..."
        />
      </div>
    </div>
  );
};

export default MealBuilder;