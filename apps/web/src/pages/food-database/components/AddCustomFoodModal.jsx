import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const AddCustomFoodModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nome: '',
    categoria: 'personalizados',
    calorias: '',
    proteinas: '',
    carboidratos: '',
    gorduras: '',
    fibras: '',
    calcio: '',
    ferro: '',
    magnesio: '',
    fosforo: '',
    potassio: '',
    sodio: '',
    zinco: '',
    vitamina_c: '',
    vitamina_b1: '',
    vitamina_b2: '',
    vitamina_b6: '',
    vitamina_b12: '',
    vitamina_a: '',
    vitamina_e: '',
    colesterol: '',
    porcao_padrao: '100'
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});

  const categories = [
    { value: 'personalizados', label: 'Personalizado' },
    { value: 'cereais', label: 'Cereais e derivados' },
    { value: 'leguminosas', label: 'Leguminosas' },
    { value: 'carnes', label: 'Carnes e aves' },
    { value: 'peixes', label: 'Peixes e frutos do mar' },
    { value: 'frutas', label: 'Frutas' },
    { value: 'vegetais', label: 'Vegetais e verduras' },
    { value: 'tuberculos', label: 'Tubérculos e raízes' },
    { value: 'laticinios', label: 'Laticínios' },
    { value: 'oleaginosas', label: 'Oleaginosas' }
  ];

  if (!isOpen) return null;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData?.nome?.trim()) {
        newErrors.nome = 'Nome do alimento é obrigatório';
      }
      if (!formData?.categoria) {
        newErrors.categoria = 'Categoria é obrigatória';
      }
    }

    if (step === 2) {
      const requiredFields = ['calorias', 'proteinas', 'carboidratos', 'gorduras'];
      
      requiredFields?.forEach(field => {
        if (formData?.[field] === '' || formData?.[field] < 0) {
          newErrors[field] = 'Este campo é obrigatório e deve ser um número positivo';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (validateStep(2)) {
      const newFood = {
        id: Date.now(),
        ...formData,
        // Convert string values to numbers
        calorias: parseFloat(formData?.calorias) || 0,
        proteinas: parseFloat(formData?.proteinas) || 0,
        carboidratos: parseFloat(formData?.carboidratos) || 0,
        gorduras: parseFloat(formData?.gorduras) || 0,
        fibras: parseFloat(formData?.fibras) || 0,
        calcio: parseFloat(formData?.calcio) || 0,
        ferro: parseFloat(formData?.ferro) || 0,
        magnesio: parseFloat(formData?.magnesio) || 0,
        fosforo: parseFloat(formData?.fosforo) || 0,
        potassio: parseFloat(formData?.potassio) || 0,
        sodio: parseFloat(formData?.sodio) || 0,
        zinco: parseFloat(formData?.zinco) || 0,
        vitamina_c: parseFloat(formData?.vitamina_c) || 0,
        vitamina_b1: parseFloat(formData?.vitamina_b1) || 0,
        vitamina_b2: parseFloat(formData?.vitamina_b2) || 0,
        vitamina_b6: parseFloat(formData?.vitamina_b6) || 0,
        vitamina_b12: parseFloat(formData?.vitamina_b12) || 0,
        vitamina_a: parseFloat(formData?.vitamina_a) || 0,
        vitamina_e: parseFloat(formData?.vitamina_e) || 0,
        colesterol: parseFloat(formData?.colesterol) || 0,
        porcao_padrao: parseFloat(formData?.porcao_padrao) || 100,
        origem: 'custom',
        created_at: new Date()?.toISOString()
      };

      onSave(newFood);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Informações Básicas
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Nome do Alimento *
            </label>
            <Input
              type="text"
              placeholder="Ex: Bolo de chocolate caseiro"
              value={formData?.nome}
              onChange={(e) => handleInputChange('nome', e?.target?.value)}
              error={errors?.nome}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Categoria *
            </label>
            <Select
              value={formData?.categoria}
              onValueChange={(value) => handleInputChange('categoria', value)}
              placeholder="Selecionar categoria"
            >
              {categories?.map((category) => (
                <option key={category?.value} value={category?.value}>
                  {category?.label}
                </option>
              ))}
            </Select>
            {errors?.categoria && (
              <p className="text-red-500 text-sm mt-1">{errors?.categoria}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Porção Padrão (gramas)
            </label>
            <Input
              type="number"
              placeholder="100"
              value={formData?.porcao_padrao}
              onChange={(e) => handleInputChange('porcao_padrao', e?.target?.value)}
              min="1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Peso em gramas da porção para a qual você está inserindo os valores nutricionais
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Macronutrientes *
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Calorias (kcal) *
            </label>
            <Input
              type="number"
              placeholder="0"
              value={formData?.calorias}
              onChange={(e) => handleInputChange('calorias', e?.target?.value)}
              min="0"
              step="0.1"
              error={errors?.calorias}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Fibras (g)
            </label>
            <Input
              type="number"
              placeholder="0"
              value={formData?.fibras}
              onChange={(e) => handleInputChange('fibras', e?.target?.value)}
              min="0"
              step="0.1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Proteínas (g) *
            </label>
            <Input
              type="number"
              placeholder="0"
              value={formData?.proteinas}
              onChange={(e) => handleInputChange('proteinas', e?.target?.value)}
              min="0"
              step="0.1"
              error={errors?.proteinas}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Carboidratos (g) *
            </label>
            <Input
              type="number"
              placeholder="0"
              value={formData?.carboidratos}
              onChange={(e) => handleInputChange('carboidratos', e?.target?.value)}
              min="0"
              step="0.1"
              error={errors?.carboidratos}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Gorduras (g) *
            </label>
            <Input
              type="number"
              placeholder="0"
              value={formData?.gorduras}
              onChange={(e) => handleInputChange('gorduras', e?.target?.value)}
              min="0"
              step="0.1"
              error={errors?.gorduras}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Colesterol (mg)
            </label>
            <Input
              type="number"
              placeholder="0"
              value={formData?.colesterol}
              onChange={(e) => handleInputChange('colesterol', e?.target?.value)}
              min="0"
              step="0.1"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Micronutrientes (Opcional)
        </h3>
        
        <div className="space-y-6">
          {/* Minerals */}
          <div>
            <h4 className="text-md font-medium text-foreground mb-3">Minerais</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { key: 'calcio', label: 'Cálcio', unit: 'mg' },
                { key: 'ferro', label: 'Ferro', unit: 'mg' },
                { key: 'magnesio', label: 'Magnésio', unit: 'mg' },
                { key: 'fosforo', label: 'Fósforo', unit: 'mg' },
                { key: 'potassio', label: 'Potássio', unit: 'mg' },
                { key: 'sodio', label: 'Sódio', unit: 'mg' },
                { key: 'zinco', label: 'Zinco', unit: 'mg' }
              ]?.map(mineral => (
                <div key={mineral?.key}>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {mineral?.label} ({mineral?.unit})
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData?.[mineral?.key]}
                    onChange={(e) => handleInputChange(mineral?.key, e?.target?.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Vitamins */}
          <div>
            <h4 className="text-md font-medium text-foreground mb-3">Vitaminas</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { key: 'vitamina_c', label: 'Vitamina C', unit: 'mg' },
                { key: 'vitamina_b1', label: 'Vitamina B1', unit: 'mg' },
                { key: 'vitamina_b2', label: 'Vitamina B2', unit: 'mg' },
                { key: 'vitamina_b6', label: 'Vitamina B6', unit: 'mg' },
                { key: 'vitamina_b12', label: 'Vitamina B12', unit: 'µg' },
                { key: 'vitamina_a', label: 'Vitamina A', unit: 'µg' },
                { key: 'vitamina_e', label: 'Vitamina E', unit: 'mg' }
              ]?.map(vitamin => (
                <div key={vitamin?.key}>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {vitamin?.label} ({vitamin?.unit})
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData?.[vitamin?.key]}
                    onChange={(e) => handleInputChange(vitamin?.key, e?.target?.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Adicionar Alimento Personalizado
            </h2>
            <div className="flex items-center space-x-2 mt-2">
              {[1, 2, 3]?.map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === currentStep 
                      ? 'bg-primary text-primary-foreground' 
                      : step < currentStep 
                      ? 'bg-success text-success-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {step < currentStep ? (
                      <Icon name="Check" size={16} />
                    ) : (
                      step
                    )}
                  </div>
                  {step < 3 && (
                    <div className={`w-8 h-0.5 mx-2 ${
                      step < currentStep ? 'bg-success' : 'bg-muted'
                    }`} />
                  )}
                </div>
              ))}
            </div>
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
          <div className="p-6">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Passo {currentStep} de 3
          </div>
          
          <div className="flex items-center space-x-3">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                iconName="ChevronLeft"
                iconPosition="left"
              >
                Anterior
              </Button>
            )}
            
            {currentStep < 3 ? (
              <Button
                onClick={handleNext}
                iconName="ChevronRight"
                iconPosition="right"
              >
                Próximo
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                iconName="Plus"
                iconPosition="left"
              >
                Adicionar Alimento
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCustomFoodModal;