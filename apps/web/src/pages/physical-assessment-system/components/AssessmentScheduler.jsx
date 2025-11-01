import React, { useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const assessmentTypes = [
  { value: 'INITIAL', label: 'Avaliação Inicial' },
  { value: 'FOLLOW_UP', label: 'Reavaliação' },
  { value: 'BODY_COMPOSITION', label: 'Composição Corporal' },
  { value: 'MEASUREMENTS', label: 'Medidas Corporais' },
  { value: 'PHOTOS', label: 'Fotos de Progresso' },
  { value: 'DEXA_SCAN', label: 'DEXA Scan' },
  { value: 'BIOIMPEDANCE', label: 'Bioimpedância' },
  { value: 'COMPLETE', label: 'Avaliação Completa' },
];

const timeSlots = Array.from({ length: 24 }, (_, hour) => [
  `${String(hour).padStart(2, '0')}:00`,
  `${String(hour).padStart(2, '0')}:30`,
]).flat();

const locations = [
  { value: 'office', label: 'Consultório' },
  { value: 'gym', label: 'Academia' },
  { value: 'home', label: 'Domicílio' },
  { value: 'online', label: 'Online' },
];

const durations = [
  { value: '30', label: '30 minutos' },
  { value: '45', label: '45 minutos' },
  { value: '60', label: '1 hora' },
  { value: '90', label: '1h 30min' },
];

const defaultState = {
  clientId: '',
  assessmentType: 'COMPLETE',
  date: new Date().toISOString().split('T')[0],
  time: '09:00',
  location: 'gym',
  duration: '60',
  notes: '',
};

const AssessmentScheduler = ({ isOpen, onClose, clients = [], onSchedule, loading = false }) => {
  const [form, setForm] = useState(defaultState);
  const [error, setError] = useState(null);
  const clientOptions = useMemo(
    () => clients.map((client) => ({ value: client.clientId, label: client.name })),
    [clients],
  );

  const handleChange = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event?.preventDefault();
    setError(null);

    if (!form.clientId) {
      setError('Selecione um cliente para agendar a avaliação.');
      return;
    }
    if (!form.date || !form.time) {
      setError('Informe data e horário para agendar a avaliação.');
      return;
    }

    try {
      await onSchedule?.({
        clientId: form.clientId,
        type: form.assessmentType,
        scheduledFor: new Date(`${form.date}T${form.time}:00`).toISOString(),
        notes: form.notes,
      });
      setForm(defaultState);
      onClose?.();
    } catch (scheduleError) {
      setError(scheduleError?.response?.data?.message ?? 'Não foi possível agendar a avaliação.');
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Icon name="Calendar" size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Agendar avaliação física</h3>
                <p className="text-sm text-muted-foreground">Selecione o cliente e defina a data da avaliação</p>
              </div>
            </div>
            <Button variant="ghost" iconName="X" onClick={onClose} type="button" />
          </div>

          <div className="px-6 space-y-4">
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">{error}</p>}

            <Select
              label="Cliente"
              required
              options={clientOptions}
              value={form.clientId}
              onChange={(value) => handleChange('clientId', value)}
              placeholder="Selecione um cliente"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Tipo de avaliação"
                options={assessmentTypes}
                value={form.assessmentType}
                onChange={(value) => handleChange('assessmentType', value)}
              />
              <Select
                label="Duração"
                options={durations}
                value={form.duration}
                onChange={(value) => handleChange('duration', value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="date"
                label="Data"
                required
                value={form.date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(event) => handleChange('date', event.target.value)}
              />
              <Select
                label="Horário"
                options={timeSlots.map((slot) => ({ value: slot, label: slot }))}
                value={form.time}
                onChange={(value) => handleChange('time', value)}
              />
            </div>

            <Select
              label="Local"
              options={locations}
              value={form.location}
              onChange={(value) => handleChange('location', value)}
            />

            <Input
              label="Notas adicionais"
              placeholder="Detalhes importantes para a avaliação"
              value={form.notes}
              onChange={(event) => handleChange('notes', event.target.value)}
            />
          </div>

          <div className="px-6 pb-6 border-t border-border flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Agendando...' : 'Agendar avaliação'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssessmentScheduler;
