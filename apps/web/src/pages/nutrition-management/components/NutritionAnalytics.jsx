import React, { useMemo } from 'react';
import { Loader2, TrendingUp, Utensils } from 'lucide-react';

const weekdayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const NutritionAnalytics = ({ data, isLoading }) => {
  const analytics = data ?? {};

  const weeklyProgress = useMemo(() => {
    return (analytics.weeklyProgress ?? []).map((item) => ({
      label: typeof item.day === 'number' ? weekdayLabels[item.day] ?? `Dia ${item.day}` : item.day,
      adherence: item.adherence ?? 0,
    }));
  }, [analytics.weeklyProgress]);

  const mostUsedFoods = analytics.mostUsedFoods ?? [];
  const macroDistribution = analytics.macroDistribution ?? {};
  const averageAdherence = analytics.averageAdherence ?? 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white p-10 text-sm text-gray-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando análises nutricionais...
      </div>
    );
  }

  if (!mostUsedFoods.length && !weeklyProgress.length) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
        Nenhum dado nutricional disponível até o momento.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
        <TrendingUp className="h-5 w-5 text-green-600" />
        Análises Nutricionais
      </h3>

      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Aderência média dos clientes</span>
          <span className="text-2xl font-bold text-green-600">{averageAdherence}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-green-500"
            style={{ width: `${Math.min(100, Math.max(0, averageAdherence))}%` }}
          />
        </div>
      </div>

      <div className="mb-6">
        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
          <Utensils className="h-4 w-4" />
          Alimentos mais utilizados
        </h4>
        <div className="space-y-2">
          {mostUsedFoods.map((food) => (
            <div key={food.id ?? food.name} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{food.name}</span>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-16 rounded-full bg-gray-200">
                  <div
                    className="h-1.5 rounded-full bg-green-500"
                    style={{ width: `${Math.min(100, (food.usage / Math.max(1, mostUsedFoods[0]?.usage ?? 1)) * 100)}%` }}
                  />
                </div>
                <span className="w-8 text-xs text-gray-500">{food.usage}</span>
              </div>
            </div>
          ))}
          {!mostUsedFoods.length && <p className="text-xs text-gray-500">Sem registros de alimentos vinculados aos planos.</p>}
        </div>
      </div>

      <div className="mb-6 space-y-3">
        <h4 className="text-sm font-semibold text-gray-900">Distribuição de macronutrientes</h4>
        {[{ key: 'proteins', label: 'Proteínas', color: 'bg-red-500' }, { key: 'carbs', label: 'Carboidratos', color: 'bg-blue-500' }, { key: 'fats', label: 'Gorduras', color: 'bg-yellow-500' }].map((macro) => (
          <div key={macro.key} className="flex items-center justify-between">
            <span className="text-sm text-gray-700">{macro.label}</span>
            <div className="flex items-center gap-2">
              <div className="h-2 w-20 rounded-full bg-gray-200">
                <div
                  className={`h-2 rounded-full ${macro.color}`}
                  style={{ width: `${Math.min(100, Math.max(0, macroDistribution[macro.key] ?? 0))}%` }}
                />
              </div>
              <span className="w-10 text-sm font-medium text-gray-900">{macroDistribution[macro.key] ?? 0}%</span>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h4 className="mb-3 text-sm font-semibold text-gray-900">Progresso semanal</h4>
        <div className="flex h-16 items-end gap-1">
          {weeklyProgress.map((day) => (
            <div key={day.label} className="flex flex-1 flex-col items-center">
              <div
                className="w-full rounded-t bg-green-500"
                style={{ height: `${(day.adherence / 100) * 50}px`, minHeight: '8px' }}
              />
              <span className="mt-1 text-xs text-gray-500">{day.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NutritionAnalytics;
