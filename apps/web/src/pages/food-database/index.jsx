import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';


import FoodSearchPanel from './components/FoodSearchPanel';
import FoodTable from './components/FoodTable';
import FoodDetailsModal from './components/FoodDetailsModal';
import AddCustomFoodModal from './components/AddCustomFoodModal';
import FoodComparisonPanel from './components/FoodComparisonPanel';
import NutritionalCalculator from './components/NutritionalCalculator';
import FavoriteFoodsList from './components/FavoriteFoodsList';
import ExportReportModal from './components/ExportReportModal';

const FoodDatabase = () => {
  const navigate = useNavigate();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [selectedFood, setSelectedFood] = useState(null);
  const [comparisonList, setComparisonList] = useState([]);
  const [favoriteFoods, setFavoriteFoods] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);
  const [showComparisonPanel, setShowComparisonPanel] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'nome', direction: 'asc' });
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mock TACO database - Extended nutritional data
  const tacoDatabase = [
    {
      id: 1,
      nome: 'Arroz branco cozido',
      categoria: 'cereais',
      calorias: 128,
      proteinas: 2.6,
      carboidratos: 26.2,
      gorduras: 0.2,
      fibras: 0.4,
      calcio: 4,
      ferro: 0.3,
      magnesio: 7,
      fosforo: 21,
      potassio: 16,
      sodio: 1,
      zinco: 0.4,
      vitamina_c: 0,
      vitamina_b1: 0.02,
      vitamina_b2: 0.01,
      vitamina_b6: 0.03,
      vitamina_b12: 0,
      vitamina_a: 0,
      vitamina_e: 0.01,
      colesterol: 0,
      porcao_padrao: 100,
      origem: 'taco',
      created_at: '2023-01-01'
    },
    {
      id: 2,
      nome: 'Feijão preto cozido',
      categoria: 'leguminosas',
      calorias: 77,
      proteinas: 4.5,
      carboidratos: 14.0,
      gorduras: 0.5,
      fibras: 8.4,
      calcio: 29,
      ferro: 1.5,
      magnesio: 40,
      fosforo: 88,
      potassio: 256,
      sodio: 2,
      zinco: 1.0,
      vitamina_c: 0,
      vitamina_b1: 0.16,
      vitamina_b2: 0.06,
      vitamina_b6: 0.07,
      vitamina_b12: 0,
      vitamina_a: 0,
      vitamina_e: 0.87,
      colesterol: 0,
      porcao_padrao: 100,
      origem: 'taco',
      created_at: '2023-01-01'
    },
    {
      id: 3,
      nome: 'Peito de frango grelhado',
      categoria: 'carnes',
      calorias: 165,
      proteinas: 31.0,
      carboidratos: 0,
      gorduras: 3.6,
      fibras: 0,
      calcio: 14,
      ferro: 0.7,
      magnesio: 29,
      fosforo: 228,
      potassio: 256,
      sodio: 74,
      zinco: 0.9,
      vitamina_c: 0,
      vitamina_b1: 0.07,
      vitamina_b2: 0.12,
      vitamina_b6: 0.54,
      vitamina_b12: 0.34,
      vitamina_a: 21,
      vitamina_e: 0.27,
      colesterol: 85,
      porcao_padrao: 100,
      origem: 'taco',
      created_at: '2023-01-01'
    },
    {
      id: 4,
      nome: 'Banana nanica',
      categoria: 'frutas',
      calorias: 89,
      proteinas: 1.1,
      carboidratos: 22.8,
      gorduras: 0.3,
      fibras: 2.6,
      calcio: 5,
      ferro: 0.3,
      magnesio: 27,
      fosforo: 22,
      potassio: 358,
      sodio: 1,
      zinco: 0.2,
      vitamina_c: 8.7,
      vitamina_b1: 0.03,
      vitamina_b2: 0.07,
      vitamina_b6: 0.37,
      vitamina_b12: 0,
      vitamina_a: 64,
      vitamina_e: 0.1,
      colesterol: 0,
      porcao_padrao: 100,
      origem: 'taco',
      created_at: '2023-01-01'
    },
    {
      id: 5,
      nome: 'Brócolis cozido',
      categoria: 'vegetais',
      calorias: 25,
      proteinas: 2.4,
      carboidratos: 4.0,
      gorduras: 0.4,
      fibras: 3.4,
      calcio: 40,
      ferro: 0.5,
      magnesio: 16,
      fosforo: 50,
      potassio: 206,
      sodio: 8,
      zinco: 0.4,
      vitamina_c: 64.9,
      vitamina_b1: 0.07,
      vitamina_b2: 0.12,
      vitamina_b6: 0.14,
      vitamina_b12: 0,
      vitamina_a: 81,
      vitamina_e: 1.45,
      colesterol: 0,
      porcao_padrao: 100,
      origem: 'taco',
      created_at: '2023-01-01'
    },
    {
      id: 6,
      nome: 'Aveia em flocos',
      categoria: 'cereais',
      calorias: 394,
      proteinas: 13.9,
      carboidratos: 66.6,
      gorduras: 8.5,
      fibras: 9.1,
      calcio: 48,
      ferro: 4.4,
      magnesio: 119,
      fosforo: 153,
      potassio: 336,
      sodio: 5,
      zinco: 2.3,
      vitamina_c: 0,
      vitamina_b1: 0.55,
      vitamina_b2: 0.06,
      vitamina_b6: 0.10,
      vitamina_b12: 0,
      vitamina_a: 0,
      vitamina_e: 0.42,
      colesterol: 0,
      porcao_padrao: 100,
      origem: 'taco',
      created_at: '2023-01-01'
    },
    {
      id: 7,
      nome: 'Salmão grelhado',
      categoria: 'peixes',
      calorias: 231,
      proteinas: 25.4,
      carboidratos: 0,
      gorduras: 13.4,
      fibras: 0,
      calcio: 9,
      ferro: 0.3,
      magnesio: 26,
      fosforo: 252,
      potassio: 628,
      sodio: 59,
      zinco: 0.4,
      vitamina_c: 0,
      vitamina_b1: 0.23,
      vitamina_b2: 0.15,
      vitamina_b6: 0.80,
      vitamina_b12: 2.8,
      vitamina_a: 40,
      vitamina_e: 1.22,
      colesterol: 70,
      porcao_padrao: 100,
      origem: 'taco',
      created_at: '2023-01-01'
    },
    {
      id: 8,
      nome: 'Batata doce cozida',
      categoria: 'tuberculos',
      calorias: 77,
      proteinas: 0.6,
      carboidratos: 18.4,
      gorduras: 0.1,
      fibras: 2.2,
      calcio: 17,
      ferro: 0.2,
      magnesio: 13,
      fosforo: 15,
      potassio: 135,
      sodio: 9,
      zinco: 0.2,
      vitamina_c: 19.6,
      vitamina_b1: 0.06,
      vitamina_b2: 0.02,
      vitamina_b6: 0.09,
      vitamina_b12: 0,
      vitamina_a: 999,
      vitamina_e: 0.26,
      colesterol: 0,
      porcao_padrao: 100,
      origem: 'taco',
      created_at: '2023-01-01'
    }
  ];

  // Food categories
  const foodCategories = [
    { value: 'todos', label: 'Todas as categorias' },
    { value: 'cereais', label: 'Cereais e derivados' },
    { value: 'leguminosas', label: 'Leguminosas' },
    { value: 'carnes', label: 'Carnes e aves' },
    { value: 'peixes', label: 'Peixes e frutos do mar' },
    { value: 'frutas', label: 'Frutas' },
    { value: 'vegetais', label: 'Vegetais e verduras' },
    { value: 'tuberculos', label: 'Tubérculos e raízes' },
    { value: 'laticinios', label: 'Laticínios' },
    { value: 'oleaginosas', label: 'Oleaginosas' },
    { value: 'personalizados', label: 'Alimentos personalizados' }
  ];

  // Filtered and sorted foods
  const filteredFoods = useMemo(() => {
    let filtered = tacoDatabase?.filter(food => {
      const matchesSearch = food?.nome?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                           food?.categoria?.toLowerCase()?.includes(searchTerm?.toLowerCase());
      const matchesCategory = selectedCategory === 'todos' || food?.categoria === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    // Apply sorting
    if (sortConfig?.key) {
      filtered = filtered?.sort((a, b) => {
        if (a?.[sortConfig?.key] < b?.[sortConfig?.key]) {
          return sortConfig?.direction === 'asc' ? -1 : 1;
        }
        if (a?.[sortConfig?.key] > b?.[sortConfig?.key]) {
          return sortConfig?.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [searchTerm, selectedCategory, sortConfig, tacoDatabase]);

  // Handle food selection
  const handleFoodSelect = (food) => {
    setSelectedFood(food);
    setShowDetailsModal(true);
  };

  // Handle adding to comparison
  const handleAddToComparison = (food) => {
    if (comparisonList?.length < 4 && !comparisonList?.find(f => f?.id === food?.id)) {
      setComparisonList(prev => [...prev, food]);
    }
  };

  // Handle removing from comparison
  const handleRemoveFromComparison = (foodId) => {
    setComparisonList(prev => prev?.filter(f => f?.id !== foodId));
  };

  // Handle favorite toggle
  const handleToggleFavorite = (food) => {
    const isFavorite = favoriteFoods?.find(f => f?.id === food?.id);
    
    if (isFavorite) {
      setFavoriteFoods(prev => prev?.filter(f => f?.id !== food?.id));
    } else {
      setFavoriteFoods(prev => [...prev, food]);
    }
  };

  // Handle sort change
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev?.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <div className="flex items-center space-x-3 mb-2">
                <Icon name="Database" size={28} className="text-primary" />
                <h1 className="text-2xl font-bold text-foreground">
                  Base de Dados TACO
                </h1>
              </div>
              <p className="text-muted-foreground">
                Tabela Brasileira de Composição de Alimentos - Pesquise, compare e analise informações nutricionais completas
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddFoodModal(true)}
                iconName="Plus"
                iconPosition="left"
              >
                Adicionar Alimento
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExportModal(true)}
                iconName="Download"
                iconPosition="left"
              >
                Exportar Dados
              </Button>

              {comparisonList?.length > 0 && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowComparisonPanel(true)}
                  iconName="BarChart3"
                  iconPosition="left"
                >
                  Comparar ({comparisonList?.length})
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Panel */}
        <FoodSearchPanel
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={foodCategories}
          resultsCount={filteredFoods?.length}
        />

        {/* Desktop Layout */}
        {!isMobile ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
            {/* Main Food Table */}
            <div className="lg:col-span-3">
              <FoodTable
                foods={filteredFoods}
                onFoodSelect={handleFoodSelect}
                onAddToComparison={handleAddToComparison}
                onToggleFavorite={handleToggleFavorite}
                favoriteFoods={favoriteFoods}
                comparisonList={comparisonList}
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Favorites List */}
              <FavoriteFoodsList
                favoriteFoods={favoriteFoods}
                onFoodSelect={handleFoodSelect}
                onRemoveFavorite={(food) => handleToggleFavorite(food)}
              />

              {/* Nutritional Calculator */}
              <NutritionalCalculator
                selectedFoods={comparisonList}
                onCalculate={(results) => console.log('Calculation results:', results)}
              />
            </div>
          </div>
        ) : (
          /* Mobile Layout */
          (<div className="mt-8 space-y-6">
            {/* Mobile Food Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredFoods?.map((food) => (
                <div key={food?.id} className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground text-sm mb-1">
                        {food?.nome}
                      </h3>
                      <p className="text-xs text-muted-foreground capitalize">
                        {food?.categoria}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleFavorite(food)}
                        iconName={favoriteFoods?.find(f => f?.id === food?.id) ? "Heart" : "HeartOff"}
                        className="text-muted-foreground hover:text-red-500"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddToComparison(food)}
                        iconName="BarChart3"
                        className="text-muted-foreground hover:text-primary"
                        disabled={comparisonList?.length >= 4 || comparisonList?.find(f => f?.id === food?.id)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="text-center p-2 bg-primary/5 rounded">
                      <p className="text-lg font-bold text-foreground">{food?.calorias}</p>
                      <p className="text-xs text-muted-foreground">kcal</p>
                    </div>
                    <div className="text-center p-2 bg-success/5 rounded">
                      <p className="text-lg font-bold text-foreground">{food?.proteinas}g</p>
                      <p className="text-xs text-muted-foreground">proteínas</p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFoodSelect(food)}
                    className="w-full"
                  >
                    Ver Detalhes
                  </Button>
                </div>
              ))}
            </div>
            {/* Mobile Quick Actions */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-3">Ações Rápidas</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddFoodModal(true)}
                  iconName="Plus"
                  iconPosition="left"
                >
                  Adicionar
                </Button>
                
                {comparisonList?.length > 0 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowComparisonPanel(true)}
                    iconName="BarChart3"
                    iconPosition="left"
                  >
                    Comparar ({comparisonList?.length})
                  </Button>
                )}
              </div>
            </div>
          </div>)
        )}
      </div>
      {/* Modals and Panels */}
      {showDetailsModal && selectedFood && (
        <FoodDetailsModal
          food={selectedFood}
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          onAddToComparison={handleAddToComparison}
          onToggleFavorite={handleToggleFavorite}
          isFavorite={favoriteFoods?.find(f => f?.id === selectedFood?.id)}
        />
      )}
      {showAddFoodModal && (
        <AddCustomFoodModal
          isOpen={showAddFoodModal}
          onClose={() => setShowAddFoodModal(false)}
          onSave={(newFood) => {
            console.log('New food saved:', newFood);
            setShowAddFoodModal(false);
          }}
        />
      )}
      {showComparisonPanel && (
        <FoodComparisonPanel
          foods={comparisonList}
          isOpen={showComparisonPanel}
          onClose={() => setShowComparisonPanel(false)}
          onRemoveFood={handleRemoveFromComparison}
        />
      )}
      {showExportModal && (
        <ExportReportModal
          foods={filteredFoods}
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
};

export default FoodDatabase;