import React, { useState } from 'react';
import { Copy, Star, Clock, Users } from 'lucide-react';
import Button from '../../../components/ui/Button';

const PlanTemplates = ({ onTemplateSelect }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const templates = [
    {
      id: 1,
      name: 'Perda de Peso Feminino',
      description: 'Plano de 1800 kcal focado em déficit calórico',
      category: 'Emagrecimento',
      difficulty: 'Fácil',
      prepTime: '45 min/dia',
      rating: 4.8,
      usedBy: 23,
      meals: {
        cafe_da_manha: [
          { id: 101, name: 'Aveia com frutas', quantity: 80, calories: 124, protein: 4, carbs: 23, fat: 2 }
        ],
        almoco: [
          { id: 102, name: 'Peito de frango grelhado', quantity: 120, calories: 198, protein: 37, carbs: 0, fat: 4.3 },
          { id: 103, name: 'Arroz integral', quantity: 100, calories: 124, protein: 2.6, carbs: 25, fat: 1 }
        ],
        jantar: [
          { id: 104, name: 'Salmão grelhado', quantity: 100, calories: 208, protein: 22, carbs: 0, fat: 12 }
        ],
        lanche_manha: [],
        lanche_tarde: [],
        ceia: []
      },
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
      id: 2,
      name: 'Ganho de Massa Masculino',
      description: 'Plano de 2800 kcal para hipertrofia',
      category: 'Ganho de Peso',
      difficulty: 'Moderada',
      prepTime: '60 min/dia',
      rating: 4.6,
      usedBy: 18,
      meals: {
        cafe_da_manha: [
          { id: 201, name: 'Ovos mexidos', quantity: 150, calories: 233, protein: 20, carbs: 1.7, fat: 16.5 },
          { id: 202, name: 'Pão integral', quantity: 50, calories: 120, protein: 4, carbs: 22, fat: 2 }
        ],
        almoco: [
          { id: 203, name: 'Carne bovina magra', quantity: 150, calories: 250, protein: 26, carbs: 0, fat: 15 },
          { id: 204, name: 'Batata doce', quantity: 200, calories: 154, protein: 2.8, carbs: 36, fat: 0.2 }
        ],
        jantar: [
          { id: 205, name: 'Peito de frango', quantity: 150, calories: 248, protein: 46.5, carbs: 0, fat: 5.4 }
        ],
        lanche_manha: [],
        lanche_tarde: [],
        ceia: []
      },
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
      id: 3,
      name: 'Dieta Vegetariana',
      description: 'Plano completo sem proteína animal',
      category: 'Vegetariana',
      difficulty: 'Moderada',
      prepTime: '50 min/dia',
      rating: 4.7,
      usedBy: 15,
      meals: {
        cafe_da_manha: [
          { id: 301, name: 'Quinoa com frutas', quantity: 80, calories: 96, protein: 3.5, carbs: 17.6, fat: 1.5 }
        ],
        almoco: [
          { id: 302, name: 'Feijão preto', quantity: 150, calories: 136, protein: 8.9, carbs: 24, fat: 0.5 },
          { id: 303, name: 'Arroz integral', quantity: 100, calories: 124, protein: 2.6, carbs: 25, fat: 1 }
        ],
        jantar: [
          { id: 304, name: 'Tofu grelhado', quantity: 100, calories: 76, protein: 8, carbs: 1.9, fat: 4.8 }
        ],
        lanche_manha: [],
        lanche_tarde: [],
        ceia: []
      },
      goals: {
        calories: 2000,
        protein: 120,
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
      }
    },
    {
      id: 4,
      name: 'Low Carb Iniciante',
      description: 'Redução gradual de carboidratos',
      category: 'Low Carb',
      difficulty: 'Fácil',
      prepTime: '35 min/dia',
      rating: 4.5,
      usedBy: 31,
      meals: {
        cafe_da_manha: [
          { id: 401, name: 'Ovos com abacate', quantity: 120, calories: 180, protein: 12, carbs: 4, fat: 14 }
        ],
        almoco: [
          { id: 402, name: 'Salmão', quantity: 120, calories: 250, protein: 26.4, carbs: 0, fat: 14.4 },
          { id: 403, name: 'Salada verde', quantity: 150, calories: 30, protein: 2, carbs: 6, fat: 0.3 }
        ],
        jantar: [
          { id: 404, name: 'Peito de frango', quantity: 100, calories: 165, protein: 31, carbs: 0, fat: 3.6 }
        ],
        lanche_manha: [],
        lanche_tarde: [],
        ceia: []
      },
      goals: {
        calories: 1600,
        protein: 140,
        carbs: 80,
        fat: 100,
        mealDistribution: {
          cafe_da_manha: 25,
          lanche_manha: 10,
          almoco: 40,
          lanche_tarde: 10,
          jantar: 15,
          ceia: 0
        }
      }
    }
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Fácil':
        return 'text-green-600 bg-green-100';
      case 'Moderada':
        return 'text-yellow-600 bg-yellow-100';
      case 'Difícil':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Emagrecimento':
        return 'text-red-600 bg-red-50';
      case 'Ganho de Peso':
        return 'text-blue-600 bg-blue-50';
      case 'Vegetariana':
        return 'text-green-600 bg-green-50';
      case 'Low Carb':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Copy className="w-5 h-5 text-orange-600" />
        Templates de Planos
      </h3>
      <div className="space-y-4">
        {templates?.map((template) => (
          <div
            key={template?.id}
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              selectedTemplate?.id === template?.id
                ? 'border-orange-300 bg-orange-50' :'border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => setSelectedTemplate(template)}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold text-gray-900">{template?.name}</h4>
                <p className="text-sm text-gray-600">{template?.description}</p>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-gray-600">{template?.rating}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(template?.category)}`}>
                {template?.category}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(template?.difficulty)}`}>
                {template?.difficulty}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{template?.prepTime}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{template?.usedBy} usuários</span>
                </div>
              </div>
              <div className="font-medium text-gray-900">
                {template?.goals?.calories} kcal
              </div>
            </div>

            {selectedTemplate?.id === template?.id && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{template?.goals?.protein}g</div>
                    <div className="text-gray-500">Proteína</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{template?.goals?.carbs}g</div>
                    <div className="text-gray-500">Carboidrato</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{template?.goals?.fat}g</div>
                    <div className="text-gray-500">Gordura</div>
                  </div>
                </div>

                <Button
                  onClick={(e) => {
                    e?.stopPropagation();
                    onTemplateSelect(template);
                  }}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  Aplicar Template
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">💡 Dica dos Templates</h4>
        <p className="text-sm text-blue-700">
          Use templates como ponto de partida e personalize conforme as necessidades específicas do seu cliente. 
          Todos os valores podem ser ajustados após aplicar o template.
        </p>
      </div>
    </div>
  );
};

export default PlanTemplates;