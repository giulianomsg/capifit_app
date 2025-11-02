import React, { useState } from 'react';
import { ArrowLeft, Save, Copy, Calculator, ChefHat } from 'lucide-react';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import ClientInfoSidebar from './components/ClientInfoSidebar';
import MealBuilder from './components/MealBuilder';
import NutritionalCalculator from './components/NutritionalCalculator';
import FoodSelectionPanel from './components/FoodSelectionPanel';
import NutritionalGoalsConfig from './components/NutritionalGoalsConfig';
import PlanTemplates from './components/PlanTemplates';

const CreateMealPlan = () => {
  const [selectedClient, setSelectedClient] = useState(null);
  const [currentMeal, setCurrentMeal] = useState('cafe_da_manha');
  const [mealPlan, setMealPlan] = useState({
    cafe_da_manha: [],
    lanche_manha: [],
    almoco: [],
    lanche_tarde: [],
    jantar: [],
    ceia: []
  });
  const [nutritionalGoals, setNutritionalGoals] = useState({
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 67,
    mealDistribution: {
      cafe_da_manha: 25,
      lanche_manha: 10,
      almoco: 35,
      lanche_tarde: 10,
      jantar: 15,
      ceia: 5
    }
  });

  // Mock client data
  const client = {
    id: 1,
    name: 'Maria Silva',
    email: 'maria.silva@email.com',
    age: 32,
    weight: 65,
    height: 165,
    activity: 'Moderada',
    goal: 'Perda de Peso',
    restrictions: ['Intolerância à Lactose'],
    preferences: ['Não gosta de peixe', 'Prefere alimentos integrais']
  };

  const meals = [
    { id: 'cafe_da_manha', name: 'Café da Manhã', icon: '🌅', time: '07:00' },
    { id: 'lanche_manha', name: 'Lanche da Manhã', icon: '☕', time: '10:00' },
    { id: 'almoco', name: 'Almoço', icon: '🍽️', time: '12:30' },
    { id: 'lanche_tarde', name: 'Lanche da Tarde', icon: '🥤', time: '15:30' },
    { id: 'jantar', name: 'Jantar', icon: '🌙', time: '19:00' },
    { id: 'ceia', name: 'Ceia', icon: '🌛', time: '21:30' }
  ];

  const addFoodToMeal = (food, quantity, meal) => {
    const newFood = {
      ...food,
      quantity: quantity,
      totalCalories: (food?.calories * quantity) / 100,
      totalProtein: (food?.protein * quantity) / 100,
      totalCarbs: (food?.carbs * quantity) / 100,
      totalFat: (food?.fat * quantity) / 100
    };

    setMealPlan(prev => ({
      ...prev,
      [meal]: [...prev?.[meal], newFood]
    }));
  };

  const removeFoodFromMeal = (foodId, meal) => {
    setMealPlan(prev => ({
      ...prev,
      [meal]: prev?.[meal]?.filter(food => food?.id !== foodId)
    }));
  };

  const calculateTotalNutrition = () => {
    let totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };

    Object.values(mealPlan)?.forEach(meal => {
      meal?.forEach(food => {
        totals.calories += food?.totalCalories || 0;
        totals.protein += food?.totalProtein || 0;
        totals.carbs += food?.totalCarbs || 0;
        totals.fat += food?.totalFat || 0;
      });
    });

    return totals;
  };

  const savePlan = () => {
    console.log('Saving meal plan...', { mealPlan, nutritionalGoals, client });
    // Implement save functionality
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuToggle={() => {}} />
      <div className="flex">
        <Sidebar onClose={() => {}} />
        
        <main className="flex-1">
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => window.history?.back()}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Criar Plano Alimentar
                  </h1>
                  <p className="text-gray-600">
                    Monte um plano nutricional personalizado para seu cliente
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button variant="outline" className="flex items-center gap-2">
                  <Copy className="w-4 h-4" />
                  Salvar como Template
                </Button>
                <Button onClick={savePlan} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                  <Save className="w-4 h-4" />
                  Salvar Plano
                </Button>
              </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
              {/* Client Info Sidebar */}
              <div className="lg:col-span-1">
                <ClientInfoSidebar client={client} />
                
                {/* Nutritional Goals */}
                <div className="mt-6">
                  <NutritionalGoalsConfig
                    goals={nutritionalGoals}
                    onGoalsChange={setNutritionalGoals}
                  />
                </div>

                {/* Plan Templates */}
                <div className="mt-6">
                  <PlanTemplates
                    onTemplateSelect={(template) => {
                      setMealPlan(template?.meals);
                      setNutritionalGoals(template?.goals);
                    }}
                  />
                </div>
              </div>

              {/* Main Meal Builder */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <ChefHat className="w-5 h-5 text-green-600" />
                      Construtor de Refeições
                    </h2>

                    {/* Meal Tabs */}
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                      {meals?.map(meal => (
                        <button
                          key={meal?.id}
                          onClick={() => setCurrentMeal(meal?.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                            currentMeal === meal?.id
                              ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <span className="text-lg">{meal?.icon}</span>
                          <div className="text-left">
                            <div>{meal?.name}</div>
                            <div className="text-xs text-gray-500">{meal?.time}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Meal Builder Component */}
                  <MealBuilder
                    meal={currentMeal}
                    foods={mealPlan?.[currentMeal]}
                    onRemoveFood={removeFoodFromMeal}
                    nutritionalGoals={nutritionalGoals}
                  />
                </div>
              </div>

              {/* Right Panel */}
              <div className="lg:col-span-1 space-y-6">
                {/* Nutritional Calculator */}
                <NutritionalCalculator
                  currentNutrition={calculateTotalNutrition()}
                  goals={nutritionalGoals}
                />

                {/* Food Selection Panel */}
                <FoodSelectionPanel
                  onAddFood={(food, quantity) => addFoodToMeal(food, quantity, currentMeal)}
                  restrictions={client?.restrictions}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateMealPlan;