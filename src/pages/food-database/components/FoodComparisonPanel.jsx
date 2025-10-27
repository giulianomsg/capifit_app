import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FoodComparisonPanel = ({ foods, isOpen, onClose, onRemoveFood }) => {
  if (!isOpen || !foods || foods?.length === 0) return null;

  const formatValue = (value, unit = '') => {
    if (typeof value === 'number') {
      return value % 1 === 0 ? `${value}${unit}` : `${value?.toFixed(1)}${unit}`;
    }
    return `${value}${unit}`;
  };

  const nutritionFields = [
    { key: 'calorias', label: 'Calorias', unit: ' kcal', color: 'text-primary' },
    { key: 'proteinas', label: 'Proteínas', unit: 'g', color: 'text-green-600' },
    { key: 'carboidratos', label: 'Carboidratos', unit: 'g', color: 'text-blue-600' },
    { key: 'gorduras', label: 'Gorduras', unit: 'g', color: 'text-amber-600' },
    { key: 'fibras', label: 'Fibras', unit: 'g', color: 'text-purple-600' },
    { key: 'calcio', label: 'Cálcio', unit: 'mg', color: 'text-indigo-600' },
    { key: 'ferro', label: 'Ferro', unit: 'mg', color: 'text-red-600' },
    { key: 'magnesio', label: 'Magnésio', unit: 'mg', color: 'text-teal-600' },
    { key: 'potassio', label: 'Potássio', unit: 'mg', color: 'text-orange-600' },
    { key: 'sodio', label: 'Sódio', unit: 'mg', color: 'text-red-500' },
    { key: 'vitamina_c', label: 'Vitamina C', unit: 'mg', color: 'text-yellow-600' },
    { key: 'vitamina_a', label: 'Vitamina A', unit: 'µg', color: 'text-pink-600' }
  ];

  const getMaxValue = (field) => {
    return Math.max(...foods?.map(food => food?.[field] || 0));
  };

  const getPercentage = (value, maxValue) => {
    if (maxValue === 0) return 0;
    return (value / maxValue) * 100;
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
      <div className="bg-card border border-border rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Comparação Nutricional
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Comparando {foods?.length} alimento{foods?.length !== 1 ? 's' : ''} - Valores por 100g
            </p>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            iconName="X"
          />
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6">
            {/* Food Headers */}
            <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `250px repeat(${foods?.length}, 1fr)` }}>
              <div></div>
              {foods?.map((food, index) => (
                <div key={food?.id} className="bg-muted/20 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm truncate">
                        {food?.nome}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize mt-1 ${getCategoryColor(food?.categoria)}`}>
                        {food?.categoria}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveFood(food?.id)}
                      iconName="X"
                      className="text-muted-foreground hover:text-red-500"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Comparison Table */}
            <div className="space-y-4">
              {nutritionFields?.map((field) => {
                const maxValue = getMaxValue(field?.key);
                
                return (
                  <div key={field?.key} className="bg-card border border-border rounded-lg p-4">
                    <div className="grid gap-4" style={{ gridTemplateColumns: `250px repeat(${foods?.length}, 1fr)` }}>
                      {/* Field Label */}
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${field?.color?.replace('text-', 'bg-')}`} />
                        <span className="font-medium text-foreground">
                          {field?.label}
                        </span>
                      </div>

                      {/* Values for each food */}
                      {foods?.map((food) => {
                        const value = food?.[field?.key] || 0;
                        const percentage = getPercentage(value, maxValue);
                        const isHighest = value === maxValue && maxValue > 0;
                        
                        return (
                          <div key={`${food?.id}-${field?.key}`} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className={`text-sm font-semibold ${isHighest ? field?.color : 'text-foreground'}`}>
                                {formatValue(value, field?.unit)}
                              </span>
                              {isHighest && maxValue > 0 && (
                                <Icon name="Crown" size={16} className="text-amber-500" />
                              )}
                            </div>
                            {/* Progress Bar */}
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  isHighest 
                                    ? field?.color?.replace('text-', 'bg-') 
                                    : 'bg-muted-foreground'
                                }`}
                                style={{
                                  width: `${Math.max(percentage, 2)}%`
                                }}
                              />
                            </div>
                            {maxValue > 0 && (
                              <div className="text-xs text-muted-foreground">
                                {percentage?.toFixed(1)}% do maior
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
              {/* Highest Calories */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="Zap" size={16} className="text-primary" />
                  <h4 className="font-semibold text-foreground">Maior Caloria</h4>
                </div>
                {(() => {
                  const highest = foods?.reduce((max, food) => 
                    food?.calorias > max?.calorias ? food : max
                  );
                  return (
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {highest?.nome}
                      </p>
                      <p className="text-lg font-bold text-primary">
                        {formatValue(highest?.calorias, ' kcal')}
                      </p>
                    </div>
                  );
                })()}
              </div>

              {/* Highest Protein */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="Dumbbell" size={16} className="text-green-600" />
                  <h4 className="font-semibold text-foreground">Maior Proteína</h4>
                </div>
                {(() => {
                  const highest = foods?.reduce((max, food) => 
                    food?.proteinas > max?.proteinas ? food : max
                  );
                  return (
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {highest?.nome}
                      </p>
                      <p className="text-lg font-bold text-green-600">
                        {formatValue(highest?.proteinas, 'g')}
                      </p>
                    </div>
                  );
                })()}
              </div>

              {/* Highest Fiber */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="Leaf" size={16} className="text-purple-600" />
                  <h4 className="font-semibold text-foreground">Maior Fibra</h4>
                </div>
                {(() => {
                  const highest = foods?.reduce((max, food) => 
                    food?.fibras > max?.fibras ? food : max
                  );
                  return (
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {highest?.nome}
                      </p>
                      <p className="text-lg font-bold text-purple-600">
                        {formatValue(highest?.fibras, 'g')}
                      </p>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-muted/20 rounded-lg p-4 mt-6">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="Info" size={16} className="text-primary" />
                <h4 className="font-semibold text-foreground">Dicas de Comparação</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Os valores são calculados por 100g de cada alimento</li>
                <li>• O ícone de coroa indica o maior valor em cada categoria</li>
                <li>• As barras de progresso mostram valores relativos entre os alimentos</li>
                <li>• Use esta comparação para fazer substituições inteligentes em sua dieta</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodComparisonPanel;