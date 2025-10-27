import React, { useState } from 'react';
import { Search, Database, Info } from 'lucide-react';
import Button from '../../../components/ui/Button';

const FoodSearchPanel = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock TACO database foods
  const tacoFoods = [
    {
      id: 1,
      name: 'Peito de Frango (sem pele, grelhado)',
      category: 'Carnes',
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      fiber: 0
    },
    {
      id: 2,
      name: 'Arroz Integral (cozido)',
      category: 'Cereais',
      calories: 124,
      protein: 2.6,
      carbs: 25,
      fat: 1,
      fiber: 2.7
    },
    {
      id: 3,
      name: 'Batata Doce (cozida)',
      category: 'Tubérculos',
      calories: 77,
      protein: 1.4,
      carbs: 18,
      fat: 0.1,
      fiber: 2.2
    },
    {
      id: 4,
      name: 'Brócolis (cozido)',
      category: 'Vegetais',
      calories: 25,
      protein: 3,
      carbs: 4,
      fat: 0.4,
      fiber: 3
    },
    {
      id: 5,
      name: 'Ovo de Galinha (cozido)',
      category: 'Ovos',
      calories: 155,
      protein: 13,
      carbs: 1.1,
      fat: 11,
      fiber: 0
    }
  ];

  const categories = [
    'all',
    'Carnes',
    'Cereais',
    'Tubérculos',
    'Vegetais',
    'Ovos',
    'Laticínios',
    'Frutas',
    'Leguminosas'
  ];

  const filteredFoods = tacoFoods?.filter(food => {
    const matchesSearch = food?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || food?.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Database className="w-5 h-5 text-blue-600" />
        Busca TACO
      </h3>
      {/* Search Controls */}
      <div className="space-y-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar alimento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e?.target?.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {categories?.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'Todas as Categorias' : category}
            </option>
          ))}
        </select>
      </div>
      {/* Food Results */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredFoods?.map((food) => (
          <div
            key={food?.id}
            className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-gray-900 text-sm leading-tight">
                {food?.name}
              </h4>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {food?.category}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Calorias:</span>
                <span className="font-medium">{food?.calories} kcal</span>
              </div>
              <div className="flex justify-between">
                <span>Proteína:</span>
                <span className="font-medium">{food?.protein}g</span>
              </div>
              <div className="flex justify-between">
                <span>Carboidrato:</span>
                <span className="font-medium">{food?.carbs}g</span>
              </div>
              <div className="flex justify-between">
                <span>Gordura:</span>
                <span className="font-medium">{food?.fat}g</span>
              </div>
            </div>

            <div className="flex gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
              >
                Adicionar ao Plano
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="px-2"
              >
                <Info className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}

        {filteredFoods?.length === 0 && (
          <div className="text-center py-8">
            <Database className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">
              Nenhum alimento encontrado
            </p>
          </div>
        )}
      </div>
      {/* TACO Info */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-700">
          <strong>Base TACO:</strong> Tabela Brasileira de Composição de Alimentos com valores nutricionais por 100g.
        </p>
      </div>
    </div>
  );
};

export default FoodSearchPanel;