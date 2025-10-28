import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const AssessmentScheduler = ({ isOpen, onClose, clients }) => {
  const [selectedClient, setSelectedClient] = useState('');
  const [assessmentType, setAssessmentType] = useState('');
  const [assessmentDate, setAssessmentDate] = useState('');
  const [assessmentTime, setAssessmentTime] = useState('');
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState('60');
  const [notes, setNotes] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState('monthly');

  const assessmentTypes = [
    { value: 'initial', label: 'Avaliação Inicial' },
    { value: 'followup', label: 'Reavaliação' },
    { value: 'body_composition', label: 'Composição Corporal' },
    { value: 'measurements', label: 'Medidas Corporais' },
    { value: 'photos', label: 'Fotos de Progresso' },
    { value: 'dexa_scan', label: 'DEXA Scan' },
    { value: 'bioimpedance', label: 'Bioimpedância' },
    { value: 'complete', label: 'Avaliação Completa' }
  ];

  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i?.toString()?.padStart(2, '0');
    return [
      { value: `${hour}:00`, label: `${hour}:00` },
      { value: `${hour}:30`, label: `${hour}:30` }
    ];
  })?.flat();

  const locations = [
    { value: 'office', label: 'Consultório' },
    { value: 'gym', label: 'Academia' },
    { value: 'home', label: 'Domicílio' },
    { value: 'online', label: 'Online' },
    { value: 'clinic', label: 'Clínica Parceira' }
  ];

  const durations = [
    { value: '30', label: '30 minutos' },
    { value: '45', label: '45 minutos' },
    { value: '60', label: '1 hora' },
    { value: '90', label: '1h 30min' },
    { value: '120', label: '2 horas' }
  ];

  const recurringTypes = [
    { value: 'weekly', label: 'Semanal' },
    { value: 'biweekly', label: 'Quinzenal' },
    { value: 'monthly', label: 'Mensal' },
    { value: 'bimonthly', label: 'Bimestral' },
    { value: 'quarterly', label: 'Trimestral' }
  ];

  const handleSchedule = () => {
    if (!selectedClient || !assessmentType || !assessmentDate || !assessmentTime) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const scheduleData = {
      clientId: selectedClient,
      type: assessmentType,
      date: assessmentDate,
      time: assessmentTime,
      location,
      duration: parseInt(duration),
      notes,
      recurring,
      recurringType: recurring ? recurringType : null,
      createdAt: new Date()?.toISOString()
    };

    // Here you would typically save to your backend
    console.log('Scheduling assessment:', scheduleData);
    
    // Show success message and close modal
    alert('Avaliação agendada com sucesso!');
    onClose();
  };

  const getClientInfo = (clientId) => {
    return clients?.find(client => client?.id?.toString() === clientId);
  };

  const selectedClientInfo = getClientInfo(selectedClient);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="Calendar" size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Agendar Avaliação Física
                </h3>
                <p className="text-sm text-muted-foreground">
                  Configure uma nova avaliação para seu cliente
                </p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              onClick={onClose}
              iconName="X"
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          {/* Client Selection */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Informações do Cliente</h4>
            
            <Select
              value={selectedClient}
              onChange={setSelectedClient}
              options={clients?.map(client => ({
                value: client?.id?.toString(),
                label: client?.name
              }))}
              placeholder="Selecionar cliente"
              label="Cliente *"
              required
            />
            
            {selectedClientInfo && (
              <div className="p-4 bg-muted/30 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                    <img
                      src={selectedClientInfo?.avatar}
                      alt={selectedClientInfo?.alt || `Foto de perfil de ${selectedClientInfo?.name}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full bg-muted flex items-center justify-center" style={{ display: 'none' }}>
                      <Icon name="User" size={24} className="text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div>
                    <p className="font-medium text-foreground">{selectedClientInfo?.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedClientInfo?.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Última avaliação: {new Date(selectedClientInfo?.lastAssessment)?.toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Assessment Details */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Detalhes da Avaliação</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                value={assessmentType}
                onChange={setAssessmentType}
                options={assessmentTypes}
                placeholder="Selecionar tipo"
                label="Tipo de Avaliação *"
                required
              />
              
              <Select
                value={duration}
                onChange={setDuration}
                options={durations}
                label="Duração"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="date"
                label="Data *"
                value={assessmentDate}
                onChange={(e) => setAssessmentDate(e?.target?.value)}
                min={new Date()?.toISOString()?.split('T')?.[0]}
                required
              />
              
              <Select
                value={assessmentTime}
                onChange={setAssessmentTime}
                options={timeSlots}
                placeholder="Selecionar horário"
                label="Horário *"
                required
              />
            </div>
            
            <Select
              value={location}
              onChange={setLocation}
              options={locations}
              placeholder="Selecionar local"
              label="Local da Avaliação"
            />
          </div>

          {/* Recurring Options */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="recurring"
                checked={recurring}
                onChange={(e) => setRecurring(e?.target?.checked)}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
              />
              <label htmlFor="recurring" className="font-medium text-foreground">
                Agendar reavaliações automáticas
              </label>
            </div>
            
            {recurring && (
              <div className="pl-6 border-l-2 border-primary/20">
                <Select
                  value={recurringType}
                  onChange={setRecurringType}
                  options={recurringTypes}
                  label="Frequência das Reavaliações"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  As próximas avaliações serão agendadas automaticamente baseadas na frequência selecionada.
                </p>
              </div>
            )}
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Observações
            </label>
            <textarea
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Adicione observações sobre a avaliação, objetivos específicos, preparação necessária..."
              value={notes}
              onChange={(e) => setNotes(e?.target?.value)}
            />
          </div>

          {/* Quick Tips */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <Icon name="Info" size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-800 mb-1">Dicas para a Avaliação:</p>
                <ul className="text-blue-700 space-y-1">
                  <li>• Cliente deve estar em jejum para medições mais precisas</li>
                  <li>• Recomendar roupas leves e confortáveis</li>
                  <li>• Evitar exercícios intensos nas 24h anteriores</li>
                  <li>• Manter hidratação adequada</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <div className="flex items-center justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            
            <Button
              onClick={handleSchedule}
              iconName="Calendar"
              iconPosition="left"
              disabled={!selectedClient || !assessmentType || !assessmentDate || !assessmentTime}
            >
              Agendar Avaliação
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentScheduler;