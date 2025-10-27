import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FoodTable = ({ 
  foods, 
  onFoodSelect, 
  onAddToComparison, 
  onToggleFavorite, 
  favoriteFoods, 
  comparisonList, 
  sortConfig, 
  onSort 
}) => {
  const getSortIcon = (columnKey) => {
    if (sortConfig?.key !== columnKey) {
      return 'ChevronsUpDown';
    }
    return sortConfig?.direction === 'asc' ? 'ChevronUp' : 'ChevronDown';
  };

  const formatValue = (value, unit = '') => {
    if (typeof value === 'number') {
      return value % 1 === 0 ? `${value}${unit}` : `${value?.toFixed(1)}${unit}`;
    }
    return `${value}${unit}`;
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

  if (!foods || foods?.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Nenhum alimento encontrado
        </h3>
        <p className="text-muted-foreground">
          Tente ajustar os termos de pesquisa ou filtros para encontrar alimentos
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Table Header */}
      <div className="bg-muted/50 border-b border-border">
        <div className="px-6 py-4">
          <h3 className="text-lg font-semibold text-foreground">
            Alimentos Encontrados ({foods?.length})
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Valores nutricionais por 100g de alimento
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/20 border-b border-border">
            <tr>
              <th className="text-left px-6 py-3">
                <button
                  onClick={() => onSort('nome')}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary"
                >
                  <span>Alimento</span>
                  <Icon name={getSortIcon('nome')} size={16} />
                </button>
              </th>
              <th className="text-left px-6 py-3">
                <button
                  onClick={() => onSort('categoria')}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary"
                >
                  <span>Categoria</span>
                  <Icon name={getSortIcon('categoria')} size={16} />
                </button>
              </th>
              <th className="text-center px-6 py-3">
                <button
                  onClick={() => onSort('calorias')}
                  className="flex items-center justify-center space-x-2 text-sm font-medium text-foreground hover:text-primary"
                >
                  <span>Calorias</span>
                  <Icon name={getSortIcon('calorias')} size={16} />
                </button>
              </th>
              <th className="text-center px-6 py-3">
                <button
                  onClick={() => onSort('proteinas')}
                  className="flex items-center justify-center space-x-2 text-sm font-medium text-foreground hover:text-primary"
                >
                  <span>Proteínas</span>
                  <Icon name={getSortIcon('proteinas')} size={16} />
                </button>
              </th>
              <th className="text-center px-6 py-3">
                <button
                  onClick={() => onSort('carboidratos')}
                  className="flex items-center justify-center space-x-2 text-sm font-medium text-foreground hover:text-primary"
                >
                  <span>Carboidratos</span>
                  <Icon name={getSortIcon('carboidratos')} size={16} />
                </button>
              </th>
              <th className="text-center px-6 py-3">
                <button
                  onClick={() => onSort('gorduras')}
                  className="flex items-center justify-center space-x-2 text-sm font-medium text-foreground hover:text-primary"
                >
                  <span>Gorduras</span>
                  <Icon name={getSortIcon('gorduras')} size={16} />
                </button>
              </th>
              <th className="text-center px-6 py-3">
                <button
                  onClick={() => onSort('fibras')}
                  className="flex items-center justify-center space-x-2 text-sm font-medium text-foreground hover:text-primary"
                >
                  <span>Fibras</span>
                  <Icon name={getSortIcon('fibras')} size={16} />
                </button>
              </th>
              <th className="text-center px-6 py-3 text-sm font-medium text-foreground">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {foods?.map((food, index) => (
              <tr 
                key={food?.id} 
                className={`border-b border-border hover:bg-muted/20 transition-colors ${
                  index % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                }`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => onFoodSelect(food)}
                        className="text-left hover:text-primary transition-colors"
                      >
                        <p className="text-sm font-medium text-foreground truncate">
                          {food?.nome}
                        </p>
                        {food?.origem === 'custom' && (
                          <p className="text-xs text-muted-foreground">
                            Personalizado
                          </p>
                        )}
                      </button>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${getCategoryColor(food?.categoria)}`}>
                    {food?.categoria}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-sm font-medium text-foreground">
                    {formatValue(food?.calorias)} kcal
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-sm text-foreground">
                    {formatValue(food?.proteinas, 'g')}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-sm text-foreground">
                    {formatValue(food?.carboidratos, 'g')}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-sm text-foreground">
                    {formatValue(food?.gorduras, 'g')}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-sm text-foreground">
                    {formatValue(food?.fibras, 'g')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleFavorite(food)}
                      iconName={favoriteFoods?.find(f => f?.id === food?.id) ? "Heart" : "HeartOff"}
                      className={`${
                        favoriteFoods?.find(f => f?.id === food?.id) 
                          ? 'text-red-500 hover:text-red-600' :'text-muted-foreground hover:text-red-500'
                      }`}
                      title={favoriteFoods?.find(f => f?.id === food?.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                    />
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onAddToComparison(food)}
                      iconName="BarChart3"
                      className="text-muted-foreground hover:text-primary"
                      disabled={comparisonList?.length >= 4 || comparisonList?.find(f => f?.id === food?.id)}
                      title={
                        comparisonList?.find(f => f?.id === food?.id) 
                          ? 'Já está na comparação' 
                          : comparisonList?.length >= 4 
                          ? 'Máximo 4 alimentos para comparação' :'Adicionar à comparação'
                      }
                    />
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onFoodSelect(food)}
                      iconName="Eye"
                      className="text-muted-foreground hover:text-primary"
                      title="Ver detalhes completos"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="bg-muted/50 border-t border-border px-6 py-3">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Mostrando {foods?.length} alimento{foods?.length !== 1 ? 's' : ''}
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Icon name="Heart" size={16} className="text-red-500" />
              <span>Favoritos</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="BarChart3" size={16} className="text-primary" />
              <span>Comparar</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="Eye" size={16} className="text-muted-foreground" />
              <span>Detalhes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodTable;