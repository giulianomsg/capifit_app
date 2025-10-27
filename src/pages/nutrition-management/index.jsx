import React, { useState } from 'react';
import { PlusCircle, Search, Filter, Download } from 'lucide-react';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import NutritionStatsCards from './components/NutritionStatsCards';
import ActivePlansTable from './components/ActivePlansTable';
import NutritionAnalytics from './components/NutritionAnalytics';
import QuickActionCards from './components/QuickActionCards';
import FoodSearchPanel from './components/FoodSearchPanel';
import NotificationAlert from './components/NotificationAlert';

const NutritionManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showNotifications, setShowNotifications] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Mock data for active nutrition plans
  const activePlans = [
    {
      id: 1,
      clientName: 'Maria Silva',
      planType: 'Perda de Peso',
      caloriesTarget: 1800,
      startDate: '2024-10-01',
      compliance: 85,
      status: 'active',
      lastUpdate: '2024-10-26'
    },
    {
      id: 2,
      clientName: 'João Santos',
      planType: 'Ganho de Massa',
      caloriesTarget: 2500,
      startDate: '2024-10-15',
      compliance: 92,
      status: 'active',
      lastUpdate: '2024-10-27'
    },
    {
      id: 3,
      clientName: 'Ana Costa',
      planType: 'Manutenção',
      caloriesTarget: 2000,
      startDate: '2024-09-20',
      compliance: 78,
      status: 'needs_attention',
      lastUpdate: '2024-10-25'
    },
    {
      id: 4,
      clientName: 'Pedro Oliveira',
      planType: 'Cutting',
      caloriesTarget: 1600,
      startDate: '2024-10-10',
      compliance: 95,
      status: 'excellent',
      lastUpdate: '2024-10-27'
    }
  ];

  // Mock analytics data
  const analyticsData = {
    averageAdherence: 87.5,
    mostUsedFoods: [
      { name: 'Peito de Frango', usage: 45 },
      { name: 'Arroz Integral', usage: 38 },
      { name: 'Batata Doce', usage: 32 },
      { name: 'Ovos', usage: 29 },
      { name: 'Brócolis', usage: 25 }
    ],
    macroDistribution: {
      proteins: 30,
      carbs: 45,
      fats: 25
    },
    weeklyProgress: [
      { day: 'Seg', adherence: 85 },
      { day: 'Ter', adherence: 90 },
      { day: 'Qua', adherence: 88 },
      { day: 'Qui', adherence: 92 },
      { day: 'Sex', adherence: 87 },
      { day: 'Sáb', adherence: 80 },
      { day: 'Dom', adherence: 85 }
    ]
  };

  const filteredPlans = activePlans?.filter(plan => {
    const matchesSearch = plan?.clientName?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         plan?.planType?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'active') return matchesSearch && plan?.status === 'active';
    if (filterType === 'needs_attention') return matchesSearch && plan?.status === 'needs_attention';
    if (filterType === 'excellent') return matchesSearch && plan?.status === 'excellent';
    
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex">
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
        
        <main className="flex-1 p-6">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Gestão de Nutrição
                </h1>
                <p className="text-gray-600">
                  Gerencie planos alimentares e monitore o progresso nutricional dos seus clientes
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Exportar Relatório
                </Button>
                <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                  <PlusCircle className="w-4 h-4" />
                  Criar Plano Alimentar
                </Button>
              </div>
            </div>

            {/* Notifications */}
            {showNotifications && (
              <NotificationAlert onClose={() => setShowNotifications(false)} />
            )}
          </div>

          {/* Quick Action Cards */}
          <div className="mb-8">
            <QuickActionCards />
          </div>

          {/* Stats Cards */}
          <div className="mb-8">
            <NutritionStatsCards plans={activePlans} />
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content Area - Active Plans */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Planos Ativos
                    </h2>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        Filtros
                      </Button>
                    </div>
                  </div>

                  {/* Search and Filter Controls */}
                  <div className="flex gap-4 mb-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Buscar por cliente ou tipo de plano..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e?.target?.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e?.target?.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="all">Todos os Status</option>
                      <option value="active">Ativo</option>
                      <option value="excellent">Excelente</option>
                      <option value="needs_attention">Precisa Atenção</option>
                    </select>
                  </div>
                </div>

                {/* Active Plans Table */}
                <ActivePlansTable plans={filteredPlans} />
              </div>
            </div>

            {/* Sidebar Content */}
            <div className="space-y-6">
              {/* Nutrition Analytics */}
              <NutritionAnalytics data={analyticsData} />

              {/* Food Search Panel */}
              <FoodSearchPanel />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NutritionManagement;