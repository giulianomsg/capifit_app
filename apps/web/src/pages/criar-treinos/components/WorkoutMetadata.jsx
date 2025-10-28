import React, { useMemo, useState } from 'react';

import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const weekDays = [
  { key: 'monday', label: 'Seg' },
  { key: 'tuesday', label: 'Ter' },
  { key: 'wednesday', label: 'Qua' },
  { key: 'thursday', label: 'Qui' },
  { key: 'friday', label: 'Sex' },
  { key: 'saturday', label: 'Sáb' },
  { key: 'sunday', label: 'Dom' },
];

const WorkoutMetadata = ({
  metadata,
  clients,
  clientsLoading,
  difficultyOptions,
  frequencyOptions,
  onUpdate,
  onSaveWorkout,
  onSaveTemplate,
  isSaving,
  showExtended = false,
}) => {
  const [scheduleOpen, setScheduleOpen] = useState(showExtended);

  const clientOptions = useMemo(() => {
    return clients.map((assignment) => ({
      value: assignment.clientId,
      label: assignment.client?.name ?? assignment.clientId,
    }));
  }, [clients]);

  const toggleScheduleDay = (day) => {
    const current = metadata.schedule ?? [];
    const exists = current.includes(day);
    const updated = exists ? current.filter((item) => item !== day) : [...current, day];
    onUpdate({ schedule: updated });
  };

  const handleChange = (field) => (eventOrValue) => {
    if (typeof eventOrValue === 'string') {
      onUpdate({ [field]: eventOrValue });
      return;
    }

    const { target } = eventOrValue;
    onUpdate({ [field]: target.value });
  };

  const handleToggleTemplate = () => {
    onUpdate({ isTemplate: !metadata.isTemplate, clientId: metadata.isTemplate ? metadata.clientId : '' });
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Informações do treino</h2>
        <p className="text-sm text-muted-foreground">Configure os detalhes gerais e agendamento.</p>
      </div>

      <div className="p-4 space-y-4">
        <Input
          label="Nome do treino"
          placeholder="Ex: Força total"
          value={metadata.title}
          onChange={handleChange('title')}
          required
        />

        <Select
          label="Cliente destinatário"
          placeholder={clientsLoading ? 'Carregando...' : 'Selecione um cliente'}
          options={clientOptions}
          value={metadata.clientId}
          onChange={(value) => onUpdate({ clientId: value })}
          disabled={metadata.isTemplate || clientsLoading}
          searchable
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Input
            type="date"
            label="Data de início"
            value={metadata.startDate}
            onChange={handleChange('startDate')}
          />
          <Select
            label="Frequência"
            options={frequencyOptions}
            value={metadata.frequency}
            onChange={(value) => onUpdate({ frequency: value })}
          />
          <Select
            label="Dificuldade"
            options={difficultyOptions}
            value={metadata.difficulty}
            onChange={(value) => onUpdate({ difficulty: value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Descrição e objetivos</label>
          <textarea
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            rows={4}
            value={metadata.description}
            onChange={handleChange('description')}
            placeholder="Descreva o objetivo geral e pontos de atenção deste plano."
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Agendamento semanal</label>
            <Button
              variant="ghost"
              size="sm"
              iconName={scheduleOpen ? 'ChevronUp' : 'ChevronDown'}
              iconPosition="right"
              onClick={() => setScheduleOpen((prev) => !prev)}
            >
              {scheduleOpen ? 'Ocultar' : 'Configurar'}
            </Button>
          </div>

          {scheduleOpen && (
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <p className="text-xs text-muted-foreground">
                Selecione os dias em que o treino deve aparecer na agenda do aluno.
              </p>
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day) => {
                  const active = metadata.schedule?.includes(day.key);
                  return (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => toggleScheduleDay(day.key)}
                      className={`rounded-lg py-2 text-xs font-semibold transition-colors ${
                        active
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-background border border-border text-foreground hover:bg-muted'
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="bg-muted/30 rounded-lg p-4 grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-semibold text-primary">{metadata.totalExercises ?? 0}</p>
            <p className="text-xs text-muted-foreground">Exercícios</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-accent">{metadata.estimatedDuration ?? 0} min</p>
            <p className="text-xs text-muted-foreground">Duração estimada</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-secondary">{metadata.estimatedCalories ?? 0}</p>
            <p className="text-xs text-muted-foreground">Calorias</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-muted-foreground">{metadata.schedule?.length ?? 0}</p>
            <p className="text-xs text-muted-foreground">Dias por semana</p>
          </div>
        </div>

        <div className="flex items-center justify-between bg-muted/30 rounded-lg px-4 py-3">
          <div>
            <p className="text-sm font-medium text-foreground">Salvar como template</p>
            <p className="text-xs text-muted-foreground">
              Templates não são vinculados a alunos e podem ser reutilizados futuramente.
            </p>
          </div>
          <Button
            variant={metadata.isTemplate ? 'default' : 'outline'}
            size="sm"
            onClick={handleToggleTemplate}
          >
            {metadata.isTemplate ? 'Template ativo' : 'Salvar como template'}
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-3">
          <Button
            className="lg:flex-1"
            disabled={isSaving}
            onClick={onSaveWorkout}
            iconName="Save"
          >
            {isSaving ? 'Salvando...' : 'Salvar treino'}
          </Button>
          <Button
            className="lg:flex-1"
            variant="outline"
            disabled={isSaving}
            onClick={onSaveTemplate}
            iconName="Bookmark"
          >
            {metadata.isTemplate ? 'Atualizar template' : 'Salvar como template'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutMetadata;
