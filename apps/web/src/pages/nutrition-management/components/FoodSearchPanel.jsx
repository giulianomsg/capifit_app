import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Database, Info, Loader2, Search } from 'lucide-react';

import Button from '../../../components/ui/Button';
import { listFoods } from '../../../services/nutritionService';

const FoodSearchPanel = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const allFoodsQuery = useQuery({
    queryKey: ['nutrition', 'foods', 'catalog'],
    queryFn: () => listFoods(),
    staleTime: 5 * 60 * 1000,
  });

  const foodsQuery = useQuery({
    queryKey: ['nutrition', 'foods', searchTerm, selectedCategory],
    queryFn: () =>
      listFoods({
        search: searchTerm || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
      }),
    keepPreviousData: true,
  });

  const categories = useMemo(() => {
    const baseCategories = new Set((allFoodsQuery.data ?? []).map((food) => food.category));
    return ['all', ...Array.from(baseCategories).sort((a, b) => a.localeCompare(b))];
  }, [allFoodsQuery.data]);

  const foods = foodsQuery.data ?? [];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
        <Database className="h-5 w-5 text-blue-600" />
        Busca TACO
      </h3>

      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Buscar alimento..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-10 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(event) => setSelectedCategory(event.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category === 'all' ? 'Todas as categorias' : category}
            </option>
          ))}
        </select>
      </div>

      <div className="max-h-96 space-y-3 overflow-y-auto">
        {foodsQuery.isLoading ? (
          <div className="flex items-center justify-center py-6 text-sm text-gray-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Consultando base nutricional...
          </div>
        ) : (
          foods.map((food) => (
            <div key={food.id} className="cursor-pointer rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
              <div className="mb-2 flex items-start justify-between">
                <h4 className="text-sm font-medium text-gray-900">{food.name}</h4>
                <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-500">{food.category}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Calorias:</span>
                  <span className="font-medium">{food.calories} kcal</span>
                </div>
                <div className="flex justify-between">
                  <span>Proteína:</span>
                  <span className="font-medium">{food.protein ?? 0}g</span>
                </div>
                <div className="flex justify-between">
                  <span>Carboidrato:</span>
                  <span className="font-medium">{food.carbs ?? 0}g</span>
                </div>
                <div className="flex justify-between">
                  <span>Gordura:</span>
                  <span className="font-medium">{food.fat ?? 0}g</span>
                </div>
              </div>

              <div className="mt-2 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 text-xs">
                  Adicionar ao plano
                </Button>
                <Button variant="outline" size="sm" className="px-2">
                  <Info className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))
        )}

        {!foodsQuery.isLoading && foods.length === 0 && (
          <div className="py-8 text-center text-sm text-gray-500">
            <Database className="mx-auto mb-2 h-8 w-8 text-gray-400" />
            Nenhum alimento encontrado para os filtros selecionados.
          </div>
        )}
      </div>

      <div className="mt-4 rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
        <strong>Base TACO:</strong> Tabela Brasileira de Composição de Alimentos com valores nutricionais por 100g.
      </div>
    </div>
  );
};

export default FoodSearchPanel;
