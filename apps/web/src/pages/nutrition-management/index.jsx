import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Filter, Loader2, PlusCircle, Search } from 'lucide-react';

import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import {
  getNutritionAnalytics,
  getNutritionOverview,
  listNutritionPlans,
} from '../../services/nutritionService';
import ActivePlansTable from './components/ActivePlansTable';
import FoodSearchPanel from './components/FoodSearchPanel';
import NotificationAlert from './components/NotificationAlert';
import NutritionAnalytics from './components/NutritionAnalytics';
import NutritionStatsCards from './components/NutritionStatsCards';
import QuickActionCards from './components/QuickActionCards';

const statusFilters = [
  { value: 'all', label: 'Todos os status' },
  { value: 'active', label: 'Ativos' },
  { value: 'excellent', label: 'Excelentes' },
  { value: 'needs_attention', label: 'Precisam atenção' },
];

const NutritionManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showNotifications, setShowNotifications] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const overviewQuery = useQuery({
    queryKey: ['nutrition', 'overview'],
    queryFn: () => getNutritionOverview(),
  });

  const plansQuery = useQuery({
    queryKey: ['nutrition', 'plans'],
    queryFn: () => listNutritionPlans(),
  });

  const analyticsQuery = useQuery({
    queryKey: ['nutrition', 'analytics'],
    queryFn: () => getNutritionAnalytics(),
  });

  const plans = plansQuery.data ?? [];

  const filteredPlans = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return plans.filter((plan) => {
      const matchesSearch =
        !normalizedSearch ||
        plan.clientName?.toLowerCase().includes(normalizedSearch) ||
        plan.title?.toLowerCase().includes(normalizedSearch);

      if (filterType === 'all') {
        return matchesSearch;
      }

      return matchesSearch && plan.status === filterType;
    });
  }, [plans, filterType, searchTerm]);

  const isLoading = overviewQuery.isLoading || plansQuery.isLoading || analyticsQuery.isLoading;
  const hasError = overviewQuery.isError || plansQuery.isError || analyticsQuery.isError;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex">
        <Sidebar onClose={() => setIsSidebarOpen(false)} />

        <main className="flex-1 p-6">
          {hasError && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              Ocorreu um erro ao carregar os dados de nutrição. Tente novamente mais tarde.
            </div>
          )}

          <div className="mb-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h1 className="mb-2 text-3xl font-bold text-gray-900">Gestão de Nutrição</h1>
                <p className="text-gray-600">
                  Gerencie planos alimentares e monitore o progresso nutricional dos seus clientes
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Exportar Relatório
                </Button>
                <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                  <PlusCircle className="h-4 w-4" />
                  Criar Plano Alimentar
                </Button>
              </div>
            </div>

            {showNotifications && <NotificationAlert onClose={() => setShowNotifications(false)} />}
          </div>

          <div className="mb-8">
            <QuickActionCards />
          </div>

          <div className="mb-8">
            {isLoading ? (
              <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white p-10 text-sm text-gray-500">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando métricas nutricionais...
              </div>
            ) : (
              <NutritionStatsCards stats={overviewQuery.data?.stats} />
            )}
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Planos Ativos</h2>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Filtros
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="relative w-full md:max-w-sm">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        placeholder="Buscar por cliente ou título do plano"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-10 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <select
                      value={filterType}
                      onChange={(event) => setFilterType(event.target.value)}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {statusFilters.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="p-6">
                  {plansQuery.isLoading ? (
                    <div className="flex items-center justify-center py-12 text-sm text-gray-500">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Carregando planos alimentares...
                    </div>
                  ) : (
                    <ActivePlansTable plans={filteredPlans} />
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <NutritionAnalytics data={analyticsQuery.data} isLoading={analyticsQuery.isLoading} />
              <FoodSearchPanel />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NutritionManagement;
