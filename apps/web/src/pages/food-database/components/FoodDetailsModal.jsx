import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FoodDetailsModal = ({ 
  food, 
  isOpen, 
  onClose, 
  onAddToComparison, 
  onToggleFavorite, 
  isFavorite 
}) => {
  if (!isOpen || !food) return null;

  const macroData = [
    { name: 'Proteínas', value: food?.proteinas, color: '#10B981', unit: 'g' },
    { name: 'Carboidratos', value: food?.carboidratos, color: '#3B82F6', unit: 'g' },
    { name: 'Gorduras', value: food?.gorduras, color: '#F59E0B', unit: 'g' }
  ];

  const totalMacros = macroData?.reduce((sum, macro) => sum + (macro?.value || 0), 0);

  const minerals = [
    { name: 'Cálcio', value: food?.calcio, unit: 'mg' },
    { name: 'Ferro', value: food?.ferro, unit: 'mg' },
    { name: 'Magnésio', value: food?.magnesio, unit: 'mg' },
    { name: 'Fósforo', value: food?.fosforo, unit: 'mg' },
    { name: 'Potássio', value: food?.potassio, unit: 'mg' },
    { name: 'Sódio', value: food?.sodio, unit: 'mg' },
    { name: 'Zinco', value: food?.zinco, unit: 'mg' }
  ];

  const vitamins = [
    { name: 'Vitamina C', value: food?.vitamina_c, unit: 'mg' },
    { name: 'Vitamina B1', value: food?.vitamina_b1, unit: 'mg' },
    { name: 'Vitamina B2', value: food?.vitamina_b2, unit: 'mg' },
    { name: 'Vitamina B6', value: food?.vitamina_b6, unit: 'mg' },
    { name: 'Vitamina B12', value: food?.vitamina_b12, unit: 'µg' },
    { name: 'Vitamina A', value: food?.vitamina_a, unit: 'µg' },
    { name: 'Vitamina E', value: food?.vitamina_e, unit: 'mg' }
  ];

  const formatValue = (value, unit) => {
    if (value === 0) return `0 ${unit}`;
    if (typeof value === 'number') {
      return value % 1 === 0 ? `${value} ${unit}` : `${value?.toFixed(2)} ${unit}`;
    }
    return `${value} ${unit}`;
  };

  const getCategoryColor = (category) => {
    const colors = {
      cereais: 'bg-amber-100 text-amber-800',
      leguminosas: 'bg-green-100 text-green-800',
      carnes: 'bg-red-100 text-red-800',
      peixes: 'bg-blue-100 text-blue-800',
      frutas: 'bg-orange-100 text-orange-800',
      vegetais: 'bg-emerald-100 text-emerald-800',
      tuberculos: 'bg-yellow-100 text-yellow-800',
      laticinios: 'bg-purple-100 text-purple-800',
      oleaginosas: 'bg-brown-100 text-brown-800',
      personalizados: 'bg-gray-100 text-gray-800'
    };
    return colors?.[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {food?.nome}
              </h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${getCategoryColor(food?.categoria)}`}>
                  {food?.categoria}
                </span>
                {food?.origem === 'custom' && (
                  <span className="text-xs text-muted-foreground">
                    • Alimento personalizado
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleFavorite(food)}
              iconName={isFavorite ? "Heart" : "HeartOff"}
              className={isFavorite ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-red-500'}
            >
              {isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddToComparison(food)}
              iconName="BarChart3"
              iconPosition="left"
            >
              Adicionar à comparação
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              iconName="X"
            />
          </div>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6 space-y-8">
            {/* Main Nutritional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Calories and Basic Info */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Informações Básicas
                </h3>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {food?.calorias}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      kcal por 100g
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-card border border-border rounded">
                      <div className="text-lg font-semibold text-foreground">
                        {formatValue(food?.fibras, 'g')}
                      </div>
                      <div className="text-xs text-muted-foreground">Fibras</div>
                    </div>
                    <div className="text-center p-3 bg-card border border-border rounded">
                      <div className="text-lg font-semibold text-foreground">
                        {formatValue(food?.colesterol, 'mg')}
                      </div>
                      <div className="text-xs text-muted-foreground">Colesterol</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Macro Distribution Chart */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Distribuição de Macronutrientes
                </h3>
                
                <div className="space-y-4">
                  {macroData?.map((macro) => {
                    const percentage = totalMacros > 0 ? (macro?.value / totalMacros) * 100 : 0;
                    return (
                      <div key={macro?.name} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-foreground">
                            {macro?.name}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {formatValue(macro?.value, macro?.unit)} ({percentage?.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.max(percentage, 2)}%`,
                              backgroundColor: macro?.color
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Minerals */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Minerais
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {minerals?.map((mineral) => (
                  <div key={mineral?.name} className="text-center p-3 bg-muted/20 rounded">
                    <div className="text-sm font-semibold text-foreground">
                      {formatValue(mineral?.value, mineral?.unit)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {mineral?.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vitamins */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Vitaminas
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {vitamins?.map((vitamin) => (
                  <div key={vitamin?.name} className="text-center p-3 bg-muted/20 rounded">
                    <div className="text-sm font-semibold text-foreground">
                      {formatValue(vitamin?.value, vitamin?.unit)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {vitamin?.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-muted/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="Info" size={16} className="text-primary" />
                <h4 className="text-sm font-semibold text-foreground">
                  Informações Adicionais
                </h4>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Valores nutricionais calculados por 100g de alimento</p>
                <p>• Dados baseados na Tabela Brasileira de Composição de Alimentos (TACO)</p>
                <p>• Para porções diferentes, ajuste os valores proporcionalmente</p>
                {food?.origem === 'custom' && (
                  <p>• Este é um alimento personalizado adicionado pelo usuário</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodDetailsModal;