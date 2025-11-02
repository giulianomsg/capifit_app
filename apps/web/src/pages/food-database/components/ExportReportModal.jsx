import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const ExportReportModal = ({ foods, isOpen, onClose }) => {
  const [exportOptions, setExportOptions] = useState({
    format: 'csv',
    includeFields: {
      basic: true,
      macros: true,
      minerals: false,
      vitamins: false,
      all: false
    },
    filteredOnly: true
  });

  if (!isOpen) return null;

  const handleOptionChange = (category, value) => {
    setExportOptions(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleFieldChange = (field, checked) => {
    setExportOptions(prev => ({
      ...prev,
      includeFields: {
        ...prev?.includeFields,
        [field]: checked
      }
    }));
  };

  const generateCSV = () => {
    if (!foods || foods?.length === 0) return '';

    const { includeFields } = exportOptions;
    
    // Define headers based on selected options
    let headers = [];
    
    if (includeFields?.basic || includeFields?.all) {
      headers?.push('Nome', 'Categoria', 'Calorias (kcal)');
    }
    
    if (includeFields?.macros || includeFields?.all) {
      headers?.push('Proteínas (g)', 'Carboidratos (g)', 'Gorduras (g)', 'Fibras (g)');
    }
    
    if (includeFields?.minerals || includeFields?.all) {
      headers?.push('Cálcio (mg)', 'Ferro (mg)', 'Magnésio (mg)', 'Fósforo (mg)', 'Potássio (mg)', 'Sódio (mg)', 'Zinco (mg)');
    }
    
    if (includeFields?.vitamins || includeFields?.all) {
      headers?.push('Vitamina C (mg)', 'Vitamina B1 (mg)', 'Vitamina B2 (mg)', 'Vitamina B6 (mg)', 'Vitamina B12 (µg)', 'Vitamina A (µg)', 'Vitamina E (mg)');
    }

    // Create CSV content
    let csvContent = headers?.join(',') + '\n';
    
    foods?.forEach(food => {
      let row = [];
      
      if (includeFields?.basic || includeFields?.all) {
        row?.push(`"${food?.nome}"`, `"${food?.categoria}"`, food?.calorias || 0);
      }
      
      if (includeFields?.macros || includeFields?.all) {
        row?.push(
          food?.proteinas || 0,
          food?.carboidratos || 0,
          food?.gorduras || 0,
          food?.fibras || 0
        );
      }
      
      if (includeFields?.minerals || includeFields?.all) {
        row?.push(
          food?.calcio || 0,
          food?.ferro || 0,
          food?.magnesio || 0,
          food?.fosforo || 0,
          food?.potassio || 0,
          food?.sodio || 0,
          food?.zinco || 0
        );
      }
      
      if (includeFields?.vitamins || includeFields?.all) {
        row?.push(
          food?.vitamina_c || 0,
          food?.vitamina_b1 || 0,
          food?.vitamina_b2 || 0,
          food?.vitamina_b6 || 0,
          food?.vitamina_b12 || 0,
          food?.vitamina_a || 0,
          food?.vitamina_e || 0
        );
      }
      
      csvContent += row?.join(',') + '\n';
    });

    return csvContent;
  };

  const generateJSON = () => {
    const { includeFields } = exportOptions;
    
    const filteredFoods = foods?.map(food => {
      let exportFood = {};
      
      if (includeFields?.basic || includeFields?.all) {
        exportFood.nome = food?.nome;
        exportFood.categoria = food?.categoria;
        exportFood.calorias = food?.calorias;
      }
      
      if (includeFields?.macros || includeFields?.all) {
        exportFood.proteinas = food?.proteinas;
        exportFood.carboidratos = food?.carboidratos;
        exportFood.gorduras = food?.gorduras;
        exportFood.fibras = food?.fibras;
      }
      
      if (includeFields?.minerals || includeFields?.all) {
        exportFood.minerais = {
          calcio: food?.calcio,
          ferro: food?.ferro,
          magnesio: food?.magnesio,
          fosforo: food?.fosforo,
          potassio: food?.potassio,
          sodio: food?.sodio,
          zinco: food?.zinco
        };
      }
      
      if (includeFields?.vitamins || includeFields?.all) {
        exportFood.vitaminas = {
          vitamina_c: food?.vitamina_c,
          vitamina_b1: food?.vitamina_b1,
          vitamina_b2: food?.vitamina_b2,
          vitamina_b6: food?.vitamina_b6,
          vitamina_b12: food?.vitamina_b12,
          vitamina_a: food?.vitamina_a,
          vitamina_e: food?.vitamina_e
        };
      }
      
      return exportFood;
    });

    return JSON.stringify({
      metadata: {
        total_foods: filteredFoods?.length,
        export_date: new Date()?.toISOString(),
        source: 'TACO Food Database',
        format: 'JSON'
      },
      foods: filteredFoods
    }, null, 2);
  };

  const handleExport = () => {
    if (!foods || foods?.length === 0) {
      alert('Nenhum alimento para exportar');
      return;
    }

    let content = '';
    let filename = '';
    let mimeType = '';

    if (exportOptions?.format === 'csv') {
      content = generateCSV();
      filename = `alimentos_taco_${new Date()?.toISOString()?.split('T')?.[0]}.csv`;
      mimeType = 'text/csv;charset=utf-8;';
    } else {
      content = generateJSON();
      filename = `alimentos_taco_${new Date()?.toISOString()?.split('T')?.[0]}.json`;
      mimeType = 'application/json;charset=utf-8;';
    }

    // Create and download file
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    
    if (link?.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link?.setAttribute('href', url);
      link?.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body?.appendChild(link);
      link?.click();
      document.body?.removeChild(link);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Exportar Dados Nutricionais
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {foods?.length} alimento{foods?.length !== 1 ? 's' : ''} será{foods?.length !== 1 ? 'ão' : ''} exportado{foods?.length !== 1 ? 's' : ''}
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
        <div className="overflow-y-auto max-h-[calc(90vh-160px)]">
          <div className="p-6 space-y-6">
            {/* Format Selection */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Formato de Exportação
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleOptionChange('format', 'csv')}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    exportOptions?.format === 'csv' ?'border-primary bg-primary/5' :'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon name="FileSpreadsheet" size={24} className="text-green-600" />
                    <div className="text-left">
                      <div className="font-medium text-foreground">CSV</div>
                      <div className="text-sm text-muted-foreground">
                        Para Excel, Google Sheets
                      </div>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => handleOptionChange('format', 'json')}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    exportOptions?.format === 'json' ?'border-primary bg-primary/5' :'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon name="FileCode2" size={24} className="text-blue-600" />
                    <div className="text-left">
                      <div className="font-medium text-foreground">JSON</div>
                      <div className="text-sm text-muted-foreground">
                        Para desenvolvedores, APIs
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Fields Selection */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Campos para Exportar
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="all-fields"
                    checked={exportOptions?.includeFields?.all}
                    onCheckedChange={(checked) => handleFieldChange('all', checked)}
                  />
                  <label htmlFor="all-fields" className="font-medium text-foreground">
                    Todos os campos (arquivo completo)
                  </label>
                </div>
                
                {!exportOptions?.includeFields?.all && (
                  <>
                    <div className="ml-6 space-y-2">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="basic-fields"
                          checked={exportOptions?.includeFields?.basic}
                          onCheckedChange={(checked) => handleFieldChange('basic', checked)}
                        />
                        <label htmlFor="basic-fields" className="text-foreground">
                          Informações básicas (nome, categoria, calorias)
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="macro-fields"
                          checked={exportOptions?.includeFields?.macros}
                          onCheckedChange={(checked) => handleFieldChange('macros', checked)}
                        />
                        <label htmlFor="macro-fields" className="text-foreground">
                          Macronutrientes (proteínas, carboidratos, gorduras, fibras)
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="mineral-fields"
                          checked={exportOptions?.includeFields?.minerals}
                          onCheckedChange={(checked) => handleFieldChange('minerals', checked)}
                        />
                        <label htmlFor="mineral-fields" className="text-foreground">
                          Minerais (cálcio, ferro, magnésio, etc.)
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="vitamin-fields"
                          checked={exportOptions?.includeFields?.vitamins}
                          onCheckedChange={(checked) => handleFieldChange('vitamins', checked)}
                        />
                        <label htmlFor="vitamin-fields" className="text-foreground">
                          Vitaminas (A, B1, B2, B6, B12, C, E)
                        </label>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Preview */}
            <div className="bg-muted/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="Eye" size={16} className="text-primary" />
                <h4 className="font-semibold text-foreground">Prévia do Arquivo</h4>
              </div>
              
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Formato: {exportOptions?.format?.toUpperCase()}</p>
                <p>• Total de alimentos: {foods?.length}</p>
                <p>• Campos inclusos: {
                  exportOptions?.includeFields?.all ? 'Todos' :
                  Object.entries(exportOptions?.includeFields)
                    ?.filter(([key, value]) => value && key !== 'all')
                    ?.map(([key]) => {
                      const labels = {
                        basic: 'Básicos',
                        macros: 'Macronutrientes',
                        minerals: 'Minerais',
                        vitamins: 'Vitaminas'
                      };
                      return labels?.[key];
                    })
                    ?.join(', ') || 'Nenhum'
                }</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <div className="text-sm text-muted-foreground">
            O download será iniciado automaticamente
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            
            <Button
              onClick={handleExport}
              iconName="Download"
              iconPosition="left"
              disabled={
                !exportOptions?.includeFields?.all && 
                !Object.entries(exportOptions?.includeFields)
                  ?.some(([key, value]) => value && key !== 'all')
              }
            >
              Exportar Dados
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportReportModal;