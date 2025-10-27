import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FavoriteFoodsList = ({ favoriteFoods, onFoodSelect, onRemoveFavorite }) => {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Icon name="Heart" size={20} className="text-red-500" />
        <h3 className="text-lg font-semibold text-foreground">
          Alimentos Favoritos
        </h3>
      </div>

      {!favoriteFoods || favoriteFoods?.length === 0 ? (
        <div className="text-center py-8">
          <Icon name="HeartOff" size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">
            Nenhum alimento favoritado ainda
          </p>
          <p className="text-muted-foreground text-xs mt-2">
            Clique no ícone ❤️ para adicionar alimentos aos seus favoritos
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {favoriteFoods?.map(food => (
            <div key={food?.id} className="bg-muted/20 rounded-lg p-3 hover:bg-muted/30 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => onFoodSelect(food)}
                    className="text-left w-full hover:text-primary transition-colors"
                  >
                    <h4 className="text-sm font-medium text-foreground truncate">
                      {food?.nome}
                    </h4>
                    <p className="text-xs text-muted-foreground capitalize mt-1">
                      {food?.categoria}
                    </p>
                  </button>
                  
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="text-xs">
                      <span className="font-medium text-foreground">
                        {food?.calorias}
                      </span>
                      <span className="text-muted-foreground"> kcal</span>
                    </div>
                    <div className="text-xs">
                      <span className="font-medium text-foreground">
                        {food?.proteinas}g
                      </span>
                      <span className="text-muted-foreground"> prot</span>
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveFavorite(food)}
                  iconName="X"
                  className="text-muted-foreground hover:text-red-500 ml-2"
                  title="Remover dos favoritos"
                />
              </div>
            </div>
          ))}

          {/* Quick Actions */}
          <div className="border-t border-border pt-4 mt-4">
            <div className="text-xs text-muted-foreground mb-2">
              {favoriteFoods?.length} alimento{favoriteFoods?.length !== 1 ? 's' : ''} favoritado{favoriteFoods?.length !== 1 ? 's' : ''}
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Clear all favorites (implement this in parent component)
                  favoriteFoods?.forEach(food => onRemoveFavorite(food));
                }}
                iconName="Trash2"
                className="text-xs text-muted-foreground hover:text-red-500"
              >
                Limpar todos
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoriteFoodsList;