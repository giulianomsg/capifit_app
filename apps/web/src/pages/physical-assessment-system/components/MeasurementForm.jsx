import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const MeasurementForm = ({ selectedClient }) => {
  const [measurements, setMeasurements] = useState({
    weight: '',
    height: '',
    bodyFat: '',
    muscleMass: '',
    waist: '',
    chest: '',
    arm: '',
    thigh: '',
    hip: '',
    neck: '',
    calf: '',
    forearm: ''
  });

  const [calculatedValues, setCalculatedValues] = useState({
    bmi: 0,
    idealWeight: 0,
    bodyFatMass: 0,
    leanMass: 0
  });

  // Calculate BMI and other metrics
  React.useEffect(() => {
    if (measurements?.weight && measurements?.height) {
      const heightInMeters = parseFloat(measurements?.height) / 100;
      const weight = parseFloat(measurements?.weight);
      const bmi = weight / (heightInMeters * heightInMeters);
      
      const idealWeight = 22 * (heightInMeters * heightInMeters);
      
      let bodyFatMass = 0;
      let leanMass = 0;
      
      if (measurements?.bodyFat) {
        bodyFatMass = (weight * parseFloat(measurements?.bodyFat)) / 100;
        leanMass = weight - bodyFatMass;
      }

      setCalculatedValues({
        bmi: isNaN(bmi) ? 0 : bmi,
        idealWeight: isNaN(idealWeight) ? 0 : idealWeight,
        bodyFatMass: isNaN(bodyFatMass) ? 0 : bodyFatMass,
        leanMass: isNaN(leanMass) ? 0 : leanMass
      });
    }
  }, [measurements?.weight, measurements?.height, measurements?.bodyFat]);

  const handleMeasurementChange = (field, value) => {
    setMeasurements(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { label: 'Abaixo do peso', color: 'text-blue-600' };
    if (bmi < 25) return { label: 'Peso normal', color: 'text-green-600' };
    if (bmi < 30) return { label: 'Sobrepeso', color: 'text-yellow-600' };
    return { label: 'Obesidade', color: 'text-red-600' };
  };

  const handleSave = () => {
    console.log('Saving measurements:', measurements);
    // Here you would typically save to your backend
  };

  if (!selectedClient) {
    return (
      <div className="p-8 text-center">
        <Icon name="UserX" size={48} className="text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Selecione um cliente para começar</p>
      </div>
    );
  }

  const bmiCategory = getBMICategory(calculatedValues?.bmi);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground">
            Medidas Corporais - {selectedClient?.name}
          </h3>
          <p className="text-muted-foreground">
            Registre as medidas antropométricas do cliente
          </p>
        </div>
        <Button onClick={handleSave} iconName="Save" iconPosition="left">
          Salvar Avaliação
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Basic Measurements */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-muted/30 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Icon name="Scale" size={20} className="mr-2 text-primary" />
              Medidas Básicas
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Peso (kg)"
                type="number"
                placeholder="75.5"
                value={measurements?.weight}
                onChange={(e) => handleMeasurementChange('weight', e?.target?.value)}
              />
              <Input
                label="Altura (cm)"
                type="number"
                placeholder="175"
                value={measurements?.height}
                onChange={(e) => handleMeasurementChange('height', e?.target?.value)}
              />
              <Input
                label="% Gordura Corporal"
                type="number"
                placeholder="15.2"
                value={measurements?.bodyFat}
                onChange={(e) => handleMeasurementChange('bodyFat', e?.target?.value)}
              />
              <Input
                label="Massa Muscular (kg)"
                type="number"
                placeholder="45.8"
                value={measurements?.muscleMass}
                onChange={(e) => handleMeasurementChange('muscleMass', e?.target?.value)}
              />
            </div>
          </div>

          <div className="bg-muted/30 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Icon name="Ruler" size={20} className="mr-2 text-primary" />
              Circunferências (cm)
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input
                label="Cintura"
                type="number"
                placeholder="82"
                value={measurements?.waist}
                onChange={(e) => handleMeasurementChange('waist', e?.target?.value)}
              />
              <Input
                label="Peito"
                type="number"
                placeholder="98"
                value={measurements?.chest}
                onChange={(e) => handleMeasurementChange('chest', e?.target?.value)}
              />
              <Input
                label="Braço"
                type="number"
                placeholder="35"
                value={measurements?.arm}
                onChange={(e) => handleMeasurementChange('arm', e?.target?.value)}
              />
              <Input
                label="Coxa"
                type="number"
                placeholder="58"
                value={measurements?.thigh}
                onChange={(e) => handleMeasurementChange('thigh', e?.target?.value)}
              />
              <Input
                label="Quadril"
                type="number"
                placeholder="95"
                value={measurements?.hip}
                onChange={(e) => handleMeasurementChange('hip', e?.target?.value)}
              />
              <Input
                label="Pescoço"
                type="number"
                placeholder="38"
                value={measurements?.neck}
                onChange={(e) => handleMeasurementChange('neck', e?.target?.value)}
              />
              <Input
                label="Panturrilha"
                type="number"
                placeholder="36"
                value={measurements?.calf}
                onChange={(e) => handleMeasurementChange('calf', e?.target?.value)}
              />
              <Input
                label="Antebraço"
                type="number"
                placeholder="28"
                value={measurements?.forearm}
                onChange={(e) => handleMeasurementChange('forearm', e?.target?.value)}
              />
            </div>
          </div>
        </div>

        {/* Calculations Panel */}
        <div className="space-y-6">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Icon name="Calculator" size={20} className="mr-2 text-primary" />
              Cálculos Automáticos
            </h4>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-card rounded-lg">
                <span className="text-sm font-medium text-foreground">IMC</span>
                <div className="text-right">
                  <div className="text-lg font-bold text-foreground">
                    {calculatedValues?.bmi?.toFixed(1)}
                  </div>
                  <div className={`text-xs ${bmiCategory?.color}`}>
                    {bmiCategory?.label}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-card rounded-lg">
                <span className="text-sm font-medium text-foreground">Peso Ideal</span>
                <span className="text-lg font-bold text-foreground">
                  {calculatedValues?.idealWeight?.toFixed(1)} kg
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-card rounded-lg">
                <span className="text-sm font-medium text-foreground">Massa Gorda</span>
                <span className="text-lg font-bold text-foreground">
                  {calculatedValues?.bodyFatMass?.toFixed(1)} kg
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-card rounded-lg">
                <span className="text-sm font-medium text-foreground">Massa Magra</span>
                <span className="text-lg font-bold text-foreground">
                  {calculatedValues?.leanMass?.toFixed(1)} kg
                </span>
              </div>
            </div>
          </div>

          {/* BMI Reference */}
          <div className="bg-muted/30 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-foreground mb-4">
              Referência IMC
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-600">Abaixo do peso</span>
                <span className="text-muted-foreground">&lt; 18.5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">Peso normal</span>
                <span className="text-muted-foreground">18.5 - 24.9</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-600">Sobrepeso</span>
                <span className="text-muted-foreground">25 - 29.9</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-600">Obesidade</span>
                <span className="text-muted-foreground">≥ 30</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeasurementForm;