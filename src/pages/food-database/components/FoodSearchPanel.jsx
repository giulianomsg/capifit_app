import React from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const FoodSearchPanel = ({ 
  searchTerm, 
  onSearchChange, 
  selectedCategory, 
  onCategoryChange, 
  categories, 
  resultsCount 
}) => {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Search Input */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Icon 
              name="Search" 
              size={20} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
            />
            <Input
              type="text"
              placeholder="Buscar alimentos, categorias ou nutrientes..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e?.target?.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-4">
          <div className="min-w-[200px]">
            <Select
              value={selectedCategory}
              onValueChange={onCategoryChange}
              placeholder="Selecionar categoria"
            >
              {categories?.map((category) => (
                <option key={category?.value} value={category?.value}>
                  {category?.label}
                </option>
              ))}
            </Select>
          </div>

          {/* Results Counter */}
          <div className="text-sm text-muted-foreground whitespace-nowrap">
            {resultsCount} alimento{resultsCount !== 1 ? 's' : ''} encontrado{resultsCount !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
      {/* Search Tips */}
      {(!searchTerm || searchTerm?.length === 0) && (
        <div className="mt-4 p-3 bg-muted/20 rounded-lg">
          <div className="flex items-start space-x-2">
            <Icon name="Info" size={16} className="text-primary mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Dicas de pesquisa:</p>
              <ul className="text-xs space-y-1">
                <li>• Digite o nome do alimento (ex: "arroz", "frango", "banana")</li>
                <li>• Busque por categoria (ex: "frutas", "carnes", "cereais")</li>
                <li>• Use termos nutricionais (ex: "proteína", "fibra", "vitamina")</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodSearchPanel;