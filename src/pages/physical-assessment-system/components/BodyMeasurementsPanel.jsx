import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';


const BodyMeasurementsPanel = ({ clients, selectedClient, onClientSelect }) => {
  const [activeForm, setActiveForm] = useState(false);
  const [measurements, setMeasurements] = useState({
    weight: '',
    height: '',
    bodyFat: '',
    muscleMass: '',
    chest: '',
    waist: '',
    hip: '',
    bicep: '',
    thigh: '',
    neck: '',
    forearm: '',
    calf: '',
    date: new Date()?.toISOString()?.split('T')?.[0],
    notes: ''
  });

  const measurementFields = [
    { key: 'weight', label: 'Peso', unit: 'kg', icon: 'Scale' },
    { key: 'height', label: 'Altura', unit: 'cm', icon: 'Ruler' },
    { key: 'bodyFat', label: '% Gordura', unit: '%', icon: 'Activity' },
    { key: 'muscleMass', label: 'Massa Magra', unit: 'kg', icon: 'Zap' },
    { key: 'chest', label: 'Peito', unit: 'cm', icon: 'Maximize2' },
    { key: 'waist', label: 'Cintura', unit: 'cm', icon: 'Minimize2' },
    { key: 'hip', label: 'Quadril', unit: 'cm', icon: 'Circle' },
    { key: 'bicep', label: 'Bíceps', unit: 'cm', icon: 'Dumbbell' },
    { key: 'thigh', label: 'Coxa', unit: 'cm', icon: 'Circle' },
    { key: 'neck', label: 'Pescoço', unit: 'cm', icon: 'Circle' },
    { key: 'forearm', label: 'Antebraço', unit: 'cm', icon: 'Circle' },
    { key: 'calf', label: 'Panturrilha', unit: 'cm', icon: 'Circle' }
  ];

  const handleInputChange = (field, value) => {
    setMeasurements(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveMeasurements = () => {
    if (!selectedClient) return;
    
    // Here you would typically save to your backend
    console.log('Saving measurements for client:', selectedClient?.id, measurements);
    
    // Reset form
    setMeasurements({
      weight: '',
      height: '',
      bodyFat: '',
      muscleMass: '',
      chest: '',
      waist: '',
      hip: '',
      bicep: '',
      thigh: '',
      neck: '',
      forearm: '',
      calf: '',
      date: new Date()?.toISOString()?.split('T')?.[0],
      notes: ''
    });
    setActiveForm(false);
    
    // Show success message (you could use a toast here)
    alert('Medidas salvas com sucesso!');
  };

  const calculateBMI = (weight, height) => {
    if (!weight || !height) return '-';
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    return bmi?.toFixed(1);
  };

  const getBMICategory = (bmi) => {
    const bmiValue = parseFloat(bmi);
    if (isNaN(bmiValue)) return { category: '-', color: 'text-muted-foreground' };
    
    if (bmiValue < 18.5) return { category: 'Abaixo do peso', color: 'text-blue-600' };
    if (bmiValue < 25) return { category: 'Peso normal', color: 'text-green-600' };
    if (bmiValue < 30) return { category: 'Sobrepeso', color: 'text-yellow-600' };
    return { category: 'Obesidade', color: 'text-red-600' };
  };

  if (!selectedClient) {
    return (
      <div className="space-y-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Selecionar Cliente
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients?.map((client) => (
              <div
                key={client?.id}
                onClick={() => onClientSelect?.(client)}
                className="p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                    <img
                      src={client?.avatar}
                      alt={client?.alt || `Foto de perfil de ${client?.name}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full bg-muted flex items-center justify-center" style={{ display: 'none' }}>
                      <Icon name="User" size={20} className="text-muted-foreground" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{client?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Última avaliação: {new Date(client?.lastAssessment)?.toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentBMI = calculateBMI(selectedClient?.weight, selectedClient?.height);
  const bmiInfo = getBMICategory(currentBMI);

  return (
    <div className="space-y-6">
      {/* Client Header */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-muted">
              <img
                src={selectedClient?.avatar}
                alt={selectedClient?.alt || `Foto de perfil de ${selectedClient?.name}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-full h-full bg-muted flex items-center justify-center" style={{ display: 'none' }}>
                <Icon name="User" size={32} className="text-muted-foreground" />
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-foreground">{selectedClient?.name}</h2>
              <p className="text-muted-foreground">{selectedClient?.email}</p>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-sm text-muted-foreground">
                  Última avaliação: {new Date(selectedClient?.lastAssessment)?.toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => onClientSelect?.(null)}
              iconName="ArrowLeft"
              iconPosition="left"
            >
              Voltar
            </Button>
            
            <Button
              onClick={() => setActiveForm(!activeForm)}
              iconName="Plus"
              iconPosition="left"
            >
              Nova Medição
            </Button>
          </div>
        </div>
      </div>
      {/* Current Measurements Overview */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Medidas Atuais
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <div className="text-center p-4 bg-primary/5 rounded-lg">
            <Icon name="Scale" className="text-primary mx-auto mb-2" size={20} />
            <p className="text-2xl font-bold text-foreground">{selectedClient?.weight}</p>
            <p className="text-sm text-muted-foreground">kg</p>
          </div>
          
          <div className="text-center p-4 bg-secondary/5 rounded-lg">
            <Icon name="Ruler" className="text-secondary mx-auto mb-2" size={20} />
            <p className="text-2xl font-bold text-foreground">{selectedClient?.height}</p>
            <p className="text-sm text-muted-foreground">cm</p>
          </div>
          
          <div className="text-center p-4 bg-accent/5 rounded-lg">
            <Icon name="Activity" className="text-accent mx-auto mb-2" size={20} />
            <p className="text-2xl font-bold text-foreground">{selectedClient?.bodyFat}</p>
            <p className="text-sm text-muted-foreground">% gordura</p>
          </div>
          
          <div className="text-center p-4 bg-success/5 rounded-lg">
            <Icon name="Zap" className="text-success mx-auto mb-2" size={20} />
            <p className="text-2xl font-bold text-foreground">{selectedClient?.muscleMass}</p>
            <p className="text-sm text-muted-foreground">kg magra</p>
          </div>
          
          <div className="text-center p-4 bg-muted/5 rounded-lg">
            <Icon name="Calculator" className="text-muted-foreground mx-auto mb-2" size={20} />
            <p className="text-2xl font-bold text-foreground">{currentBMI}</p>
            <p className="text-sm text-muted-foreground">IMC</p>
          </div>
          
          <div className="text-center p-4 bg-muted/5 rounded-lg">
            <Icon name="Target" className="text-muted-foreground mx-auto mb-2" size={20} />
            <p className={`text-sm font-medium ${bmiInfo?.color}`}>{bmiInfo?.category}</p>
            <p className="text-xs text-muted-foreground">Categoria</p>
          </div>
        </div>

        {/* Circumferences */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(selectedClient?.measurements || {})?.map(([key, value]) => (
            <div key={key} className="text-center p-3 border border-border rounded-lg">
              <p className="text-lg font-semibold text-foreground">{value} cm</p>
              <p className="text-sm text-muted-foreground capitalize">{key}</p>
            </div>
          ))}
        </div>
      </div>
      {/* New Measurement Form */}
      {activeForm && (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">
              Nova Medição - {selectedClient?.name}
            </h3>
            <Button
              variant="ghost"
              onClick={() => setActiveForm(false)}
              iconName="X"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="lg:col-span-3 mb-4">
              <Input
                type="date"
                label="Data da Avaliação"
                value={measurements?.date}
                onChange={(e) => handleInputChange('date', e?.target?.value)}
                required
              />
            </div>
            
            {measurementFields?.map((field) => (
              <div key={field?.key}>
                <Input
                  type="number"
                  label={`${field?.label} (${field?.unit})`}
                  value={measurements?.[field?.key]}
                  onChange={(e) => handleInputChange(field?.key, e?.target?.value)}
                  step="0.1"
                  min="0"
                  placeholder={`Digite ${field?.label?.toLowerCase()}`}
                />
              </div>
            ))}
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              Observações
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Adicione observações sobre a avaliação..."
              value={measurements?.notes}
              onChange={(e) => handleInputChange('notes', e?.target?.value)}
            />
          </div>
          
          <div className="flex items-center justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setActiveForm(false)}
            >
              Cancelar
            </Button>
            
            <Button
              onClick={handleSaveMeasurements}
              iconName="Save"
              iconPosition="left"
            >
              Salvar Medições
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BodyMeasurementsPanel;