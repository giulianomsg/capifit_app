import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const WorkoutMetadata = ({ metadata, onUpdateMetadata, onSaveWorkout, onSaveTemplate }) => {
  const [showSchedule, setShowSchedule] = useState(false);

  const clients = [
    { value: 'maria-santos', label: 'Maria Santos' },
    { value: 'carlos-silva', label: 'Carlos Silva' },
    { value: 'ana-costa', label: 'Ana Costa' },
    { value: 'pedro-oliveira', label: 'Pedro Oliveira' },
    { value: 'julia-ferreira', label: 'Julia Ferreira' }
  ];

  const frequencyOptions = [
    { value: 'daily', label: 'Diário' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'muscle-group', label: 'Por Grupo Muscular' },
    { value: 'custom', label: 'Personalizado' }
  ];

  const difficultyOptions = [
    { value: 'iniciante', label: 'Iniciante' },
    { value: 'intermediario', label: 'Intermediário' },
    { value: 'avancado', label: 'Avançado' }
  ];

  const weekDays = [
    { key: 'monday', label: 'Seg' },
    { key: 'tuesday', label: 'Ter' },
    { key: 'wednesday', label: 'Qua' },
    { key: 'thursday', label: 'Qui' },
    { key: 'friday', label: 'Sex' },
    { key: 'saturday', label: 'Sáb' },
    { key: 'sunday', label: 'Dom' }
  ];

  const handleMetadataChange = (field, value) => {
    onUpdateMetadata({ [field]: value });
  };

  const handleScheduleToggle = (day) => {
    const currentSchedule = metadata?.schedule || [];
    const newSchedule = currentSchedule?.includes(day)
      ? currentSchedule?.filter(d => d !== day)
      : [...currentSchedule, day];
    
    handleMetadataChange('schedule', newSchedule);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'iniciante': return 'text-success';
      case 'intermediario': return 'text-warning';
      case 'avancado': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Informações do Treino</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure os detalhes e agendamento do treino
        </p>
      </div>
      {/* Form */}
      <div className="p-4 space-y-4">
        {/* Basic Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Input
            label="Nome do Treino"
            placeholder="Ex: Treino de Peito e Tríceps"
            value={metadata?.nome || ''}
            onChange={(e) => handleMetadataChange('nome', e?.target?.value)}
            required
          />
          
          <Select
            label="Cliente Destinatário"
            placeholder="Selecione um cliente"
            options={clients}
            value={metadata?.clienteId || ''}
            onChange={(value) => handleMetadataChange('clienteId', value)}
            searchable
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Input
            label="Data de Início"
            type="date"
            value={metadata?.dataInicio || ''}
            onChange={(e) => handleMetadataChange('dataInicio', e?.target?.value)}
          />
          
          <Select
            label="Frequência"
            options={frequencyOptions}
            value={metadata?.frequencia || 'weekly'}
            onChange={(value) => handleMetadataChange('frequencia', value)}
          />
          
          <Select
            label="Dificuldade"
            options={difficultyOptions}
            value={metadata?.dificuldade || 'intermediario'}
            onChange={(value) => handleMetadataChange('dificuldade', value)}
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Descrição e Objetivos
          </label>
          <textarea
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            rows={3}
            placeholder="Descreva os objetivos e observações importantes para este treino..."
            value={metadata?.descricao || ''}
            onChange={(e) => handleMetadataChange('descricao', e?.target?.value)}
          />
        </div>

        {/* Schedule Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-foreground">
              Agendamento Semanal
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSchedule(!showSchedule)}
              iconName={showSchedule ? "ChevronUp" : "ChevronDown"}
              iconPosition="right"
            >
              {showSchedule ? 'Ocultar' : 'Configurar'}
            </Button>
          </div>

          {showSchedule && (
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-3">
                Selecione os dias da semana para este treino
              </p>
              
              <div className="grid grid-cols-7 gap-2">
                {weekDays?.map((day) => (
                  <button
                    key={day?.key}
                    onClick={() => handleScheduleToggle(day?.key)}
                    className={`
                      p-2 rounded-lg text-sm font-medium transition-colors
                      ${(metadata?.schedule || [])?.includes(day?.key)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background border border-border text-foreground hover:bg-muted'
                      }
                    `}
                  >
                    {day?.label}
                  </button>
                ))}
              </div>

              {metadata?.schedule && metadata?.schedule?.length > 0 && (
                <div className="mt-3 p-2 bg-primary/10 rounded border border-primary/20">
                  <p className="text-sm text-primary">
                    <Icon name="Calendar" size={14} className="inline mr-1" />
                    Agendado para {metadata?.schedule?.length} dia{metadata?.schedule?.length !== 1 ? 's' : ''} da semana
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Workout Summary */}
        <div className="bg-muted/30 rounded-lg p-4">
          <h3 className="font-medium text-foreground mb-3">Resumo do Treino</h3>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {metadata?.totalExercicios || 0}
              </div>
              <div className="text-muted-foreground">Exercícios</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-accent mb-1">
                {metadata?.duracaoEstimada || 0}
              </div>
              <div className="text-muted-foreground">Minutos</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-success mb-1">
                {metadata?.caloriasEstimadas || 0}
              </div>
              <div className="text-muted-foreground">Calorias</div>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold mb-1 ${getDifficultyColor(metadata?.dificuldade)}`}>
                {metadata?.dificuldade ? metadata?.dificuldade?.charAt(0)?.toUpperCase() + metadata?.dificuldade?.slice(1) : 'N/A'}
              </div>
              <div className="text-muted-foreground">Nível</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onSaveTemplate}
            iconName="Bookmark"
            iconPosition="left"
            className="flex-1"
          >
            Salvar como Template
          </Button>
          
          <Button
            onClick={onSaveWorkout}
            iconName="Save"
            iconPosition="left"
            className="flex-1"
            disabled={!metadata?.nome || !metadata?.clienteId}
          >
            Salvar Treino
          </Button>
        </div>

        {/* Validation Messages */}
        {(!metadata?.nome || !metadata?.clienteId) && (
          <div className="flex items-center space-x-2 text-sm text-warning bg-warning/10 p-3 rounded-lg">
            <Icon name="AlertTriangle" size={16} />
            <span>
              Preencha o nome do treino e selecione um cliente para continuar
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutMetadata;