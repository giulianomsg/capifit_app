import React from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const ClientGoalsForm = ({ 
  formData, 
  onInputChange, 
  errors = {},
  className = "" 
}) => {
  const handleChange = (field) => (value) => {
    if (onInputChange) {
      onInputChange(field, value);
    }
  };

  const handleInputChange = (field) => (e) => {
    if (onInputChange) {
      onInputChange(field, e?.target?.value);
    }
  };

  const fitnessGoals = [
    { value: 'perder_peso', label: 'Perder Peso' },
    { value: 'ganhar_massa', label: 'Ganhar Massa Muscular' },
    { value: 'definir_corpo', label: 'Definir o Corpo' },
    { value: 'melhorar_condicionamento', label: 'Melhorar Condicionamento' },
    { value: 'reabilitacao', label: 'Reabilitação' },
    { value: 'manter_forma', label: 'Manter a Forma' },
    { value: 'performance_esportiva', label: 'Performance Esportiva' }
  ];

  const experienceLevels = [
    { value: 'iniciante', label: 'Iniciante', description: 'Nunca pratiquei exercícios regularmente' },
    { value: 'basico', label: 'Básico', description: 'Pratico há menos de 1 ano' },
    { value: 'intermediario', label: 'Intermediário', description: 'Pratico há 1-3 anos' },
    { value: 'avancado', label: 'Avançado', description: 'Pratico há mais de 3 anos' }
  ];

  const activityFrequency = [
    { value: '1-2', label: '1-2 vezes por semana' },
    { value: '3-4', label: '3-4 vezes por semana' },
    { value: '5-6', label: '5-6 vezes por semana' },
    { value: 'diario', label: 'Todos os dias' }
  ];

  const healthConditions = [
    'Hipertensão',
    'Diabetes',
    'Problemas cardíacos',
    'Lesões articulares',
    'Problemas na coluna',
    'Asma',
    'Obesidade',
    'Ansiedade/Depressão'
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Seus Objetivos Fitness
        </h3>
        <p className="text-sm text-muted-foreground">
          Ajude-nos a personalizar sua experiência
        </p>
      </div>
      {/* Primary Goal */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center mb-4">
          <Icon name="Target" size={20} className="text-primary mr-2" />
          <h4 className="font-semibold text-foreground">Objetivo Principal</h4>
        </div>

        <Select
          label="Qual é seu principal objetivo?"
          options={fitnessGoals}
          value={formData?.objetivoPrincipal || ''}
          onChange={handleChange('objetivoPrincipal')}
          error={errors?.objetivoPrincipal}
          placeholder="Selecione seu objetivo"
          required
        />
      </div>
      {/* Experience Level */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center mb-4">
          <Icon name="TrendingUp" size={20} className="text-secondary mr-2" />
          <h4 className="font-semibold text-foreground">Nível de Experiência</h4>
        </div>

        <Select
          label="Qual seu nível atual de condicionamento?"
          options={experienceLevels}
          value={formData?.nivelExperiencia || ''}
          onChange={handleChange('nivelExperiencia')}
          error={errors?.nivelExperiencia}
          placeholder="Selecione seu nível"
          required
        />
      </div>
      {/* Activity Frequency */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center mb-4">
          <Icon name="Calendar" size={20} className="text-accent mr-2" />
          <h4 className="font-semibold text-foreground">Frequência Desejada</h4>
        </div>

        <Select
          label="Quantas vezes por semana pretende treinar?"
          options={activityFrequency}
          value={formData?.frequenciaTreino || ''}
          onChange={handleChange('frequenciaTreino')}
          error={errors?.frequenciaTreino}
          placeholder="Selecione a frequência"
          required
        />
      </div>
      {/* Physical Measurements */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center mb-4">
          <Icon name="Ruler" size={20} className="text-success mr-2" />
          <h4 className="font-semibold text-foreground">Medidas Físicas</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Altura (cm)"
            type="number"
            placeholder="175"
            value={formData?.altura || ''}
            onChange={handleInputChange('altura')}
            error={errors?.altura}
            min="100"
            max="250"
          />

          <Input
            label="Peso Atual (kg)"
            type="number"
            placeholder="70"
            value={formData?.pesoAtual || ''}
            onChange={handleInputChange('pesoAtual')}
            error={errors?.pesoAtual}
            min="30"
            max="300"
            step="0.1"
          />

          <Input
            label="Peso Meta (kg)"
            type="number"
            placeholder="65"
            value={formData?.pesoMeta || ''}
            onChange={handleInputChange('pesoMeta')}
            error={errors?.pesoMeta}
            min="30"
            max="300"
            step="0.1"
          />
        </div>
      </div>
      {/* Health Conditions */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center mb-4">
          <Icon name="Heart" size={20} className="text-warning mr-2" />
          <h4 className="font-semibold text-foreground">Condições de Saúde</h4>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Marque todas as condições que se aplicam (opcional):
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {healthConditions?.map((condition) => (
            <Checkbox
              key={condition}
              label={condition}
              checked={formData?.condicoesSaude?.includes(condition) || false}
              onChange={(e) => {
                const current = formData?.condicoesSaude || [];
                const updated = e?.target?.checked
                  ? [...current, condition]
                  : current?.filter(c => c !== condition);
                handleChange('condicoesSaude')(updated);
              }}
            />
          ))}
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-foreground mb-2">
            Outras condições ou observações
          </label>
          <textarea
            placeholder="Descreva outras condições de saúde, lesões anteriores ou limitações..."
            value={formData?.observacoesSaude || ''}
            onChange={handleInputChange('observacoesSaude')}
            rows={3}
            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
          />
        </div>
      </div>
      {/* Preferences */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center mb-4">
          <Icon name="Settings" size={20} className="text-muted-foreground mr-2" />
          <h4 className="font-semibold text-foreground">Preferências</h4>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Horários preferenciais para treino
            </label>
            <textarea
              placeholder="Ex: Manhã (6h-9h), Tarde (14h-17h), Noite (18h-21h)"
              value={formData?.horarioPreferencia || ''}
              onChange={handleInputChange('horarioPreferencia')}
              rows={2}
              className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Atividades que mais gosta
            </label>
            <textarea
              placeholder="Ex: Musculação, corrida, natação, dança, yoga..."
              value={formData?.atividadesPreferidas || ''}
              onChange={handleInputChange('atividadesPreferidas')}
              rows={2}
              className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientGoalsForm;