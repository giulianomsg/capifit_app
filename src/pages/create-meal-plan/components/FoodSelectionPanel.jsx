import React, { useState } from 'react';
import { Search, Plus, AlertTriangle } from 'lucide-react';
import Button from '../../../components/ui/Button';

const FoodSelectionPanel = ({ onAddFood, restrictions = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(100);

  // Extended TACO database foods with restriction flags
  const tacoFoods = [
    {
      id: 1,
      name: 'Peito de Frango (sem pele, grelhado)',
      category: 'Carnes',
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      fiber: 0,
      sodium: 74,
      restrictions: [],
      allergens: []
    },
    {
      id: 2,
      name: 'Arroz Integral (cozido)',
      category: 'Cereais',
      calories: 124,
      protein: 2.6,
      carbs: 25,
      fat: 1,
      fiber: 2.7,
      sodium: 1,
      restrictions: [],
      allergens: ['glúten']
    },
    {
      id: 3,
      name: 'Leite Integral',
      category: 'Laticínios',
      calories: 61,
      protein: 3.2,
      carbs: 4.3,
      fat: 3.5,
      fiber: 0,
      sodium: 43,
      restrictions: ['lactose'],
      allergens: ['lactose']
    },
    {
      id: 4,
      name: 'Batata Doce (cozida)',
      category: 'Tubérculos',
      calories: 77,
      protein: 1.4,
      carbs: 18,
      fat: 0.1,
      fiber: 2.2,
      sodium: 6,
      restrictions: [],
      allergens: []
    },
    {
      id: 5,
      name: 'Salmão (grelhado)',
      category: 'Peixes',
      calories: 208,
      protein: 22,
      carbs: 0,
      fat: 12,
      fiber: 0,
      sodium: 59,
      restrictions: [],
      allergens: []
    },
    {
      id: 6,
      name: 'Quinoa (cozida)',
      category: 'Cereais',
      calories: 120,
      protein: 4.4,
      carbs: 22,
      fat: 1.9,
      fiber: 2.8,
      sodium: 7,
      restrictions: [],
      allergens: []
    },
    {
      id: 7,
      name: 'Queijo Minas Frescal',
      category: 'Laticínios',
      calories: 264,
      protein: 17,
      carbs: 3.8,
      fat: 20,
      fiber: 0,
      sodium: 569,
      restrictions: ['lactose'],
      allergens: ['lactose']
    }
  ];

  const categories = [
    'all',
    'Carnes',
    'Peixes',
    'Cereais',
    'Tubérculos',
    'Vegetais',
    'Frutas',
    'Laticínios',
    'Leguminosas',
    'Ovos'
  ];

  const hasRestriction = (food) => {
    return restrictions?.some(restriction => 
      food?.restrictions?.includes(restriction?.toLowerCase()) ||
      food?.allergens?.includes(restriction?.toLowerCase())
    );
  };

  const filteredFoods = tacoFoods?.filter(food => {
    const matchesSearch = food?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || food?.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddFood = () => {
    if (selectedFood && quantity > 0) {
      onAddFood(selectedFood, quantity);
      setSelectedFood(null);
      setQuantity(100);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Search className="w-5 h-5 text-green-600" />
        Seleção de Alimentos
      </h3>
      {/* Search Controls */}
      <div className="space-y-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar no TACO..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e?.target?.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          {categories?.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'Todas as Categorias' : category}
            </option>
          ))}
        </select>
      </div>
      {/* Restrictions Alert */}
      {restrictions?.length > 0 && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">
              Restrições do Cliente
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {restrictions?.map((restriction, index) => (
              <span key={index} className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                {restriction}
              </span>
            ))}
          </div>
        </div>
      )}
      {/* Food List */}
      <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
        {filteredFoods?.map((food) => {
          const isRestricted = hasRestriction(food);
          
          return (
            <div
              key={food?.id}
              onClick={() => setSelectedFood(food)}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedFood?.id === food?.id
                  ? 'border-green-500 bg-green-50'
                  : isRestricted
                  ? 'border-red-200 bg-red-50' :'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className={`font-medium text-sm leading-tight ${
                  isRestricted ? 'text-red-700' : 'text-gray-900'
                }`}>
                  {food?.name}
                  {isRestricted && (
                    <span className="ml-2 text-xs text-red-600">⚠️</span>
                  )}
                </h4>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {food?.category}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Cal:</span>
                  <span className="font-medium">{food?.calories}</span>
                </div>
                <div className="flex justify-between">
                  <span>Prot:</span>
                  <span className="font-medium">{food?.protein}g</span>
                </div>
                <div className="flex justify-between">
                  <span>Carb:</span>
                  <span className="font-medium">{food?.carbs}g</span>
                </div>
                <div className="flex justify-between">
                  <span>Gord:</span>
                  <span className="font-medium">{food?.fat}g</span>
                </div>
              </div>
            </div>
          );
        })}

        {filteredFoods?.length === 0 && (
          <div className="text-center py-8">
            <Search className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">
              Nenhum alimento encontrado
            </p>
          </div>
        )}
      </div>
      {/* Selected Food Panel */}
      {selectedFood && (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="font-medium text-gray-900 mb-3">
            Adicionar: {selectedFood?.name}
          </h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Quantidade (gramas)
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e?.target?.value))}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <h5 className="text-sm font-medium text-gray-700 mb-2">
                Valores para {quantity}g:
              </h5>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Calorias:</span>
                  <span className="font-medium">
                    {Math.round((selectedFood?.calories * quantity) / 100)} kcal
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Proteína:</span>
                  <span className="font-medium">
                    {Math.round((selectedFood?.protein * quantity) / 100)}g
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Carboidrato:</span>
                  <span className="font-medium">
                    {Math.round((selectedFood?.carbs * quantity) / 100)}g
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Gordura:</span>
                  <span className="font-medium">
                    {Math.round((selectedFood?.fat * quantity) / 100)}g
                  </span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleAddFood}
              disabled={hasRestriction(selectedFood)}
              className={`w-full flex items-center gap-2 ${
                hasRestriction(selectedFood)
                  ? 'bg-red-600 hover:bg-red-700' :'bg-green-600 hover:bg-green-700'
              }`}
            >
              <Plus className="w-4 h-4" />
              {hasRestriction(selectedFood) 
                ? 'Alimento com Restrição' :'Adicionar à Refeição'
              }
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodSelectionPanel;