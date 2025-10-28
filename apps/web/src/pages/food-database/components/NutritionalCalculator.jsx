import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const NutritionalCalculator = ({ selectedFoods, onCalculate }) => {
  const [portions, setPortions] = useState({});
  const [totals, setTotals] = useState({
    calorias: 0,
    proteinas: 0,
    carboidratos: 0,
    gorduras: 0,
    fibras: 0
  });

  // Initialize portions when selectedFoods changes
  useEffect(() => {
    const newPortions = {};
    selectedFoods?.forEach(food => {
      if (!portions?.[food?.id]) {
        newPortions[food?.id] = 100; // Default 100g
      } else {
        newPortions[food?.id] = portions?.[food?.id];
      }
    });
    setPortions(newPortions);
  }, [selectedFoods]);

  // Calculate totals when portions or selectedFoods change
  useEffect(() => {
    let newTotals = {
      calorias: 0,
      proteinas: 0,
      carboidratos: 0,
      gorduras: 0,
      fibras: 0
    };

    selectedFoods?.forEach(food => {
      const portion = portions?.[food?.id] || 100;
      const multiplier = portion / 100; // Convert to per 100g basis

      newTotals.calorias += (food?.calorias || 0) * multiplier;
      newTotals.proteinas += (food?.proteinas || 0) * multiplier;
      newTotals.carboidratos += (food?.carboidratos || 0) * multiplier;
      newTotals.gorduras += (food?.gorduras || 0) * multiplier;
      newTotals.fibras += (food?.fibras || 0) * multiplier;
    });

    setTotals(newTotals);
  }, [selectedFoods, portions]);

  const handlePortionChange = (foodId, value) => {
    setPortions(prev => ({
      ...prev,
      [foodId]: parseFloat(value) || 0
    }));
  };

  const formatValue = (value, decimals = 1) => {
    return value % 1 === 0 ? value?.toString() : value?.toFixed(decimals);
  };

  const getMacroPercentage = (value, total) => {
    if (total === 0) return 0;
    return (value / total) * 100;
  };

  const totalMacros = totals?.proteinas + totals?.carboidratos + totals?.gorduras;

  if (!selectedFoods || selectedFoods?.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Icon name="Calculator" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            Calculadora Nutricional
          </h3>
        </div>
        
        <div className="text-center py-8">
          <Icon name="Calculator" size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Adicione alimentos à comparação para calcular valores nutricionais totais
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Icon name="Calculator" size={20} className="text-primary" />
        <h3 className="text-lg font-semibold text-foreground">
          Calculadora Nutricional
        </h3>
      </div>
      {/* Food Portions */}
      <div className="space-y-4 mb-6">
        <h4 className="text-sm font-semibold text-foreground">
          Ajustar Porções:
        </h4>
        
        {selectedFoods?.map(food => (
          <div key={food?.id} className="bg-muted/20 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground truncate">
                {food?.nome}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={portions?.[food?.id] || 100}
                onChange={(e) => handlePortionChange(food?.id, e?.target?.value)}
                min="0"
                step="1"
                className="w-20 text-sm"
              />
              <span className="text-sm text-muted-foreground">gramas</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-muted-foreground">
              <span>
                {formatValue(((food?.calorias || 0) * (portions?.[food?.id] || 100)) / 100)} kcal
              </span>
              <span>
                {formatValue(((food?.proteinas || 0) * (portions?.[food?.id] || 100)) / 100)}g prot
              </span>
            </div>
          </div>
        ))}
      </div>
      {/* Totals Summary */}
      <div className="border-t border-border pt-6">
        <h4 className="text-sm font-semibold text-foreground mb-4">
          Valores Totais:
        </h4>
        
        {/* Main Calorie Display */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {formatValue(totals?.calorias, 0)}
            </div>
            <div className="text-sm text-muted-foreground">
              calorias totais
            </div>
          </div>
        </div>

        {/* Macronutrients */}
        <div className="space-y-3">
          {[
            { key: 'proteinas', label: 'Proteínas', color: 'text-green-600', bgColor: 'bg-green-600' },
            { key: 'carboidratos', label: 'Carboidratos', color: 'text-blue-600', bgColor: 'bg-blue-600' },
            { key: 'gorduras', label: 'Gorduras', color: 'text-amber-600', bgColor: 'bg-amber-600' },
            { key: 'fibras', label: 'Fibras', color: 'text-purple-600', bgColor: 'bg-purple-600' }
          ]?.map(macro => {
            const value = totals?.[macro?.key];
            const percentage = macro?.key !== 'fibras' ? getMacroPercentage(value, totalMacros) : 0;
            
            return (
              <div key={macro?.key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${macro?.color}`}>
                    {macro?.label}
                  </span>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-foreground">
                      {formatValue(value)}g
                    </span>
                    {macro?.key !== 'fibras' && totalMacros > 0 && (
                      <span className="text-xs text-muted-foreground ml-2">
                        ({formatValue(percentage, 0)}%)
                      </span>
                    )}
                  </div>
                </div>
                
                {macro?.key !== 'fibras' && totalMacros > 0 && (
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${macro?.bgColor} transition-all duration-300`}
                      style={{ width: `${Math.max(percentage, 2)}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const resetPortions = {};
              selectedFoods?.forEach(food => {
                resetPortions[food?.id] = 100;
              });
              setPortions(resetPortions);
            }}
            iconName="RotateCcw"
            iconPosition="left"
            className="flex-1"
          >
            Resetar
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onCalculate({
              foods: selectedFoods?.map(food => ({
                ...food,
                portion: portions?.[food?.id] || 100
              })),
              totals
            })}
            iconName="Save"
            iconPosition="left"
            className="flex-1"
          >
            Salvar
          </Button>
        </div>

        {/* Quick Portions */}
        <div className="mt-4">
          <h5 className="text-xs font-medium text-muted-foreground mb-2">
            Porções rápidas:
          </h5>
          <div className="flex space-x-2">
            {[50, 100, 150, 200]?.map(amount => (
              <Button
                key={amount}
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newPortions = {};
                  selectedFoods?.forEach(food => {
                    newPortions[food?.id] = amount;
                  });
                  setPortions(prev => ({ ...prev, ...newPortions }));
                }}
                className="text-xs px-2 py-1 h-auto"
              >
                {amount}g
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionalCalculator;